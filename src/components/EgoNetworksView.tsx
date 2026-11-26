import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { EGO_TERMS, edgeKey, ringPositions, visibleEgo, type EgoData, type EgoEdge, type EgoRings, type EgoStage, type EgoTerm, type Point } from "../domain/egoNetworks";
import { CATEGORY_ORDER, categoryColor, categoryLabel, formatInt } from "../domain/vocabulary";
import { useT } from "../i18n";
import { useTheme } from "../state/theme";
import { Loader } from "./Loader";
import "./egoNetworks.css";

type EgoView = ReturnType<typeof visibleEgo>;
type Selection = { node: number } | { edge: string } | null;
interface Mark extends Point { opacity: number }
interface MovingNode { from: Mark; to: Mark }
interface MovingEdge { edge: EgoEdge; from: number; to: number }
interface Transition {
  view: EgoView;
  nodes: Map<number, MovingNode>;
  edges: Map<string, MovingEdge>;
  start: number;
  duration: number;
}

const STAGES = ["ego.core", "ego.direct", "ego.neighborLinks", "ego.secondRing", "ego.allLinks"] as const;
const ACTIONS = ["ego.addDirect", "ego.addNeighborLinks", "ego.addSecondRing", "ego.addAllLinks", "ego.inspect"] as const;
const TAU = 2 * Math.PI;

function progress(transition: Transition, now: number) {
  return transition.duration ? Math.min(1, Math.max(0, (now - transition.start) / transition.duration)) : 1;
}

function line(a: number, b: number, t: number) { return a + (b - a) * t; }
function location(node: MovingNode, t: number): Mark {
  const amount = 1 - (1 - t) ** 3;
  return {
    x: line(node.from.x, node.to.x, amount),
    y: line(node.from.y, node.to.y, amount),
    opacity: line(node.from.opacity, node.to.opacity, t),
  };
}

function transitionTo(view: EgoView, positions: Map<number, Point>[], old: Transition | null, now: number): Transition {
  const nodes = new Map<number, MovingNode>();
  const edges = new Map<string, MovingEdge>();
  const t = old ? progress(old, now) : 1;
  for (const [id, layer] of view.distances) {
    const position = layer === 0 ? { x: 0, y: 0 } : positions[layer - 1].get(id)!;
    const to = { ...position, opacity: 1 };
    const previous = old?.nodes.get(id);
    nodes.set(id, { from: previous ? location(previous, t) : { ...position, opacity: 0 }, to });
  }
  for (const [id, previous] of old?.nodes ?? []) {
    if (nodes.has(id)) continue;
    const from = location(previous, t);
    if (from.opacity > .005) nodes.set(id, { from, to: { ...from, opacity: 0 } });
  }
  for (const [key, edge] of view.edges) {
    const previous = old?.edges.get(key);
    edges.set(key, { edge, from: previous ? line(previous.from, previous.to, t) : 0, to: 1 });
  }
  for (const [key, previous] of old?.edges ?? []) {
    if (edges.has(key)) continue;
    const from = line(previous.from, previous.to, t);
    if (from > .005) edges.set(key, { edge: previous.edge, from, to: 0 });
  }
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return { view, nodes, edges, start: now, duration: old && !reduced ? 460 : 0 };
}

