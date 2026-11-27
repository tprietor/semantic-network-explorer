type Text = { es: string; en: string };

interface Reading {
  category: "PRAC" | "CHAR";
  title: Text;
  text: Text;
  terms: string[];
}

export const deforestationReadings: Record<string, Reading[]> = {
  "2000–2019": [
    {
      category: "PRAC",
      title: { es: "La minería de oro aparece junto a deforestation en 28 oraciones de dos documentos.", en: "Gold mining co-occurs with deforestation in 28 sentences across two documents." },
      text: {
        es: "La minería de oro es el vínculo más repetido de esta selección, con 28 oraciones en dos documentos. La ganadería, la tala y la expansión agrícola también aparecen junto a la deforestación. El mismo vecindario recoge cómo se observa la pérdida de bosque mediante sensores remotos y cómo se responde mediante la reforestación.",
        en: "Gold mining is the most frequently recorded link in this selection, with 28 sentences across two documents. Cattle ranching, logging and agricultural expansion also appear alongside deforestation. The same neighborhood includes ways of observing forest loss through remote sensing and responding through reforestation.",
      },
      terms: ["mining", "gold mining", "cattle ranching", "logging", "agricultural expansion", "oil exploration", "remote sensing", "reforestation"],
    },
    {
      category: "CHAR",
      title: { es: "FAO, municipios y cazadores-recolectores son los tres actores con enlace directo.", en: "FAO, municipalities and hunter-gatherers are the three directly linked actors." },
      text: {
        es: "FAO, municipalities y hunter-gatherers son los únicos actores con un enlace directo. Los documentos sitúan así la deforestación junto a una organización internacional, autoridades municipales y poblaciones cazadoras-recolectoras. Para conocer el papel de cada actor hay que volver al pasaje donde se lo menciona.",
        en: "FAO, municipalities and hunter-gatherers are the only actors with direct links. The documents thus place deforestation alongside an international organization, municipalities and hunting and gathering populations. The role of each actor depends on the passage in which it appears.",
      },
      terms: ["FAO", "municipalities", "hunter-gatherers"],
    },
  ],
  "2020–2023": [
    {
      category: "PRAC",
      title: { es: "Persisten la minería y la tala. La conservación y la restauración aparecen a su lado.", en: "Mining and logging persist. Conservation and restoration now appear alongside them." },
      text: {
        es: "La minería, la ganadería y la tala siguen a un paso. Ahora también se nombran explícitamente la minería de oro ilegal y la tala ilegal. Conservación, restauración y socio-bioeconomía comparten ese espacio. Ecoturismo y monocultivo, antes a dos pasos, pasan a ser vecinos directos.",
        en: "Mining, cattle ranching and logging remain one step away. Illegal gold mining and illegal logging are now named explicitly. Conservation, restoration and socio-bioeconomy share this neighborhood. Ecotourism and monoculture move from two steps away to direct links.",
      },
      terms: ["conservation", "restoration", "socio-bioeconomy", "ecotourism", "monoculture", "illegal gold mining", "illegal logging"],
    },
    {
      category: "CHAR",
      title: { es: "FAO y municipios siguen presentes. Se suman pueblos indígenas y productores.", en: "FAO and municipalities remain. Indigenous Peoples and producers gain direct links." },
      text: {
        es: "FAO y municipalities conservan sus enlaces. A su lado aparecen Indigenous Peoples y producers, cada uno vinculado a deforestation en dos documentos. IPLCs y Brazilian Government también están a un paso. Esto permite preguntar cómo describen los textos la producción, el gobierno y la vida en el territorio.",
        en: "FAO and municipalities retain their links. Indigenous Peoples and producers now appear alongside them, each linked to deforestation in two documents. IPLCs and Brazilian Government are also one step away. This opens a question about how the texts describe production, government and life in the territory.",
      },
      terms: ["FAO", "municipalities", "Indigenous Peoples", "producers", "IPLCs", "Brazilian Government", "government"],
    },
  ],
  "2024–2026": [
    {
      category: "PRAC",
      title: { es: "La cosecha de castaña pasa de dos pasos a uno. Aparece la adaptación climática.", en: "Brazil nut harvesting moves from two steps away to one. Climate adaptation appears." },
      text: {
        es: "La cosecha de castaña (Brazil nut harvesting) estaba a dos pasos en los dos períodos anteriores y ahora tiene un enlace directo, registrado en una oración. El manejo forestal también pasa de indirecto a directo. La agroforestería con cacao, la contabilidad del carbono y la adaptación climática amplían la lectura, mientras la minería y la tala siguen presentes.",
        en: "Brazil nut harvesting was two steps away in both earlier periods. It now has a direct link recorded in one sentence. Forest management also moves from an indirect to a direct link. Cacao agroforestry, carbon accounting and climate adaptation broaden the picture, while mining and logging remain present.",
      },
      terms: ["Brazil nut harvesting", "cacao agroforestry", "forest management", "carbon accounting", "climate adaptation"],
    },
    {
      category: "CHAR",
      title: { es: "Los gobiernos regionales pasan a un vínculo directo, junto a comunidades locales e instituciones financieras.", en: "Regional governments gain a direct link, alongside local communities and financial institutions." },
      text: {
        es: "Indigenous Peoples mantiene un enlace directo, ahora en 12 oraciones de tres documentos. Regional governments pasa de dos pasos a uno. Local communities, smallholders, cacao industry y financial institutions también aparecen junto a deforestation. La lectura territorial se amplía hacia las escalas de gobierno, los medios de vida y la financiación que menciona el corpus.",
        en: "Indigenous Peoples retains a direct link, now recorded in 12 sentences across three documents. Regional governments moves from two steps away to one. Local communities, smallholders, cacao industry and financial institutions also appear alongside deforestation. The texts now bring levels of government, livelihoods and finance into the same neighborhood.",
      },
      terms: ["Indigenous Peoples", "IPLCs", "regional governments", "local communities", "smallholders", "cacao industry", "financial institutions"],
    },
  ],
};
