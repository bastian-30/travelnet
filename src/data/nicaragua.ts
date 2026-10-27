export type SiteCategory = "turistico" | "historico" | "colonial";
export type MIPYMEType = "hostal" | "hotel" | "restaurante" | "tour" | "artesanía";

export interface MIPYME {
  id: string;
  name: string;
  type: MIPYMEType;
  description: string;
  distance: string;
  rating: number;
  priceRange: "$" | "$$" | "$$$";
  phone: string;
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  date: string;
  rating: number;
  text: string;
  imageUrl?: string;
  siteId: string;
  siteName: string;
  departmentName: string;
}

export interface Site {
  id: string;
  name: string;
  category: SiteCategory;
  coverImage: string;
  thumbnailImage: string;
  description: string;
  history: string;
  videoId: string;
  mipymes: MIPYME[];
  tags: string[];
}

export interface Department {
  id: string;
  name: string;
  capital: string;
  region: "Pacífico" | "Norte" | "Atlántico" | "Central";
  description: string;
  coverImage: string;
  mapX: number;
  mapY: number;
  sites: Site[];
}

export const departments: Department[] = [
  {
    id: "granada",
    name: "Granada",
    capital: "Granada",
    region: "Pacífico",
    description:
      "La Gran Sultana, ciudad colonial más antigua de América Central fundada en 1524. Sus calles adoquinadas y coloridas fachadas la convierten en joya del patrimonio arquitectónico.",
    coverImage:
      "https://images.unsplash.com/photo-1630773899830-15ae96bbd777?w=1200&h=700&fit=crop&auto=format",
    mapX: 205,
    mapY: 196,
    sites: [
      {
        id: "ciudad-colonial-granada",
        name: "Ciudad Colonial de Granada",
        category: "colonial",
        coverImage:
          "https://images.unsplash.com/photo-1630773899830-15ae96bbd777?w=900&h=550&fit=crop&auto=format",
        thumbnailImage:
          "https://images.unsplash.com/photo-1630773899830-15ae96bbd777?w=500&h=300&fit=crop&auto=format",
        description:
          "El corazón colonial de Nicaragua, con arquitecturas de estilo hispano-colonial del siglo XVI, plazas centenarias y la mítica Catedral de Granada.",
        history:
          "Granada fue fundada en 1524 por Francisco Hernández de Córdoba, convirtiéndose en una de las primeras ciudades europeas establecidas en tierra firme del continente americano. Su posición estratégica junto al Gran Lago de Nicaragua le permitió prosperar como centro comercial y cultural durante el período colonial. La ciudad fue saqueada tres veces por piratas, entre ellos el famoso William Walker en 1856, quien ordenó incendiar la ciudad al retirarse, dejando el letrero 'Aquí fue Granada'. Reconstruida con determinación, hoy conserva uno de los conjuntos arquitectónicos coloniales mejor preservados de Centroamérica, con más de 180 edificios de valor histórico catalogados por el Instituto Nicaragüense de Cultura.",
        videoId: "hc-FoNOfCUQ",
        tags: ["Colonial", "Arquitectura", "Historia", "Centro Histórico"],
        mipymes: [
          {
            id: "hotel-granada-1",
            name: "Hostal La Pérgola",
            type: "hostal",
            description:
              "Hostal familiar en casa colonial restaurada, a media cuadra del Parque Central. Habitaciones con patio interior y desayuno incluido.",
            distance: "150 m del centro",
            rating: 4.7,
            priceRange: "$$",
            phone: "+505 2552-4110",
          },
          {
            id: "rest-granada-1",
            name: "El Zaguán Restaurant",
            type: "restaurante",
            description:
              "Cocina nicaragüense tradicional en ambiente colonial. Especialidad en vigorón, indio viejo y nacatamal artesanal.",
            distance: "200 m del Parque Central",
            rating: 4.5,
            priceRange: "$",
            phone: "+505 2552-2522",
          },
          {
            id: "tour-granada-1",
            name: "Granada Colonial Tours",
            type: "tour",
            description:
              "Recorridos a pie por el centro histórico con guías bilingües certificados. Tours al amanecer y al atardecer disponibles.",
            distance: "Parque Central",
            rating: 4.8,
            priceRange: "$$",
            phone: "+505 8852-0145",
          },
        ],
      },
      {
        id: "isletas-de-granada",
        name: "Isletas de Granada",
        category: "turistico",
        coverImage:
          "https://images.unsplash.com/photo-1711377449741-b01fd2adcd82?w=900&h=550&fit=crop&auto=format",
        thumbnailImage:
          "https://images.unsplash.com/photo-1711377449741-b01fd2adcd82?w=500&h=300&fit=crop&auto=format",
        description:
          "Archipiélago de 365 islotes volcánicos en el Lago Cocibolca, formados por la erupción del Volcán Mombacho hace más de 10,000 años.",
        history:
          "Las Isletas de Granada son 365 pequeños islotes dispersos en las aguas del Gran Lago de Nicaragua (Lago Cocibolca), frente a las costas de la ciudad de Granada. Se formaron hace aproximadamente 10,000 años cuando el Volcán Mombacho sufrió un colosal colapso volcánico que proyectó enormes bloques de roca al lago. Durante la época precolombina, estas islas fueron habitadas por grupos indígenas Chorotegas, quienes encontraron en ellas un refugio natural y un punto estratégico para la pesca y el comercio. Hoy en día, algunas isletas albergan residencias privadas, pequeños hoteles y restaurantes flotantes, mientras que otras están completamente vírgenes y sirven como refugio de vida silvestre.",
        videoId: "zr-4gNnUSxs",
        tags: ["Naturaleza", "Lagos", "Ecoturismo", "Kayak"],
        mipymes: [
          {
            id: "hotel-isletas-1",
            name: "Isla El Pájaro Lodge",
            type: "hotel",
            description:
              "Pequeño ecolodge sobre una isleta privada. Acceso exclusivo en lancha, cabaña de madera sobre el agua y avistamiento de aves al amanecer.",
            distance: "15 min en lancha desde puerto",
            rating: 4.9,
            priceRange: "$$$",
            phone: "+505 8880-2230",
          },
          {
            id: "tour-isletas-1",
            name: "Kayak Las Isletas",
            type: "tour",
            description:
              "Recorridos en kayak y lancha por el archipiélago. Paquetes de medio día con almuerzo incluido en restaurante flotante.",
            distance: "Puerto Granada",
            rating: 4.6,
            priceRange: "$$",
            phone: "+505 8654-7890",
          },
        ],
      },
      {
        id: "convento-san-francisco",
        name: "Convento San Francisco",
        category: "historico",
        coverImage:
          "https://images.unsplash.com/photo-1584904558330-f9772a6778c5?w=900&h=550&fit=crop&auto=format",
        thumbnailImage:
          "https://images.unsplash.com/photo-1584904558330-f9772a6778c5?w=500&h=300&fit=crop&auto=format",
        description:
          "El convento más antiguo de América Central, fundado en 1529, alberga el Museo de Arte Precolombino con más de 30 estatuas indígenas del siglo X.",
        history:
          "El Convento y Museo San Francisco es el edificio religioso más antiguo de Nicaragua y uno de los más antiguos de América Central. Fue fundado por la Orden Franciscana en 1529, apenas cinco años después de la fundación de la ciudad de Granada. A lo largo de su historia, el convento ha servido como cuartel militar, hospital, sede universitaria y cárcel, reflejando las convulsiones históricas de Nicaragua. Fue incendiado en varias ocasiones, incluyendo el saqueo de William Walker en 1856. Su actual edificio data de la reconstrucción de 1867-1868. Hoy alberga el Museo de Arte Precolombino y Colonial, que exhibe más de 30 grandes estatuas de piedra provenientes de la Isla de Zapatera, datadas del período prehispánico entre los siglos X y XIV.",
        videoId: "mJfAu6g7Xc4",
        tags: ["Colonial", "Museo", "Arte Precolombino", "Franciscanos"],
        mipymes: [
          {
            id: "hostal-convent-1",
            name: "Casa Hostal Colonial",
            type: "hostal",
            description:
              "Hostal boutique a una cuadra del Convento. Habitaciones decoradas con arte local, jardín tropical y terraza con vista a los techos coloniales.",
            distance: "80 m del convento",
            rating: 4.6,
            priceRange: "$$",
            phone: "+505 2552-8006",
          },
        ],
      },
    ],
  },
  {
    id: "leon",
    name: "León",
    capital: "León",
    region: "Pacífico",
    description:
      "Ciudad universitaria y capital cultural de Nicaragua. Cuna del poeta Rubén Darío y hogar de la Catedral más grande de América Central, Patrimonio de la Humanidad UNESCO.",
    coverImage:
      "https://images.unsplash.com/photo-1655346934940-b39b2924091f?w=1200&h=700&fit=crop&auto=format",
    mapX: 95,
    mapY: 148,
    sites: [
      {
        id: "catedral-leon",
        name: "Catedral de León",
        category: "colonial",
        coverImage:
          "https://images.unsplash.com/photo-1655346934940-b39b2924091f?w=900&h=550&fit=crop&auto=format",
        thumbnailImage:
          "https://images.unsplash.com/photo-1655346934940-b39b2924091f?w=500&h=300&fit=crop&auto=format",
        description:
          "La Catedral Basílica de la Asunción de León, declarada Patrimonio de la Humanidad por UNESCO en 2011. La catedral más grande de América Central con 113 años de construcción.",
        history:
          "La Catedral de León, formalmente conocida como Catedral Basílica de la Asunción de León, es considerada la catedral más grande de América Central. Su construcción comenzó en 1747 bajo el diseño del arquitecto guatemalteco Diego José de Porres, aunque existen tradiciones que indican que el plano original fue presentado a la corte española como si fuera de una catedral menor para obtener la aprobación real. La construcción se extendió por 113 años, finalizando en 1860. En sus bóvedas reposan los restos del poeta Rubén Darío, máximo exponente del modernismo literario hispanoamericano, y de otros próceres nicaragüenses. En 2011, la UNESCO la declaró Patrimonio de la Humanidad junto con las Ruinas de León Viejo.",
        videoId: "KSv6sLBHFpM",
        tags: ["UNESCO", "Colonial", "Catedral", "Arquitectura Barroca"],
        mipymes: [
          {
            id: "hotel-leon-1",
            name: "Hotel El Convento",
            type: "hotel",
            description:
              "Hotel boutique instalado en el antiguo Convento de San Francisco. Patio colonial, restaurante gourmet con cocina nicaragüense fusión y terraza con vista a la catedral.",
            distance: "1 cuadra de la catedral",
            rating: 4.8,
            priceRange: "$$$",
            phone: "+505 2311-7053",
          },
          {
            id: "rest-leon-1",
            name: "La Casa Vieja",
            type: "restaurante",
            description:
              "Cocina tradicional leonesa. Especialidad en sopa de queso, vigorón y quesillos. Ambiente acogedor en casa colonial del siglo XVIII.",
            distance: "Media cuadra del Parque Central",
            rating: 4.4,
            priceRange: "$",
            phone: "+505 2311-2024",
          },
          {
            id: "tour-leon-1",
            name: "León Tours Cultural",
            type: "tour",
            description:
              "Tours especializados en arte, murales y cultura revolucionaria. Visitas a museos, galerías y spots de surf en Poneloya.",
            distance: "Frente al Parque Central",
            rating: 4.7,
            priceRange: "$$",
            phone: "+505 8760-3344",
          },
        ],
      },
      {
        id: "leon-viejo",
        name: "León Viejo",
        category: "historico",
        coverImage:
          "https://images.unsplash.com/photo-1590856028965-5683c4b48ad0?w=900&h=550&fit=crop&auto=format",
        thumbnailImage:
          "https://images.unsplash.com/photo-1590856028965-5683c4b48ad0?w=500&h=300&fit=crop&auto=format",
        description:
          "Ruinas arqueológicas de la primera ciudad colonial de Nicaragua, sepultada por el volcán Momotombo en 1610. Sitio UNESCO desde 2000.",
        history:
          "León Viejo, oficialmente conocido como Ruinas de León Viejo, es el sitio arqueológico de la primera ciudad española fundada en Nicaragua, establecida en 1524 por Francisco Hernández de Córdoba a orillas del Lago Xolotlán. La ciudad prosperó como capital colonial durante casi un siglo, pero en 1610, una combinación de erupciones constantes del volcán Momotombo, terremotos y pestes llevaron a sus habitantes a abandonarla y trasladarse al actual emplazamiento de León. La ciudad quedó sepultada bajo capas de ceniza volcánica durante casi 350 años, hasta que excavaciones arqueológicas iniciadas en 1967 revelaron sus estructuras. En el año 2000, UNESCO declaró el sitio como Patrimonio de la Humanidad, reconociendo su valor como testimonio único de la vida colonial temprana en América.",
        videoId: "8pVZR7wr7nM",
        tags: ["UNESCO", "Arqueología", "Ruinas", "Volcán Momotombo"],
        mipymes: [
          {
            id: "hostal-leov-1",
            name: "Hostal El Volcán",
            type: "hostal",
            description:
              "Hospedaje comunitario cerca de las ruinas. Habitaciones sencillas con vista al Momotombo, desayuno típico y servicio de guía local.",
            distance: "500 m de las ruinas",
            rating: 4.3,
            priceRange: "$",
            phone: "+505 8901-2244",
          },
        ],
      },
    ],
  },
  {
    id: "managua",
    name: "Managua",
    capital: "Managua",
    region: "Pacífico",
    description:
      "Capital de Nicaragua y su ciudad más grande. Centro político, económico y cultural del país, a orillas del Lago Xolotlán con una historia marcada por terremotos y resurgimiento.",
    coverImage:
      "https://images.unsplash.com/photo-1590856029192-284cc8461706?w=1200&h=700&fit=crop&auto=format",
    mapX: 145,
    mapY: 165,
    sites: [
      {
        id: "vieja-catedral-managua",
        name: "Vieja Catedral de Managua",
        category: "historico",
        coverImage:
          "https://images.unsplash.com/photo-1590856029192-284cc8461706?w=900&h=550&fit=crop&auto=format",
        thumbnailImage:
          "https://images.unsplash.com/photo-1590856029192-284cc8461706?w=500&h=300&fit=crop&auto=format",
        description:
          "Imponente ruina de la Catedral de Santiago de Managua, dañada por el terremoto de 1972 y convertida en símbolo emblemático de la resiliencia nicaragüense.",
        history:
          "La Antigua Catedral de Managua, formalmente conocida como Catedral de Santiago, fue construida entre 1928 y 1938 en estilo neoclásico romano. Por décadas fue el centro espiritual de la capital nicaragüense. El devastador terremoto de 1972, que destruyó gran parte de Managua, dañó severamente sus estructuras internas. Aunque su exterior permaneció relativamente intacto, los ingenieros determinaron que era demasiado peligrosa para continuar siendo utilizada como templo activo. Lejos de ser demolida, la vieja catedral fue preservada como monumento histórico y cultural, convirtiéndose en uno de los símbolos más icónicos de Managua. Sus torres y cúpulas deterioradas narran la historia de una ciudad que fue destruida y renació de sus cenizas, siendo visitada por turistas nacionales e internacionales que llegan a contemplar este testigo silencioso de la historia nicaragüense.",
        videoId: "ZpEuJw-XH3I",
        tags: ["Historia", "Terremoto 1972", "Monumento", "Patrimonio"],
        mipymes: [
          {
            id: "hotel-man-1",
            name: "Hotel Mansión Teodolinda",
            type: "hotel",
            description:
              "Hotel clásico de Managua con 50 años de historia. Ubicación privilegiada cerca del centro histórico, piscina, restaurante y servicio personalizado.",
            distance: "800 m de la Vieja Catedral",
            rating: 4.3,
            priceRange: "$$",
            phone: "+505 2228-1050",
          },
          {
            id: "rest-man-1",
            name: "Restaurante La Terraza Chalita",
            type: "restaurante",
            description:
              "Cocina árabe-nicaragüense fusión con 40 años sirviendo a Managua. Vista panorámica al Lago Xolotlán desde su terraza superior.",
            distance: "1.2 km del malecón",
            rating: 4.6,
            priceRange: "$$",
            phone: "+505 2270-5044",
          },
        ],
      },
      {
        id: "malecon-managua",
        name: "Malecón de Managua",
        category: "turistico",
        coverImage:
          "https://images.unsplash.com/photo-1711042927311-8e1823758d10?w=900&h=550&fit=crop&auto=format",
        thumbnailImage:
          "https://images.unsplash.com/photo-1711042927311-8e1823758d10?w=500&h=300&fit=crop&auto=format",
        description:
          "Paseo costero renovado a orillas del Lago Xolotlán con monumentos nacionales, la estatua del Guerrero Negro y vistas al Volcán Momotombo al atardecer.",
        history:
          "El Malecón de Managua, también conocido como Puerto Salvador Allende, es un paseo lacustre construido en las riberas del Lago Xolotlán (Lago de Managua). Inaugurado en 2008, el complejo fue desarrollado sobre una zona que durante décadas estuvo contaminada y deteriorada debido al terremoto de 1972 y décadas de descuido ambiental. El proyecto implicó una importante limpieza ambiental del lago y la construcción de infraestructura turística y recreativa. El malecón alberga restaurantes, bares, tiendas de artesanías y espacios de entretenimiento, así como el famoso monumento al Guerrero Negro y vistas impresionantes hacia el volcán Momotombo. Es el punto de encuentro más popular de la capital para residentes y visitantes, especialmente durante las tardes y fines de semana.",
        videoId: "dXKdaVKfJ38",
        tags: ["Lagos", "Recreación", "Atardecer", "Gastronomía"],
        mipymes: [
          {
            id: "rest-malecon-1",
            name: "Puerto Restaurante El Lago",
            type: "restaurante",
            description:
              "Mariscos frescos y cocina nicaragüense con terraza sobre el lago. Especialidad en sopa marinera y pescado a la plancha del Lago Xolotlán.",
            distance: "En el Puerto Salvador Allende",
            rating: 4.4,
            priceRange: "$$",
            phone: "+505 2266-0330",
          },
        ],
      },
    ],
  },
  {
    id: "masaya",
    name: "Masaya",
    capital: "Masaya",
    region: "Pacífico",
    description:
      "Capital del folklore y la artesanía nicaragüense. Sede del único volcán activo del mundo con laguna de lava permanentemente visible y el mercado artesanal más grande de Centroamérica.",
    coverImage:
      "https://images.unsplash.com/photo-1675701142610-5d40c754a3b6?w=1200&h=700&fit=crop&auto=format",
    mapX: 168,
    mapY: 185,
    sites: [
      {
        id: "volcan-masaya",
        name: "Volcán Masaya",
        category: "turistico",
        coverImage:
          "https://images.unsplash.com/photo-1675701142610-5d40c754a3b6?w=900&h=550&fit=crop&auto=format",
        thumbnailImage:
          "https://images.unsplash.com/photo-1675701142610-5d40c754a3b6?w=500&h=300&fit=crop&auto=format",
        description:
          "Uno de los volcanes más activos del mundo con un lago de lava visible desde el borde del cráter. Primer Parque Nacional de Nicaragua establecido en 1979.",
        history:
          "El Volcán Masaya es uno de los volcanes más activos del mundo y el único en Nicaragua con un lago de lava permanentemente activo visible a simple vista. Los indígenas Chorotegas que habitaban la región lo llamaban 'Popogatepe' (montaña que arde) y lo consideraban morada de sus dioses. En el siglo XVI, los conquistadores españoles quedaron tan impresionados por la laguna de lava ardiente que el sacerdote franciscano Fray Blas del Castillo intentó descender al cráter en busca de oro. Los españoles colocaron una cruz en el borde del cráter, que aún se puede ver hoy, creyendo que era la boca del infierno. El Parque Nacional Volcán Masaya, establecido en 1979, fue el primer parque nacional de Nicaragua y recibe más de 200,000 visitantes al año. En tiempos recientes, la actividad volcánica ha aumentado con erupciones de ceniza y el lago de lava ha crecido significativamente.",
        videoId: "T5_sMfSm-Q0",
        tags: ["Volcán Activo", "Naturaleza", "Parque Nacional", "Lava"],
        mipymes: [
          {
            id: "hostal-masaya-1",
            name: "Hostal de la Luna Masaya",
            type: "hostal",
            description:
              "Hostal artesanal con habitaciones decoradas por artistas locales. Terraza con vista al volcán Masaya, desayunos orgánicos y tours nocturnos al cráter.",
            distance: "3 km del parque nacional",
            rating: 4.5,
            priceRange: "$",
            phone: "+505 2522-3889",
          },
          {
            id: "tour-masaya-1",
            name: "Aventura Volcánica Tours",
            type: "tour",
            description:
              "Tours especializados al volcán Masaya. Visitas diurnas y nocturnas al cráter, historia geológica y cultural. Guías certificados por INTUR.",
            distance: "Centro de Masaya",
            rating: 4.8,
            priceRange: "$$",
            phone: "+505 8644-5566",
          },
        ],
      },
      {
        id: "mercado-artesanias-masaya",
        name: "Mercado de Artesanías de Masaya",
        category: "turistico",
        coverImage:
          "https://images.unsplash.com/photo-1584904558330-f9772a6778c5?w=900&h=550&fit=crop&auto=format",
        thumbnailImage:
          "https://images.unsplash.com/photo-1584904558330-f9772a6778c5?w=500&h=300&fit=crop&auto=format",
        description:
          "El mercado artesanal más grande de Centroamérica, instalado en un histórico edificio colonial del siglo XIX. Centro vivo de la cultura y el folklore nicaragüense.",
        history:
          "El Mercado Nacional de Artesanías de Masaya, conocido popularmente como El Mercadito, está instalado en el antiguo Cuartel de la Ciudad, un edificio de estilo colonial construido a finales del siglo XIX. Masaya ha sido históricamente la capital artesanal de Nicaragua, con una tradición indígena de manufactura que se remonta a las culturas precolombinas Chorotegas y Niquiranos. En 1991, el edificio del antiguo cuartel fue transformado en mercado artesanal, rescatando así un inmueble histórico y creando un espacio único para que artesanos de todo el país exhiban y vendan sus creaciones. El mercado alberga más de 80 locales donde se comercializan hamacas, cuero repujado, cerámica, madera tallada, ropa típica, sombreros de palma y toda clase de objetos artesanales. Los festivales folklóricos que se realizan en su plaza interior son declarados Patrimonio Cultural Intangible de la Nación.",
        videoId: "3vEYYUuUJFk",
        tags: ["Artesanías", "Cultura", "Folklore", "Compras"],
        mipymes: [
          {
            id: "art-masaya-1",
            name: "Taller Cerámica Negra Chorotega",
            type: "artesanía",
            description:
              "Taller familiar de cuarta generación especializado en cerámica negra precolombina. Demostraciones en vivo de técnicas ancestrales y piezas únicas.",
            distance: "Dentro del Mercado",
            rating: 4.9,
            priceRange: "$",
            phone: "+505 8771-2233",
          },
        ],
      },
    ],
  },
  {
    id: "rivas",
    name: "Rivas",
    capital: "Rivas",
    region: "Pacífico",
    description:
      "Puerta de entrada al Lago Nicaragua y la Isla de Ometepe. Hogar de las playas de San Juan del Sur y corredor bioceánico entre el Pacífico y el Caribe.",
    coverImage:
      "https://images.unsplash.com/photo-1710788206590-a8bbd6007e12?w=1200&h=700&fit=crop&auto=format",
    mapX: 138,
    mapY: 245,
    sites: [
      {
        id: "isla-ometepe",
        name: "Isla de Ometepe",
        category: "turistico",
        coverImage:
          "https://images.unsplash.com/photo-1710788206590-a8bbd6007e12?w=900&h=550&fit=crop&auto=format",
        thumbnailImage:
          "https://images.unsplash.com/photo-1710788206590-a8bbd6007e12?w=500&h=300&fit=crop&auto=format",
        description:
          "La isla más grande del mundo dentro de un lago de agua dulce, formada por dos volcanes gemelos: Concepción y Maderas. Reserva de Biósfera UNESCO desde 2010.",
        history:
          "La Isla de Ometepe, cuyo nombre en náhuatl significa 'lugar de dos cerros', es la isla lacustre más grande del mundo formada por volcanes dentro de un lago de agua dulce. Ubicada en el Gran Lago de Nicaragua (Cocibolca), la isla está formada por los volcanes gemelos Concepción (1,610 metros) activo, y Maderas (1,394 metros) inactivo con su propia laguna en la cima. La isla fue habitada durante milenios por pueblos indígenas que dejaron miles de petroglifos y estatuas de piedra que aún pueden encontrarse por toda la isla. En 2010, la UNESCO la declaró Reserva de Biósfera por su extraordinaria biodiversidad y riqueza arqueológica. Ometepe alberga cinco comunidades con una fuerte identidad cultural y una economía basada en agricultura orgánica, ganadería y ecoturismo. La isla es accesible en ferry desde el puerto de San Jorge en Rivas.",
        videoId: "FiKV38Rop5E",
        tags: ["UNESCO", "Volcanes", "Ecoturismo", "Lago Nicaragua", "Petroglifos"],
        mipymes: [
          {
            id: "hotel-ometepe-1",
            name: "Finca Magdalena Eco-Lodge",
            type: "hotel",
            description:
              "Finca cafetalera orgánica convertida en ecolodge en las faldas del Volcán Maderas. Senderos, observación de vida silvestre y café de cosecha propia.",
            distance: "Falda del Volcán Maderas",
            rating: 4.7,
            priceRange: "$$",
            phone: "+505 8868-8825",
          },
          {
            id: "hostal-ometepe-1",
            name: "La Isla Natural Hostal",
            type: "hostal",
            description:
              "Hospedaje ecológico frente al lago. Hamacas, kayaks disponibles, alquiler de bicicletas para explorar la isla y tours al volcán Concepción.",
            distance: "Frente al lago, Moyogalpa",
            rating: 4.5,
            priceRange: "$",
            phone: "+505 8954-1122",
          },
          {
            id: "tour-ometepe-1",
            name: "Ometepe Adventure Tours",
            type: "tour",
            description:
              "Ascenso guiado a los volcanes, tours arqueológicos de petroglifos, kayak en la laguna del Maderas y pesca artesanal con familias locales.",
            distance: "Moyogalpa",
            rating: 4.8,
            priceRange: "$$",
            phone: "+505 8440-6677",
          },
        ],
      },
      {
        id: "san-juan-del-sur",
        name: "San Juan del Sur",
        category: "turistico",
        coverImage:
          "https://images.unsplash.com/photo-1630583950725-49a792209459?w=900&h=550&fit=crop&auto=format",
        thumbnailImage:
          "https://images.unsplash.com/photo-1630583950725-49a792209459?w=500&h=300&fit=crop&auto=format",
        description:
          "El balneario más famoso de Nicaragua, con una bahía natural de aguas tranquilas rodeada de colinas, reconocida internacionalmente como destino de surf y turismo.",
        history:
          "San Juan del Sur es un pequeño puerto pesquero convertido en uno de los destinos turísticos más populares de Nicaragua y Centroamérica. La bahía natural fue utilizada desde la época colonial como punto de paso entre el Pacífico y el Atlántico durante la época de la fiebre del oro californiana en el siglo XIX. Miles de buscadores de oro norteamericanos atravesaron Nicaragua por esta ruta como alternativa al peligroso paso por Panamá, gracias al sistema de tránsito organizado por el empresario Cornelius Vanderbilt. El acceso navegable por el Río San Juan y el Gran Lago hasta San Juan del Sur convirtió al pueblo en un punto estratégico del comercio internacional. Hoy, San Juan del Sur es conocida mundialmente por sus playas aptas para el surf, su animada vida nocturna y la famosa estatua del Cristo de la Misericordia (mirador) que domina la bahía desde las alturas.",
        videoId: "bPNDI0-fFRk",
        tags: ["Playa", "Surf", "Turismo", "Bahía Natural"],
        mipymes: [
          {
            id: "hostal-sjds-1",
            name: "Hostal Pacífico",
            type: "hostal",
            description:
              "Hostal familiar a media cuadra de la playa. Ambiente surf, patio con hamacas, bar y clases de surf para principiantes con instructores certificados.",
            distance: "50 m de la playa",
            rating: 4.5,
            priceRange: "$",
            phone: "+505 8642-3399",
          },
          {
            id: "rest-sjds-1",
            name: "El Gato Negro Café & Bar",
            type: "restaurante",
            description:
              "Café, librería y bar bohemio en el corazón de San Juan del Sur. Desayunos internacionales, cócteles artesanales y ambiente relajado para viajeros.",
            distance: "Centro de San Juan del Sur",
            rating: 4.6,
            priceRange: "$$",
            phone: "+505 8855-7744",
          },
        ],
      },
    ],
  },
  {
    id: "matagalpa",
    name: "Matagalpa",
    capital: "Matagalpa",
    region: "Norte",
    description:
      "La Perla del Septentrión. Ciudad de neblina y café entre bosques nubosos, conocida por su producción de café Gourmet de exportación mundial y sus reservas naturales vírgenes.",
    coverImage:
      "https://images.unsplash.com/photo-1590856028965-5683c4b48ad0?w=1200&h=700&fit=crop&auto=format",
    mapX: 242,
    mapY: 108,
    sites: [
      {
        id: "ruta-del-cafe",
        name: "Ruta del Café Matagalpa",
        category: "turistico",
        coverImage:
          "https://images.unsplash.com/photo-1590856028965-5683c4b48ad0?w=900&h=550&fit=crop&auto=format",
        thumbnailImage:
          "https://images.unsplash.com/photo-1590856028965-5683c4b48ad0?w=500&h=300&fit=crop&auto=format",
        description:
          "Recorrido por las fincas cafetaleras de altura de Matagalpa y Jinotega, donde se produce el 60% del café de exportación de Nicaragua, considerado entre los mejores del mundo.",
        history:
          "La región de Matagalpa ha sido el corazón cafetero de Nicaragua desde finales del siglo XIX, cuando inmigrantes alemanes y europeos introdujeron el cultivo del café arábica en sus fértiles montañas. Apellidos como Kühl, Lüthy y Grünwald dejaron una huella imborrable en el paisaje cultural y arquitectónico de la ciudad. Las condiciones geográficas de Matagalpa son ideales para el cultivo del café de especialidad: altitudes entre 900 y 1,500 metros sobre el nivel del mar, suelos volcánicos ricos en minerales, bosques nubosos que regulan la temperatura y lluvias bien distribuidas. El café nicaragüense de Matagalpa y Jinotega ha ganado múltiples premios internacionales y es reconocido por su acidez brillante, cuerpo equilibrado y notas de chocolate y frutas tropicales. La ruta del café ofrece visitas a fincas donde se puede observar todo el proceso del grano: desde la cosecha hasta el beneficiado y tostado.",
        videoId: "GHhiLOm4tEo",
        tags: ["Café", "Ecoturismo", "Montaña", "Agroturismo", "Bosque Nuboso"],
        mipymes: [
          {
            id: "hotel-mata-1",
            name: "Finca Esperanza Verde",
            type: "hotel",
            description:
              "Ecolodge certificado en finca cafetalera orgánica. Cabañas de madera entre el bosque nuboso, senderos, observación de quetzales y proceso completo del café.",
            distance: "20 km de Matagalpa",
            rating: 4.9,
            priceRange: "$$$",
            phone: "+505 8441-2095",
          },
          {
            id: "tour-mata-1",
            name: "Café Tours Matagalpa",
            type: "tour",
            description:
              "Tours de uno y dos días por las mejores fincas de café de altura. Cata de café profesional, cosecha participativa en temporada y clases de preparación.",
            distance: "Centro de Matagalpa",
            rating: 4.7,
            priceRange: "$$",
            phone: "+505 8880-1155",
          },
        ],
      },
    ],
  },
  {
    id: "esteli",
    name: "Estelí",
    capital: "Estelí",
    region: "Norte",
    description:
      "Ciudad del tabaco y los puros finos, conocida mundialmente por producir algunos de los mejores cigarros del planeta. Sede de la Reserva Natural Miraflor y el Cañón de Somoto.",
    coverImage:
      "https://images.unsplash.com/photo-1590856029192-284cc8461706?w=1200&h=700&fit=crop&auto=format",
    mapX: 168,
    mapY: 68,
    sites: [
      {
        id: "canion-de-somoto",
        name: "Cañón de Somoto",
        category: "turistico",
        coverImage:
          "https://images.unsplash.com/photo-1590856029192-284cc8461706?w=900&h=550&fit=crop&auto=format",
        thumbnailImage:
          "https://images.unsplash.com/photo-1590856029192-284cc8461706?w=500&h=300&fit=crop&auto=format",
        description:
          "Espectacular formación geológica de 800 millones de años de antigüedad, con paredes de 150 metros de altura y un río de aguas cristalinas perfecto para tubing y canyoning.",
        history:
          "El Cañón de Somoto, ubicado en el municipio de Somoto, departamento de Madriz, es una de las maravillas geológicas más impresionantes de América Central. Fue descubierto científicamente por investigadores del Museo de Historia Natural de Viena en 2004, aunque las comunidades indígenas locales conocían la existencia de la formación desde tiempos ancestrales y la consideraban un lugar sagrado. El cañón tiene una antigüedad de aproximadamente 800 millones de años y fue formado por la erosión del Río Coco (también conocido como Río Segovia o Wangki), el río más largo de América Central. Sus paredes de granito de hasta 150 metros de altura albergan una rica biodiversidad, incluyendo aves rapaces, murciélagos y vegetación riparia única. El cañón se extiende por unos 6 kilómetros y su recorrido a pie y a nado es uno de los atractivos más emocionantes del norte de Nicaragua.",
        videoId: "WpK-MInW72s",
        tags: ["Cañón", "Aventura", "Río", "Geología", "Tubing"],
        mipymes: [
          {
            id: "hostal-somoto-1",
            name: "Hostal Somoto Canyon",
            type: "hostal",
            description:
              "Hospedaje comunitario administrado por jóvenes locales. Habitaciones sencillas, guías nativos del cañón y almuerzos preparados con productos del huerto propio.",
            distance: "500 m del cañón",
            rating: 4.6,
            priceRange: "$",
            phone: "+505 8750-4411",
          },
          {
            id: "tour-somoto-1",
            name: "Cañón Tours Somoto",
            type: "tour",
            description:
              "Tours de medio y día completo por el cañón. Tubing, canyoning, rappel en paredes de granito y exploración de cuevas. Equipo de seguridad incluido.",
            distance: "Entrada al cañón",
            rating: 4.8,
            priceRange: "$$",
            phone: "+505 8665-9922",
          },
        ],
      },
    ],
  },
];

