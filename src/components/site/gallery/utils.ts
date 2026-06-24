import { getResultSetById, type ResultSet } from "@/lib/results";
import type { GalleryCatalog, GalleryService } from "./types";

export const DRAG_THRESHOLD_PX = 36;
export const TAP_TOLERANCE_PX = 8;
export const GALLERY_SELECT_SETTLE_MS = 190;
export const GALLERY_CLOSE_TRANSITION_MS = 260;
export const GALLERY_RESTORE_SETTLE_MS = 80;

export type ServiceGridLayout = {
  columns: number;
  rows: number;
  cells: number;
};

export function getServiceResult(service: GalleryService): ResultSet | null {
  return service.resultId ? getResultSetById(service.resultId) : null;
}

export function getCatalogCover(catalog: GalleryCatalog) {
  const resultId =
    catalog.coverResultId ?? catalog.services.find((service) => service.resultId)?.resultId;
  const result = resultId ? getResultSetById(resultId) : null;
  const image = result?.galleryImages[0];

  if (!image) {
    return null;
  }

  return {
    desktop: result?.galleryMobileImage ?? image,
    tablet: {
      ...image,
      src: withCloudinaryTransform(image.src, "t_acotado"),
    },
    mobile: image,
  };
}

export function getCatalogTone(index: number) {
  const tones = [
    "from-darker/94 via-darker/48 to-dark/18",
    "from-darker/92 via-dark/50 to-copper/20",
    "from-darker/95 via-darker/52 to-sage/18",
    "from-dark/92 via-darker/50 to-copper/16",
    "from-darker/96 via-dark/54 to-sage/16",
  ];

  return tones[index % tones.length];
}

export function getServiceGridLayout(serviceCount: number): ServiceGridLayout {
  if (serviceCount <= 6) {
    return { columns: 3, rows: 2, cells: 6 };
  }

  if (serviceCount <= 8) {
    return { columns: 4, rows: 2, cells: 8 };
  }

  if (serviceCount <= 9) {
    return { columns: 3, rows: 3, cells: 9 };
  }

  const rows = Math.ceil(serviceCount / 4);

  return { columns: 4, rows, cells: rows * 4 };
}

export function withCloudinaryTransform(src: string, transformation: string) {
  const uploadMarker = "/image/upload/";
  const uploadIndex = src.indexOf(uploadMarker);

  if (uploadIndex === -1) {
    return src;
  }

  const prefixEnd = uploadIndex + uploadMarker.length;
  const prefix = src.slice(0, prefixEnd);
  const parts = src.slice(prefixEnd).split("/");

  if (parts[0]?.startsWith("t_")) {
    parts[0] = transformation;
    return `${prefix}${parts.join("/")}`;
  }

  return `${prefix}${transformation}/${parts.join("/")}`;
}

export function getServicePreview(result: ResultSet | null) {
  const image = result?.galleryImages[0];

  if (!image) {
    return null;
  }

  return {
    desktop: image,
    tablet: {
      ...image,
      src: withCloudinaryTransform(image.src, "t_acotado"),
    },
  };
}
