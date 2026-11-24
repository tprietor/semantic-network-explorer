import { describe, expect, it } from "vitest";
import type { ExplorerEdge, ExplorerNode, NetworkResponse } from "../api/client";
import { buildGraph, edgeKey, readPositions, scaleNodeSize, seedPositions } from "./buildGraph";

function node(id: string, pagerank: number, category = "CHAR"): ExplorerNode {
  return {
    id,
    name: id,
    category,
    mention_count: 1,
    sentence_count: 1,
    metrics: { degree: 1, strength: 1, betweenness: 0, closeness: 0, pagerank, document_count: 2 },
    ranks: { pagerank: 1, degree: 1, strength: 1, betweenness: 1, closeness: 1, document_count: 1 },
    shown_degree: 1,
  };
}

function edge(source: string, target: string, weight = 1): ExplorerEdge {
  return {
    source,
    target,
    weight,
    sentence_count: 1,
    document_count: 1,
    category_pair: "CHAR--CHAR",
    confidence_tier: "exploratory",
  };
}

function network(nodes: ExplorerNode[], edges: ExplorerEdge[]): NetworkResponse {
  return { nodes, edges } as unknown as NetworkResponse;
}

describe("scaleNodeSize", () => {
  it("maps the extent to the size range with area proportional to the value", () => {
    expect(scaleNodeSize(0, 0, 1)).toBe(4);
    expect(scaleNodeSize(1, 0, 1)).toBe(22);
    expect(scaleNodeSize(0.25, 0, 1)).toBeCloseTo(4 + 0.5 * 18);
  });

  it("uses a middle size when every node has the same value", () => {
    expect(scaleNodeSize(3, 3, 3)).toBe(13);
  });
});

describe("seedPositions", () => {
  it("reuses known positions and places new nodes next to known neighbours", () => {
    const known = new Map([
      ["a", { x: 10, y: 10 }],
      ["b", { x: 20, y: 10 }],
    ]);
    const { positions, reused } = seedPositions(
      [node("a", 1), node("b", 1), node("c", 1)],
      [edge("a", "c"), edge("b", "c")],
      known,
    );

    expect(reused).toBe(2);
    expect(positions.get("a")).toEqual({ x: 10, y: 10 });
    const c = positions.get("c")!;
    expect(Math.abs(c.x - 15)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(c.y - 10)).toBeLessThanOrEqual(0.5);
  });

  it("never stacks unknown isolated nodes on the same point", () => {
    const { positions } = seedPositions([node("a", 1), node("b", 1)], [], new Map());
    expect(positions.get("a")).not.toEqual(positions.get("b"));
  });

  it("spreads a new connected network across the circle instead of chaining new anchors", () => {
    const nodes = Array.from({ length: 400 }, (_, i) => node(String(i), 1));
    const edges = nodes.slice(1).map((n) => edge("0", n.id));
    const { positions, reused } = seedPositions(nodes, edges, new Map());
    const xs = [...positions.values()].map((p) => p.x).sort((a, b) => a - b);
    expect(reused).toBe(0);
    expect(xs[360] - xs[40]).toBeGreaterThan(50);
  });
});

describe("buildGraph", () => {
  const data = network([node("a", 0.6), node("b", 0.3), node("c", 0.1)], [edge("a", "b", 2), edge("b", "c", 1)]);

  it("encodes the selected metric as size and keeps one undirected edge per pair", () => {
    const graph = buildGraph(data, { metric: "pagerank", runLayout: false });

    expect(graph.order).toBe(3);
    expect(graph.size).toBe(2);
    expect(graph.getNodeAttribute("a", "size")).toBeGreaterThan(graph.getNodeAttribute("c", "size"));
    expect(graph.hasEdge(edgeKey("b", "a"))).toBe(true);
    expect(graph.getEdgeAttribute(edgeKey("a", "b"), "size")).toBe(3.5);
  });

  it("keeps fixed positions when layout is disabled", () => {
    const known = new Map([
      ["a", { x: 1, y: 2 }],
      ["b", { x: 3, y: 4 }],
      ["c", { x: 5, y: 6 }],
    ]);
    const graph = buildGraph(data, { metric: "pagerank", knownPositions: known, runLayout: false });

    expect(readPositions(graph)).toEqual(known);
  });

  it("produces finite positions after running the layout", () => {
    const graph = buildGraph(data, { metric: "pagerank" });
    graph.forEachNode((_, attributes) => {
      expect(Number.isFinite(attributes.x)).toBe(true);
      expect(Number.isFinite(attributes.y)).toBe(true);
    });
  });

  it("recovers a 400-node layout whose cached positions collapsed below a few outliers", () => {
    const nodes = Array.from({ length: 400 }, (_, i) => node(String(i), 1 / (i + 1)));
    const edges = nodes.slice(1).map((n) => edge("0", n.id));
    const known = new Map(nodes.map((n, i) => [n.id, { x: 0, y: i < 3 ? (3 - i) * 1e9 : i * 1e-6 }]));
    const graph = buildGraph(network(nodes, edges), { metric: "pagerank", knownPositions: known });
    for (const axis of ["x", "y"] as const) {
      const values = graph.mapNodes((_, attributes) => attributes[axis]).sort((a, b) => a - b);
      expect(values.every(Number.isFinite)).toBe(true);
      expect((values[379] - values[20]) / (values[399] - values[0])).toBeGreaterThan(0.1);
    }
  });
});
