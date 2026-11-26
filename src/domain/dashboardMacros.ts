import type { Lang } from "../i18n";

type LocalizedName = Record<Lang, string>;

interface MacroBlock {
  /** Índice del bloque ordenado por tamaño, C01 = 0. */
  rank: number;
  name: LocalizedName;
}

export interface MacroConfiguration {
  id: number;
  name: LocalizedName;
  color: string;
  blocks: MacroBlock[];
  description?: Record<Lang, string[]>;
}

export const MIDDLE_PERIOD = "2020–2023";
export const CORE_PERIOD = "2024–2026";

const block = (number: number, es: string, en: string): MacroBlock => ({
  rank: number - 1, name: { es, en },
});

const EARLY_MACROS: MacroConfiguration[] = [
  {
    id: 1,
    name: {
      es: "Régimen Extractivo y Lock-ins Históricos",
      en: "Extractive regime and historical lock-ins",
    },
    color: "#c87379",
    blocks: [
      block(10, "Minería/Ganadería", "Mining and cattle ranching"),
      block(11, "Carreteras/Dictadura", "Roads and dictatorship"),
      block(8, "Frontera Pará", "Pará frontier"),
      block(13, "Actores mineros", "Mining actors"),
      block(7, "Deforestación", "Deforestation"),
    ],
  },
  {
    id: 2,
    name: {
      es: "Nicho Agroforestal Consolidado e Infraestructura Blanda",
      en: "Established agroforestry niche and soft infrastructure",
    },
    color: "#76ba8d",
    blocks: [
      block(1, "Modelo agroforestal", "Agroforestry model"),
      block(5, "Asistencia técnica", "Technical assistance"),
      block(9, "Innovación local", "Local innovation"),
      block(12, "Raíces Tomé-Açú", "Tomé-Açú roots"),
      block(15, "Cadenas cortas", "Short supply chains"),
      block(16, "Núcleo", "Core"),
    ],
  },
  {
    id: 3,
    name: {
      es: "Nichos Emergentes Regenerativos y Tradicionales (Aislados o Fragmentados)",
      en: "Emerging regenerative and traditional niches (isolated or fragmented)",
    },
    color: "#ae96dc",
    blocks: [
      block(2, "Bioeconomía del bosque en pie", "Standing-forest bioeconomy"),
      block(3, "Prácticas familiares/ancestrales", "Family and ancestral practices"),
    ],
  },
  {
    id: 4,
    name: {
      es: "Zonas de Coexistencia y Tensión de Trayectorias",
      en: "Zones of coexistence and tension between trajectories",
    },
    color: "#70b9cd",
    blocks: [
      block(4, "Sistemas campesinos híbridos en Acre", "Hybrid smallholder systems in Acre"),
      block(6, "Diversificación en contextos de conflicto", "Diversification in conflict settings"),
    ],
  },
];

const LATE_MACROS: MacroConfiguration[] = [
  {
    id: 1,
    name: { es: "Super-núcleo articulador regional", en: "Regional coordinating core" },
    color: "#286b46",
    blocks: [block(25, "", "")],
  },
  {
    id: 2,
    name: { es: "Interfaz de Reglas y Gobernanza Territorial (Perú / MDD)", en: "Rules and territorial governance interface (Peru / MDD)" },
    color: "#8591c8",
    blocks: [2, 7, 18, 12, 19, 16, 27].map((rank) => block(rank, "", "")),
  },
  {
    id: 3,
    name: { es: "Arenas de Coalición e Intermediarios Locales de Madre de Dios", en: "Coalition arenas and local intermediaries in Madre de Dios" },
    color: "#72b9c8",
    blocks: [6, 29, 10, 9].map((rank) => block(rank, "", "")),
  },
  {
    id: 4,
    name: { es: "Capital Natural", en: "Natural Capital" },
    color: "#86bb76",
    blocks: [block(14, "", ""), block(11, "", "")],
  },
  {
    id: 5,
    name: { es: "Optimización / Productivo", en: "Optimization / Production" },
    color: "#75b5cf",
    blocks: [8, 4, 23, 24, 26, 28].map((rank) => block(rank, "", "")),
  },
  {
    id: 6,
    name: { es: "Regenerativo / Territorial", en: "Regenerative / Territorial" },
    color: "#bc91d6",
    blocks: [block(3, "", ""), block(20, "", "")],
  },
  {
    id: 7,
    name: { es: "Régimen Extractivo y Fricción Regulatoria", en: "Extractive regime and regulatory friction" },
    color: "#c87d7e",
    blocks: [1, 5, 15, 17].map((rank) => block(rank, "", "")),
  },
];

