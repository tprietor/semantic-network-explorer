export const EGO_TERMS = ["deforestation", "conservation", "monoculture"] as const;
export type EgoTerm = typeof EGO_TERMS[number];
export type EgoStage = 0 | 1 | 2 | 3 | 4;
export type Distance = 0 | 1 | 2;
export type EgoEdge = [source: number, target: number, weight: number, documents: number, sentences: number];
export interface EgoPeriod { label: string; edges: EgoEdge[] }
export interface EgoRings { center: number; near: number[]; far: number[] }
export interface EgoData {
  nodes: [name: string, category: string][];
  periods: EgoPeriod[];
  egos: Record<EgoTerm, EgoRings[]>;
}
export interface Point { x: number; y: number }

export function ringPositions(periods: EgoRings[]): Map<number, Point>[] {
  const rings = (["near", "far"] as const).map((layer) =>
    [...new Set(periods.flatMap((period) => period[layer]))].sort((a, b) => a - b),
  );
  const all = [...new Set(rings.flat())].sort((a, b) => a - b);
  const angles = new Map(all.map((node, i) => [node, i * Math.PI * (3 - Math.sqrt(5))]));
  return rings.map((nodes, layer) => new Map(nodes.map((node, i) => {
    const [min, max] = layer === 0 ? [.21, .575] : [.65, .97];
    const radius = Math.sqrt(min ** 2 + (max ** 2 - min ** 2) * (i + .5) / nodes.length);
    const angle = angles.get(node) ?? 0;
    return [node, { x: radius * Math.cos(angle), y: radius * Math.sin(angle) }];
  })));
}

export function visibleEgo(rings: EgoRings, period: EgoPeriod, stage: EgoStage) {
  const distances = new Map<number, Distance>([[rings.center, 0]]);
  if (stage >= 1) rings.near.forEach((id) => distances.set(id, 1));
  if (stage >= 3) rings.far.forEach((id) => distances.set(id, 2));
  const edges = new Map<string, EgoEdge>();
  if (stage > 0) for (const edge of period.edges) {
    const [source, target] = edge;
    const a = distances.get(source), b = distances.get(target);
    if (a === undefined || b === undefined) continue;
    if (stage === 1 && a !== 0 && b !== 0) continue;
    if (stage === 3 && a === 2 && b === 2) continue;
    edges.set(edgeKey(source, target), edge);
  }
  return { distances, edges };
}

export function edgeKey(a: number, b: number): string {
  return a < b ? a + ":" + b : b + ":" + a;
}
