import type { ClusterProfile } from "./dashboardClusterProfiles";

/** Full network, 2020–2023, in cluster rank order. */
export const profiles2020: readonly ClusterProfile[] = [
  { // C01
    title: {
      es: "Monocultivo, tala y otros usos del bosque",
      en: "Monoculture, logging and other forest uses",
    },
    description: {
      es: "El monocultivo aparece junto a los árboles y los derechos territoriales. La tala se vincula con el aguajal, y la minería de oro con la fragmentación del paisaje. En otro componente, el turismo aparece junto a REDD+.",
      en: "Monoculture appears alongside trees and territorial rights. Logging is linked to aguajal palm swamps, and gold mining to landscape fragmentation. Tourism appears alongside REDD+ in a separate component.",
    },
    territorialReading: {
      es: "El aguajal da un lugar concreto a la mención de la tala. ¿Qué ambientes y qué derechos nombran los documentos cuando describen un cambio de uso del bosque?",
      en: "The palm swamp gives the reference to logging a specific setting. Which environments and rights do the documents name when describing a change in forest use?",
    },
    terms: ["monoculture", "territorial rights", "logging", "aguajal", "landscape fragmentation"],
  },
  { // C02
    title: {
      es: "Brasil, agricultura a gran escala y CAMTA",
      en: "Brazil, large-scale agriculture and CAMTA",
    },
    description: {
      es: "Brasil se menciona junto a la agricultura a gran escala y a los habitantes del bosque. En el mismo componente, CAMTA aparece junto a comunidades colonas y a una empresa de cosméticos. De los 148 términos del bloque, 120 carecen de enlaces internos.",
      en: "Brazil is mentioned alongside large-scale agriculture and forest dwellers. In the same component, CAMTA appears alongside settler communities and a cosmetics company. Of the block’s 148 terms, 120 have no internal links.",
    },
    territorialReading: {
      es: "La referencia al país abarca realidades muy distintas. ¿Qué se alcanza a ver de la producción al seguir las menciones a la cooperativa y a las comunidades concretas?",
      en: "The country reference spans very different circumstances. What comes into view about production when we follow the mentions of the cooperative and the communities themselves?",
    },
    terms: ["Brazil", "large-scale agriculture", "forest dwellers", "CAMTA", "Colono communities"],
  },
  { // C03
    title: {
      es: "Deforestación y conservación entre gobiernos, comunidades y huertos",
      en: "Deforestation and conservation across governments, communities and gardens",
    },
    description: {
      es: "Deforestación y conservación aparecen juntas en dos documentos. La primera también se vincula con IPLCs y con el gobierno brasileño. La segunda se conecta con los huertos familiares y los ecosistemas acuáticos.",
      en: "Deforestation and conservation appear together in two documents. Deforestation is also linked to IPLCs and the Brazilian government. Conservation connects to home gardens and aquatic ecosystems.",
    },
    territorialReading: {
      es: "Los huertos ofrecen una entrada doméstica a un debate que también nombra al gobierno. ¿A qué escala se describe la pérdida de bosque y a qué escala se reconocen las prácticas de conservación?",
      en: "Gardens offer a household perspective on a discussion that also names the government. At what scale is forest loss described, and at what scale are conservation practices recognized?",
    },
    terms: ["deforestation", "conservation", "IPLCs", "Brazilian Government", "home gardens"],
  },
  { // C04
    title: {
      es: "Familias rurales y organizaciones de agricultores",
      en: "Rural families and farmers’ organizations",
    },
    description: {
      es: "En un componente, las aldeas se vinculan con Assosa, en el oeste de Etiopía. En otro, el sindicato de trabajadores rurales de Tomé-Açu aparece junto a agricultores locales y organizaciones de base.",
      en: "In one component, villages are linked to Assosa in western Ethiopia. In another, the rural workers’ union of Tomé-Açu appears alongside local farmers and grassroots organizations.",
    },
    territorialReading: {
      es: "Una aldea y un sindicato son dos maneras muy distintas de situar a quienes cultivan. ¿Cuándo describe el texto dónde vive la gente y cuándo explica cómo se organiza?",
      en: "A village and a union locate farmers in different ways. When does a text describe where people live, and when does it explain how they organize?",
    },
    terms: ["villages", "Assosa", "Rural Workers' Union of Tomé-Açu", "local farmers", "grassroots organizations"],
  },
  { // C05
    title: {
      es: "Quién define la innovación agraria",
      en: "Who defines agricultural innovation",
    },
    description: {
      es: "La CTRIA aparece junto al MINAGRI y a la innovación agraria. La comisión regional también se menciona junto a la investigación, la transferencia de tecnología y la extensión. La agenda regional de innovación figura en ese conjunto.",
      en: "CTRIA appears alongside MINAGRI and agricultural innovation. The regional commission is also mentioned alongside research, technology transfer and extension. The regional innovation agenda figures in this group.",
    },
    territorialReading: {
      es: "La palabra innovación abarca desde investigar hasta acompañar a quienes producen. ¿Qué necesidades de las fincas llegan a formularse como prioridades en la agenda regional?",
      en: "Innovation here spans research and support for producers. Which needs identified on farms find their way into the regional agenda as priorities?",
    },
    terms: ["CTRIA", "MINAGRI", "agricultural innovation", "Regional Agricultural Innovation Agenda", "research, technology transfer and agricultural extension"],
  },
  { // C06
    title: {
      es: "Migración japonesa y agricultura en Tomé-Açú",
      en: "Japanese migration and farming in Tomé-Açú",
    },
    description: {
      es: "Tomé-Açú aparece junto a la agricultura y a los migrantes japoneses. En el mismo componente, la Asociación Cultural Nikkei se vincula con la cooperativa agrícola Nikkei, y Capitão Poço con Bragantina.",
      en: "Tomé-Açú appears alongside farming and Japanese migrants. In the same component, the Nikkei cultural association is linked to the Nikkei farming cooperative, and Capitão Poço to Bragantina.",
    },
    territorialReading: {
      es: "Al lado de los nombres de lugar aparecen una asociación cultural y una cooperativa. ¿Qué cuentan esas organizaciones sobre la relación entre la historia migratoria y las formas locales de cultivar?",
      en: "A cultural association and a cooperative appear alongside place names. What do these organizations reveal in the accounts of migration and local farming?",
    },
    terms: ["Tomé-Açú", "Japanese migrants", "farming", "Asociación Cultural Nikkei", "Nikkei Farming Cooperative"],
  },
  { // C07
    title: {
      es: "La chagra entre el cultivo y el mercado",
      en: "The chagra between cultivation and the market",
    },
    description: {
      es: "Las chagras se vinculan con el policultivo y la agrobiodiversidad. También aparecen junto a la comercialización y a la comunidad Ziora-Amena. La forma singular, chagra, se menciona con el mercado de Leticia.",
      en: "Chagras are linked to polyculture and agrobiodiversity. They also appear alongside commercialization and the Ziora-Amena community. The singular term, chagra, is mentioned with the Leticia market.",
    },
    territorialReading: {
      es: "La chagra se puede seguir desde la parcela hasta el mercado. ¿Qué se cuenta sobre la diversidad de lo que se cultiva y qué parte de esa diversidad llega a la venta?",
      en: "The chagra can be followed from plot to market. What do the texts say about the diversity of crops grown, and which of those crops reach the market?",
    },
    terms: ["chagras", "Polyculture", "agrobiodiversity", "commercialization", "Ziora-Amena community"],
  },
  { // C08
    title: {
      es: "Manejo sostenible, producción y soberanía alimentaria",
      en: "Sustainable management, production and food sovereignty",
    },
    description: {
      es: "VACC se vincula con el marco legal, el manejo sostenible y las estrategias agroforestales. En otro componente, la producción sostenible aparece junto a posibles ingresos adicionales, mayores rendimientos y oportunidades para la soberanía alimentaria.",
      en: "VACC is linked to the legal framework, sustainable management and agroforestry strategies. In another component, sustainable production appears alongside additional income, higher yields and opportunities for food sovereignty.",
    },
    territorialReading: {
      es: "Los textos reúnen varias aspiraciones bajo la expresión producción sostenible. ¿Quién define lo que cuenta como una mejora cuando entran en juego el ingreso, la cosecha y la posibilidad de decidir qué comer?",
      en: "Several aspirations sit under the heading of sustainable production. Who defines an improvement when income, harvests and the ability to choose what to eat are all at stake?",
    },
    terms: ["VACC", "legal framework", "sustainable management", "Sustainable Production", "future opportunities for food sovereignty"],
  },
  { // C09
    title: {
      es: "Pueblos indígenas, chagra y lugares de conservación",
      en: "Indigenous Peoples, the chagra and conservation sites",
    },
    description: {
      es: "Indigenous Peoples se vincula tanto con la chagra amazónica como con el parque nacional de Lawachara y el valle de Tehuacán–Cuicatlán. La Carretera Interoceánica y el corredor de conservación Vilcabamba–Amboró forman parte de otro componente.",
      en: "Indigenous Peoples is linked to the Amazonian chagra, Lawachara National Park and the Tehuacán–Cuicatlán Valley. The Interoceanic Highway and the Vilcabamba–Amboró Conservation Corridor belong to a different component.",
    },
    territorialReading: {
      es: "Una misma denominación reúne referencias de lugares muy distantes. ¿Qué pueblos y qué prácticas identifica cada texto cuando pasamos del término general al lugar que describe?",
      en: "A shared name brings together references from widely separated places. Which peoples and practices does each text identify when we move from the general term to the place it describes?",
    },
    terms: ["Indigenous Peoples", "Amazonian chagra", "Lawachara National Park", "Tehuacán Valley—Cuicatlán", "Interoceanic Highway"],
  },
  { // C10
    title: {
      es: "Agricultura familiar, programas públicos y derechos territoriales",
      en: "Family farming, public programs and land rights",
    },
    description: {
      es: "La agricultura familiar aparece a través de un actor, el agricultor familiar, vinculado al programa de alimentación escolar y al de manejo forestal comunitario y familiar. Los territorios indígenas se enlazan con los derechos sobre la tierra y las comunidades locales.",
      en: "The family farmer is linked to both the school meals program and the community and family forest management program. Indigenous territories are linked to land rights and local communities.",
    },
    territorialReading: {
      es: "Los programas nombran a sus destinatarios de distintas maneras. ¿Qué cambia en el relato de una familia cuando se habla de ella como productora de alimentos o como titular de derechos sobre la tierra?",
      en: "Programs name those they serve in different ways. What changes in an account of a family when it is described as a food producer or as a holder of land rights?",
    },
    terms: ["family farmer", "National Program for School Meals", "Indigenous territories", "land rights", "local communities"],
  },
  { // C11
    title: {
      es: "Las categorías del campesinado caboclo",
      en: "Categories of Caboclo peasantry",
    },
    description: {
      es: "El término Caboclo aparece junto a campesinados. CbF y CbO se vinculan entre sí y ambos figuran junto a la denominación de campesinado caboclo. En otro componente, Tacana y Yahuarcaca se mencionan junto a los bosques inundables.",
      en: "Caboclo appears alongside peasantries. CbF and CbO are linked to one another and both occur alongside the term for Caboclo peasantry. In a different component, Tacana and Yahuarcaca are mentioned with floodplain forests.",
    },
    territorialReading: {
      es: "Las siglas ocupan un lugar destacado en el bloque. ¿Qué diferencias entre formas de vida campesina buscó distinguir quien propuso esas categorías?",
      en: "Abbreviations figure prominently in this block. Which differences in peasant livelihoods was the author of those categories trying to capture?",
    },
    terms: ["peasantries", "Caboclo", "CbF", "CbO", "forests in river floodplains"],
  },
  { // C12
    title: {
      es: "La Amazonía suroccidental y las geografías del Perú",
      en: "Southwestern Amazonia and the geographies of Peru",
    },
    description: {
      es: "Acre y Pando se enlazan entre sí y con la Amazonía suroccidental, también vinculada a los bosques de bambú Guadua. En otro componente, Cusco se menciona junto a Apurímac, Arequipa y Moquegua.",
      en: "Acre and Pando are linked to each other and to southwestern Amazonia, which is also linked to Guadua bamboo forests. In a separate component, Cusco appears alongside Apurímac, Arequipa and Moquegua.",
    },
    territorialReading: {
      es: "Los nombres de los bosques dibujan una geografía distinta de la división por departamentos. ¿Qué límites resultan pertinentes para el tema que aborda cada documento?",
      en: "Forest names trace a geography different from departmental boundaries. Which boundaries make sense for the issue each document addresses?",
    },
    terms: ["Acre", "Pando", "Southwestern Amazon", "Guadua bamboo forests", "Cusco"],
  },
  { // C13
    title: {
      es: "Planificación de la finca y cuidado del suelo",
      en: "Farm planning and soil care",
    },
    description: {
      es: "La planificación de la finca se vincula con la productividad, la seguridad alimentaria y los nutrientes del suelo. Otro componente reúne prácticas de agricultura de conservación, entre ellas la labranza mínima y los cultivos de cobertura.",
      en: "Farm planning is linked to productivity, food security and soil nutrients. A separate component groups conservation farming practices, including minimum tillage and cover cropping.",
    },
    territorialReading: {
      es: "Productividad y alimentación aparecen como razones para planificar. ¿Qué observan las familias en sus suelos y cosechas para juzgar si esa planificación les sirve?",
      en: "Productivity and food supply appear as reasons to plan. What do households look for in their soils and harvests to judge whether that planning is useful?",
    },
    terms: ["Farm planning", "better productivity", "food and nutritional security", "minimum tillage", "cover cropping"],
  },
  { // C14
    title: {
      es: "Diversificar en una misma parcela",
      en: "Diversifying within a single plot",
    },
    description: {
      es: "La diversificación agrícola se menciona junto a los pequeños productores y la producción de plantas distintas en una parcela. En otro componente, la variedad de cultivos se vincula con el manejo integrado de plagas y la reducción de la dependencia de insumos externos.",
      en: "Agricultural diversification appears alongside small-scale producers and the production of different plants on one plot. In another component, growing varied crops is linked to integrated pest management and reduced dependence on external inputs.",
    },
    territorialReading: {
      es: "Diversificar puede referirse a lo que crece junto o a un cambio en el manejo. ¿Qué decisión concreta de la persona que cultiva describe cada pasaje?",
      en: "Diversification can refer to what grows together or to a change in management. Which decision by the grower does each passage describe?",
    },
    terms: ["Agricultural diversification", "small-scale producers", "single plot", "integrated pest management", "reduced dependence on external inputs"],
  },
  { // C15
    title: {
      es: "La Amazonía Legal, Tomé-Açu y los huertos de India",
      en: "The Legal Amazon, Tomé-Açu and homegardens in India",
    },
    description: {
      es: "Tres componentes sitúan los temas a escalas diferentes. La Amazonía Legal aparece junto al IBGE. Las secretarías municipales se vinculan con los modelos agroforestales de Tomé-Açu. India figura junto a los huertos agroforestales y a Attappady.",
      en: "Three components place the themes at different scales. The Legal Amazon appears alongside IBGE. Municipal departments are linked to Tomé-Açu’s agroforestry models. India appears with agroforestry homegardens and Attappady.",
    },
    territorialReading: {
      es: "Una región estadística, un municipio y un valle ofrecen puntos de observación distintos. ¿Qué unidad de comparación permite entender las prácticas que se describen en cada lugar?",
      en: "A statistical region, a municipality and a valley offer different vantage points. What unit of comparison helps us understand the practices described in each place?",
    },
    terms: ["Legal Amazon", "IBGE", "Agroforestry Models of Tomé-Açu", "agroforestry homegardens", "Attappady"],
  },
  { // C16
    title: {
      es: "La finca vista desde el proyecto y desde la chagra",
      en: "The farm as seen through projects and chagra management",
    },
    description: {
      es: "Las familias beneficiarias aparecen junto a la planificación de fincas y los sistemas agroforestales diversificados. En otro componente, el manejo tradicional de la chagra se vincula con la distribución de las plantas y el momento de sembrar.",
      en: "Beneficiary families appear alongside farm planning and diversified agroforestry systems. In another component, traditional chagra management is linked to the placement of plants and the timing of sowing.",
    },
    territorialReading: {
      es: "Una lectura empieza por las familias que identifica un proyecto. Otra empieza por cómo se organiza la siembra. ¿Qué decisiones familiares se pueden reconocer desde cada perspectiva?",
      en: "One account starts with the households a project identifies. Another starts with how sowing is organized. Which household decisions can be recognized from each perspective?",
    },
    terms: ["beneficiary families", "implementation of farm planning", "diversified agroforestry systems", "traditional management of the chagra", "planting at specific times"],
  },
  { // C17
    title: {
      es: "Bioeconomía del bosque y recolección de castaña",
      en: "Forest bioeconomy and Brazil nut harvesting",
    },
    description: {
      es: "El bosque amazónico se vincula con la bioeconomía, la degradación forestal y los ríos saludables. En un componente separado, la recolección de castaña aparece junto a las tierras degradadas y la minería ilegal de oro.",
      en: "The Amazon forest is linked to the bioeconomy, forest degradation and healthy rivers. In a separate component, Brazil nut harvesting appears alongside degraded lands and illegal gold mining.",
    },
    territorialReading: {
      es: "Los ríos y los castañales permiten concretar la idea de un bosque en pie. ¿Qué condiciones del bosque importan para quienes dependen de la recolección?",
      en: "Rivers and Brazil nut groves give substance to the idea of a standing forest. Which forest conditions matter to people who depend on harvesting?",
    },
    terms: ["Amazon forest", "bioeconomy", "healthy and flowing rivers", "Brazil nut harvesting", "degraded lands"],
  },
  { // C18
    title: {
      es: "Cómo se coordina la innovación regional",
      en: "How regional innovation is coordinated",
    },
    description: {
      es: "Los 25 términos forman un componente. La coordinación aparece junto al sistema regional de innovación agraria y sus actores. La investigación se vincula con la innovación y el desarrollo tecnológico, y la innovación con la seguridad alimentaria.",
      en: "All 25 terms form one component. Coordination appears alongside the regional agricultural innovation system and its actors. Research is linked to innovation and technological development, and innovation to food security.",
    },
    territorialReading: {
      es: "La seguridad alimentaria figura entre los fines que se mencionan al hablar de innovación. ¿Cómo se traduce esa prioridad en las preguntas que se investigan en la región?",
      en: "Food security figures among the aims mentioned in discussions of innovation. How does that priority translate into the questions researched in the region?",
    },
    terms: ["coordination", "Regional Agricultural Innovation System", "research", "innovation", "food security"],
  },
  { // C19
    title: {
      es: "Quiénes integran el sistema de innovación agraria",
      en: "Who is part of the agricultural innovation system?",
    },
    description: {
      es: "Las universidades, las empresas agrarias y las organizaciones de productores se vinculan entre sí. Las organizaciones de productores también aparecen junto al Estado. En este mismo componente se mencionan los planes y las políticas de desarrollo agrario.",
      en: "Universities, agricultural companies and producer organizations are linked to one another. Producer organizations also appear alongside the state. Plans and agricultural development policies are mentioned in the same component.",
    },
    territorialReading: {
      es: "Una lista de participantes permite reconocer quién tiene un lugar en el relato institucional. ¿A quién se atribuye la elección de prioridades y quién aparece principalmente como destinatario?",
      en: "A list of participants shows who has a place in the institutional account. Who is credited with choosing priorities, and who appears mainly as an intended beneficiary?",
    },
    terms: ["universities", "producer organizations", "agricultural companies", "the State", "agricultural development policies"],
  },
  { // C20
    title: {
      es: "Producción de alimentos e ingresos en comunidades rurales",
      en: "Food production and income in rural communities",
    },
    description: {
      es: "Las comunidades rurales aparecen junto a Aveiro y a la mejora de la producción alimentaria. Esta última se vincula con la generación de ingresos y la posibilidad de replicar experiencias. Otros componentes reúnen nombres de países y municipios.",
      en: "Rural communities appear alongside Aveiro and improved food production. The latter is linked to income generation and the possibility of replicating experiences. Other components group country and municipality names.",
    },
    territorialReading: {
      es: "Replicar una experiencia supone decidir qué se puede trasladar de un lugar a otro. ¿Qué condiciones locales menciona el relato de Aveiro al hablar de alimentos e ingresos?",
      en: "Replicating an experience means deciding what can travel from one place to another. Which local conditions does the account of Aveiro mention when it discusses food and income?",
    },
    terms: ["rural communities", "Aveiro", "improve food production", "income generation", "replicate experiences"],
  },
  { // C21
    title: {
      es: "El resguardo Ticuna-Huitoto en el registro agrario",
      en: "The Ticuna-Huitoto reserve in agrarian records",
    },
    description: {
      es: "El Instituto Colombiano de la Reforma Agraria aparece junto al resguardo Ticuna-Huitoto y las resoluciones 025-1978 y 005-1986. El bloque conserva tanto la sigla INCORA como formas desarrolladas del nombre de la institución.",
      en: "The Colombian Institute of Agrarian Reform appears alongside the Ticuna-Huitoto reserve and resolutions 025-1978 and 005-1986. The block retains both INCORA and full forms of the institution’s name.",
    },
    territorialReading: {
      es: "Las resoluciones dan fechas y una referencia institucional al resguardo. ¿Qué parte de su historia territorial se puede reconstruir con esos actos y qué habría que buscar en las memorias de sus habitantes?",
      en: "The resolutions give the reserve dates and an institutional reference. Which parts of its territorial history can be traced through those acts, and which would call for residents’ own accounts?",
    },
    terms: ["Indigenous Ticuna-Huitoto Reservation", "Colombian Institute of Agrarian Reform", "INCORA", "Resolution 025-1978", "Resolution 005-1986"],
  },
  { // C22
    title: {
      es: "Producción campesina y asistencia técnica en Pará",
      en: "Peasant production and technical assistance in Pará",
    },
    description: {
      es: "El campesinado aparece junto a Pará, Santarém, la producción de açaí y los cultivos asociados. En ese mismo componente, los productores se vinculan con la asistencia técnica y Pará con la castaña.",
      en: "The peasantry appears alongside Pará, Santarém, açaí production and intercropping. In the same component, producers are linked to technical assistance and Pará to Brazil nuts.",
    },
    territorialReading: {
      es: "El nombre del estado reúne productos y formas de cultivo distintas. ¿Qué prácticas y qué necesidades de acompañamiento se distinguen al acercarnos a los productores de cada lugar?",
      en: "The state name brings together different products and ways of growing them. Which practices and support needs emerge when we look at producers in each place?",
    },
    terms: ["Pará", "peasant", "acai production", "Intercropping", "technical assistance"],
  },
  { // C23
    title: {
      es: "Consumo familiar, venta y extensión agraria",
      en: "Household consumption, sales and agricultural extension",
    },
    description: {
      es: "Los cambios en la producción aparecen junto al consumo familiar, la venta y la generación de ingresos. En otro componente, las empresas se mencionan con la extensión agraria, la participación y la asistencia técnica.",
      en: "Changes in production appear alongside household consumption, sales and income generation. In another component, companies are mentioned with agricultural extension, participation and technical assistance.",
    },
    territorialReading: {
      es: "Una misma cosecha puede tener varios destinos. ¿Qué entiende una familia por mejorar su producción cuando una parte se come en casa y otra se vende?",
      en: "A harvest can have several destinations. What might improving production mean to a family when some of the harvest is eaten at home and some is sold?",
    },
    terms: ["change in current production dynamics", "family consumption", "sale", "generate income", "agricultural extension"],
  },
  { // C24
    title: {
      es: "Agroforestería adaptada al Corredor Seco",
      en: "Agroforestry adapted to the Dry Corridor",
    },
    description: {
      es: "AGROINNOVA se vincula con el Corredor Seco Centroamericano, los sistemas agroforestales adaptados y la combinación de árboles con cultivos. Un componente distinto reúne la prospectiva agrícola, las oportunidades de mercado y la vigilancia tecnológica.",
      en: "AGROINNOVA is linked to the Central American Dry Corridor, adapted agroforestry systems and combining trees with crops. A separate component groups agricultural foresight, market opportunities and technology monitoring.",
    },
    territorialReading: {
      es: "La palabra adaptación adquiere un lugar concreto en el Corredor Seco. ¿A qué condiciones de las fincas responde la combinación de árboles y cultivos que se propone allí?",
      en: "Adaptation has a specific setting in the Dry Corridor. Which farm conditions is the proposed combination of trees and crops intended to address there?",
    },
    terms: ["AGROINNOVA", "Central American Dry Corridor", "Adapted Agroforestry Systems", "combining forest trees with agricultural crops", "agricultural foresight"],
  },
  { // C25
    title: {
      es: "Planes y seguimiento de la innovación agraria en Perú",
      en: "Planning and oversight of agricultural innovation in Peru",
    },
    description: {
      es: "El PERIA se menciona junto al INIA, que a su vez se vincula con la evaluación y la supervisión. En un componente distinto, el MIDAGRI aparece junto al PESEM y a otros instrumentos de planificación.",
      en: "PERIA is mentioned alongside INIA, which in turn is linked to evaluation and oversight. In a separate component, MIDAGRI appears with PESEM and other planning instruments.",
    },
    territorialReading: {
      es: "Los documentos distinguen instrumentos regionales y sectoriales. ¿Qué se evalúa en cada escala y dónde aparecen las necesidades de los productores en ese seguimiento?",
      en: "The documents distinguish regional and sectoral planning instruments. What is evaluated at each scale, and where do producers’ needs appear in that review?",
    },
    terms: ["PERIA", "National Institute of Agricultural Innovation (INIA)", "evaluation", "MIDAGRI", "PESEM"],
  },
  { // C26
    title: {
      es: "Familias y técnicas de siembra nombradas en el corpus",
      en: "Named families and planting techniques",
    },
    description: {
      es: "Yamada aparece junto a la familia Kusano, al método de siembra de Sakagushi y a técnicas de cultivo de maracuyá y cacao nativo. En un componente de dos nodos, Refloramaz se vincula con EMBRAPA Amazônia Oriental.",
      en: "Yamada appears alongside the Kusano family, Sakagushi’s planting method and techniques for growing passion fruit and native cacao. In a separate pair, Refloramaz is linked to EMBRAPA Amazônia Oriental.",
    },
    territorialReading: {
      es: "Algunas técnicas se recuerdan con un apellido. ¿Qué permite reconstruir esa manera de nombrarlas sobre las personas que las ensayaron o transmitieron?",
      en: "Some techniques are remembered by a family name. What does that way of naming them allow us to trace about the people who tried them or passed them on?",
    },
    terms: ["Yamada", "Kusano family", "Sakagushi's planting method", "passion fruit planting techniques", "techniques for planting native cacao"],
  },
  { // C27
    title: {
      es: "Cooperación técnica y parcelas demostrativas",
      en: "Technical cooperation and demonstration plots",
    },
    description: {
      es: "CATIE, IICA y la Unión Europea aparecen en un componente que incluye siglas y nombres desarrollados. En otro, las parcelas demostrativas se vinculan con las fincas y la implementación de modelos de innovación.",
      en: "CATIE, IICA and the European Union appear in a component containing abbreviations and full names. In another, demonstration plots are linked to farms and the implementation of innovation models.",
    },
    territorialReading: {
      es: "Una parcela demostrativa sitúa la innovación en un terreno observable. ¿Qué se elige mostrar allí y qué condiciones necesitaría una finca para reproducir la experiencia?",
      en: "A demonstration plot gives innovation a visible setting. What is chosen for demonstration there, and which conditions would a farm need to reproduce the experience?",
    },
    terms: ["CATIE", "IICA", "Unión Europea", "demonstration plots", "farms"],
  },
  { // C28
    title: {
      es: "La Transamazónica y nueve municipios",
      en: "The Trans-Amazonian Highway and nine municipalities",
    },
    description: {
      es: "La Transamazónica aparece junto a municipios como Nova Ipixuna, Parauapebas, Medicilândia y Vilhena. Cada uno de los diez términos se enlaza con los otros nueve, para un total de 45 pares.",
      en: "The Trans-Amazonian Highway appears alongside municipalities including Nova Ipixuna, Parauapebas, Medicilândia and Vilhena. Each of the ten terms links to the other nine, giving 45 pairs.",
    },
    territorialReading: {
      es: "Los municipios ocupan posiciones equivalentes dentro del bloque. ¿Qué criterio los reúne en el texto y qué diferencias entre sus historias se pierden al leerlos como una lista?",
      en: "The municipalities occupy equivalent positions within the block. Why does the text group them, and which differences in their histories disappear when they are read as a list?",
    },
    terms: ["Transamazon Highway", "Nova Ipixuna", "Parauapebas", "Medicilândia", "Vilhena"],
  },
];
