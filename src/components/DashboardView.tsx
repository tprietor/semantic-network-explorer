import { categoryDiversity, diversityFormat, type Diversity } from "../domain/diversity";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { CORE_PERIOD, MIDDLE_PERIOD, macroClusters, type MacroConfiguration } from "../domain/dashboardMacros";
import { fullNetworkProfiles } from "../domain/dashboardClusterProfiles";
import { EGO_TERMS } from "../domain/egoNetworks";
import { CATEGORY_ORDER, categoryColor, categoryLabel, formatInt } from "../domain/vocabulary";
import { useT, type Lang } from "../i18n";
import { useTheme } from "../state/theme";
import { Loader } from "./Loader";
import { EgoNetworksView } from "./EgoNetworksView";
import "./dashboard.css";

function ClusterDiversity({ metric }: { metric: Diversity }) {
  const { lang, t } = useT();
  if (!metric) return <p>{t("dashboard.diversityUnavailable")}</p>;
  const { distribution, total, present, entropy, diversity } = metric;
  const number = diversityFormat[lang];
  return (
    <section className="dashboard-diversity">
      <h4>{t("dashboard.diversity")} <strong>{number.format(diversity)}</strong></h4>
      <div className="dashboard-diversity-bar" aria-hidden="true">
        {distribution.filter(({ count }) => count > 0).map(({ category, count }) => (
          <span key={category} style={{ width: count / total * 100 + "%", backgroundColor: categoryColor(category) }}
            title={categoryLabel(category, lang) + " · " + count} />
        ))}
      </div>
      <details className="dashboard-category-key">
        <summary>{t("dashboard.diversityCounts", { present, possible: distribution.length, nodes: total })}</summary>
        <p>{t("dashboard.diversityMethod", { bits: number.format(entropy) })}</p>
        <ul className="dashboard-category-counts">
          {distribution.map(({ category, count }) => (
            <li className="dashboard-count-row" key={category} data-category={category}>
              <span><i aria-hidden="true" style={{ backgroundColor: categoryColor(category) }} />{categoryLabel(category, lang)}</span>
              <strong>{formatInt(count, lang)}</strong>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}

type DashboardNode = [name: string, category: string, cluster: number, betweenness: number];
type DashboardEdge = [source: number, target: number, weight: number];
type Coordinate = [x: number, y: number];
interface BridgeStory {
  node: number;
  terms: [number, number];
  documents: [number, number];
  branches: [number[], number[]];
}
interface MacroBridgeStory {
  node: number;
  links: { macro: number; node: number; documents: number }[];
}
interface MacroBetweenness {
  scores: number[];
  stories: MacroBridgeStory[];
}
interface NestedFit {
  seed: number;
  blocks: {
    size: number;
    internal_edges: number;
    components: number;
    isolated: number;
    largest_component: number;
  }[];
  recursive: { trialsPerModel: number; blocks: number };
  sensitivity: { nodes: number; splits: number; trials: number; sizes: number[] };
}
interface Snapshot {
  label: string;
  documents: number;
  blocks: number;
  nodes: DashboardNode[];
  edges: DashboardEdge[];
  categoryPositions: Coordinate[];
  clusterPositions: Coordinate[];
  stories: BridgeStory[];
  isolatedActors?: number;
  isolatedNodes?: number;
  nestedFit?: NestedFit;
  macroBetweenness?: MacroBetweenness;
}
interface Point { x: number; y: number }
interface Group extends Point {
  label: string;
  radiusX: number;
  radiusY: number;
  color: string;
  labelBounds?: PlotBox;
}
interface LabeledGroup extends Group { labelPosition: Point }
interface PlotBox extends Point {
  width: number;
  height: number;
}
interface MacroRegion extends PlotBox {
  macro?: MacroConfiguration;
  ranks: Set<number>;
  color: string;
}
interface Layout {
  regions: MacroRegion[];
  positions: Point[];
  groups: LabeledGroup[];
  height: number;
}
type Stage = 0 | 1 | 2 | 3;

const DASHBOARD_VIEWS = {
  full: { file: "dashboard.json", label: "dashboard.fullView" },
  actors: { file: "actor-dashboard.json", label: "dashboard.actorView" },
  "practice-actors": {
    file: "practice-actor-dashboard.json",
    label: "dashboard.practiceActorView",
  },
} as const;
type DashboardNetworkMode = keyof typeof DASHBOARD_VIEWS;
export type DashboardMode = DashboardNetworkMode | "ego-networks";
const VIEW_OPTIONS = ["actors", "practice-actors"] as const;


const ORANGE = "#ff982d";
const TAU = 2 * Math.PI;
const STAGES = ["dashboard.categories", "dashboard.clusters", "dashboard.macros", "dashboard.bridges"] as const;
const NEXT = ["dashboard.showClusters", "dashboard.showMacros", "dashboard.showBridges", "dashboard.reset"] as const;
const motionPreference = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function layoutCoreRanks(period: string): Set<number> {
  return new Set(macroClusters(period).find((item) => item.id === 1)?.blocks.map((block) => block.rank));
}

function clusterLabel(rank: number): string {
  return "C" + String(rank + 1).padStart(2, "0");
}

function placeLabels(groups: Group[], width: number, height: number): LabeledGroup[] {
  const labelHeight = 36;
  const labelWidth = 62;
  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));
  const labels: Point[] = [];

  return groups.map((group) => {
    const { x, y, radiusX, radiusY } = group;
    const bounds = group.labelBounds ?? { x: 0, y: 0, width, height };
    const candidates = [
      { x, y: y + radiusY + 19 },
      { x, y: y - radiusY - 19 },
      { x: x + radiusX + labelWidth / 2 + 4, y },
      { x: x - radiusX - labelWidth / 2 - 4, y },
      { x: x + radiusX + labelWidth / 2, y: y - radiusY - 19 },
      { x: x - radiusX - labelWidth / 2, y: y - radiusY - 19 },
      { x: x + radiusX + labelWidth / 2, y: y + radiusY + 19 },
      { x: x - radiusX - labelWidth / 2, y: y + radiusY + 19 },
      { x, y: y - radiusY - 47 },
    ].map(({ x, y }) => ({
      x: clamp(x, bounds.x + labelWidth / 2, bounds.x + bounds.width - labelWidth / 2),
      y: clamp(y, bounds.y + labelHeight / 2, bounds.y + bounds.height - labelHeight / 2),
    }));
    const overlap = (point: Point) =>
      labels.reduce((sum, label) =>
        sum + Math.max(0, labelWidth - Math.abs(label.x - point.x)) *
          Math.max(0, labelHeight - Math.abs(label.y - point.y)), 0) +
      groups.reduce((sum, other) =>
        sum + Math.max(0, other.radiusX + labelWidth / 2 - Math.abs(other.x - point.x)) *
          Math.max(0, other.radiusY + labelHeight / 2 - Math.abs(other.y - point.y)), 0);
    const scored = candidates.map((point) => ({ point, overlap: overlap(point) }));
    const labelPosition = scored.reduce((best, candidate) =>
      candidate.overlap < best.overlap ? candidate : best).point;
    labels.push(labelPosition);
    return { ...group, labelPosition };
  });
}

function lateMacroBoxes(width: number, height: number, narrow: boolean): PlotBox[] {
  const inset = 13, gap = 18;
  const span = width - 2 * inset;
  const core = { x: width / 2 - 73, y: height / 2 - 73, width: 146, height: 146 };
  if (narrow) return [
    core,
    { x: inset, y: 15, width: span, height: 345 },
    { x: inset, y: 376, width: span, height: 345 },
    { x: inset, y: 989, width: span, height: 186 },
    { x: inset, y: 1191, width: span, height: 186 },
    { x: inset, y: 1393, width: span, height: 186 },
    { x: inset, y: 1595, width: span, height: 192 },
  ];
  const half = (span - gap) / 2;
  const third = (span - gap * 2) / 3;
  return [
    core,
    { x: inset, y: 15, width: half, height: 380 },
    { x: inset + half + gap, y: 15, width: half, height: 380 },
    { x: inset, y: 642, width: third, height: 165 },
    { x: inset + third + gap, y: 642, width: third, height: 165 },
    { x: inset + 2 * (third + gap), y: 642, width: third, height: 165 },
    { x: inset, y: 824, width: span, height: 190 },
  ];
}

function readingBoxes(width: number, narrow: boolean): PlotBox[] {
  const inset = 13, gap = 16, span = width - 2 * inset;
  const half = (span - gap) / 2;
  const stack = narrow ? [236, 192, 252, 192, 206] : [224, 224, 208, 194, 194];
  let top = inset;
  return stack.map((height, index) => {
    const full = narrow || index === 2;
    const right = !full && (index === 1 || index === 4);
    const box = { x: right ? inset + half + gap : inset, y: top, width: full ? span : half, height };
    if (full || right) top += height + gap;
    return box;
  });
}

function macroLayout(snapshot: Snapshot, width: number): Pick<Layout, "positions" | "regions" | "height"> {
  const narrow = width < 570;
  const horizontalGap = 18;
  const verticalGap = 18;
  const inset = 13;
  const span = width - inset * 2;
  const late = snapshot.label === CORE_PERIOD;
  const middle = snapshot.label === MIDDLE_PERIOD;
  const remainderHeight = middle ? (narrow ? 205 : 168) : 76;
  const readingLayout = !late && !middle ? readingBoxes(width, narrow) : undefined;
  const height = readingLayout ? Math.max(...readingLayout.map((box) => box.y + box.height)) + inset : late ? (narrow ? 1888 : 1110) :
    (narrow ? 1140 : 742) + remainderHeight - 76;
  const rowTop = 15;
  const firstRowHeight = narrow ? 252 : 340;
  const secondRowHeight = narrow ? 234 : 264;
  const widths = narrow ? [span, span, span, span] :
    [(span - horizontalGap) * .46, (span - horizontalGap) * .54,
     (span - horizontalGap) * .42, (span - horizontalGap) * .58];
  const rows = narrow
    ? [rowTop, rowTop + firstRowHeight + verticalGap,
      rowTop + 2 * (firstRowHeight + verticalGap),
      rowTop + 2 * firstRowHeight + secondRowHeight + 3 * verticalGap]
    : [rowTop, rowTop, rowTop + firstRowHeight + verticalGap, rowTop + firstRowHeight + verticalGap];

  const lateBoxes = late ? lateMacroBoxes(width, height, narrow) : undefined;
  const regions: MacroRegion[] = macroClusters(snapshot.label).map((macro, i) => {
    const box = readingLayout?.[i] ?? lateBoxes?.[i] ?? {
      x: narrow || i % 2 === 0 ? inset : inset + widths[i - 1] + horizontalGap,
      y: rows[i], width: widths[i], height: i < 2 ? firstRowHeight : secondRowHeight,
    };
    return { ...box, macro, color: macro.color,
      ranks: new Set(macro.blocks.map((block) => block.rank)) };
  });
  const assigned = new Set(regions.flatMap((region) => [...region.ranks]));
  const unassigned = new Set(Array.from({ length: snapshot.blocks }, (_, rank) => rank)
    .filter((rank) => !assigned.has(rank)));
  if (unassigned.size) regions.push({
    ranks: unassigned,
    color: "#8e948f",
    x: inset, y: height - remainderHeight - 9, width: span, height: remainderHeight,
  });

  const positions: Point[] = [];
  function place(bounds: PlotBox, ranks: Set<number>, padding: number, header: number, widthLimit?: number) {
    const indices = snapshot.nodes.flatMap((node, index) => ranks.has(node[2]) ? [index] : []);
    const coordinates = indices.map((index) => snapshot.clusterPositions[index]);
    const xs = coordinates.map(([x]) => x), ys = coordinates.map(([, y]) => 1 - y);
    const minX = Math.min(...xs), minY = Math.min(...ys);
    const dx = Math.max(...xs) - minX, dy = Math.max(...ys) - minY;
    const usableWidth = Math.min(widthLimit ?? Infinity, bounds.width - 2 * padding);
    const usableHeight = bounds.height - header - padding;
    const normalize = (value: number, min: number, range: number) => range > 0 ? (value - min) / range : .5;
    for (let i = 0; i < indices.length; i++) {
      positions[indices[i]] = {
        x: bounds.x + (bounds.width - usableWidth) / 2 + normalize(xs[i], minX, dx) * usableWidth,
        y: bounds.y + header + normalize(ys[i], minY, dy) * usableHeight,
      };
    }
  }
  for (const region of regions) {
    if (late && region.macro?.id === 1) {
      place(region, region.ranks, 46, 46);
    } else if (!region.macro) {
      place(region, region.ranks, 22, 16, region.ranks.size === 1 ? 150 : undefined);
    } else {
      place(region, region.ranks, narrow ? 30 : 38, readingLayout ? 56 : 86);
    }
  }
  return { positions, regions, height };
}

function makeLayout(snapshot: Snapshot, clustered: boolean, width: number, grouped: boolean): Layout {
  const macro = grouped ? macroLayout(snapshot, width) : null;
  const height = macro?.height ?? Math.min(670, Math.max(420, width * .65));
  const marginX = width < 560 ? 30 : 44;
  const marginY = width < 560 ? 35 : 45;
  const coordinates = clustered ? snapshot.clusterPositions : snapshot.categoryPositions;
  const positions = macro?.positions ?? coordinates.map(([x, y]) => ({
    x: marginX + x * (width - 2 * marginX),
    y: marginY + (1 - y) * (height - 2 * marginY),
  }));
  if (!clustered) return { positions, groups: [], height, regions: [] };
  const members = Array.from({ length: snapshot.blocks }, () => [] as Point[]);
  snapshot.nodes.forEach((node, i) => {
    members[node[2]].push(positions[i]);
  });
  const groups = members.map((points, i) => {
    const xs = points.map((point) => point.x), ys = points.map((point) => point.y);
    const left = Math.min(...xs), right = Math.max(...xs), top = Math.min(...ys), bottom = Math.max(...ys);
    const region = macro?.regions.find((item) => item.ranks.has(i));
    const box = region;
    const captionHeight = region?.macro?.reading ? 42 : region?.macro ? 62 : 0;
    const labelBounds = box ? {
      x: box.x + 4, y: box.y + captionHeight,
      width: box.width - 8, height: box.height - captionHeight - 4,
    } : undefined;
    return {
      labelBounds,
      x: (left + right) / 2, y: (top + bottom) / 2,
      radiusX: (right - left) / 2 + 11,
      radiusY: (bottom - top) / 2 + 11,
      label: clusterLabel(i),
      color: region?.color ?? "hsl(" + ((i * 137.508 + 154) % 360) + " 67% 63%)",
    };
  });
  return { positions, groups: placeLabels(groups, width, height), height, regions: macro?.regions ?? [] };
}

interface CanvasProps {
  snapshot: Snapshot;
  stage: Stage;
  grouped: boolean;
  lang: Lang;
  selected: number | null;
  story: BridgeStory | undefined;
  macroStory: MacroBridgeStory | undefined;
  selectedMacro: number | null;
  selectedCluster: number | null;
  diversity: Diversity[] | null;
  onCluster: (rank: number) => void;
  onMacro: (id: number) => void;
  onSelect: (node: number | null) => void;
}
function DashboardGraph({ snapshot, stage, grouped, lang, selected, story, macroStory, selectedMacro, selectedCluster, diversity, onCluster, onMacro, onSelect }: CanvasProps) {
  const theme = useTheme();
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previous = useRef<{ snapshot: Snapshot; width: number; layout: Layout } | null>(null);
  const livePositions = useRef<Point[]>([]);
  const [width, setWidth] = useState(0);
  const clustered = stage > 0;
  const intermediaries = useMemo(
    () => snapshot.nodes.map((node, index) => stage === 3 && (snapshot.macroBetweenness?.scores[index] ?? node[3]) > 0),
    [snapshot, stage],
  );
  const layout = useMemo(() => makeLayout(snapshot, clustered, Math.max(180, width), grouped), [snapshot, clustered, width, grouped]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const resize = () => setWidth(host.clientWidth);
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || !width) return;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(layout.height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    const old = previous.current;
    const animate = !!old && old.snapshot === snapshot && old.width === width &&
      old.layout.positions !== layout.positions && !motionPreference();
    const origin = animate ? livePositions.current : layout.positions;
    const started = performance.now();
    let frame = 0;
    previous.current = { snapshot, width, layout };
    const coreRanks = grouped && snapshot.label === CORE_PERIOD ? layoutCoreRanks(snapshot.label) : undefined;
    const colors = snapshot.nodes.map((node, index) =>
      intermediaries[index] ? ORANGE : coreRanks?.has(node[2]) ? "#286b46" : categoryColor(node[1]));
    const branchByNode = new Map<number, number>();
    story?.branches.forEach((branch, i) => branch.forEach((node) => branchByNode.set(node, i)));
    const focusedStory = macroStory ?? story;
    const highlightedNodes = new Set(macroStory?.links.map((link) => link.node) ?? story?.terms);
    const link = theme === "oscuro" ? "#a4b6a9" : "#4b6259";
    const diversityInk = getComputedStyle(canvas).getPropertyValue("--diversity-ink").trim();
    const nodeRadius = width < 560 ? 3 : 3.5;
    const visibleInCluster = snapshot.nodes.map((node) => selectedCluster === null || node[2] === selectedCluster);

    function draw(now: number) {
      if (!context) return;
      const progress = animate ? Math.min((now - started) / 525, 1) : 1;
      const slide = 1 - (1 - progress) ** 3;
      const points = progress === 1 ? layout.positions : layout.positions.map(({ x, y }, i) => ({
        x: origin[i].x + (x - origin[i].x) * slide,
        y: origin[i].y + (y - origin[i].y) * slide,
      }));
      livePositions.current = points;
      context.clearRect(0, 0, width, layout.height);
      for (const region of layout.regions) {
        if (!region.macro) continue;
        const reveal = Math.max(0, (progress - .34) / .66);
        const chosen = selectedMacro === region.macro.id;
        context.fillStyle = region.color;
        context.strokeStyle = region.color;
        context.lineWidth = chosen ? 2 : 1;
        context.beginPath();
        context.roundRect(region.x, region.y, region.width, region.height, 18);
        context.globalAlpha = reveal * (chosen ? .23 : .13);
        context.fill();
        context.globalAlpha = reveal * (chosen ? .85 : .38);
        context.stroke();
      }
      if (clustered) {
        context.globalAlpha = Math.max(0, (progress - .46) / .54) * (theme === "oscuro" ? .17 : .20);
        for (const [rank, group] of layout.groups.entries()) {
          if (selectedCluster !== null) {
            context.globalAlpha = Math.max(0, (progress - .46) / .54) * (rank === selectedCluster ? .32 : .08);
          }
          context.beginPath();
          const metric = diversity?.[rank];
          if (metric) {
            context.fillStyle = diversityInk;
            context.globalAlpha = Math.max(0, (progress - .46) / .54) * (.12 + .68 * metric.diversity);
          } else {
            context.fillStyle = group.color;
          }
          context.ellipse(group.x, group.y, group.radiusX, group.radiusY, 0, 0, TAU);
          context.fill();
        }
      }
      const directStoryLinks: DashboardEdge[] = [];
      for (const edge of snapshot.edges) {
        const [source, target, weight] = edge;
        const from = points[source], to = points[target];
        const incident = selected === source || selected === target;
        const other = source === selected ? target : source;
        if (focusedStory && incident && highlightedNodes.has(other)) {
          directStoryLinks.push(edge);
          continue;
        }
        const sameBlock = snapshot.nodes[source][2] === snapshot.nodes[target][2];
        const branch = branchByNode.get(source);
        const withinBranch = branch !== undefined && branch === branchByNode.get(target);
        context.strokeStyle = link;
        context.globalAlpha = focusedStory ? (withinBranch ? .36 : .025) :
          incident ? .54 : visibleInCluster[source] && visibleInCluster[target] ?
            (clustered && sameBlock ? .20 : .055) : .025;
        context.lineWidth = (!focusedStory && incident ? .8 : .38) + .23 * Math.sqrt(weight);
        context.beginPath();
        context.moveTo(from.x, from.y);
        context.lineTo(to.x, to.y);
        context.stroke();
      }
      context.strokeStyle = ORANGE;
      context.globalAlpha = .96;
      context.lineWidth = 2;
      for (const [source, target] of directStoryLinks) {
        context.beginPath();
        context.moveTo(points[source].x, points[source].y);
        context.lineTo(points[target].x, points[target].y);
        context.stroke();
      }
      context.globalAlpha = 1;
      points.forEach(({ x, y }, i) => {
        const emphasized = focusedStory?.node === i || highlightedNodes.has(i);
        context.globalAlpha = visibleInCluster[i] ? 1 : .25;
        context.fillStyle = colors[i];
        context.beginPath();
        context.arc(x, y, emphasized ? 5.5 : nodeRadius, 0, TAU);
        context.fill();
        if (i === selected || highlightedNodes.has(i)) {
          context.strokeStyle = theme === "oscuro" ? "#ffffff" : "#1f2421";
          context.lineWidth = 1.2;
          context.beginPath();
          context.arc(x, y, 8, 0, TAU);
          context.stroke();
        }
      });
      if (progress < 1) frame = requestAnimationFrame(draw);
    }
    draw(started);
    return () => cancelAnimationFrame(frame);
  }, [snapshot, intermediaries, clustered, grouped, layout, selected, story, macroStory, selectedMacro, selectedCluster, diversity, theme, width]);

  function inspect(event: PointerEvent<HTMLCanvasElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left, y = event.clientY - bounds.top;
    let distance = 13;
    let closest: number | null = null;
    livePositions.current.forEach((point, i) => {
      const candidate = Math.hypot(x - point.x, y - point.y);
      if (candidate < distance) {
        distance = candidate;
        closest = i;
      }
    });
    const region = layout.regions.find(({ x: left, y: top, width, height, macro }) =>
      macro && x >= left && x <= left + width && y >= top && y <= top + height);
    if (region?.macro && (stage === 2 || closest === null)) {
      onMacro(region.macro.id);
      return;
    }
    onSelect(closest);
  }

  return (
    <div className="dashboard-graph" ref={hostRef} style={{ height: layout.height }}>
      <canvas ref={canvasRef} role="img" aria-label={snapshot.label} onPointerUp={inspect} />
      {width > 0 && layout.groups.map((group, rank) => diversity ? (
        <button type="button" key={group.label} data-cluster={group.label}
          className="dashboard-cluster dashboard-diversity-label"
          aria-pressed={selectedCluster === rank} data-highlighted={selectedCluster === rank || undefined}
          style={{ left: group.labelPosition.x, top: group.labelPosition.y }}
          onClick={() => onCluster(rank)}>
          {group.label}<small>{diversity[rank] ? diversityFormat[lang].format(diversity[rank].diversity) : "—"}</small>
        </button>
      ) : (
        <span
          key={group.label}
          data-cluster={group.label}
          data-highlighted={selectedCluster === rank ? true : undefined}
          className="dashboard-cluster"
          style={{ left: group.labelPosition.x, top: group.labelPosition.y }}
        >
          {group.label}
        </span>
      ))}
      {width > 0 && layout.regions.map((region) => region.macro ? (
        <button type="button" key={region.macro.id}
          className="dashboard-macro-label"
          data-macro={region.macro.id}
          data-core={snapshot.label === CORE_PERIOD && region.macro.id === 1 ? "true" : undefined}
          aria-pressed={selectedMacro === region.macro.id}
          style={snapshot.label === CORE_PERIOD && region.macro.id === 1 ?
            { left: region.x + region.width / 2, top: region.y + 7, width: Math.min(292, width - 24) } :
            { left: region.x + 10, top: region.y + 8, width: region.width - 20 }}
          onClick={() => region.macro && onMacro(region.macro.id)}>
          <i aria-hidden="true" style={{ background: region.color }} />
          {region.macro.name[lang]}
        </button>
      ) : null)}
      {width > 0 && stage === 3 && (snapshot.macroBetweenness?.stories ?? snapshot.stories).map(({ node }) => (
        <button
          type="button"
          key={node}
          className="dashboard-bridge"
          aria-label={snapshot.nodes[node][0]}
          aria-pressed={selected === node}
          title={snapshot.nodes[node][0]}
          style={{ left: layout.positions[node].x, top: layout.positions[node].y, color: ORANGE }}
          onClick={() => onSelect(selected === node ? null : node)}
        />
      ))}
    </div>
  );
}

function NestedFitDetails({ fit }: { fit: NestedFit }) {
  const { t } = useT();
  const [parent] = fit.blocks;
  return (
    <details className="dashboard-nested-fit">
      <summary>{t("dashboard.nestedFit", { sizes: fit.blocks.map((block) => block.size).join(" + ") })}</summary>
      <p>{t("dashboard.nestedModel", { seed: fit.seed })}</p>
      <ul>
        {fit.blocks.map((block, rank) => (
          <li key={rank}>
            <strong>{clusterLabel(rank)}</strong>{" "}
            {t("dashboard.nestedBlock", { n: block.size, edges: block.internal_edges })}
            {" · "}
            {block.components === 1 ? t("dashboard.nestedConnected") : t("dashboard.nestedComponents", {
              n: block.components, isolated: block.isolated, largest: block.largest_component,
            })}
          </li>
        ))}
      </ul>
      <p>{t("dashboard.nestedRefit", {
        n: parent.size, trials: fit.recursive.trialsPerModel, blocks: fit.recursive.blocks,
      })}</p>
      <p>{t("dashboard.nestedControl", {
        n: fit.sensitivity.nodes, splits: fit.sensitivity.splits, trials: fit.sensitivity.trials,
        sizes: fit.sensitivity.sizes.join(" / "),
      })}</p>
    </details>
  );
}

function DashboardStory({ snapshots, view }: { snapshots: Snapshot[]; view: DashboardNetworkMode }) {
  const { t, lang } = useT();
  const [showDiversity, setShowDiversity] = useState(false);
  const [period, setPeriod] = useState(0);
  const [shown, setShown] = useState(0);
  const [step, setStep] = useState<Stage>(0);
  const [fading, setFading] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [selectedMacro, setSelectedMacro] = useState<number | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const snapshot = snapshots[shown];
  const plotRef = useRef<HTMLDivElement>(null);
  const hasPracticeFinding = view === "practice-actors" && snapshot.label === "2000–2019" && !!snapshot.nestedFit;
  const macros = view === "full" ? macroClusters(snapshot.label) : [];
  const config = DASHBOARD_VIEWS[view];
  const practiceCount = view === "practice-actors" ? snapshot.nodes.filter((node) => node[1] === "PRAC").length : 0;
  const nodeCount = view === "practice-actors" ? t("dashboard.practiceActorCounts", {
    practices: formatInt(practiceCount, lang),
    actors: formatInt(snapshot.nodes.length - practiceCount, lang),
  }) : formatInt(snapshot.nodes.length, lang) + " " + t(view === "actors" ? "dashboard.actorViewLabel" : "dashboard.nodes");
  const hasMacros = macros.length > 0;
  const assignedRanks = new Set(macros.flatMap((macro) => macro.blocks.map((block) => block.rank)));
  const unassigned = Array.from({ length: snapshot.blocks }, (_, rank) => rank)
    .filter((rank) => !assignedRanks.has(rank)).map(clusterLabel).join(", ");
  const stage = step === 2 && !hasMacros ? 1 : step;
  const canShowDiversity = view === "full" && stage === 1;
  const mapDiversity = canShowDiversity && showDiversity;
  const nextStage = (stage === 1 && !hasMacros ? 3 : (stage + 1) % 4) as Stage;
  const nextLabel = stage === 1 && !hasMacros ? "dashboard.showBridges" : NEXT[stage];
  const node = selected === null ? null : snapshot.nodes[selected];
  const macroMetric = stage === 3 ? snapshot.macroBetweenness : undefined;
  const story = stage === 3 && !macroMetric ? snapshot.stories.find((item) => item.node === selected) : undefined;
  const macroStory = macroMetric?.stories.find((item) => item.node === selected);
  const score = selected === null ? 0 : (macroMetric?.scores[selected] ?? node?.[3] ?? 0);
  const profile = hasMacros && stage >= 2 ? macros.find((macro) => macro.id === selectedMacro) : undefined;
  const parentMacro = selectedCluster !== null && stage >= 2
    ? macros.find((macro) => macro.reading && macro.blocks.some((block) => block.rank === selectedCluster)) : undefined;
  const profileRanks = new Set(profile?.blocks.map((block) => block.rank));
  const counts = useMemo(() => {
    const byCluster = Array<number>(snapshot.blocks).fill(0);
    const clusterCategories = Array.from({ length: snapshot.blocks }, () => new Map<string, number>());
    const byCategory = new Map<string, number>();
    for (const [, category, rank] of snapshot.nodes) {
      byCluster[rank]++;
      const categories = clusterCategories[rank];
      categories.set(category, (categories.get(category) ?? 0) + 1);
      byCategory.set(category, (byCategory.get(category) ?? 0) + 1);
    }
    return { byCluster, byCategory, diversity: clusterCategories.map(categoryDiversity) };
  }, [snapshot]);
  const largestCluster = Math.max(...counts.byCluster);
  const visibleCategories = CATEGORY_ORDER.filter((category) => counts.byCategory.has(category));
  const activeCluster = selectedCluster ?? (node && stage > 0 ? node[2] : null);
  const periodProfiles = view === "full" ? fullNetworkProfiles[snapshot.label] : undefined;
  const clusterProfile = selectedCluster === null ? undefined : periodProfiles?.[selectedCluster];
  const profileTerms = clusterProfile?.terms
    .map((name) => snapshot.nodes.find((node) => node[0] === name && node[2] === selectedCluster))
    .filter((node) => node !== undefined) ?? [];
  const categoryCounts = (
    <ul className="dashboard-category-counts">
      {visibleCategories.map((category) => (
        <li key={category} className="dashboard-count-row">
          <span><i aria-hidden="true" style={{ backgroundColor: categoryColor(category) }} />{categoryLabel(category, lang, true)}</span>
          <strong>{formatInt(counts.byCategory.get(category) ?? 0, lang)}</strong>
        </li>
      ))}
    </ul>
  );

  function selectNode(index: number | null) {
    setSelectedCluster(null);
    setSelectedMacro(null);
    setSelected(index);
  }

  function selectMacro(id: number) {
    setSelectedCluster(null);
    setSelected(null);
    setSelectedMacro((current) => current === id ? null : id);
  }

  function selectCluster(rank: number) {
    setSelected(null);
    setSelectedMacro(null);
    setSelectedCluster(selectedCluster === rank ? null : rank);
  }

  function showPracticeFinding() {
    const rank = 1;
    if (stage === 0) setStep(1);
    selectCluster(rank);
    if (selectedCluster !== rank && window.matchMedia("(max-width: 1023px)").matches) {
      plotRef.current?.scrollIntoView({ block: "start", behavior: motionPreference() ? "instant" : "smooth" });
    }
  }

  const goTo = useCallback((next: number) => {
    window.clearTimeout(timer.current);
    setPeriod(next);
    if (motionPreference()) {
      setSelected(null);
      setSelectedMacro(null);
      setSelectedCluster(null);
      setShown(next);
      setFading(false);
      return;
    }
    setFading(true);
    timer.current = window.setTimeout(() => {
      setSelected(null);
      setSelectedMacro(null);
      setSelectedCluster(null);
      setShown(next);
      setFading(false);
    }, 180);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <section className="card dashboard-story" aria-label={t(config.label)}>
      {stage === 3 && (
        <div className="dashboard-stories" role="group" aria-label={t("dashboard.examples")}>
          <span>{t("dashboard.examples")}</span>
          {(macroMetric?.stories ?? snapshot.stories).map(({ node: index }) => (
            <button key={index} type="button" aria-pressed={selected === index}
              onClick={() => selectNode(selected === index ? null : index)}>
              {snapshot.nodes[index][0]}
            </button>
          ))}
        </div>
      )}
      <div className={"dashboard-workbench" + (periodProfiles ? " has-cluster-profiles" : "") + (fading ? " is-fading" : "")}>
        <div className="dashboard-plot-column">
          <div className="dashboard-snapshot" ref={plotRef} data-period={snapshot.label} data-stage={stage}>
            <div className="dashboard-snapshot-header">
              <div className="dashboard-status num" aria-live="polite">
                <strong>{snapshot.label}</strong>
                <span>{t(macroMetric ? "dashboard.macroBridgeScore" : STAGES[stage])}</span>
                <span>{t("common.documents", { n: formatInt(snapshot.documents, lang) })} · {nodeCount} · {formatInt(snapshot.edges.length, lang)} {t("dashboard.edges")}</span>
                {snapshot.isolatedActors !== undefined && <span>{t("dashboard.actorIsolates", { n: formatInt(snapshot.isolatedActors, lang) })}</span>}
                {snapshot.isolatedNodes !== undefined && <span>{t("dashboard.isolatedNodes", { n: formatInt(snapshot.isolatedNodes, lang) })}</span>}
              </div>
              <button type="button" className="dashboard-action" onClick={() => {
                setStep(nextStage);
                setSelectedCluster(null);
                setSelected(null);
                setSelectedMacro(null);
              }}>
                {t(nextLabel)}
              </button>
            </div>
            {canShowDiversity && (
              <div className="dashboard-diversity-tools">
                <button type="button" aria-pressed={showDiversity} onClick={() => setShowDiversity(!showDiversity)}>
                  {t("dashboard.showDiversity")}
                </button>
                {showDiversity && <span className="dashboard-diversity-scale">
                  {t("dashboard.diversity")} <b>0</b><i aria-hidden="true" /><b>1</b>
                </span>}
              </div>
            )}
            {stage > 0 && snapshot.nestedFit && <NestedFitDetails key={snapshot.label} fit={snapshot.nestedFit} />}
            <DashboardGraph snapshot={snapshot} stage={stage} grouped={hasMacros && stage >= 2} lang={lang} selected={selected} story={story} macroStory={macroStory}
              diversity={mapDiversity ? counts.diversity : null} onCluster={selectCluster}
              selectedMacro={selectedMacro} selectedCluster={selectedCluster} onMacro={selectMacro} onSelect={selectNode} />
            {hasMacros && stage >= 2 && unassigned && <p className="dashboard-unassigned">{t("dashboard.unassigned", { cluster: unassigned })}</p>}
          </div>
          <div className="dashboard-timeline" role="group" aria-label={t("top.period")}>
            {snapshots.map((item, index) => (
              <button
                key={item.label}
                type="button"
                aria-label={item.label}
                aria-pressed={index === period}
                onClick={() => { if (index !== period) goTo(index); }}
              >
                {item.label.replace(/–\d{2}(\d{2})$/, "-$1")}
              </button>
            ))}
          </div>
        </div>
        <aside className="dashboard-inspector" aria-label={t("dashboard.inspector")}>
          {hasPracticeFinding && (
            <section className="dashboard-finding" aria-labelledby="dashboard-practice-finding-title">
              <h3 id="dashboard-practice-finding-title">{t("dashboard.practiceFindingTitle")}</h3>
              <p>{t("dashboard.practiceFindingEvidence")}</p>
              <p>{t("dashboard.practiceFindingReading")}</p>
              <button type="button" className="dashboard-finding-action" aria-pressed={selectedCluster === 1}
                onClick={showPracticeFinding}>{t("dashboard.practiceFindingShow")}</button>
            </section>
          )}
          <div className="dashboard-detail" aria-live="polite">
            {profile?.reading ? (
              <article key={profile.id} className="dashboard-macro-reading dashboard-node-card" style={{ borderInlineStartColor: profile.color }}>
                <button type="button" className="dashboard-story-close" onClick={() => setSelectedMacro(null)} aria-label={t("common.close")}>×</button>
                <small>{t("dashboard.macroTotal", { blocks: profile.blocks.length,
                  nodes: formatInt([...profileRanks].reduce((sum, rank) => sum + counts.byCluster[rank], 0), lang) })}</small>
                <h3>{profile.name[lang]}</h3>
                {profile.description?.[lang].map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                <details open>
                  <summary>{t("dashboard.macroNetworkEvidence")}</summary>
                  <p>{profile.reading.network[lang]}</p>
                </details>
                <details>
                  <summary>{t("dashboard.macroCorpusEvidence")}</summary>
                  {profile.reading.sources.map((source) => (
                    <div className="dashboard-reading-source" key={source.title}>
                      <cite>{source.title}</cite>
                      <blockquote lang="en">{source.excerpt}</blockquote>
                      <p>{source.passage[lang]}</p>
                    </div>
                  ))}
                </details>
                <h4>{t("dashboard.exploreMacroBlocks")}</h4>
                <div className="dashboard-reading-blocks">
                  {profile.blocks.map((block) => (
                    <button key={block.rank} onClick={() => selectCluster(block.rank)}>
                      <b>{clusterLabel(block.rank)}</b><span>{block.name[lang]}</span>
                    </button>
                  ))}
                </div>
              </article>
            ) : profile ? (
              <div className="dashboard-story-note dashboard-macro-profile" style={{ borderColor: profile.color }}>
                <button type="button" className="dashboard-story-close" onClick={() => setSelectedMacro(null)}
                  aria-label={t("common.close")}>×</button>
                <strong>{profile.name[lang]}</strong>
                <span>{t("dashboard.macroTotal", { blocks: profile.blocks.length,
                  nodes: formatInt([...profileRanks].reduce((sum, rank) => sum + counts.byCluster[rank], 0), lang) })}</span>
                {profile.description?.[lang].map((paragraph) => (
                  <p className="dashboard-profile-description" key={paragraph}>{paragraph}</p>
                ))}
                <ul>
                  {profile.blocks.map((block) => (
                    <li key={block.rank}>
                      <b>{clusterLabel(block.rank)}</b>{block.name[lang] && " " + block.name[lang]}
                      <span> · {formatInt(counts.byCluster[block.rank], lang)} {t("dashboard.nodes")}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : node ? (
              <div className="dashboard-node-card" style={{ borderInlineStartColor: categoryColor(node[1]) }}>
                {!story && !macroStory && (
                  <button type="button" className="dashboard-story-close" onClick={() => selectNode(null)}
                    aria-label={t("dashboard.clearNode")}>×</button>
                )}
                <span className="dashboard-node-eyebrow">{t("dashboard.selectedNode")}</span>
                <strong className="dashboard-node-name">{node[0]}</strong>
                <div className="dashboard-node-meta">
                  <span><i aria-hidden="true" style={{ backgroundColor: categoryColor(node[1]) }} />{categoryLabel(node[1], lang)}</span>
                  {stage > 0 && <span>{clusterLabel(node[2])}</span>}
                </div>
                {stage === 3 && <span>{t(macroMetric ? "dashboard.macroBridgeScore" : "dashboard.score")} {new Intl.NumberFormat(lang, { maximumSignificantDigits: 4 }).format(score)}</span>}
              </div>
            ) : clusterProfile && selectedCluster !== null ? (
              <div className="dashboard-node-card dashboard-cluster-profile">
                <button type="button" className="dashboard-story-close" onClick={() => selectCluster(selectedCluster)}
                  aria-label={t("common.close")}>×</button>
                {parentMacro && <button className="dashboard-parent-macro" onClick={() => selectMacro(parentMacro.id)}>‹ {parentMacro.name[lang]}</button>}
                <h3 className="dashboard-node-name">{clusterLabel(selectedCluster)} · {clusterProfile.title[lang]}</h3>
                <ClusterDiversity key={snapshot.label + selectedCluster} metric={counts.diversity[selectedCluster]} />
                <p className="dashboard-cluster-question">{t("dashboard.clusterThemeQuestion")}</p>
                <p className="dashboard-cluster-answer">{clusterProfile.description[lang]}</p>
                <h4 className="dashboard-cluster-terms-title">
                  {t(profileTerms.length === counts.byCluster[selectedCluster] ? "dashboard.clusterAllNodes" : "dashboard.clusterTopNodes", {
                    count: profileTerms.length, cluster: clusterLabel(selectedCluster),
                  })}
                </h4>
                <ul className="dashboard-cluster-terms">
                  {profileTerms.map(([name, category]) => {
                    const color = categoryColor(category);
                    return <li key={name} data-category={category} title={categoryLabel(category, lang)}
                      style={{ borderColor: color, backgroundColor: `color-mix(in srgb, ${color} 22%, var(--surf))` }}>
                      {name}
                    </li>;
                  })}
                </ul>
                <p className="dashboard-cluster-question">{t("dashboard.clusterTerritoryQuestion")}</p>
                <p className="dashboard-cluster-answer">{clusterProfile.territorialReading[lang]}</p>
              </div>
            ) : selectedCluster !== null ? (
              <><strong>{clusterLabel(selectedCluster)}</strong><span>{t("dashboard.nodeTotal", {
                n: formatInt(counts.byCluster[selectedCluster], lang),
              })}</span></>
            ) : stage === 2 && macros.some((macro) => macro.reading) ? (
              <section className="dashboard-reading-index">
                <h3>{t("dashboard.macroReadings")}</h3>
                <p>{t("dashboard.macroReadingIntro")}</p>
                {macros.map((macro) => (
                  <button key={macro.id} onClick={() => selectMacro(macro.id)}>
                    <i aria-hidden="true" style={{ background: macro.color }} /><span>{macro.name[lang]}</span><b aria-hidden="true">›</b>
                  </button>
                ))}
              </section>
            ) : (
              <div className="dashboard-node-placeholder">
                <strong>{t("dashboard.nodeDetails")}</strong>
                <p>{t(stage === 3 ? (macroMetric ? "dashboard.macroBridgeHelp" : "dashboard.bridgeHelp") : stage === 2 ? "dashboard.macroHint" : "dashboard.inspect")}</p>
              </div>
            )}
            {macroStory && (
              <div className="dashboard-story-note dashboard-macro-profile">
                <button type="button" className="dashboard-story-close" onClick={() => selectNode(null)}
                  aria-label={t("common.close")}>×</button>
                <strong>{t("dashboard.macroBridgeLinks", { count: macroStory.links.length })}</strong>
                <ul className="dashboard-macro-bridge-links">
                  {macroStory.links.map((link) => {
                    const macro = macros.find((item) => item.id === link.macro);
                    return (
                      <li key={link.node}>
                        <span>{macro?.name[lang]}</span>
                        <b>{snapshot.nodes[link.node][0]}</b>
                        <span> · {t(link.documents === 1 ? "common.docOne" : "common.docs", { n: link.documents })}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {story && (
              <div className="dashboard-story-note">
                <button type="button" className="dashboard-story-close" onClick={() => setSelected(null)}
                  aria-label={t("common.close")}>×</button>
                <strong>{snapshot.nodes[story.terms[0]][0]} → {node?.[0]} → {snapshot.nodes[story.terms[1]][0]}</strong>
                <span>{t("dashboard.storySplit", {
                  first: story.branches[0].length, second: story.branches[1].length,
                })}</span>
                <span>{t("dashboard.storyEvidence", { first: story.documents[0], second: story.documents[1] })}</span>
              </div>
            )}
          </div>
          {stage > 0 ? (
            <details className="dashboard-cluster-key" open>
              <summary>
                <span className="dashboard-cluster-summary">
                  <span>{t("dashboard.clusters")}</span>
                  <span>{t("dashboard.nodeTotal", { n: formatInt(snapshot.nodes.length, lang) })}</span>
                </span>
              </summary>
              <div className="dashboard-cluster-list" role="group" aria-label={t("dashboard.exploreCounts")}>
                {counts.byCluster.map((size, rank) => (
                  <button key={rank} type="button" className="dashboard-count-row"
                    data-active={activeCluster === rank ? true : undefined}
                    aria-pressed={selectedCluster === rank}
                    onClick={() => selectCluster(rank)}>
                    <span>{clusterLabel(rank)}</span>
                    <strong aria-label={t("dashboard.nodeTotal", { n: formatInt(size, lang) })}>{formatInt(size, lang)}</strong>
                    <i aria-hidden="true" style={{ width: (size / largestCluster * 100) + "%" }} />
                  </button>
                ))}
              </div>
            </details>
          ) : (
            <div className="dashboard-counts">
              <header>
                <h3>{t("dashboard.categories")}</h3>
                <span>{t("dashboard.nodeTotal", { n: formatInt(snapshot.nodes.length, lang) })}</span>
              </header>
              {categoryCounts}
            </div>
          )}
          {stage > 0 && (
            <details className="dashboard-category-key" key={snapshot.label}>
              <summary>{t("dashboard.categories")}</summary>
              {categoryCounts}
            </details>
          )}
          {stage === 3 && (
            <span className="dashboard-bridge-key">
              <i aria-hidden="true" style={{ backgroundColor: ORANGE }} />
              {t(macroMetric ? "dashboard.macroPositiveBridges" : "dashboard.positiveBridges")}
            </span>
          )}
        </aside>
      </div>
    </section>
  );
}

export function DashboardViewPicker({ view, onChange }: { view: DashboardMode; onChange: (mode: DashboardMode) => void }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function closeOutside(event: globalThis.PointerEvent) {
      if (event.target instanceof Node && !menu.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);

  function choose(mode: DashboardMode) {
    setOpen(false);
    onChange(mode);
    trigger.current?.focus();
  }

  return (
    <div className="dashboard-view-picker" role="group" aria-label={t("dashboard.viewPicker")}>
      <div ref={menu} className="dashboard-full-menu" onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.stopPropagation();
          setOpen(false);
          trigger.current?.focus();
        }
      }}>
        <button ref={trigger} type="button" className="dashboard-full-trigger"
          data-active={view === "full" || view === "ego-networks" ? true : undefined}
          aria-expanded={open} aria-controls={open ? "dashboard-full-options" : undefined}
          onClick={() => setOpen(!open)}>
          {t("dashboard.fullView")}
          <span className="dashboard-full-chevron" aria-hidden="true" />
        </button>
        {open && (
          <div className="dashboard-full-menu-options" id="dashboard-full-options">
            <button type="button" aria-pressed={view === "full"} onClick={() => choose("full")}>
              {t("dashboard.fullView")}
            </button>
            <button type="button" aria-pressed={view === "ego-networks"} onClick={() => choose("ego-networks")}>
              <span>{t("ego.title")}</span>
              <small>{EGO_TERMS.join(" · ")}</small>
            </button>
          </div>
        )}
      </div>
      {VIEW_OPTIONS.map((option) => (
        <button key={option} type="button" aria-pressed={view === option} onClick={() => {
          setOpen(false);
          onChange(option);
        }}>
          {t(DASHBOARD_VIEWS[option].label)}
        </button>
      ))}
    </div>
  );
}

function DashboardNetwork({ view }: { view: DashboardNetworkMode }) {
  const { t } = useT();
  const data = useQuery({
    queryKey: ["dashboard", "lognormal", view],
    queryFn: async ({ signal }): Promise<Snapshot[]> => {
      const { file } = DASHBOARD_VIEWS[view];
      const response = await fetch(import.meta.env.BASE_URL + "data/" + file, { signal });
      if (!response.ok) throw new Error("Dashboard snapshot unavailable");
      return response.json() as Promise<Snapshot[]>;
    },
    staleTime: Infinity,
  });
  return (
    <>
      {view === "full" && <div className="card dashboard-intro" aria-hidden="true" />}
      {data.data ? <DashboardStory key={view} snapshots={data.data} view={view} /> : data.isError ? (
        <div className="notice error">
          {t("dashboard.loadError")}{" "}
          <button type="button" onClick={() => void data.refetch()}>{t("dashboard.retry")}</button>
        </div>
      ) : <Loader label={t("common.loading")} size={52} />}
    </>
  );
}

export function DashboardView({ view }: { view: DashboardMode }) {
  const viewport = useRef<HTMLElement>(null);
  useEffect(() => { viewport.current?.scrollTo(0, 0); }, [view]);

  return (
    <main className="dashboard-view scroll-view" ref={viewport}>
      {view === "ego-networks" ? <EgoNetworksView /> : <DashboardNetwork view={view} />}
    </main>
  );
}