const MIDDLE_MACROS: MacroConfiguration[] = [
  {
    id: 1,
    name: {
      es: "Bloque pivote Deforestación–Conservación–Tenencia",
      en: "Deforestation–conservation–tenure pivot",
    },
    color: "#6eae91",
    blocks: [block(3, "Deforestación, conservación y tenencia", "Deforestation, conservation and tenure")],
    description: {
      es: [
        "Por primera vez en los períodos analizados, deforestation (peso global 62) y conservation (20,75) comparten bloque. Su arista directa aparece en dos documentos.",
        "C03 también reúne IPLCs, flowing rivers, home gardens, Brazilian Government y Land tenure (RUL). El bloque reúne el problema de la deforestación con prácticas de conservación y referencias a la tenencia.",
      ],
      en: [
        "For the first time in the periods studied, deforestation (global strength 62) and conservation (20.75) share a block. Two documents support their direct edge.",
        "C03 also includes IPLCs, flowing rivers, home gardens, Brazilian Government and Land tenure (RUL). The block brings deforestation together with conservation practices and tenure references.",
      ],
    },
  },
  {
    id: 2,
    name: { es: "Innovación Agrícola y Reglas Peruanas", en: "Agricultural innovation and Peruvian rules" },
    color: "#859acb",
    blocks: [
      block(5, "CTRIA, INIA, MINAGRI y Regional Agricultural Innovation Agenda", "CTRIA, INIA, MINAGRI and Regional Agricultural Innovation Agenda"),
      block(18, "SNIA", "SNIA"),
      block(19, "Universities y producer organizations", "Universities and producer organizations"),
      block(25, "MIDAGRI, PERIA y PESEM", "MIDAGRI, PERIA and PESEM"),
    ],
    description: {
      es: [
        "La lectura propuesta es una trayectoria de optimización institucional, centrada en la arquitectura de innovación agrícola y política pública.",
        "En C05, 23 de 82 nodos son KAS (28,0 %). En C25, 8 de 17 son RUL (47,1 %).",
      ],
      en: [
        "The proposed interpretation is an institutional optimization pathway centered on agricultural innovation and public policy.",
        "In C05, 23 of 82 nodes are KAS (28.0%). In C25, 8 of 17 are RUL (47.1%).",
      ],
    },
  },
  {
    id: 3,
    name: { es: "Nichos Locales, Indígenas y de Bioeconomía", en: "Local, Indigenous and bioeconomy niches" },
    color: "#ae96dc",
    blocks: [
      block(7, "Chagras, colono farmers, Social innovations y commercialization", "Chagras, colono farmers, Social innovations and commercialization"),
      block(9, "Indigenous Peoples y conservación de la biodiversidad", "Indigenous Peoples and biodiversity conservation"),
      block(16, "Traditional management of the chagra y diversified agroforestry systems", "Traditional management of the chagra and diversified agroforestry systems"),
      block(17, "Bioeconomy, standing forest, circular bioeconomy y healthy and flowing rivers", "Bioeconomy, standing forest, circular bioeconomy and healthy and flowing rivers"),
    ],
    description: {
      es: [
        "En C07, chagras suma 11,87 de peso dentro del bloque y se agrupa con colono farmers, Social innovations, collective actions y commercialization.",
        "En C09, Indigenous Peoples alcanza un peso global de 59,04 y tiene una arista directa con conservation of biodiversity. Interoceanic Highway también pertenece a C09.",
      ],
      en: [
        "In C07, chagras has an internal strength of 11.87 and is grouped with colono farmers, Social innovations, collective actions and commercialization.",
        "In C09, Indigenous Peoples reaches a global strength of 59.04 and has a direct edge with conservation of biodiversity. Interoceanic Highway also belongs to C09.",
      ],
    },
  },
  {
    id: 4,
    name: { es: "Régimen Extractivo y Referente Brasileño", en: "Extractive regime and Brazilian reference points" },
    color: "#c87d7e",
    blocks: [
      block(1, "Prácticas extractivas, turismo y restauración forestal", "Extractive practices, tourism and forest restoration"),
      block(2, "Brazil", "Brazil"),
      block(6, "Tomé-Açú", "Tomé-Açú"),
      block(10, "", ""),
      block(22, "", ""),
    ],
    description: {
      es: [
        "C01 es el bloque más grande del período. Reúne monoculture (peso global 27,25), logging (19) y gold mining (10,17) con Tourism y forest restoration.",
        "Brazil alcanza un peso global de 63,85 en C02 y Tomé-Açú, de 24,58 en C06. Por separado, el bloque geográfico C12 reúne Acre, Cusco, Puno, Arequipa y Pando.",
      ],
      en: [
        "C01 is the largest block in this period. It combines monoculture (global strength 27.25), logging (19) and gold mining (10.17) with Tourism and forest restoration.",
        "Brazil reaches a global strength of 63.85 in C02 and Tomé-Açú reaches 24.58 in C06. The separate geographic block C12 includes Acre, Cusco, Puno, Arequipa and Pando.",
      ],
    },
  },
];

const MACROS_BY_PERIOD: Record<string, MacroConfiguration[]> = {
  "2000–2019": EARLY_MACROS,
  [MIDDLE_PERIOD]: MIDDLE_MACROS,
  [CORE_PERIOD]: LATE_MACROS,
};
const NO_MACROS: MacroConfiguration[] = [];

export function macroClusters(period: string): MacroConfiguration[] {
  return MACROS_BY_PERIOD[period] ?? NO_MACROS;
}
