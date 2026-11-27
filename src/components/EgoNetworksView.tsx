import stories from "../domain/practiceStories.json";
import additionalReadings from "../domain/conservationMonocultureReadings.json";
import additionalPassages from "../domain/conservationMonoculturePassages.json";
import examples from "../domain/deforestationPassages.json";
import { deforestationReadings } from "../domain/deforestationReadings";
import { categoryDiversity, diversityFormat } from "../domain/diversity";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { EGO_TERMS, edgeKey, egoRoute, ringPositions, visibleEgo, type EgoData, type EgoEdge, type EgoRings, type EgoStage, type EgoTerm, type Point } from "../domain/egoNetworks";
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

type Reading = { category: string; terms: string[]; text: Record<"es" | "en", string> };
type Passage = { document_name: string; text: string; year: number | null; sentence_id: string };
const readings: Record<EgoTerm, Record<string, Reading[]>> = { deforestation: deforestationReadings, ...additionalReadings };
const passages: Record<EgoTerm, Record<string, Record<string, Passage>>> = { deforestation: examples, ...additionalPassages };

interface CanvasProps {
  featured: ReadonlySet<number>;
  view: EgoView;
  positions: Map<number, Point>[];
  data: EgoData;
  core: number;
  selection: Selection;
  onSelect: (selection: Selection) => void;
  label: string;
  evidenceLabel: { id: number; text: string } | null;
  route: number[];
  arrivals: ReadonlySet<number>;
}
function EgoCanvas({ featured, evidenceLabel, route, arrivals, view, positions, data, core, selection, onSelect, label }: CanvasProps) {
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
      // Draw annotated spokes over ordinary edges and preserve the user's selection on top.
      for (const priority of [0, 1, 2]) for (const [key, motion] of current.edges) {
        const active = highlighted.has(key);
        const [a, b, weight] = motion.edge;
        const left = displayed.get(a), right = displayed.get(b);
        if (!left || !right) continue;
        const opacity = line(motion.from, motion.to, t) * Math.min(left.opacity, right.opacity);
        const direct = a === core || b === core;
        const annotated = direct && featured.has(a === core ? b : a);
        if ((active ? 2 : annotated ? 1 : 0) !== priority) continue;
        const incoming = annotated && arrivals.has(a === core ? b : a);
        const reveal = incoming ? Math.max(0, 2 * t - 1) : 1;
        const alpha = active ? .9 : highlighted.size ? .045 : annotated ? .88 : direct ? .34 : .14;
        context.globalAlpha = alpha * opacity * reveal;
        context.strokeStyle = active ? emphasis : annotated ? categoryColor(data.nodes[a === core ? b : a][1]) : stroke;
        context.lineWidth = .37 + .42 * Math.sqrt(weight) + (active ? 1.2 : annotated ? .95 : 0);
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
        if (featured.has(id)) {
          context.beginPath();
          context.arc(point.x, point.y, 7, 0, TAU);
          context.strokeStyle = categoryColor(data.nodes[id][1]);
          context.lineWidth = 1.25;
          context.stroke();
        }
        if (active) {
          context.beginPath();
          context.arc(point.x, point.y, 6, 0, TAU);
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
  }, [featured, arrivals, view, positions, data, core, selection, theme, width, height]);

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

  // Anchor the callout to the featured spoke with the most sentence evidence.
  let callout: number | undefined;
  let mostSentences = -1;
  for (const id of featured) {
    const key = edgeKey(core, id);
    const edge = view.edges.get(key);
    if (!edge || (selection && ("node" in selection ? selection.node !== id : selection.edge !== key))) continue;
    if (edge[4] > mostSentences) { callout = id; mostSentences = edge[4]; }
  }
  if (!selection && evidenceLabel) callout = evidenceLabel.id;
  if (route.length) callout = route[route.length - 1];
  const layer = callout === undefined ? undefined : view.distances.get(callout);
  const anchor = callout === undefined || !layer ? undefined : positions[layer - 1].get(callout);
  return <>
    <canvas ref={canvas} role="img" aria-label={label} onPointerUp={inspect} />
    {anchor && callout !== undefined && width > 0 && <span key={callout} className="ego-spoke-label"
      style={{ left: (.5 + .46 * anchor.x) * width, top: (.5 + .45 * anchor.y) * height + (anchor.y < 0 ? -16 : 16),
        borderColor: categoryColor(data.nodes[callout][1]) }}>{data.nodes[callout][0]}{evidenceLabel?.id === callout && <small>{evidenceLabel.text}</small>}</span>}
  </>;
}

