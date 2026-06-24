import type { GalleryCatalog } from "./types";

export const GALLERY_CATALOGS: GalleryCatalog[] = [
  {
    id: "mamas",
    name: "Mamas",
    eyebrow: "Cirugia mamaria",
    description: "Procedimientos de volumen, elevacion y reconstruccion.",
    coverResultId: "mamoplastia-aumento",
    services: [
      {
        title: "Aumento de mamas",
        description: "Mamoplastia de aumento con seguimiento fotografico.",
        resultId: "mamoplastia-aumento",
      },
      {
        title: "Mastopexia",
        description: "Elevacion mamaria con protesis segun indicacion.",
        resultId: "pexia-protesis",
      },
      {
        title: "Reduccion de mamas",
        description: "Casos documentados sujetos a autorizacion.",
      },
      {
        title: "Reconstruccion mamaria",
        description: "Reconstruccion y simetrizacion segun cada caso.",
      },
    ],
  },
  {
    id: "rostro",
    name: "Rostro",
    eyebrow: "Cirugia facial",
    description: "Opciones para armonia facial y rejuvenecimiento.",
    services: [
      {
        title: "Rinoplastia",
        description: "Resultados disponibles solo con consentimiento.",
      },
      {
        title: "Otoplastia",
        description: "Correccion de orejas prominentes o asimetricas.",
      },
      {
        title: "Blefaroplastia",
        description: "Tratamiento del exceso cutaneo palpebral.",
      },
      {
        title: "Lifting",
        description: "Planificacion personalizada de rejuvenecimiento.",
      },
      {
        title: "Cirugia maxilofacial",
        description: "Correccion funcional y estetica de estructuras faciales.",
      },
      {
        title: "Cirugia de pomulos",
        description: "Volumen y proyeccion del tercio medio facial.",
      },
    ],
  },
  {
    id: "cuerpo",
    name: "Cuerpo",
    eyebrow: "Contorno corporal",
    description: "Tratamientos de abdomen, silueta y definicion.",
    coverResultId: "abdominoplastia",
    services: [
      {
        title: "Abdominoplastia",
        description: "Resultados de contorno abdominal y reparacion.",
        resultId: "abdominoplastia",
      },
      {
        title: "Liposuccion",
        description: "Modelado corporal por zonas seleccionadas.",
      },
      {
        title: "Lipoescultura",
        description: "Definicion de silueta con plan quirurgico integral.",
      },
      {
        title: "Aumento de gluteos",
        description: "Procedimiento sujeto a evaluacion anatomica.",
      },
      {
        title: "Dermolipectomia",
        description: "Tratamiento del exceso de piel y grasa por zonas.",
      },
    ],
  },
  {
    id: "masculina",
    name: "Cirugia masculina",
    eyebrow: "Procedimientos masculinos",
    description: "Tratamientos frecuentes para contorno y armonia.",
    services: [
      {
        title: "Ginecomastia",
        description: "Correccion de volumen mamario masculino.",
      },
    ],
  },
  {
    id: "capilar",
    name: "Capilar",
    eyebrow: "Restauracion capilar",
    description: "Alternativas de recuperacion y densidad capilar.",
    services: [
      {
        title: "Implante capilar",
        description: "Planificacion por zona, densidad y evolucion.",
      },
    ],
  },
  {
    id: "medicina-estetica",
    name: "Medicina estetica",
    eyebrow: "Procedimientos no quirurgicos",
    description: "Recursos faciales y corporales de medicina estetica.",
    services: [
      {
        title: "Acido hialuronico",
        description: "Rellenos dermicos para volumen, hidratacion y armonia.",
      },
      {
        title: "Botox",
        description: "Tratamiento de lineas dinamicas de expresion.",
      },
      {
        title: "Flebologia",
        description: "Abordaje de varices y aranas vasculares.",
      },
      {
        title: "Plasma Rico en Plaquetas",
        description: "Bioestimulacion con factores de crecimiento propios.",
      },
      {
        title: "Rinomodelacion",
        description: "Correccion no quirurgica del perfil nasal.",
      },
      {
        title: "HIFU",
        description: "Reafirmacion cutanea con ultrasonido focalizado.",
      },
      {
        title: "Rejuvenecimiento facial",
        description: "Plan integral para textura, firmeza y luminosidad.",
      },
      {
        title: "Hilos tensores",
        description: "Tension y reposicionamiento facial sin cirugia.",
      },
      {
        title: "Eliminacion de ojeras",
        description: "Correccion de surcos y ojeras segun indicacion.",
      },
      {
        title: "Medicina Ortomolecular",
        description: "Tratamiento nutricional y bienestar celular.",
      },
      {
        title: "Blefaroplastia sin cirugia",
        description: "Mejora del contorno ocular sin bisturi.",
      },
      {
        title: "Rellenos faciales",
        description: "Modelado facial con rellenos en zonas seleccionadas.",
      },
    ],
  },
  {
    id: "piel-laser",
    name: "Piel y laser",
    eyebrow: "Belleza y dermatologia",
    description: "Tratamientos de piel, laser y calidad cutanea.",
    services: [
      {
        title: "Borrar tatuajes",
        description: "Eliminacion laser de tatuajes segun pigmento y zona.",
      },
      {
        title: "Tratamiento para estrias",
        description: "Protocolos para mejorar estrias segun extension.",
      },
      {
        title: "Mesoterapia",
        description: "Microinyecciones para revitalizar y nutrir la piel.",
      },
      {
        title: "Tratamiento de celulitis",
        description: "Tratamientos combinados para celulitis localizada.",
      },
      {
        title: "Depilacion laser",
        description: "Reduccion progresiva del vello no deseado.",
      },
      {
        title: "Microdermoabrasion",
        description: "Exfoliacion mecanica para textura, manchas y poros.",
      },
      {
        title: "Peeling",
        description: "Renovacion cutanea con acidos seleccionados.",
      },
      {
        title: "Eliminar cicatrices",
        description: "Tratamiento de cicatrices segun tipo y profundidad.",
      },
    ],
  },
];
