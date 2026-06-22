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
  galleryMobileImage: ResultImage;
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
        src: "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/mamoplastia-01_32_frjrtg.png",
        alt: "Resultado de mamoplastia de aumento caso 1 por el Dr. Masedo Carlos Dante",
      },
      {
        src: "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/mamoplastia-02_32_qodruf.png",
        alt: "Resultado de mamoplastia de aumento caso 2 por el Dr. Masedo Carlos Dante",
      },
      {
        src: "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/mamoplastia-03_32_uodk8c.png",
        alt: "Resultado de mamoplastia de aumento caso 3 por el Dr. Masedo Carlos Dante",
      },
      {
        src: "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/mamoplastia-04_32_jsusi8.png",
        alt: "Resultado de mamoplastia de aumento caso 4 por el Dr. Masedo Carlos Dante",
      },
    ],
    galleryMobileImage: {
      src: "https://res.cloudinary.com/dz9tuwczf/image/upload/t_mobile/f_auto/q_auto/mamoplastia-01_llctwx.png",
      alt: "Resultado de mamoplastia de aumento caso 1 por el Dr. Masedo Carlos Dante",
    },
    modalImages: [
      {
        src: "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/mamoplastia-01_llctwx.png",
        alt: "Fotografia clinica completa de mamoplastia de aumento caso 1",
      },
      {
        src: "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/mamoplastia-02_lpytrl.png",
        alt: "Fotografia clinica completa de mamoplastia de aumento caso 2",
      },
      {
        src: "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/mamoplastia-03_xiw2ew.png",
        alt: "Fotografia clinica completa de mamoplastia de aumento caso 3",
      },
      {
        src: "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/mamoplastia-04_b6sybk.png",
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
        src: "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/abdominoplastia-01_32_qftfri.png",
        alt: "Resultado de abdominoplastia caso 1 por el Dr. Masedo Carlos Dante",
      },
      {
        src: "https://res.cloudinary.com/dz9tuwczf/image/upload/v1782018027/abdominoplastia-02_32_fim20n.webp",
        alt: "Resultado de abdominoplastia caso 2 por el Dr. Masedo Carlos Dante",
      },
      {
        src: "https://res.cloudinary.com/dz9tuwczf/image/upload/v1782017974/abdominoplastia-03_32_vkhx5o.webp",
        alt: "Resultado de abdominoplastia caso 3 por el Dr. Masedo Carlos Dante",
      },
    ],
    galleryMobileImage: {
      src: "https://res.cloudinary.com/dz9tuwczf/image/upload/t_mobile/f_auto/q_auto/abdominoplastia-01_fatsey.webp",
      alt: "Resultado de abdominoplastia caso 1 por el Dr. Masedo Carlos Dante",
    },
    modalImages: [
      {
        src: "https://res.cloudinary.com/dz9tuwczf/image/upload/v1782017837/abdominoplastia-01_fatsey.webp",
        alt: "Fotografia clinica completa de abdominoplastia caso 1",
      },
      {
        src: "https://res.cloudinary.com/dz9tuwczf/image/upload/v1782017600/abdominoplastia-02_ntjitb.webp",
        alt: "Fotografia clinica completa de abdominoplastia caso 2",
      },
      {
        src: "https://res.cloudinary.com/dz9tuwczf/image/upload/v1782017360/abdominoplastia-03_sedm61.webp",
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
        src: "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/pex-01_32_xwyfum.png",
        alt: "Resultado de pexia mas protesis caso 1 por el Dr. Masedo Carlos Dante",
      },
      {
        src: "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/pex-02_32_bbjzeo.png",
        alt: "Resultado de pexia mas protesis caso 2 por el Dr. Masedo Carlos Dante",
      },
    ],
    galleryMobileImage: {
      src: "https://res.cloudinary.com/dz9tuwczf/image/upload/t_mobile/f_auto/q_auto/pex-01_vdffzs.png",
      alt: "Resultado de pexia mas protesis caso 1 por el Dr. Masedo Carlos Dante",
    },
    modalImages: [
      {
        src: "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/pex-01_vdffzs.png",
        alt: "Fotografia clinica completa de pexia mas protesis caso 1",
      },
      {
        src: "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/pex-02_jnusnh.png",
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
