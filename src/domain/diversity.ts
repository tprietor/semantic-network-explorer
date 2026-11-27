import { CATEGORY_ORDER } from "./vocabulary";

const diversityCategories = CATEGORY_ORDER.filter((code) => code !== "INFRA");

export function categoryDiversity(counts: ReadonlyMap<string, number>) {
  const total = Array.from(counts.values()).reduce((sum, count) => sum + count, 0);
  const distribution = diversityCategories.map((category) => ({ category, count: counts.get(category) ?? 0 }));
  if (!total || distribution.reduce((sum, row) => sum + row.count, 0) !== total) {
    return null;
  }
  const entropy = distribution.reduce((sum, { count }) => {
    if (!count) return sum;
    const proportion = count / total;
    return sum - proportion * Math.log2(proportion);
  }, 0);
  const diversity = entropy / Math.log2(diversityCategories.length);
  return { distribution, total, present: counts.size, entropy, diversity };
}

export type Diversity = ReturnType<typeof categoryDiversity>;
export const diversityFormat = {
  en: new Intl.NumberFormat("en", { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
  es: new Intl.NumberFormat("es", { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
};
