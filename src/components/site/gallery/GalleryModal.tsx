import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { PointerEvent as ReactPointerEvent, RefObject } from "react";

import type { ResultSet } from "@/lib/results";
import type { ModalState } from "./types";

type GalleryModalProps = {
  activeImage: ResultSet["modalImages"][number] | null;
  activeResult: ResultSet | null;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  dialogLabel: string;
  modal: ModalState;
  modalDragOffset: number;
  onClose: () => void;
  onNavigate: (direction: 1 | -1) => void;
  onPointerCancel: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
};

export function GalleryModal({
  activeImage,
  activeResult,
  closeButtonRef,
  dialogLabel,
  modal,
  modalDragOffset,
  onClose,
  onNavigate,
  onPointerCancel,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: GalleryModalProps) {
  return (
    <div
      aria-label={dialogLabel}
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-darker/95 p-4 backdrop-blur-sm"
      data-gallery-modal
      onClick={onClose}
      role="dialog"
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-5xl flex-col items-center"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          aria-label="Cerrar resultados"
          className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center text-white/75 transition-colors duration-150 hover:text-white active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage md:right-6 md:top-6"
          onClick={onClose}
          ref={closeButtonRef}
          type="button"
        >
          <X className="h-5 w-5" />
        </button>

        {modal.type === "result" && activeResult && activeImage ? (
          <>
            <div className="mb-4 px-12 text-center">
              <p className="font-sans text-2xs uppercase tracking-brand-widest text-sage">
                {activeResult.label}
              </p>
              <h3 className="mt-1 font-serif text-2xl leading-tight text-white md:text-3xl">
                {activeResult.procedure}
              </h3>
              <p className="mt-2 font-sans text-xs uppercase tracking-[0.16em] text-white/55">
                {modal.index + 1} / {activeResult.modalImages.length}
              </p>
            </div>

            <div className="relative flex w-full items-center justify-center">
              <div
                aria-label="Imagen de resultado"
                className="flex max-h-[72vh] max-w-[88vw] touch-pan-y cursor-grab select-none items-center justify-center active:cursor-grabbing"
                data-modal-gesture
                onPointerCancel={onPointerCancel}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                role="presentation"
              >
                <img
                  alt={activeImage.alt}
                  className="max-h-[72vh] max-w-[88vw] object-contain transition-transform duration-200 ease-out"
                  draggable={false}
                  loading="eager"
                  src={activeImage.src}
                  style={{
                    transform: `translateX(${modalDragOffset}px)`,
                  }}
                />
              </div>

              {activeResult.modalImages.length > 1 ? (
                <>
                  <button
                    aria-label="Imagen anterior"
                    className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-white/75 transition-colors duration-150 hover:text-white active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage md:left-6"
                    onClick={() => onNavigate(-1)}
                    type="button"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    aria-label="Imagen siguiente"
                    className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-white/75 transition-colors duration-150 hover:text-white active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage md:right-6"
                    onClick={() => onNavigate(1)}
                    type="button"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              ) : null}
            </div>

            <p className="mt-4 max-w-md px-4 text-center font-sans text-xs leading-[1.7] text-white/65">
              Las fotografías se publican con consentimiento informado del paciente. Los resultados
              individuales pueden variar.
            </p>
          </>
        ) : null}

        {modal.type === "empty" ? (
          <div className="grid min-h-[360px] place-items-center px-4 py-10 text-center">
            <div className="max-w-md">
              <p className="font-sans text-2xs uppercase tracking-brand-widest text-sage">
                {modal.catalogName}
              </p>
              <h3 className="mt-1 font-serif text-2xl leading-tight text-white md:text-3xl">
                {modal.procedure}
              </h3>
              <div className="mx-auto mt-8 flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-sage/45 bg-dark/70 font-sans text-2xs uppercase tracking-brand-tight text-sage">
                Sin fotos
              </div>
              <p className="mt-6 font-sans text-sm leading-[1.7] text-white/75">
                No hay fotos de casos disponibles para este servicio.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
