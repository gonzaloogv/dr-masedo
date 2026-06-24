export type ResultRequest = {
  resultId: string;
  requestKey: number;
};

export type GalleryProps = {
  resultRequest?: ResultRequest | null;
};

export type ModalState =
  | {
      type: "result";
      resultId: string;
      index: number;
    }
  | {
      type: "empty";
      catalogName: string;
      procedure: string;
    };

export type GalleryService = {
  title: string;
  description: string;
  resultId?: string;
};

export type GalleryCatalog = {
  id: string;
  name: string;
  eyebrow: string;
  description: string;
  coverResultId?: string;
  services: GalleryService[];
};

export type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  currentX: number;
  dragging: boolean;
};

export type GalleryViewState = "open" | "selecting" | "selected" | "closing" | "restoring";
