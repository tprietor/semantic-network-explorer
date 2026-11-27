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
  reading?: { network: LocalizedName; sources: { title: string; excerpt: string; passage: LocalizedName }[] };
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
    name: {"es": "Sistemas Agroforestales Consolidados y Soporte Técnico", "en": "Established Agroforestry Systems and Technical Support"},
    color: "#70ae93",
    blocks: [
      block(1, "La cooperativa y los productores", "The cooperative and its producers"),
      block(9, "Ensayos de familias pioneras", "Trials by pioneer families"),
      block(5, "La extensión llega a las fincas", "Extension reaches family farms"),
      block(16, "Tomé-Açú como lugar de encuentro", "Tomé-Açú as a meeting place"),
    ],
    description: {
      es: ["En Tomé-Açú se probaron cultivos en las fincas y se compartieron resultados a través de CAMTA. La extensión también tuvo un rostro concreto: Michinori Konagano visitaba a sus vecinos, repartía plántulas y enseñaba técnicas. Cada familia decidía qué adoptar."],
      en: ["In Tomé-Açú, growers tested crops on their farms and shared results through CAMTA. Extension also had a human face. Michinori Konagano visited neighbors, distributed seedlings and taught techniques. Each household decided what to adopt."],
    },
    reading: {
      network: {
        es: "CAMTA (C01) se enlaza con Tomé-Açú (C16), y JICA (C01) con la asistencia técnica (C05). Los dos enlaces entre C01 y C09 son geográficos, de Ecuador a Napo y Tena. La relación con los ensayos familiares de C09 se reconstruye en los textos.",
        en: "CAMTA (C01) links to Tomé-Açú (C16), and JICA (C01) to technical assistance (C05). Both links between C01 and C09 are geographic, from Ecuador to Napo and Tena. The texts supply the connection to the family trials in C09.",
      },
      sources: [
        { title: "Cooperativism and Agroforestry in the Eastern Amazon", excerpt: "shared results with other members through the cooperative", passage: {
          es: "Los pasajes sobre ensayos en fincas y circulación de resultados explican el papel de CAMTA y la decisión de cada hogar.",
          en: "The passages on farm trials and sharing results describe CAMTA’s role and the decisions made by each household.",
        } },
        { title: "The Role of Homegardens in Agroforestry Development", excerpt: "distribute seedlings, and teach agricultural techniques", passage: {
          es: "El relato de Konagano describe sus visitas y la distribución de plántulas a fincas vecinas.",
          en: "The account of Konagano describes his visits and the distribution of seedlings to neighboring farms.",
        } },
        { title: "The economy of agroforestry systems in the Amazon", excerpt: "pioneer families testing different paths and sharing results", passage: {
          es: "El pasaje sobre las familias pioneras en Tomé-Açú recupera el estudio de Yamada y Osaqui sobre policultivos e intercambio de resultados.",
          en: "The passage on pioneer families in Tomé-Açú draws on Yamada and Osaqui’s study of polycultures and shared results.",
        } },
      ],
    },
  },
  {
    id: 2,
    name: {"es": "Iniciativas Locales y Tradicionales Emergentes", "en": "Emerging Local and Traditional Initiatives"},
    color: "#93aa67",
    blocks: [
      block(2, "Cacao y manejo de sombra", "Cacao and shade management"),
      block(3, "Chakras, huertos y agrobiodiversidad", "Chakras, homegardens and agrobiodiversity"),
    ],
    description: {
      es: ["En las chakras de la Amazonía ecuatoriana, elegir qué árboles conservar cambia la luz que reciben los cultivos. El estudio compara parcelas de cacao, maíz y yuca con bosques secundarios y maduros. Así se puede preguntar qué diversidad de árboles permanece en un espacio que también alimenta a una familia."],
      en: ["In chakras of the Ecuadorian Amazon, choosing which trees to retain changes the light reaching crops. The study compares cacao, maize and cassava plots with secondary and mature forest. This makes it possible to ask which trees persist in a place that also feeds a household."],
    },
    reading: {
      network: {
        es: "En C02, conservación se vincula con manejo de sombra y cultivo en chakras. C03 contiene chakra y conservación de la agrobiodiversidad. Sus 55 nodos carecen de enlaces internos y tampoco hay aristas entre C02 y C03. La asociación es temática y se circunscribe a esos términos.",
        en: "In C02, conservation links to shade management and chakra farming. C03 contains chakra and agrobiodiversity conservation. Its 55 nodes have no internal edges, and there are no edges between C02 and C03. The thematic association applies to these particular terms.",
      },
      sources: [
        { title: "Biodiversity, dynamics, and impact of chakras on the Ecuadorian Amazon", excerpt: "a farmer's tree selection is intended exclusively to increase crop productivity", passage: {
          es: "El inventario compara árboles en 61 parcelas. La discusión sobre la selección de árboles de sombra distingue el objetivo productivo y la presencia de especies nativas.",
          en: "The inventory compares trees across 61 plots. The discussion of shade-tree selection distinguishes the production objective from the presence of native species.",
        } },
      ],
    },
  },
  {
    id: 3,
    name: {"es": "Sistemas Productivos Mixtos en Tensión", "en": "Mixed Production Systems in Tension"},
    color: "#8e9fbf",
    blocks: [
      block(8, "Fronteras de Pará", "Settlement frontiers in Pará"),
      block(12, "Migración y núcleos agrícolas", "Migration and farming settlements"),
      block(6, "El caso de Capitão Poço", "The case of Capitão Poço"),
      block(11, "Carreteras y asentamientos", "Highways and settlements"),
      block(14, "Siete municipios en el relato", "Seven municipalities in the account"),
    ],
    description: {
      es: ["La historia empieza en lugares concretos. El estudio sigue a familias migrantes hacia el nordeste de Pará y describe la expansión hacia Capitão Poço. Para la Transamazónica y Rondônia reconstruye otra historia, ligada a carreteras y proyectos de colonización. Los siete municipios de C14 sitúan ese segundo relato."],
      en: ["The study follows migrant families into northeastern Pará and describes expansion toward Capitão Poço. For the Trans-Amazonian region and Rondônia it traces a different history involving roads and settlement projects. The seven municipalities in C14 locate that second account."],
    },
    reading: {
      network: {
        es: "Pará (C08) enlaza con Capitão Poço (C06) y con la colonización japonesa (C12). Rondônia (C11) enlaza con cada municipio de C14. La lectura toma de C06 su componente de poblamiento y diversificación. El bloque también contiene referencias al conflicto en Colombia.",
        en: "Pará (C08) links to Capitão Poço (C06) and Japanese colonization (C12). Rondônia (C11) links to each municipality in C14. This reading draws on the settlement and diversification component of C06, which also contains references to conflict in Colombia.",
      },
      sources: [
        { title: "The economy of agroforestry systems in the Amazon", excerpt: "the formation of peasant settlements", passage: {
          es: "Los apartados sobre campesinado inmigrante y reciente describen Bragantina, Capitão Poço y las carreteras. Más adelante, el estudio identifica los siete municipios al comparar los censos de 2006 y 2017.",
          en: "The sections on immigrant and recently settled peasantries describe Bragantina, Capitão Poço and the highways. Later, the study identifies the seven municipalities when comparing the 2006 and 2017 censuses.",
        } },
      ],
    },
  },
  {
    id: 4,
    name: {"es": "Bionegocios, Concesiones y Mercados del Bosque", "en": "Bio-based Businesses, Concessions and Forest Markets"},
    color: "#c29f70",
    blocks: [
      block(4, "Extracción, cultivos y ganado", "Extraction, crops and cattle"),
      block(15, "Cadenas cortas y largas", "Short and long value chains"),
    ],
    description: {
      es: ["¿A dónde va lo que se produce en un territorio campesino? El estudio distingue cadenas que atienden necesidades locales y otras que llegan a mercados nacionales o mundiales. También describe cómo la extracción y la ganadería tienen pesos distintos en lugares como Assis Brasil y Xapuri, en Acre."],
      en: ["Where does the produce of a peasant territory go? The study distinguishes chains serving local needs from those reaching national or world markets. It also describes how extraction and ranching feature differently in places such as Assis Brasil and Xapuri in Acre."],
    },
    reading: {
      network: {
        es: "Los dos bloques comparten cinco aristas, entre ellas las que unen ReP (C15) con producción extractiva y ganadería (C04). La distinción entre cadenas cortas y largas aparece en otro componente de C15. Identificar el destino comercial de un producto de Acre exige seguir ese caso en el texto.",
        en: "Five edges join these blocks, including links from ReP (C15) to extractive production and cattle ranching (C04). Short and long chains appear in a different component of C15. Tracing a particular Acre product to market requires evidence about that case.",
      },
      sources: [
        { title: "The economy of agroforestry systems in the Amazon", excerpt: "short value chains, related to local needs, and long chains, related to national and world markets", passage: {
          es: "El pasaje sobre arreglos productivos locales define las cadenas cortas y largas. La comparación de Acre desagrega la ganadería por municipio, incluidos Assis Brasil y Xapuri.",
          en: "The passage on local productive arrangements defines short and long chains. The comparison in Acre breaks down ranching by municipality, including Assis Brasil and Xapuri.",
        } },
      ],
    },
  },
  {
    id: 5,
    name: {"es": "Régimen Extractivo y Lock-ins", "en": "Extractive Regime and Lock-ins"},
    color: "#c48779",
    blocks: [
      block(7, "Pérdida de cobertura forestal", "Forest cover loss"),
      block(10, "Minería y actividades productivas", "Mining and productive activities"),
      block(13, "Mineros, municipios y ecorregiones", "Miners, municipalities and ecoregions"),
    ],
    description: {
      es: ["El estudio sobre la demanda de oro localiza pérdidas de bosque en zonas mineras y se detiene en Itaituba, dentro de la ecorregión Tapajós–Xingú. Al pasar del mapa al municipio aparecen los garimpeiros. En Magdalena–Urabá, el propio estudio sitúa la minería junto a la ganadería, la agricultura y la exploración petrolera."],
      en: ["The study of gold demand maps forest loss in mining areas and takes a closer look at Itaituba in the Tapajós–Xingú ecoregion. Moving from map to municipality brings the garimpeiros into view. In Magdalena–Urabá, the study places mining alongside ranching, agriculture and oil exploration."],
    },
    reading: {
      network: {
        es: "Deforestación (C07) y minería de oro (C10) coocurren en dos documentos. La minería de oro enlaza con los mineros de oro (C13), y la deforestación con la ecorregión Tapajós–Xingú (C13). Para atribuir una pérdida concreta a la minería hay que volver al análisis espacial del estudio.",
        en: "Deforestation (C07) and gold mining (C10) co-occur in two documents. Gold mining links to gold miners (C13), and deforestation to the Tapajós–Xingú ecoregion (C13). Attributing a particular loss to mining requires the study’s spatial analysis.",
      },
      sources: [
        { title: "Global demand for gold is another threat for tropical forests", excerpt: "many concentrated in the municipality of Itaituba", passage: {
          es: "Los resultados localizan áreas de pérdida forestal en Itaituba. La discusión compara Tapajós–Xingú y Magdalena–Urabá y distingue las actividades descritas en cada lugar.",
          en: "The results locate patches of forest loss in Itaituba. The discussion compares Tapajós–Xingú and Magdalena–Urabá and distinguishes the activities reported in each place.",
        } },
      ],
    },
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
