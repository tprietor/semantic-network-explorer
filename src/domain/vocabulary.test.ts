import { describe, expect, it } from "vitest";
import { CATEGORY_ORDER, categoryColor, categoryLabel, categoryPalette, formatInt, formatMetric, metricLabel, periodShort } from "./vocabulary";

describe("vocabulary", () => {
  it("uses the selected colors for places, rules and infrastructures", () => {
    expect(categoryColor("LOC")).toBe("#6BC8CC");
    expect(categoryColor("eco_INFRA")).toBe("#8BCB2E");
    expect(categoryColor("soft_INFRA")).toBe("#794A83");
    expect(categoryColor("RUL")).toBe("#FFFF00");
  });

  it("offers one KAS category in both languages", () => {
    expect(CATEGORY_ORDER.filter((code) => code !== "INFRA")).toHaveLength(8);
    expect(CATEGORY_ORDER).toContain("KAS");
    for (const old of ["ATT", "KNOW", "SKILL"]) expect(CATEGORY_ORDER).not.toContain(old);
    expect(categoryPalette()).toHaveLength(8);
    for (const lang of ["es", "en"] as const) {
      expect(categoryLabel("KAS", lang)).toBe("KAS");
      expect(categoryLabel("KAS", lang, true)).toBe("KAS");
    }
  });
  it("formats numbers with the separators of each language", () => {
    expect(formatInt(36873, "es")).toBe("36.873");
    expect(formatInt(36873, "en")).toBe("36,873");
    expect(formatInt(999, "es")).toBe("999");
    expect(formatMetric("betweenness", 0.38, "es")).toBe("0,380");
    expect(formatMetric("betweenness", 0.38, "en")).toBe("0.380");
    expect(formatMetric("strength", 1102.4, "en")).toBe("1,102");
  });

  it("translates labels and short periods", () => {
    expect(categoryLabel("LOC", "es")).toBe("Lugares");
    expect(categoryLabel("eco_INFRA", "en", true)).toBe("Ecological infra.");
    expect(categoryLabel("UNKNOWN", "en")).toBe("UNKNOWN");
    expect(metricLabel("betweenness", "en")).toBe("Bridge between groups");
    expect(periodShort("2020-2023", "es")).toBe("2020–23");
    expect(periodShort("2000-2019", "en")).toBe("2000–19");
    expect(periodShort("all", "en")).toBe("All");
  });
});