function EgoPanel({ term, rings, data }: { term: EgoTerm; rings: EgoRings[]; data: EgoData }) {
  const { t, lang } = useT();
  const [period, setPeriod] = useState(0);
  const [stage, setStage] = useState<EgoStage>(0);
  const [selection, setSelection] = useState<Selection>(null);
  const positions = useMemo(() => ringPositions(rings), [rings]);
  const current = data.periods[period];
  const [tracing, setTracing] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const center = rings[period].center;
  const story = stories[term];
  const target = useMemo(() => data.nodes.findIndex(([name, cat]) => name === story.target && cat === story.targetCategory), [data.nodes, story]);
  const neighborhood = useMemo(() => visibleEgo(rings[period], current, tracing ? 3 : stage), [rings, current, period, stage, tracing]);
  const route = useMemo(() => tracing ? egoRoute(neighborhood, center, target) : [], [tracing, neighborhood, center, target]);
  const view = useMemo(() => {
    if (!route.length) return neighborhood;
    const distances: EgoView["distances"] = new Map();
    const edges: EgoView["edges"] = new Map();
    route.forEach((id, i) => {
      distances.set(id, neighborhood.distances.get(id)!);
      if (i > 0) {
        const key = edgeKey(route[i - 1], id);
        edges.set(key, neighborhood.edges.get(key)!);
      }
    });
    return { distances, edges };
  }, [route, neighborhood]);
  const options = useMemo(() => [...view.distances.keys()].filter((id) => id !== center)
    .sort((a, b) => data.nodes[a][0].localeCompare(data.nodes[b][0], lang)), [view, center, data, lang]);

  const [openGroup, setOpenGroup] = useState<number | null>(null);
  const showAnnotations = stage > 0;
  const periodCounts = useMemo(() => {
    return rings.map(({ near }) => {
      const counts = { PRAC: 0, CHAR: 0 };
      for (const id of near) {
        const category = data.nodes[id][1];
        if (category === "PRAC" || category === "CHAR") counts[category]++;
      }
      return counts;
    });
  }, [rings, data.nodes]);
  const annotationGroups = useMemo(() => {
    if (!showAnnotations) return [];
    return (readings[term][current.label] ?? []).map(group => ({
      ...group,
      ids: rings[period].near.filter(id => {
        const [name, category] = data.nodes[id];
        return group.category === category && group.terms.some(term => term === name);
      }),
    }));
  }, [term, showAnnotations, current.label, rings, period, data.nodes]);
  const featured = useMemo(() => {
    if (tracing) return new Set(route.slice(1));
    if (openGroup !== null) return new Set(annotationGroups[openGroup]?.ids);
    const names = story.focus[period] ?? [];
    return new Set(showAnnotations && stage <= 2 ? rings[period].near.filter(id => names.includes(data.nodes[id][0])) : []);
  }, [annotationGroups, openGroup, stage, tracing, route, story, rings, period, data.nodes, showAnnotations]);

  const arrivals = useMemo(() => {
    const prior = new Set(rings[period - 1]?.near);
    return new Set([...featured].filter(id => period > 0 && !prior.has(id)));
  }, [rings, period, featured]);

  const radiusMetrics = useMemo(() => {
    const { near, far, center } = rings[period];
    const directCounts = new Map<string, number>();
    return [near, [...near, ...far]].map((neighbors, index) => {
      const unique = new Set(neighbors);
      unique.delete(center);
      const counts = new Map<string, number>();
      for (const id of unique) {
        const category = data.nodes[id][1];
        counts.set(category, (counts.get(category) ?? 0) + 1);
      }
      let leadingCategory = "", leadingCount = 0;
      for (const [category, count] of counts) {
        const added = count - (directCounts.get(category) ?? 0);
        if (added > leadingCount) {
          leadingCategory = category;
          leadingCount = added;
        }
        if (index === 0) directCounts.set(category, count);
      }
      return { total: unique.size, metric: categoryDiversity(counts), leadingCategory, leadingCount };
    });
  }, [data.nodes, rings, period]);

  const visibleMetrics = radiusMetrics.slice(0, stage === 0 ? 0 : stage < 3 ? 1 : 2);

  function changePeriod(next: number) {
    if (next === period && !tracing) return;
    setTracing(false);
    setEvidenceOpen(false);
    const updated = visibleEgo(rings[next], data.periods[next], stage);
    setSelection((selected) => {
      if (!selected) return null;
      return ("node" in selected ? updated.distances.has(selected.node) : updated.edges.has(selected.edge)) ? selected : null;
    });
    setOpenGroup(null);
    setPeriod(next);
  }

  function expand() {
    if (tracing) return;
    if (stage < 4) setStage((stage + 1) as EgoStage);
  }

  function traceTarget(next: number) {
    setPeriod(next);
    setTracing(true);
    setSelection({ node: target });
    setEvidenceOpen(false);
    setOpenGroup(null);
  }

  function reset() {
    setTracing(false);
    setEvidenceOpen(false);
    setOpenGroup(null);
    setSelection(null);
    setStage(0);
  }

  const nodeSelection = selection && "node" in selection ? selection.node : null;
  const edgeSelection = selection && "edge" in selection ? view.edges.get(selection.edge) : undefined;
  const early = current.label === "2000–2019";
  const middle = current.label === "2020–2023";
  const firstFocus = early && showAnnotations ? [...featured].find(id => data.nodes[id][0] === story.focus[0][0]) : undefined;
  const firstEdge = firstFocus === undefined ? undefined : view.edges.get(edgeKey(center, firstFocus));
  const evidenceLabel = firstEdge && firstFocus !== undefined ? { id: firstFocus,
    text: t(firstEdge[4] === 1 ? "ego.singleSentence" : "ego.sentenceCount", { n: firstEdge[4] }) + " · " +
      t(firstEdge[3] === 1 ? "ego.singleDocument" : "ego.documentCount", { n: firstEdge[3] }) } : null;
  const earlierCounts = periodCounts[period - 1];
  const prevDiversity = useMemo(() => {
    if (!showAnnotations || !middle) return null;
    const counts = new Map<string, number>();
    for (const id of rings[period - 1].near) {
      const cat = data.nodes[id][1];
      counts.set(cat, (counts.get(cat) ?? 0) + 1);
    }
    return categoryDiversity(counts);
  }, [data.nodes, middle, period, rings, showAnnotations]);
  const selectedNeighbor = edgeSelection && (edgeSelection[0] === center || edgeSelection[1] === center)
    ? data.nodes[edgeSelection[0] === center ? edgeSelection[1] : edgeSelection[0]][0] : null;
  const passage = selectedNeighbor ? passages[term][current.label]?.[selectedNeighbor] : undefined;
  const nodes = t(view.distances.size === 1 ? "ego.oneNode" : "ego.nodes", { n: formatInt(view.distances.size, lang) });
  const edges = t(view.edges.size === 1 ? "ego.oneEdge" : "ego.edges", { n: formatInt(view.edges.size, lang) });
  const counts = nodes + " · " + edges;
  const metricsPanel = <>
          <div className="ego-radius-pair" aria-live="polite">
            {visibleMetrics.map(({ metric, total, leadingCategory, leadingCount }, index) => (
              <section key={current.label + index} data-radius={index + 1} className="ego-radius">
                <h5>{t(index === 0 ? "ego.radiusOne" : "ego.radiusTwo")}</h5>
                <p>{index === 0
                  ? t("ego.directReading", { n: formatInt(total, lang), term })
                  : t("ego.extendedReading", { near: formatInt(radiusMetrics[0].total, lang),
                      added: formatInt(total - radiusMetrics[0].total, lang), total: formatInt(total, lang) })}</p>
                {leadingCount > 0 && <p>{t(index === 0 ? "ego.directCategory" : "ego.addedCategory", {
                  count: formatInt(leadingCount, lang), category: categoryLabel(leadingCategory, lang),
                })}</p>}
                {metric && <>
                  <div className="ego-category-strip" aria-hidden="true">
                    {metric.distribution.filter(({ count }) => count > 0).map(({ category, count }) => (
                      <i key={category} style={{ width: count / total * 100 + "%", backgroundColor: categoryColor(category) }} />
                    ))}
                  </div>
                  <div className="ego-radius-stats">
                    <span>{t("ego.categoryCoverage", { present: metric.present, possible: metric.distribution.length })}</span>
                    <span>{t("dashboard.diversity")} <b>{diversityFormat[lang].format(metric.diversity)}</b></span>
                  </div>
                </>}
              </section>
            ))}
          </div>
          {stage > 0 && <>
          <p className="ego-scale-note">{t("ego.diversityScale")}</p>
          <details className="ego-category-detail">
            <summary>{t("ego.categoryBreakdown")}</summary>
            <table>
              <thead><tr><th scope="col">{t("dashboard.categories")}</th>
                <th scope="col">{t("ego.directColumn")}</th>{visibleMetrics.length === 2 && <th scope="col">{t("ego.extendedColumn")}</th>}</tr></thead>
              <tbody>{CATEGORY_ORDER.filter(category => category !== "INFRA").map(category => (
                <tr key={category}><th scope="row"><i aria-hidden="true" style={{ backgroundColor: categoryColor(category) }} />{categoryLabel(category, lang)}</th>
                  {visibleMetrics.map(({ metric, total }, i) => <td key={i}>{metric ?
                    formatInt(metric.distribution.find(row => row.category === category)!.count, lang) : total ? "—" : "0"}</td>)}
                </tr>
              ))}</tbody>
            </table>
          </details>
          </>}
  </>;
  return (
    <section className="dashboard-ego-panel" data-ego={term} aria-labelledby={"dashboard-ego-" + term}
      data-period={current.label} data-stage={stage} data-nodes={view.distances.size} data-edges={view.edges.size}>
      <div className="ego-workspace">
        <div className="ego-network-column">
          <header className="dashboard-ego-heading">
            <div>
              <h3 id={"dashboard-ego-" + term}>{term}</h3>
              <span className="num">{current.label} · {counts}</span>
            </div>
            {!tracing && stage > 0 && stage < 4 && <button type="button" className="dashboard-action" onClick={expand}>{t(ACTIONS[stage])}</button>}
          </header>
          <div className="dashboard-ego-plot">
            <EgoCanvas arrivals={arrivals} route={route} evidenceLabel={evidenceLabel} featured={featured} view={view} positions={positions} data={data} core={center} selection={selection}
              onSelect={setSelection} label={term + " · " + current.label + " · " + counts} />
            <button type="button" className="dashboard-ego-center"
              aria-label={tracing ? term : term + " · " + t(ACTIONS[stage])} aria-disabled={tracing || stage === 4}
              onClick={expand}>
              {term}
              {stage === 0 && <small>{t(ACTIONS[0])} <span aria-hidden="true">＋</span></small>}
            </button>
          </div>
          {stage > 0 && <div className="dashboard-ego-footer">
            <div className="ego-selected" aria-live="polite">
              {(selection !== null || stage === 4) && <p>
                {nodeSelection !== null ? (
                  <>{data.nodes[nodeSelection][0]} · {categoryLabel(data.nodes[nodeSelection][1], lang)} · {t(view.distances.get(nodeSelection) === 1 ? "ego.firstDistance" : "ego.secondDistance")}</>
                ) : edgeSelection ? (
                  <>{data.nodes[edgeSelection[0]][0]} ↔ {data.nodes[edgeSelection[1]][0]} · {t("ego.edgeEvidence", {
                    weight: new Intl.NumberFormat(lang, { maximumSignificantDigits: 5 }).format(edgeSelection[2]),
                    documents: edgeSelection[3], sentences: edgeSelection[4],
                  })}</>
                ) : t(ACTIONS[stage])}
              </p>}
            </div>
            <div className="dashboard-ego-tools">
              <select aria-label={t("ego.inspectNode")} disabled={options.length === 0} value={nodeSelection ?? ""}
                onChange={(event) => setSelection(event.target.value === "" ? null : { node: Number(event.target.value) })}>
                <option value="">{t("ego.inspectNode")}</option>
                {options.map((id) => <option key={id} value={id}>{data.nodes[id][0]} · {categoryLabel(data.nodes[id][1], lang, true)}</option>)}
              </select>
              <button type="button" className="dashboard-action" disabled={stage === 0} onClick={reset}>{t("ego.reset")}</button>
            </div>
          </div>}
          <div className="ego-period-picker">
            <span>{t("top.period")}</span>
            <div className="dashboard-timeline dashboard-ego-timeline" role="group" aria-label={term + " · " + t("top.period")}>
              {data.periods.map(({ label }, i) => (
                <button type="button" key={label} aria-pressed={period === i} onClick={() => changePeriod(i)}>{label}</button>
              ))}
            </div>
          </div>
        </div>
        <aside className="ego-comparison" aria-labelledby={"ego-comparison-" + term}>
          <h4 id={"ego-comparison-" + term}>{t(showAnnotations ? "ego.networkChange" : "ego.neighborDiversity", { term })}</h4>
          {stage === 0 && <p className="ego-reading-prompt">{t("ego.openReading")}</p>}
          {showAnnotations && <section key={current.label} className="ego-period-reading">
            <p className="ego-reading-period">{current.label} · {t(tracing ? "ego.route" : "ego.directColumn")}</p>
            {tracing ? <div className="ego-story-focus" aria-live="polite">
              <h5>{t(route.length === 3 ? "ego.twoStepTarget" : "ego.directTarget", { term: story.target })}</h5>
              <p className="ego-route">{route.map(id => data.nodes[id][0]).join(" → ")}</p>
              {middle ? <button className="dashboard-action" onClick={() => traceTarget(period + 1)}>{t("ego.seeLast")}</button>
                : <button className="dashboard-action" onClick={() => traceTarget(period - 1)}>{t("ego.seeMiddle")}</button>}
              <button className="ego-evidence-toggle" onClick={() => { setTracing(false); setPeriod(2); setSelection(null); }}>{t("ego.endTrace")}</button>
            </div> : <div className="ego-story-focus">
              <h5>{early ? story.earlyTitle[lang] : middle ? story.middleTitle[lang] :
                t("ego.actorJump", { before: earlierCounts.CHAR, now: periodCounts[period].CHAR })}</h5>
              <p>{early ? story.earlyReading[lang] : middle ? story.middleReading[lang] : story.actorReading[lang]}</p>
              {middle && prevDiversity && radiusMetrics[0].metric && <p className="ego-story-metric">
                {t("ego.directDiversity")} <b>{diversityFormat[lang].format(prevDiversity.diversity)} → {diversityFormat[lang].format(radiusMetrics[0].metric.diversity)}</b>
              </p>}
              {!early && !middle && <>
                <button className="ego-evidence-toggle" onClick={() => { setEvidenceOpen(true); setOpenGroup(annotationGroups.findIndex(group => group.category === "CHAR")); setSelection(null); }}>{t("ego.seeActors")}</button>
                <h5 className="ego-secondary-story">{story.routeTitle[lang]}</h5>
                <p>{story.routeReading[lang]}</p>
                <button className="dashboard-action" onClick={() => traceTarget(period - 1)}>{story.follow[lang]}</button>
              </>}
            </div>}
            {!tracing && <details key={current.label} open={evidenceOpen} className="ego-story-evidence"
              onToggle={event => {
                const open = event.currentTarget.open;
                setEvidenceOpen(open);
                if (!open) { setOpenGroup(null); setSelection(null); }
              }}>
              <summary>{t("ego.storyEvidence")}</summary>
            {annotationGroups.map((group, index) => {
              return <article key={group.category} data-reading={group.category}>
                <p className="ego-reading-category"><i aria-hidden="true" style={{ backgroundColor: categoryColor(group.category) }} />
                  {categoryLabel(group.category, lang)}</p>

                <button className="ego-evidence-toggle" type="button" aria-expanded={openGroup === index}
                  onClick={() => { setOpenGroup(openGroup === index ? null : index); setSelection(null); }}>
                  {t("ego.termLinks", { n: group.ids.length })}</button>
                {openGroup === index && <>
                  <p>{group.text[lang]}</p>
                  <div className="ego-annotation-terms">{group.ids.map(id => (
                  <button type="button" key={id} aria-pressed={selection !== null && "edge" in selection && selection.edge === edgeKey(center,id)}
                    onClick={() => setSelection({ edge: edgeKey(center,id) })}>{data.nodes[id][0]}</button>
                ))}</div>
                </>}
                {openGroup === index && edgeSelection && group.ids.some(id => edgeKey(id, center) === edgeKey(edgeSelection[0], edgeSelection[1])) &&
                  <div aria-live="polite"><p className="ego-reading-scope">{t("ego.edgeEvidence", {
                    weight: new Intl.NumberFormat(lang, { maximumSignificantDigits: 5 }).format(edgeSelection[2]),
                    documents: edgeSelection[3], sentences: edgeSelection[4],
                  })}</p>
                  {passage && <blockquote className="ego-passage">{passage.text}
                    <cite>{passage.document_name} · {passage.year} · {passage.sentence_id}</cite></blockquote>}</div>}
              </article>;
            })}
            </details>}
          </section>}
          {showAnnotations ? !tracing && <details className="ego-story-metrics">
            <summary>{t("ego.metricsDetails")}</summary>{metricsPanel}
          </details> : metricsPanel}
        </aside>
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
        <h2 id="dashboard-ego-title">{t("ego.title")}</h2>
      </header>
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
