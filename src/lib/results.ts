export type ResultImage = {
  src: string;
  alt: string;
};

export type ResultSet = {
  id: string;
  label: string;
  procedure: string;
  serviceTitles: string[];
  galleryImages: ResultImage[];
  modalImages: ResultImage[];
};

export type GalleryEntry =
  | {
      type: "result";
      resultId: string;
    }
  | {
      type: "placeholder";
      id: string;
      label: string;
      procedure: string;
      src: string;
      alt: string;
    };

export const RESULT_SETS: ResultSet[] = [
  {
    id: "mamoplastia-aumento",
    label: "MAMAS",
    procedure: "Mamoplastia de Aumento",
    serviceTitles: ["Aumento de mamas", "Mamoplastia de Aumento"],
    galleryImages: [
      {
        src: "https://res.cloudinary.com/dz9tuwczf/image/upload/v1781279072/mamoplastia-01_32_frjrtg.png",
        alt: "Resultado de mamoplastia de aumento caso 1 por el Dr. Masedo Carlos Dante",
      },
      {
        src: "https://res.cloudinary.com/dz9tuwczf/image/upload/v1781279074/mamoplastia-02_32_qodruf.png",
        alt: "Resultado de mamoplastia de aumento caso 2 por el Dr. Masedo Carlos Dante",
      },
      {
        src: "https://res.cloudinary.com/dz9tuwczf/image/upload/v1781279077/mamoplastia-03_32_uodk8c.png",
        alt: "Resultado de mamoplastia de aumento caso 3 por el Dr. Masedo Carlos Dante",
      },
      {
        src: "https://res.cloudinary.com/dz9tuwczf/image/upload/v1781279079/mamoplastia-04_32_jsusi8.png",
        alt: "Resultado de mamoplastia de aumento caso 4 por el Dr. Masedo Carlos Dante",
      },
    ],
    modalImages: [
      {
        src: "https://res.cloudinary.com/dz9tuwczf/image/upload/v1781279071/mamoplastia-01_llctwx.png",
        alt: "Fotografia clinica completa de mamoplastia de aumento caso 1",
      },
      {
        src: "https://res.cloudinary.com/dz9tuwczf/image/upload/v1781279073/mamoplastia-02_lpytrl.png",
        alt: "Fotografia clinica completa de mamoplastia de aumento caso 2",
      },
      {
        src: "https://res.cloudinary.com/dz9tuwczf/image/upload/v1781279076/mamoplastia-03_xiw2ew.png",
        alt: "Fotografia clinica completa de mamoplastia de aumento caso 3",
      },
      {
        src: "https://res.cloudinary.com/dz9tuwczf/image/upload/v1781279078/mamoplastia-04_b6sybk.png",
        alt: "Fotografia clinica completa de mamoplastia de aumento caso 4",
      },
    ],
  },
  {
    id: "abdominoplastia",
    label: "CUERPO",
    procedure: "Abdominoplastia",
    serviceTitles: ["Abdominoplastía", "Abdominoplastia"],
    galleryImages: [
      {
        src: "https://res.cloudinary.com/dz9tuwczf/image/upload/v1781279038/abdominoplastia-01_32_qftfri.png",
        alt: "Resultado de abdominoplastia caso 1 por el Dr. Masedo Carlos Dante",
      },
      {
        src: "https://res.cloudinary.com/dz9tuwczf/image/upload/v1781279039/abdominoplastia-02_32_fim20n.png",
        alt: "Resultado de abdominoplastia caso 2 por el Dr. Masedo Carlos Dante",
      },
      {
        src: "https://res.cloudinary.com/dz9tuwczf/image/upload/v1781279069/abdominoplastia-03_32_vkhx5o.png",
        alt: "Resultado de abdominoplastia caso 3 por el Dr. Masedo Carlos Dante",
      },
    ],
    modalImages: [
      {
        src: "https://res.cloudinary.com/dz9tuwczf/image/upload/v1781279039/abdominoplastia-01_fatsey.png",
        alt: "Fotografia clinica completa de abdominoplastia caso 1",
      },
      {
        src: "https://res.cloudinary.com/dz9tuwczf/image/upload/v1781279040/abdominoplastia-02_ntjitb.png",
        alt: "Fotografia clinica completa de abdominoplastia caso 2",
      },
      {
        src: "https://res.cloudinary.com/dz9tuwczf/image/upload/v1781279042/abdominoplastia-03_sedm61.png",
        alt: "Fotografia clinica completa de abdominoplastia caso 3",
      },
    ],
  },
  {
    id: "pexia-protesis",
    label: "MAMAS",
    procedure: "Pexia más prótesis",
    serviceTitles: ["Mastopexia", "Pexia mas protesis", "Pexia más prótesis"],
    galleryImages: [
      {
        src: "https://res.cloudinary.com/dz9tuwczf/image/upload/v1781279082/pex-01_32_xwyfum.png",
        alt: "Resultado de pexia mas protesis caso 1 por el Dr. Masedo Carlos Dante",
      },
      {
        src: "https://res.cloudinary.com/dz9tuwczf/image/upload/v1781279084/pex-02_32_bbjzeo.png",
        alt: "Resultado de pexia mas protesis caso 2 por el Dr. Masedo Carlos Dante",
      },
    ],
    modalImages: [
      {
        src: "https://res.cloudinary.com/dz9tuwczf/image/upload/v1781279081/pex-01_vdffzs.png",
        alt: "Fotografia clinica completa de pexia mas protesis caso 1",
      },
      {
        src: "https://res.cloudinary.com/dz9tuwczf/image/upload/v1781279083/pex-02_jnusnh.png",
        alt: "Fotografia clinica completa de pexia mas protesis caso 2",
      },
    ],
  },
];

const PLACEHOLDER_SRC = "/images/placeholder-1-e1533569576673.webp";

export const GALLERY_ENTRIES: GalleryEntry[] = [
  { type: "result", resultId: "mamoplastia-aumento" },
  {
    type: "placeholder",
    id: "rinoplastia-placeholder",
    label: "ROSTRO",
    procedure: "Rinoplastia",
    src: PLACEHOLDER_SRC,
    alt: "Espacio reservado para resultados de rinoplastia del Dr. Masedo",
  },
  { type: "result", resultId: "abdominoplastia" },
  { type: "result", resultId: "pexia-protesis" },
  {
    type: "placeholder",
    id: "liposuccion-placeholder",
    label: "CUERPO",
    procedure: "Liposuccion",
    src: PLACEHOLDER_SRC,
    alt: "Espacio reservado para resultados de liposuccion del Dr. Masedo",
  },
];

export function normalizeTitle(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function getResultSetById(id: string) {
  return RESULT_SETS.find((result) => result.id === id) ?? null;
}

export function getResultSetByServiceTitle(title: string) {
  const normalizedTitle = normalizeTitle(title);
  return (
    RESULT_SETS.find((result) =>
      result.serviceTitles.some((serviceTitle) => normalizeTitle(serviceTitle) === normalizedTitle)
    ) ?? null
  );
}