export const liveStreams = [
  {
    id: "live-1",
    title: "Recorrido EN VIVO por la Ciudad Colonial de Granada",
    creator: "NicaVlog Tours",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format",
    thumbnail:
      "https://images.unsplash.com/photo-1630773899830-15ae96bbd777?w=700&h=400&fit=crop&auto=format",
    viewers: 1247,
    department: "Granada",
    isLive: true,
    startTime: "10:30 AM",
  },
  {
    id: "live-2",
    title: "Subiendo al Volcán Masaya - Cráter Activo",
    creator: "Aventuras Nicaragua",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format",
    thumbnail:
      "https://images.unsplash.com/photo-1675701142610-5d40c754a3b6?w=700&h=400&fit=crop&auto=format",
    viewers: 3891,
    department: "Masaya",
    isLive: true,
    startTime: "2:00 PM",
  },
  {
    id: "live-3",
    title: "Amanecer en Ometepe: Volcán Concepción al Despertar",
    creator: "Nica Nature",
    avatar:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&auto=format",
    thumbnail:
      "https://images.unsplash.com/photo-1710788206590-a8bbd6007e12?w=700&h=400&fit=crop&auto=format",
    viewers: 892,
    department: "Rivas",
    isLive: false,
    startTime: "Mañana 6:00 AM",
  },
  {
    id: "live-4",
    title: "Catedral de León - Recorrido por los Tejados",
    creator: "León Historia Viva",
    avatar:
      "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=80&h=80&fit=crop&auto=format",
    thumbnail:
      "https://images.unsplash.com/photo-1655346934940-b39b2924091f?w=700&h=400&fit=crop&auto=format",
    viewers: 2104,
    department: "León",
    isLive: true,
    startTime: "4:00 PM",
  },
  {
    id: "live-5",
    title: "Cañón de Somoto - Tubing de Aventura",
    creator: "Nica Adventure Sports",
    avatar:
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=80&h=80&fit=crop&auto=format",
    thumbnail:
      "https://images.unsplash.com/photo-1590856029192-284cc8461706?w=700&h=400&fit=crop&auto=format",
    viewers: 1576,
    department: "Estelí",
    isLive: false,
    startTime: "Sábado 9:00 AM",
  },
  {
    id: "live-6",
    title: "Fincas de Café en Matagalpa - Cosecha 2024",
    creator: "Café Nica TV",
    avatar:
      "https://images.unsplash.com/photo-1463453091185-61582044d556?w=80&h=80&fit=crop&auto=format",
    thumbnail:
      "https://images.unsplash.com/photo-1590856028965-5683c4b48ad0?w=700&h=400&fit=crop&auto=format",
    viewers: 744,
    department: "Matagalpa",
    isLive: false,
    startTime: "Domingo 7:00 AM",
  },
];

