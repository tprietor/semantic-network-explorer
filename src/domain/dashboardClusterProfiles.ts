import type { Lang } from "../i18n";

import { profiles2020 } from "./profiles2020";
import { profiles2024 } from "./profiles2024";

type LocalizedText = Record<Lang, string>;

export interface ClusterProfile {
  title: LocalizedText;
  description: LocalizedText;
  territorialReading: LocalizedText;
  terms: readonly string[];
}

/** Profiles for the full 2000–2019 network, in cluster rank order. */
const earlyClusterProfiles: readonly ClusterProfile[] = [
  {
    title: { es: "Diversificación productiva y manejo del bosque", en: "Productive diversification and forest management" },
    description: {
      es: "En una parte del bloque, CAMTA y los productores aparecen vinculados al modelo agroforestal. En otra, los bosques secundarios se relacionan con el barbecho y la regeneración forestal. Estas dos conversaciones aparecen en componentes separados del mismo bloque.",
      en: "In one part of the block, CAMTA and producers are linked to the agroforestry model. In another, secondary forests are linked to fallow and forest regeneration. These two themes appear in separate components of the same block.",
    },
    territorialReading: {
      es: "El bloque reúne, en componentes separados, referencias al modelo agroforestal y a la regeneración de bosques secundarios. ¿Qué se hace visible del territorio cuando seguimos a las organizaciones productivas, y qué aparece cuando seguimos las prácticas de manejo del bosque?",
      en: "The block brings together references to the agroforestry model and secondary forest regeneration in separate components. What becomes visible about the territory when we follow producer organizations, and what comes into view when we follow forest management practices?",
    },
    terms: ["CAMTA", "producers", "agroforestry model", "secondary forests", "forest regeneration"],
  },
  {
    title: { es: "Conservación, cacao y manejo de sombra", en: "Conservation, cacao and shade management" },
    description: {
      es: "La conservación se vincula con el manejo de sombra y el cultivo en chakras. Los árboles de sombra enlazan ese grupo con la producción de cacao. Otros componentes relacionan a familias con unidades campesinas y a productores locales con sus mercados.",
      en: "Conservation is linked to shade management and chakra farming. Shade trees connect that group to cacao production. Other components link families to peasant production units and local producers to their markets.",
    },
    territorialReading: {
      es: "El cacao aparece vinculado a los árboles de sombra, y la conservación, al manejo de sombra y al cultivo en chakras. ¿Qué prácticas concretas ayudan a entender cómo se habla de conservación en los espacios donde también se cultiva?",
      en: "Cacao is linked to shade trees, and conservation to shade management and chakra farming. Which practices help explain how conservation is discussed in places where crops are also grown?",
    },
    terms: ["conservation", "Shade management", "chakra farming", "shade trees", "cacao production"],
  },
  {
    title: { es: "Huertos y agrobiodiversidad en un bloque disperso", en: "Homegardens and agrobiodiversity in a dispersed block" },
    description: {
      es: "Los términos sugieren temas de huertos, chakras, pequeños productores y conservación de la agrobiodiversidad. El bloque reúne 55 nodos sin enlaces internos. La lectura se apoya en los términos que agrupa el modelo y queda abierta a revisar sus vínculos con otros bloques.",
      en: "The terms suggest themes of homegardens, chakras, small producers and agrobiodiversity conservation. The block contains 55 nodes with no internal links. This reading is based on the terms grouped by the model and can be explored further through their links to other blocks.",
    },
    territorialReading: {
      es: "Huertos, chakras y conservación de la agrobiodiversidad aparecen en el bloque sin enlaces internos entre ellos. ¿A qué lugares y situaciones se refiere cada término en los documentos, y cuáles tendría sentido comparar?",
      en: "Homegardens, chakras and agrobiodiversity conservation appear in the block without internal links. What places and situations does each term refer to in the documents, and which ones would make sense to compare?",
    },
    terms: ["homegarden", "chakra", "Small Producers", "agrobiodiversity conservation", "Northern Ecuadorian Amazon"],
  },
  {
    title: { es: "Producción campesina y extractiva en Acre", en: "Peasant production and extraction in Acre" },
    description: {
      es: "OcP e IcP aparecen vinculados entre sí y ambos se conectan con la producción extractiva y la ganadería. IcP también se vincula directamente con Acre. El componente principal reúne así varias formas de producción en torno a los mismos actores.",
      en: "OcP and IcP are linked to each other, and both connect to extractive production and cattle ranching. IcP is also directly linked to Acre. The main component brings several forms of production together around the same actors.",
    },
    territorialReading: {
      es: "En la red, OcP e IcP se vinculan tanto con la ganadería como con la producción extractiva. Al leer estas referencias en torno a Acre, ¿qué diferencias entre formas de producir quedarían por explorar si describiéramos el territorio a partir de una sola actividad?",
      en: "In the network, OcP and IcP are linked to both cattle ranching and extractive production. Reading these references around Acre, what differences between forms of production would remain to be explored if we described the territory through a single activity?",
    },
    terms: ["OcP", "IcP", "Acre", "extractive production", "cattle ranching"],
  },
  {
    title: { es: "Asistencia técnica y organización de la producción", en: "Technical assistance and organization of production" },
    description: {
      es: "La división de extensión conecta a las pequeñas fincas familiares con la asistencia técnica. En otro componente, un sistema productivo diverso aparece vinculado a la organización de la comercialización y a la diferenciación de los productos.",
      en: "The Extension Division connects small family farms to technical assistance. In a separate component, a diverse production system is linked to the organization of marketing and to product differentiation.",
    },
    territorialReading: {
      es: "La asistencia técnica aparece junto a las fincas familiares, y la comercialización figura en otro componente del bloque. ¿Qué más entenderíamos de la producción local al preguntar cómo reciben apoyo las familias y cómo venden lo que producen?",
      en: "Technical assistance appears alongside family farms, and marketing is part of a separate component. What more could we learn about local production by asking how families receive support and how they sell what they produce?",
    },
    terms: ["Extension Division", "small family farms", "technical assistance", "complex, diverse productive system", "organization of commercialization"],
  },
  {
    title: { es: "Ocupación, conflicto y diversificación productiva", en: "Settlement, conflict and productive diversification" },
    description: {
      es: "Un componente relaciona a familias con el bioma amazónico y la política de poblamiento del período pombalino. Otro reúne referencias a Colombia y a grupos armados como el ELN. En un tercer componente, Capitão Poço aparece ligado a la introducción de cultivos permanentes.",
      en: "One component links families to the Amazon biome and to Pombaline settlement policy. Another brings together references to Colombia and armed groups such as the ELN. In a third component, Capitão Poço is linked to the introduction of permanent crops.",
    },
    territorialReading: {
      es: "El bloque reúne, en componentes separados, referencias a poblamiento, conflicto armado y cambios productivos. ¿De qué lugares y momentos habla cada uno, y qué comparaciones tienen sentido una vez ubicados en su contexto?",
      en: "Separate components of the block contain references to settlement, armed conflict and changes in production. Which places and periods does each account describe, and what comparisons make sense once they are put in context?",
    },
    terms: ["families", "Amazon Biome", "Colombia", "ELN", "diversification by introducing permanent cultures"],
  },
  {
    title: { es: "Deforestación, degradación y restauración", en: "Deforestation, degradation and restoration" },
    description: {
      es: "La deforestación conecta directamente con la degradación forestal y la restauración del paisaje forestal. También aparece vinculada a la Amazonía ecuatoriana y a Magdalena Valley-Urabá. Otros componentes reúnen referencias a territorios amazónicos y a la producción de açaí.",
      en: "Deforestation connects directly to forest degradation and forest landscape restoration. It is also linked to the Ecuadorian Amazon and Magdalena Valley-Urabá. Other components bring together references to Amazonian territories and açaí production.",
    },
    territorialReading: {
      es: "La deforestación se menciona junto a la degradación y la restauración del paisaje, y también se vincula con la Amazonía ecuatoriana y Magdalena Valley-Urabá. ¿Qué problema se describe en cada lugar, y cuándo aparecen juntos la pérdida del bosque y los esfuerzos por recuperarlo?",
      en: "Deforestation is mentioned alongside degradation and landscape restoration and is also linked to the Ecuadorian Amazon and Magdalena Valley-Urabá. What problem is described in each place, and when do forest loss and efforts to restore it appear together?",
    },
    terms: ["deforestation", "forest degradation", "Forest Landscape Restoration", "Ecuadorian Amazon", "Magdalena Valley-Urabá"],
  },
  {
    title: { es: "Colonización y territorios vinculados a Pará", en: "Colonization and territories linked to Pará" },
    description: {
      es: "Los lugares constituyen 16 de los 21 nodos. Pará enlaza referencias a la colonización, a los campesinos inmigrantes, a Bragantina y a la meseta de Santarém. En componentes aparte aparecen Pando y Rhodônia, y la relación entre Irituia y las comunidades ribereñas.",
      en: "Places account for 16 of the 21 nodes. Pará links references to colonization, immigrant peasants, Bragantina and the Santarém plateau. Separate components contain Pando and Rhodônia, and the link between Irituia and riverine communities.",
    },
    territorialReading: {
      es: "Pará aparece junto a referencias a la colonización, al campesinado inmigrante y a lugares como Bragantina y la meseta de Santarém. ¿Qué se entiende mejor al pasar del nombre del estado a las historias de poblamiento de los lugares que el texto menciona?",
      en: "Pará appears alongside references to colonization, immigrant peasantries and places such as Bragantina and the Santarém plateau. What can we understand better by moving from the name of the state to the settlement histories of the places mentioned in the text?",
    },
    terms: ["Pará", "colonization", "immigrant peasants", "Bragantina microregion", "Santareno Plateau"],
  },
  {
    title: { es: "Innovación local y cambios en la producción", en: "Local innovation and changes in production" },
    description: {
      es: "El sistema de innovación local se vincula con familias pioneras, combinaciones de policultivos e intercambio de resultados. Otro componente reúne referencias al paso del açaí extractivo al plantado y a la sustitución parcial de la harina por açaí.",
      en: "The local innovation system is linked to pioneer families, polyculture combinations and sharing results. Another component brings together references to a shift from extractive to planted açaí and the partial replacement of flour by açaí.",
    },
    territorialReading: {
      es: "El bloque vincula la innovación local con las familias pioneras y, en otro componente, reúne referencias a cambios en la producción de açaí. ¿Qué cambios describe cada pasaje, y a quiénes atribuye las decisiones sobre cómo producir?",
      en: "The block links local innovation to pioneer families and, in a separate component, brings together references to changes in açaí production. What changes does each passage describe, and who is credited with making decisions about how to produce?",
    },
    terms: ["local innovation system", "pioneer families", "polyculture combinations", "planted acai berry replaced extractive acai berry", "acai berry partially replaced flour"],
  },
  {
    title: { es: "Minería aurífera y expansión productiva", en: "Gold mining and expansion of production" },
    description: {
      es: "La minería y la extracción de oro forman el grupo principal. La minería aurífera aparece vinculada a municipios y actividades de pastoreo. En otro componente, la expansión ganadera se relaciona con la intensificación del cultivo de açaí y la introducción de cultivos permanentes exóticos.",
      en: "Mining and gold extraction form the main group. Gold mining is linked to municipalities and grazing activities. In a separate component, cattle ranching expansion is linked to more intensive açaí cultivation and the introduction of permanent exotic crops.",
    },
    territorialReading: {
      es: "La minería aurífera y el pastoreo aparecen juntos en un componente. En otro, la expansión ganadera se menciona junto a cambios en el cultivo. ¿Qué significa la expansión productiva en cada contexto, y qué usos de la tierra pone en primer plano cada relato?",
      en: "Gold mining and grazing appear together in one component. In another, cattle ranching expansion is mentioned alongside changes in cultivation. What does expansion of production mean in each context, and which land uses does each account bring into focus?",
    },
    terms: ["mining", "gold mining", "grazing activities", "expansion of cattle ranching", "intensification and planting of acai berry"],
  },
  {
    title: { es: "Carreteras, colonización y frontera agrícola", en: "Highways, colonization and the agricultural frontier" },
    description: {
      es: "Rondônia se conecta con referencias a la dictadura militar, la formación de asentamientos campesinos y varias carreteras. La Transamazónica, la Belém–Brasília y la BR-364 aparecen vinculadas entre sí y a la formación de esos asentamientos.",
      en: "Rondônia connects to references to military dictatorship, the formation of peasant settlements and several highways. The Trans-Amazonian, Belém–Brasília and BR-364 highways are linked to one another and to the formation of those settlements.",
    },
    territorialReading: {
      es: "El bloque reúne menciones a carreteras, a la dictadura militar y a la formación de asentamientos campesinos. ¿Qué se entiende del poblamiento al leer esas carreteras junto a los proyectos y asentamientos mencionados en el corpus?",
      en: "The block brings together mentions of highways, military dictatorship and the formation of peasant settlements. What can we learn about settlement by reading about those highways alongside the projects and settlements mentioned in the corpus?",
    },
    terms: ["Rondônia", "military dictatorship", "formation of peasant settlements", "Trans-Amazonian highway", "Belém-Brasília highway"],
  },
  {
    title: { es: "Migración japonesa y agricultura campesina", en: "Japanese migration and peasant agriculture" },
    description: {
      es: "Los migrantes japoneses se vinculan con Tomé-Açú y Parintins. El mismo componente conecta las referencias a la colonización japonesa con el nordeste de Pará. En otro componente, el campesinado aparece relacionado con la agricultura itinerante y con cultivos alimentarios.",
      en: "Japanese migrants are linked to Tomé-Açú and Parintins. The same component connects references to Japanese colonization with northeastern Pará. In another component, the peasantry is linked to shifting cultivation and food crops.",
    },
    territorialReading: {
      es: "Los migrantes japoneses se vinculan con Tomé-Açú y Parintins, mientras que la agricultura itinerante aparece en otro componente. ¿Qué trayectorias de poblamiento y de cultivo distingue el texto al describir lugares y grupos campesinos?",
      en: "Japanese migrants are linked to Tomé-Açú and Parintins, while shifting cultivation appears in a separate component. What paths of settlement and cultivation does the text distinguish when it describes places and peasant groups?",
    },
    terms: ["Japanese migrants", "Japanese colonization", "microregion of Tomé-Açu", "peasantry", "shifting cultivation"],
  },
  {
    title: { es: "Minería de pequeña escala y territorios forestales", en: "Small-scale mining and forest territories" },
    description: {
      es: "Itaituba y la ecorregión de bosques húmedos Tapajós–Xingú se vinculan con garimpeiros, mineros de oro y mineros de pequeña escala. El mismo componente incluye referencias a Magdalena–Urabá, enlazada con la ecorregión y con la exploración petrolera.",
      en: "Itaituba and the Tapajós–Xingú moist forest ecoregion are linked to garimpeiros, gold miners and small-scale miners. The same component includes Magdalena–Urabá, which is linked to the ecoregion and to oil exploration.",
    },
    territorialReading: {
      es: "La minería aparece nombrada mediante un municipio, Itaituba, y una ecorregión, Tapajós–Xingú. ¿Qué cambia en la lectura de la actividad minera cuando el texto la sitúa en un municipio o en un paisaje forestal más amplio?",
      en: "Mining is described in relation to a municipality, Itaituba, and an ecoregion, Tapajós–Xingú. What changes in how we read mining activity when the text situates it in a municipality or in a wider forest landscape?",
    },
    terms: ["Itaituba", "garimpeiros", "gold miners", "Tapajós–Xingú moist forest ecoregion", "Magdalena–Urabá"],
  },
  {
    title: { es: "Municipios que aparecen juntos", en: "Municipalities mentioned together" },
    description: {
      es: "Los siete nodos son municipios y cada uno se conecta con los otros seis. Cada uno de los 21 enlaces aparece en un documento. El rasgo común del bloque es geográfico, con el mismo número de enlaces internos para todos sus municipios.",
      en: "All seven nodes are municipalities, and each is linked to the other six. Each of the 21 links is recorded in one document. The block is geographic in character, with the same number of internal links for every municipality.",
    },
    territorialReading: {
      es: "El documento reúne a siete municipios de la Transamazónica y Rondônia como ejemplos de colonización dirigida. Esa mención compartida da pie a preguntarnos qué tuvieron en común sus trayectorias de poblamiento y qué fue particular de cada lugar.",
      en: "The document brings together seven municipalities along the Trans-Amazonian Highway and in Rondônia as examples of directed colonization. Their shared mention invites us to ask what their settlement histories had in common and what was particular to each place.",
    },
    terms: ["Cacaulândia", "Costa Marques", "Medicilândia", "Senador José Porfírio", "Vilhena"],
  },
  {
    title: { es: "Cadenas de valor y organización campesina", en: "Value chains and peasant organization" },
    description: {
      es: "Las cadenas cortas y largas aparecen vinculadas entre sí y con los arreglos productivos locales, las microestructuras campesinas y el territorio campesino. En un componente aparte, ReP se vincula con Trans-Amazonía.",
      en: "Short and long value chains are linked to one another and to local productive arrangements, peasant microstructures and peasant territory. In a separate component, ReP is linked to Trans-Amazonía.",
    },
    territorialReading: {
      es: "El bloque pone en relación las cadenas cortas y largas con los arreglos productivos locales y el territorio campesino. ¿Qué se vuelve visible del territorio cuando seguimos los recorridos de los productos y la manera en que se organiza su comercialización?",
      en: "The block links short and long value chains to local productive arrangements and peasant territory. What becomes visible about the territory when we follow where products go and how their marketing is organized?",
    },
    terms: ["short value chains", "long chains", "local productive arrangements", "peasant microstructures", "peasantry territory"],
  },
  {
    title: { es: "Tomé-Açú como punto de enlace", en: "Tomé-Açú as a connecting point" },
    description: {
      es: "Tomé-Açú articula los enlaces del bloque. Su enlace con Brazil figura en tres documentos y su enlace con la tala aparece en uno. El perfil distingue una referencia geográfica recurrente y una mención puntual de una actividad extractiva.",
      en: "Tomé-Açú is the common endpoint of the block’s two links. Its link to Brazil appears in three documents and its link to logging in one. The profile identifies a recurring geographic reference and a single-document link to an extractive activity.",
    },
    territorialReading: {
      es: "Tomé-Açú aparece junto a Brazil en tres documentos y junto a la tala en uno. ¿Cuándo funciona como referencia geográfica y cuándo el texto lo vincula con una actividad concreta?",
      en: "Tomé-Açú appears alongside Brazil in three documents and alongside logging in one. When does it serve as a geographic reference, and when does the text link it to a specific activity?",
    },
    terms: ["Tomé-Açú", "Brazil", "logging"],
  },
];

export const fullNetworkProfiles: Readonly<Partial<Record<string, readonly ClusterProfile[]>>> = {
  "2000–2019": earlyClusterProfiles,
  "2020–2023": profiles2020,
  "2024–2026": profiles2024,
};
