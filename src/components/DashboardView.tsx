import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { CORE_PERIOD, MIDDLE_PERIOD, macroClusters, type MacroConfiguration } from "../domain/dashboardMacros";
import { CATEGORY_ORDER, categoryColor, categoryLabel, formatInt } from "../domain/vocabulary";
import { useT, type Lang } from "../i18n";
import { useTheme } from "../state/theme";
import { Loader } from "./Loader";
import { EgoNetworksView } from "./EgoNetworksView";
import "./dashboard.css";

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
interface Snapshot {
  label: string;
  documents: number;
  blocks: number;
  nodes: DashboardNode[];
  edges: DashboardEdge[];
  categoryPositions: Coordinate[];
  clusterPositions: Coordinate[];
  stories: BridgeStory[];
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
  const labelHeight = 28;
  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));
  const labels: Point[] = [];

  return groups.map((group) => {
    const { x, y, radiusX, radiusY } = group;
    const labelWidth = /^C\d+$/.test(group.label) ? 52 : width < 560 ? 89 : 129;
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
  const core = { x: width / 2 - 78, y: height / 2 - 78, width: 156, height: 156 };
  if (narrow) return [
    core,
    { x: inset, y: 15, width: span, height: 602 },
    { x: inset, y: 635, width: span, height: 590 },
    { x: inset, y: 1456, width: span, height: 241 },
    { x: inset, y: 1715, width: span, height: 241 },
    { x: inset, y: 1974, width: span, height: 241 },
    { x: inset, y: 2233, width: span, height: 376 },
  ];
  const half = (span - gap) / 2;
  const third = (span - gap * 2) / 3;
  return [
    core,
    { x: inset, y: 15, width: half, height: 600 },
    { x: inset + half + gap, y: 15, width: half, height: 600 },
    { x: inset, y: 838, width: third, height: 310 },
    { x: inset + third + gap, y: 838, width: third, height: 310 },
    { x: inset + 2 * (third + gap), y: 838, width: third, height: 310 },
    { x: inset, y: 1166, width: span, height: 205 },
  ];
}

function macroLayout(snapshot: Snapshot, width: number): Pick<Layout, "positions" | "regions" | "height"> {
  const narrow = width < 630;
  const horizontalGap = 18;
  const verticalGap = 18;
  const inset = 13;
  const span = width - inset * 2;
  const late = snapshot.label === CORE_PERIOD;
  const middle = snapshot.label === MIDDLE_PERIOD;
  const remainderHeight = middle ? (narrow ? 310 : 244) : 91;
  const height = late ? (narrow ? 2720 : 1480) :
    (narrow ? 1450 : 935) + remainderHeight - 91;
  const rowTop = 15;
  const firstRowHeight = narrow ? 325 : 460;
  const secondRowHeight = narrow ? 310 : 330;
  const widths = narrow ? [span, span, span, span] :
    [(span - horizontalGap) * .46, (span - horizontalGap) * .54,
     (span - horizontalGap) * .42, (span - horizontalGap) * .58];
  const rows = narrow
    ? [rowTop, rowTop + 325 + verticalGap, rowTop + 650 + 2 * verticalGap, rowTop + 960 + 3 * verticalGap]
    : [rowTop, rowTop, rowTop + firstRowHeight + verticalGap, rowTop + firstRowHeight + verticalGap];

  const lateBoxes = late ? lateMacroBoxes(width, height, narrow) : undefined;
  const regions: MacroRegion[] = macroClusters(snapshot.label).map((macro, i) => {
    const box = lateBoxes?.[i] ?? {
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
      place(region, region.ranks, narrow ? 34 : 47, 80);
    }
  }
  return { positions, regions, height };
}

function makeLayout(snapshot: Snapshot, clustered: boolean, width: number, lang: Lang, grouped: boolean): Layout {
  const categories = CATEGORY_ORDER.filter((category) => snapshot.nodes.some((node) => node[1] === category));
  const macro = grouped ? macroLayout(snapshot, width) : null;
  const height = macro?.height ?? Math.min(930, Math.max(530, width * .82));
  const marginX = width < 560 ? 31 : 63;
  const marginY = width < 560 ? 37 : 68;
  const coordinates = clustered ? snapshot.clusterPositions : snapshot.categoryPositions;
  const positions = macro?.positions ?? coordinates.map(([x, y]) => ({
    x: marginX + x * (width - 2 * marginX),
    y: marginY + (1 - y) * (height - 2 * marginY),
  }));
  const count = clustered ? snapshot.blocks : categories.length;
  const members = Array.from({ length: count }, () => [] as Point[]);
  snapshot.nodes.forEach((node, i) => {
    const group = clustered ? node[2] : categories.findIndex((category) => category === node[1]);
    members[group].push(positions[i]);
  });
  const groups = members.map((points, i) => {
    const xs = points.map((point) => point.x), ys = points.map((point) => point.y);
    const left = Math.min(...xs), right = Math.max(...xs), top = Math.min(...ys), bottom = Math.max(...ys);
    const region = macro?.regions.find((item) => item.ranks.has(i));
    const box = region;
    const captionHeight = region?.macro ? 62 : 0;
    const labelBounds = box ? {
      x: box.x + 4, y: box.y + captionHeight,
      width: box.width - 8, height: box.height - captionHeight - 4,
    } : undefined;
    return {
      labelBounds,
      x: (left + right) / 2, y: (top + bottom) / 2,
      radiusX: (right - left) / 2 + 11,
      radiusY: (bottom - top) / 2 + 11,
      label: clustered ? clusterLabel(i) : categoryLabel(categories[i], lang, true),
      color: clustered ? (region?.color ??
        "hsl(" + ((i * 137.508 + 154) % 360) + " 67% 63%)") : categoryColor(categories[i]),
    };
  });
  return { positions, groups: placeLabels(groups, width, height), height, regions: macro?.regions ?? [] };
}

interface CanvasProps {
  snapshot: Snapshot;
  stage: Stage;
  lang: Lang;
  selected: number | null;
  story: BridgeStory | undefined;
  macroStory: MacroBridgeStory | undefined;
  selectedMacro: number | null;
  onMacro: (id: number) => void;
  onSelect: (node: number | null) => void;
}
function DashboardGraph({ snapshot, stage, lang, selected, story, macroStory, selectedMacro, onMacro, onSelect }: CanvasProps) {
  const theme = useTheme();
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previous = useRef<{ snapshot: Snapshot; width: number; layout: Layout } | null>(null);
  const livePositions = useRef<Point[]>([]);
  const [width, setWidth] = useState(0);
  const clustered = stage > 0;
  const grouped = stage >= 2 && macroClusters(snapshot.label).length > 0;
  const intermediaries = useMemo(
    () => snapshot.nodes.map((node, index) => stage === 3 && (snapshot.macroBetweenness?.scores[index] ?? node[3]) > 0),
    [snapshot, stage],
  );
  const layout = useMemo(() => makeLayout(snapshot, clustered, Math.max(180, width), lang, grouped), [snapshot, clustered, width, lang, grouped]);

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
    const nodeRadius = width < 560 ? 2.15 : 2.8;

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
        for (const group of layout.groups) {
          context.beginPath();
          context.fillStyle = group.color;
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
          incident ? .54 : clustered && sameBlock ? .20 : .055;
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
        context.fillStyle = colors[i];
        context.beginPath();
        context.arc(x, y, emphasized ? 4.6 : nodeRadius, 0, TAU);
        context.fill();
        if (i === selected || highlightedNodes.has(i)) {
          context.strokeStyle = theme === "oscuro" ? "#ffffff" : "#1f2421";
          context.lineWidth = 1.2;
          context.beginPath();
          context.arc(x, y, 7, 0, TAU);
          context.stroke();
        }
      });
      if (progress < 1) frame = requestAnimationFrame(draw);
    }
    draw(started);
    return () => cancelAnimationFrame(frame);
  }, [snapshot, intermediaries, clustered, grouped, layout, selected, story, macroStory, selectedMacro, theme, width]);

  function inspect(event: PointerEvent<HTMLCanvasElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left, y = event.clientY - bounds.top;
    let distance = 10;
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
      {width > 0 && layout.groups.map((group) => (
        <span
          key={group.label}
          data-cluster={clustered ? group.label : undefined}
          className={clustered ? "dashboard-group dashboard-cluster" : "dashboard-group"}
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

function DashboardStory({ snapshots }: { snapshots: Snapshot[] }) {
  const { t, lang } = useT();
  const [period, setPeriod] = useState(0);
  const [shown, setShown] = useState(0);
  const [step, setStep] = useState<Stage>(0);
  const [fading, setFading] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [selectedMacro, setSelectedMacro] = useState<number | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const snapshot = snapshots[shown];
  const macros = macroClusters(snapshot.label);
  const hasMacros = macros.length > 0;
  const assignedRanks = new Set(macros.flatMap((macro) => macro.blocks.map((block) => block.rank)));
  const unassigned = Array.from({ length: snapshot.blocks }, (_, rank) => rank)
    .filter((rank) => !assignedRanks.has(rank)).map(clusterLabel).join(", ");
  const stage = step === 2 && !hasMacros ? 1 : step;
  const nextStage = (stage === 1 && !hasMacros ? 3 : (stage + 1) % 4) as Stage;
  const nextLabel = stage === 1 && !hasMacros ? "dashboard.showBridges" : NEXT[stage];
  const node = selected === null ? null : snapshot.nodes[selected];
  const macroMetric = stage === 3 ? snapshot.macroBetweenness : undefined;
  const story = stage === 3 && !macroMetric ? snapshot.stories.find((item) => item.node === selected) : undefined;
  const macroStory = macroMetric?.stories.find((item) => item.node === selected);
  const score = selected === null ? 0 : (macroMetric?.scores[selected] ?? node?.[3] ?? 0);
  const profile = hasMacros && stage >= 2 ? macros.find((macro) => macro.id === selectedMacro) : undefined;
  const profileRanks = new Set(profile?.blocks.map((block) => block.rank));
  const profileSizes = new Map<number, number>();
  if (profile) {
    for (const item of snapshot.nodes) {
      if (profileRanks.has(item[2])) profileSizes.set(item[2], (profileSizes.get(item[2]) ?? 0) + 1);
    }
  }

  function selectNode(index: number | null) {
    setSelectedMacro(null);
    setSelected(index);
  }

  function selectMacro(id: number) {
    setSelected(null);
    setSelectedMacro((current) => current === id ? null : id);
  }

  const goTo = useCallback((next: number) => {
    window.clearTimeout(timer.current);
    setPeriod(next);
    if (motionPreference()) {
      setSelected(null);
      setSelectedMacro(null);
      setShown(next);
      setFading(false);
      return;
    }
    setFading(true);
    timer.current = window.setTimeout(() => {
      setSelected(null);
      setSelectedMacro(null);
      setShown(next);
      setFading(false);
    }, 180);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <section className="card dashboard-story" aria-label={t("dashboard.title")}>
      <header className="dashboard-header">
        <div>
          <h2>{t("dashboard.title")}</h2>
          <p>{t("dashboard.scope")}</p>
        </div>
        <button type="button" className="dashboard-action" onClick={() => {
          setStep(nextStage);
          setSelected(null);
          setSelectedMacro(null);
        }}>
          {t(nextLabel)}
        </button>
      </header>
      <div className="dashboard-controls">
        <div className="dashboard-timeline" role="group" aria-label={t("top.period")}>
          {snapshots.map((item, index) => (
            <button
              key={item.label}
              type="button"
              aria-pressed={index === period}
              onClick={() => { if (index !== period) goTo(index); }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="dashboard-legend">
        {CATEGORY_ORDER.filter((category) => snapshot.nodes.some((item) => item[1] === category)).map((category) => (
          <span key={category}><i aria-hidden="true" style={{ backgroundColor: categoryColor(category) }} />{categoryLabel(category, lang, true)}</span>
        ))}
        {stage === 3 && <span><i aria-hidden="true" style={{ backgroundColor: ORANGE }} />{t(macroMetric ? "dashboard.macroPositiveBridges" : "dashboard.positiveBridges")}</span>}
      </div>
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
      <div className={"dashboard-snapshot" + (fading ? " is-fading" : "")} data-period={snapshot.label} data-stage={stage}>
        <div className="dashboard-status num" aria-live="polite">
          <strong>{snapshot.label}</strong>
          <span>{t(macroMetric ? "dashboard.macroBridgeScore" : STAGES[stage])}</span>
          <span>{t("common.documents", { n: formatInt(snapshot.documents, lang) })} · {formatInt(snapshot.nodes.length, lang)} {t("dashboard.nodes")} · {formatInt(snapshot.edges.length, lang)} {t("dashboard.edges")}</span>
        </div>
        <DashboardGraph snapshot={snapshot} stage={stage} lang={lang} selected={selected} story={story} macroStory={macroStory}
          selectedMacro={selectedMacro} onMacro={selectMacro} onSelect={selectNode} />
        {hasMacros && stage >= 2 && unassigned && <p className="dashboard-unassigned">{t("dashboard.unassigned", { cluster: unassigned })}</p>}
      </div>
      <div className="dashboard-detail" aria-live="polite">
        {profile ? (
          <div className="dashboard-story-note dashboard-macro-profile" style={{ borderColor: profile.color }}>
            <button type="button" className="dashboard-story-close" onClick={() => setSelectedMacro(null)}
              aria-label={t("common.close")}>×</button>
            <strong>{profile.name[lang]}</strong>
            <span>{t("dashboard.macroTotal", { blocks: profile.blocks.length,
              nodes: formatInt([...profileSizes.values()].reduce((sum, size) => sum + size, 0), lang) })}</span>
            {profile.description?.[lang].map((paragraph) => (
              <p className="dashboard-profile-description" key={paragraph}>{paragraph}</p>
            ))}
            <ul>
              {profile.blocks.map((block) => (
                <li key={block.rank}>
                  <b>{clusterLabel(block.rank)}</b>{block.name[lang] && " " + block.name[lang]}
                  <span> · {formatInt(profileSizes.get(block.rank) ?? 0, lang)} {t("dashboard.nodes")}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : node ? (
          <><strong>{node[0]}</strong><span>{categoryLabel(node[1], lang)}</span>
          {stage > 0 && <span>{clusterLabel(node[2])}</span>}
          {stage === 3 && <span>{t(macroMetric ? "dashboard.macroBridgeScore" : "dashboard.score")} {new Intl.NumberFormat(lang, { maximumSignificantDigits: 4 }).format(score)}</span>}</>
        ) : t(stage === 3 ? (macroMetric ? "dashboard.macroBridgeHelp" : "dashboard.bridgeHelp") : stage === 2 ? "dashboard.macroHint" : "dashboard.inspect")}
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
    </section>
  );
}

export function DashboardView() {
  const { t } = useT();
  const data = useQuery({
    queryKey: ["dashboard", "lognormal"],
    queryFn: async ({ signal }): Promise<Snapshot[]> => {
      const response = await fetch(import.meta.env.BASE_URL + "data/dashboard.json", { signal });
      if (!response.ok) throw new Error("Dashboard snapshot unavailable");
      return response.json() as Promise<Snapshot[]>;
    },
    staleTime: Infinity,
  });
  return (
    <main className="dashboard-view scroll-view">
      <div className="card dashboard-intro" aria-hidden="true" />
      {data.data ? <DashboardStory snapshots={data.data} /> : data.isError ? (
        <div className="notice error">
          {t("dashboard.loadError")}{" "}
          <button type="button" onClick={() => void data.refetch()}>{t("dashboard.retry")}</button>
        </div>
      ) : <Loader label={t("common.loading")} size={52} />}
      <EgoNetworksView />
    </main>
  );
}