export const sampleReviews: Review[] = [
  {
    id: "r1",
    author: "María José Hernández",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop&auto=format",
    date: "15 agosto 2024",
    rating: 5,
    text: "Granada me dejó sin palabras. Caminé por sus calles adoquinadas al atardecer y sentí que retrocedí en el tiempo 500 años. La Catedral con la luz dorada es simplemente mágica. Los carruajes de caballos añaden ese toque colonial perfecto. Definitivamente el lugar más hermoso que he visitado en mi vida.",
    imageUrl:
      "https://images.unsplash.com/photo-1630773899830-15ae96bbd777?w=400&h=300&fit=crop&auto=format",
    siteId: "ciudad-colonial-granada",
    siteName: "Ciudad Colonial de Granada",
    departmentName: "Granada",
  },
  {
    id: "r2",
    author: "Carlos Espinoza",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&auto=format",
    date: "3 septiembre 2024",
    rating: 5,
    text: "El Volcán Masaya de noche es una experiencia absolutamente sobrecogedora. Ver la lava ardiente iluminar el cráter en la oscuridad total es algo que nunca olvidaré. Los guías del parque son muy profesionales y conocen cada detalle geológico e histórico del volcán. 100% recomendado.",
    imageUrl:
      "https://images.unsplash.com/photo-1675701142610-5d40c754a3b6?w=400&h=300&fit=crop&auto=format",
    siteId: "volcan-masaya",
    siteName: "Volcán Masaya",
    departmentName: "Masaya",
  },
  {
    id: "r3",
    author: "Ana Lucía Pérez",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&auto=format",
    date: "20 julio 2024",
    rating: 4,
    text: "Ometepe es un sueño hecho realidad para los amantes de la naturaleza. Subí el Volcán Concepción con guía local y fue uno de los retos físicos más satisfactorios de mi vida. La vista desde la cima, cuando las nubes se dispersan, muestra el lago Cocibolca en toda su inmensidad. La finca donde me hospedé tenía un café delicioso.",
    imageUrl:
      "https://images.unsplash.com/photo-1710788206590-a8bbd6007e12?w=400&h=300&fit=crop&auto=format",
    siteId: "isla-ometepe",
    siteName: "Isla de Ometepe",
    departmentName: "Rivas",
  },
  {
    id: "r4",
    author: "Diego Molina",
    avatar:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=60&h=60&fit=crop&auto=format",
    date: "8 octubre 2024",
    rating: 5,
    text: "La Catedral de León es imponente desde cualquier ángulo. Subir al techo blanco y caminar por encima mirando toda la ciudad es una experiencia única que no se puede dejar de hacer. La tumba de Rubén Darío dentro de la catedral me emocionó profundamente. León es una ciudad que vibra con historia y arte.",
    siteId: "catedral-leon",
    siteName: "Catedral de León",
    departmentName: "León",
  },
];