function pixel(point: Point, width: number, height: number): Point {
  return { x: width * (.5 + .46 * point.x), y: height * (.5 + .45 * point.y) };
}
function segmentDistance(at: Point, left: Point, right: Point): number {
  const dx = right.x - left.x, dy = right.y - left.y;
  const ratio = Math.max(0, Math.min(1, ((at.x - left.x) * dx + (at.y - left.y) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(at.x - left.x - ratio * dx, at.y - left.y - ratio * dy);
}

interface CanvasProps {
  view: EgoView;
  positions: Map<number, Point>[];
  data: EgoData;
  core: number;
  selection: Selection;
  onSelect: (selection: Selection) => void;
  label: string;
}
function EgoCanvas({ view, positions, data, core, selection, onSelect, label }: CanvasProps) {
  const theme = useTheme();
  const canvas = useRef<HTMLCanvasElement>(null);
  const transition = useRef<Transition | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const { width, height } = size;

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const resize = () => setSize({ width: element.clientWidth, height: element.clientHeight });
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = canvas.current, context = element?.getContext("2d");
    if (!element || !context || !width || !height) return;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    element.width = Math.round(width * ratio);
    element.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const now = performance.now();
    const current = transition.current?.view === view ? transition.current : transitionTo(view, positions, transition.current, now);
    transition.current = current;
    let frame = 0;

    const selectedNode = selection && "node" in selection ? selection.node : null;
    const highlighted = new Set<string>();
    if (selection && "edge" in selection) highlighted.add(selection.edge);
    if (selectedNode !== null) {
      for (const [key, [a, b]] of view.edges) {
        if (a !== selectedNode && b !== selectedNode) continue;
        highlighted.add(key);
        const neighbor = a === selectedNode ? b : a;
        if (view.distances.get(selectedNode) === 2 && view.distances.get(neighbor) === 1) {
          highlighted.add(edgeKey(core, neighbor));
        }
      }
    }
    const stroke = theme === "oscuro" ? "#a4b6a9" : "#4b6259";
    const emphasis = theme === "oscuro" ? "#bce398" : "#256444";
    const nodeRadius = view.distances.size < 100 ? 3.6 : view.distances.size < 350 ? 2.9 : 2.25;

    function draw(time: number) {
      if (!context) return;
      const t = progress(current, time);
      const displayed = new Map<number, Mark>();
      for (const [id, motion] of current.nodes) {
        const point = location(motion, t);
        if (point.opacity > .005) displayed.set(id, { ...pixel(point, width, height), opacity: point.opacity });
      }
      context.clearRect(0, 0, width, height);
      for (const active of [false, true]) for (const [key, motion] of current.edges) {
        if (highlighted.has(key) !== active) continue;
        const [a, b, weight] = motion.edge;
        const left = displayed.get(a), right = displayed.get(b);
        if (!left || !right) continue;
        const opacity = line(motion.from, motion.to, t) * Math.min(left.opacity, right.opacity);
        const direct = a === core || b === core;
        const alpha = active ? .9 : highlighted.size ? .045 : direct ? .34 : .14;
        context.globalAlpha = alpha * opacity;
        context.strokeStyle = active ? emphasis : stroke;
        context.lineWidth = .37 + .42 * Math.sqrt(weight) + (active ? .48 : 0);
        context.beginPath();
        context.moveTo(left.x, left.y);
        context.lineTo(right.x, right.y);
        context.stroke();
      }
      for (const [id, point] of displayed) {
        if (id === core) continue;
        const active = id === selectedNode;
        context.fillStyle = categoryColor(data.nodes[id][1]);
        context.globalAlpha = point.opacity * (view.distances.get(id) === 2 && !active ? .76 : 1);
        context.beginPath();
        context.arc(point.x, point.y, active ? 6 : nodeRadius, 0, TAU);
        context.fill();
        if (active) {
          context.strokeStyle = emphasis;
          context.lineWidth = 1.6;
          context.stroke();
        }
      }
      context.globalAlpha = 1;
      if (t < 1) frame = requestAnimationFrame(draw);
      else {
        for (const [id, mark] of current.nodes) if (mark.to.opacity === 0) current.nodes.delete(id);
        for (const [key, edge] of current.edges) if (edge.to === 0) current.edges.delete(key);
      }
    }
    draw(now);
    return () => cancelAnimationFrame(frame);
  }, [view, positions, data, core, selection, theme, width, height]);

  function inspect(event: PointerEvent<HTMLCanvasElement>) {
    const current = transition.current;
    if (!current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const at = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    const t = progress(current, performance.now());
    const points = new Map<number, Point>();
    let closest: number | null = null, minimum = 9;
    for (const [id, mark] of current.nodes) {
      if (!view.distances.has(id)) continue;
      const point = pixel(location(mark, t), width, height);
      points.set(id, point);
      const distance = Math.hypot(at.x - point.x, at.y - point.y);
      if (id !== core && distance < minimum) { minimum = distance; closest = id; }
    }
    if (closest !== null) { onSelect({ node: closest }); return; }
    let edge: string | null = null;
    minimum = 5;
    for (const [key, [a, b]] of view.edges) {
      const left = points.get(a), right = points.get(b);
      if (!left || !right) continue;
      const distance = segmentDistance(at, left, right);
      if (distance < minimum) { minimum = distance; edge = key; }
    }
    onSelect(edge ? { edge } : null);
  }

  return <canvas ref={canvas} role="img" aria-label={label} onPointerUp={inspect} />;
}

function EgoPanel({ term, rings, data }: { term: EgoTerm; rings: EgoRings[]; data: EgoData }) {
  const { t, lang } = useT();
  const [period, setPeriod] = useState(0);
  const [stage, setStage] = useState<EgoStage>(0);
  const [selection, setSelection] = useState<Selection>(null);
  const positions = useMemo(() => ringPositions(rings), [rings]);
  const current = data.periods[period];
  const view = useMemo(() => visibleEgo(rings[period], current, stage), [rings, current, period, stage]);
  const center = rings[period].center;
  const options = useMemo(() => [...view.distances.keys()].filter((id) => id !== center)
    .sort((a, b) => data.nodes[a][0].localeCompare(data.nodes[b][0], lang)), [view, center, data, lang]);

  function changePeriod(next: number) {
    if (next === period) return;
    const updated = visibleEgo(rings[next], data.periods[next], stage);
    setSelection((selected) => {
      if (!selected) return null;
      return ("node" in selected ? updated.distances.has(selected.node) : updated.edges.has(selected.edge)) ? selected : null;
    });
    setPeriod(next);
  }

  function reset() {
    setSelection(null);
    setStage(0);
  }

  const nodeSelection = selection && "node" in selection ? selection.node : null;
  const edgeSelection = selection && "edge" in selection ? view.edges.get(selection.edge) : undefined;
  const nodes = t(view.distances.size === 1 ? "ego.oneNode" : "ego.nodes", { n: formatInt(view.distances.size, lang) });
  const edges = t(view.edges.size === 1 ? "ego.oneEdge" : "ego.edges", { n: formatInt(view.edges.size, lang) });
  const counts = nodes + " · " + edges;
  return (
    <section className="dashboard-ego-panel" data-ego={term} aria-labelledby={"dashboard-ego-" + term}
      data-period={current.label} data-stage={stage} data-nodes={view.distances.size} data-edges={view.edges.size}>
      <header className="dashboard-ego-heading">
        <h3 id={"dashboard-ego-" + term}>{term}</h3>
        <span>{t(STAGES[stage])}</span>
      </header>
      <div className="dashboard-timeline dashboard-ego-timeline" role="group" aria-label={term + " · " + t("top.period")}>
        {data.periods.map(({ label }, i) => (
          <button type="button" key={label} aria-pressed={period === i} onClick={() => changePeriod(i)}>{label}</button>
        ))}
      </div>
      <div className="dashboard-ego-plot">
        <EgoCanvas view={view} positions={positions} data={data} core={center} selection={selection}
          onSelect={setSelection} label={term + " · " + current.label + " · " + counts} />
        <button type="button" className="dashboard-ego-center"
          aria-label={term + " · " + t(ACTIONS[stage])} aria-disabled={stage === 4}
          onClick={() => { if (stage < 4) setStage((stage + 1) as EgoStage); }}>
          {term}
        </button>
      </div>
      <div className="dashboard-ego-footer">
        <div aria-live="polite">
          <strong className="num">{current.label} · {counts}</strong>
          <p>
            {nodeSelection !== null ? (
              <>{data.nodes[nodeSelection][0]} · {categoryLabel(data.nodes[nodeSelection][1], lang)} · {t(view.distances.get(nodeSelection) === 1 ? "ego.firstDistance" : "ego.secondDistance")}</>
            ) : edgeSelection ? (
              <>{data.nodes[edgeSelection[0]][0]} ↔ {data.nodes[edgeSelection[1]][0]} · {t("ego.edgeEvidence", {
                weight: new Intl.NumberFormat(lang, { maximumSignificantDigits: 5 }).format(edgeSelection[2]),
                documents: edgeSelection[3], sentences: edgeSelection[4],
              })}</>
            ) : t(ACTIONS[stage])}
          </p>
        </div>
        <div className="dashboard-ego-tools">
          <select aria-label={t("ego.inspectNode")} disabled={options.length === 0} value={nodeSelection ?? ""}
            onChange={(event) => setSelection(event.target.value === "" ? null : { node: Number(event.target.value) })}>
            <option value="">{t("ego.inspectNode")}</option>
            {options.map((id) => <option key={id} value={id}>{data.nodes[id][0]} · {categoryLabel(data.nodes[id][1], lang, true)}</option>)}
          </select>
          <button type="button" className="dashboard-action" disabled={stage === 0} onClick={reset}>{t("ego.reset")}</button>
        </div>
      </div>
    </section>
  );
}

export function EgoNetworksView() {
  const { t, lang } = useT();
  const result = useQuery({
    queryKey: ["dashboard", "ego-networks"],
    queryFn: async ({ signal }): Promise<EgoData> => {
      const response = await fetch(import.meta.env.BASE_URL + "data/ego-networks.json", { signal });
      if (!response.ok) throw new Error("Ego networks unavailable");
      return response.json() as Promise<EgoData>;
    },
    staleTime: Infinity,
  });
  const data = result.data;
  return (
    <section className="card dashboard-story dashboard-ego-section" aria-labelledby="dashboard-ego-title">
      <header className="dashboard-header">
        <div>
          <h2 id="dashboard-ego-title">THREE PRACTICES IN FOCUS</h2>
          <p>{t("ego.subtitle")}</p>
        </div>
      </header>
      <p className="dashboard-ego-instructions">{t("ego.instructions")}</p>
      <div className="dashboard-legend">
        {CATEGORY_ORDER.filter((category) => category !== "INFRA").map((category) => (
          <span key={category}><i aria-hidden="true" style={{ backgroundColor: categoryColor(category) }} />{categoryLabel(category, lang, true)}</span>
        ))}
      </div>
      {data ? EGO_TERMS.map((term) => <EgoPanel key={term} term={term} rings={data.egos[term]} data={data} />)
        : result.isError ? (
          <div className="notice error">{t("dashboard.loadError")}{" "}
            <button type="button" onClick={() => void result.refetch()}>{t("dashboard.retry")}</button>
          </div>
        ) : <Loader label={t("common.loading")} size={52} />}
    </section>
  );
}
