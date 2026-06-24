import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { Reveal } from "@/components/Reveal";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { getResultSetById, type ResultSet } from "@/lib/results";

export type ResultRequest = {
  resultId: string;
  requestKey: number;
};

type GalleryProps = {
  resultRequest?: ResultRequest | null;
};

type ModalState =
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

type GalleryService = {
  title: string;
  description: string;
  resultId?: string;
};

type GalleryCatalog = {
  id: string;
  name: string;
  eyebrow: string;
  description: string;
  coverResultId?: string;
  services: GalleryService[];
};

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  currentX: number;
  dragging: boolean;
};

type GalleryViewState = "open" | "selecting" | "selected" | "closing" | "restoring";

const DRAG_THRESHOLD_PX = 36;
const TAP_TOLERANCE_PX = 8;
const GALLERY_SELECT_SETTLE_MS = 80;
const GALLERY_CLOSE_TRANSITION_MS = 260;
const GALLERY_RESTORE_SETTLE_MS = 80;
const GALLERY_CATALOGS: GalleryCatalog[] = [
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
        title: "Blefaroplastia",
        description: "Tratamiento del exceso cutaneo palpebral.",
      },
      {
        title: "Lifting facial",
        description: "Planificacion personalizada de rejuvenecimiento.",
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
      {
        title: "Marcacion abdominal",
        description: "Definicion corporal segun contextura y objetivo.",
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
      {
        title: "Tratamientos capilares",
        description: "Seguimiento medico segun diagnostico.",
      },
    ],
  },
];

function getServiceResult(service: GalleryService): ResultSet | null {
  return service.resultId ? getResultSetById(service.resultId) : null;
}

function getCatalogCover(catalog: GalleryCatalog) {
  const resultId =
    catalog.coverResultId ?? catalog.services.find((service) => service.resultId)?.resultId;
  const result = resultId ? getResultSetById(resultId) : null;
  const image = result?.galleryImages[0];

  if (!image) {
    return null;
  }

  return {
    desktop: result?.galleryMobileImage ?? image,
    mobile: image,
  };
}

function getCatalogTone(index: number) {
  const tones = [
    "from-darker/94 via-darker/48 to-dark/18",
    "from-darker/92 via-dark/50 to-copper/20",
    "from-darker/95 via-darker/52 to-sage/18",
    "from-dark/92 via-darker/50 to-copper/16",
    "from-darker/96 via-dark/54 to-sage/16",
  ];

  return tones[index % tones.length];
}

export function Gallery({ resultRequest }: GalleryProps) {
  const [selectedCatalogId, setSelectedCatalogId] = useState<string | null>(null);
  const [galleryViewState, setGalleryViewState] = useState<GalleryViewState>("open");
  const [returningCatalogId, setReturningCatalogId] = useState<string | null>(null);
  const [hoveredCatalogId, setHoveredCatalogId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const modalDragStateRef = useRef<DragState | null>(null);
  const galleryTransitionTimersRef = useRef<number[]>([]);
  const [modalDragOffset, setModalDragOffset] = useState(0);

  const selectedCatalog = useMemo(
    () => GALLERY_CATALOGS.find((catalog) => catalog.id === selectedCatalogId) ?? null,
    [selectedCatalogId],
  );
  const activeResult = modal?.type === "result" ? getResultSetById(modal.resultId) : null;
  const activeImage =
    activeResult && modal?.type === "result" ? activeResult.modalImages[modal.index] : null;
  const dialogLabel =
    modal?.type === "empty"
      ? `Resultados de ${modal.procedure}`
      : activeResult
        ? `Resultados de ${activeResult.procedure}`
        : "Resultados";
  const isSelectedLayout =
    Boolean(selectedCatalog) &&
    (galleryViewState === "selecting" || galleryViewState === "selected" || galleryViewState === "closing");
  const catalogPanelState = galleryViewState === "closing" ? "closing" : isSelectedLayout ? "collapsed" : "open";
  const servicesPanelState =
    galleryViewState === "closing" ? "closing" : galleryViewState === "selected" ? "open" : "closed";
  const servicesCatalog = servicesPanelState === "closed" ? null : selectedCatalog;

  useBodyScrollLock(Boolean(modal));

  const clearGalleryTransitionTimers = useCallback(() => {
    galleryTransitionTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    galleryTransitionTimersRef.current = [];
  }, []);

  const openResult = useCallback((resultId: string, index = 0) => {
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setModal({
      type: "result",
      resultId,
      index,
    });
    setModalDragOffset(0);
  }, []);

  const openEmptyService = useCallback((catalog: GalleryCatalog, service: GalleryService) => {
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setModal({
      type: "empty",
      catalogName: catalog.name,
      procedure: service.title,
    });
    setModalDragOffset(0);
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
    setModalDragOffset(0);
    modalDragStateRef.current = null;
    window.requestAnimationFrame(() => {
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    });
  }, []);

  const navigateModal = useCallback((direction: 1 | -1) => {
    setModal((current) => {
      if (!current || current.type !== "result") {
        return current;
      }

      const result = getResultSetById(current.resultId);

      if (!result || result.modalImages.length <= 1) {
        return current;
      }

      return {
        ...current,
        index: (current.index + direction + result.modalImages.length) % result.modalImages.length,
      };
    });
    setModalDragOffset(0);
  }, []);

  useEffect(() => {
    if (!resultRequest?.resultId) {
      return;
    }

    const targetResult = getResultSetById(resultRequest.resultId);

    if (!targetResult) {
      return;
    }

    const catalogWithResult = GALLERY_CATALOGS.find((catalog) =>
      catalog.services.some((service) => service.resultId === resultRequest.resultId),
    );

    if (catalogWithResult) {
      clearGalleryTransitionTimers();
      setSelectedCatalogId(catalogWithResult.id);
      setReturningCatalogId(null);
      setGalleryViewState("selected");
    }

    openResult(resultRequest.resultId, 0);
  }, [clearGalleryTransitionTimers, openResult, resultRequest]);

  useEffect(() => clearGalleryTransitionTimers, [clearGalleryTransitionTimers]);

  useEffect(() => {
    if (!modal) {
      return undefined;
    }

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
      }

      if (event.key === "ArrowRight" && modal.type === "result") {
        event.preventDefault();
        navigateModal(1);
        return;
      }

      if (event.key === "ArrowLeft" && modal.type === "result") {
        event.preventDefault();
        navigateModal(-1);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = Array.from(
        document.querySelectorAll<HTMLElement>(
          '[data-gallery-modal] button:not([disabled]), [data-gallery-modal] [href], [data-gallery-modal] [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("disabled") && !element.getAttribute("aria-hidden"));

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeModal, modal, navigateModal]);

  useEffect(() => {
    if (!activeResult || modal?.type !== "result" || activeResult.modalImages.length <= 1) {
      return;
    }

    const previousImage =
      activeResult.modalImages[
        (modal.index - 1 + activeResult.modalImages.length) % activeResult.modalImages.length
      ];
    const nextImage = activeResult.modalImages[(modal.index + 1) % activeResult.modalImages.length];

    [previousImage, nextImage].forEach((image) => {
      const preload = new Image();
      preload.src = image.src;
    });
  }, [activeResult, modal]);

  const handleCatalogSelect = (catalog: GalleryCatalog) => {
    clearGalleryTransitionTimers();
    setSelectedCatalogId(catalog.id);
    setReturningCatalogId(null);
    setGalleryViewState("selecting");
    setHoveredCatalogId(null);

    const selectTimer = window.setTimeout(() => {
      setGalleryViewState("selected");
    }, GALLERY_SELECT_SETTLE_MS);

    galleryTransitionTimersRef.current.push(selectTimer);
  };

  const handleSelectedCatalogReturn = (catalog: GalleryCatalog) => {
    clearGalleryTransitionTimers();
    setHoveredCatalogId(null);
    setReturningCatalogId(catalog.id);
    setGalleryViewState("closing");

    const restoreTimer = window.setTimeout(() => {
      setSelectedCatalogId(null);
      setGalleryViewState("restoring");

      const openTimer = window.setTimeout(() => {
        setGalleryViewState("open");
        setReturningCatalogId(null);
      }, GALLERY_RESTORE_SETTLE_MS);

      galleryTransitionTimersRef.current.push(openTimer);
    }, GALLERY_CLOSE_TRANSITION_MS);

    galleryTransitionTimersRef.current.push(restoreTimer);
  };

  const handleServiceSelect = (catalog: GalleryCatalog, service: GalleryService) => {
    const result = getServiceResult(service);

    if (result) {
      openResult(result.id, 0);
      return;
    }

    openEmptyService(catalog, service);
  };

  const handleModalPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!activeResult || modal?.type !== "result" || activeResult.modalImages.length <= 1) {
      return;
    }

    modalDragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      currentX: event.clientX,
      dragging: false,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handleModalPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const dragState = modalDragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;

    if (!dragState.dragging) {
      if (Math.abs(deltaX) < TAP_TOLERANCE_PX && Math.abs(deltaY) < TAP_TOLERANCE_PX) {
        return;
      }

      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        modalDragStateRef.current = null;
        setModalDragOffset(0);
        return;
      }

      dragState.dragging = true;
    }

    dragState.currentX = event.clientX;
    setModalDragOffset(deltaX);
  };

  const handleModalPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const dragState = modalDragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = dragState.currentX - dragState.startX;

    modalDragStateRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);

    if (dragState.dragging && Math.abs(deltaX) >= DRAG_THRESHOLD_PX) {
      navigateModal(deltaX < 0 ? 1 : -1);
      return;
    }

    setModalDragOffset(0);
  };

  const handleModalPointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    const dragState = modalDragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    modalDragStateRef.current = null;
    setModalDragOffset(0);
  };

  return (
    <section
      aria-labelledby="galeria-title"
      className="overflow-x-hidden bg-dark py-20 md:py-28 lg:py-32"
      id="galeria"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <Reveal delay={0} preset="section">
          <div className="mb-12 text-center lg:mb-14">
            <div className="mb-4 flex items-center justify-center gap-4">
              <span className="h-px w-12 bg-copper opacity-40" />
              <span className="font-sans text-xs uppercase tracking-brand-widest text-sage">
                Resultados
              </span>
              <span className="h-px w-12 bg-copper opacity-40" />
            </div>
            <h2 className="h-display-light text-white" id="galeria-title">
              Galería de <span className="text-sage">trabajos</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl font-sans text-[0.9rem] leading-[1.8] text-white/75">
              Casos disponibles de las principales categorías quirúrgicas, publicados siempre con
              consentimiento informado.
            </p>
          </div>
        </Reveal>

        <Reveal className="mt-12">
          <div
            className={`grid transition-[gap] duration-[450ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none ${
              isSelectedLayout ? "gap-5 lg:grid-cols-[minmax(210px,280px)_1fr] lg:items-stretch" : "gap-0"
            }`}
            data-gallery-motion-stage
            data-state={galleryViewState}
          >
            <div
              className={`flex flex-col overflow-hidden opacity-100 transition-[max-height,opacity,transform,gap] duration-[450ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none lg:h-[460px] lg:max-h-none lg:flex-row lg:gap-2 ${
                isSelectedLayout ? "max-h-[260px] gap-0" : "max-h-[1400px] gap-3"
              }`}
              data-gallery-catalogs
              data-gallery-mobile-collapse
              data-state={catalogPanelState}
            >
              {GALLERY_CATALOGS.map((catalog, index) => {
                const isSelected = isSelectedLayout && selectedCatalog?.id === catalog.id;
                const activeCatalogId =
                  galleryViewState === "open"
                    ? hoveredCatalogId
                    : isSelectedLayout
                      ? selectedCatalogId
                      : null;

                return (
                  <CatalogCard
                    key={catalog.id}
                    catalog={catalog}
                    index={index}
                    isExpanded={activeCatalogId ? activeCatalogId === catalog.id : false}
                    isSelecting={galleryViewState === "selecting"}
                    isRestoring={galleryViewState === "restoring"}
                    isReturning={galleryViewState === "restoring" && returningCatalogId === catalog.id}
                    isSelected={isSelected}
                    isSelectedMode={isSelectedLayout}
                    isTransitioning={galleryViewState !== "open"}
                    onClick={() => {
                      if (galleryViewState === "selected" && isSelected && selectedCatalog) {
                        handleSelectedCatalogReturn(selectedCatalog);
                        return;
                      }

                      if (galleryViewState !== "open") {
                        return;
                      }

                      handleCatalogSelect(catalog);
                    }}
                    onMouseEnter={() => {
                      if (galleryViewState === "open") {
                        setHoveredCatalogId(catalog.id);
                      }
                    }}
                    onMouseLeave={() => setHoveredCatalogId(null)}
                    onFocus={() => {
                      if (galleryViewState === "open") {
                        setHoveredCatalogId(catalog.id);
                      }
                    }}
                    onBlur={() => setHoveredCatalogId((current) => (current === catalog.id ? null : current))}
                  />
                );
              })}
            </div>

            <div
              aria-hidden={servicesPanelState === "open" ? undefined : true}
              className={`grid overflow-hidden transition-[grid-template-rows,max-height,opacity,transform] duration-[420ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none ${
                servicesPanelState === "open"
                  ? "grid-rows-[1fr] max-h-[1200px] translate-y-0 opacity-100"
                  : servicesPanelState === "closing"
                    ? "pointer-events-none grid-rows-[0fr] max-h-[1200px] translate-y-1 opacity-0"
                    : "pointer-events-none grid-rows-[0fr] max-h-0 translate-y-3 opacity-0"
              }`}
              data-gallery-services
              data-state={servicesPanelState}
            >
              <div className="min-h-0 overflow-hidden">
                {servicesCatalog ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {servicesCatalog.services.map((service) => (
                      <ServiceCard
                        key={service.title}
                        service={service}
                        onClick={() => handleServiceSelect(servicesCatalog, service)}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal
          className="mx-auto mt-10 flex max-w-6xl items-start gap-4 border-l-2 border-sage/70 bg-sage/10 p-6"
        >
          <span aria-hidden="true" className="text-[1.4rem] leading-none text-sage">
            i
          </span>
          <p className="font-sans text-sm leading-[1.7] text-white/75">
            Las fotografías clínicas disponibles se publican con consentimiento informado. Los
            resultados individuales pueden variar según el estado de salud, la anatomía y el
            proceso de recuperación de cada paciente.
          </p>
        </Reveal>
      </div>

      {modal ? (
        <div
          aria-label={dialogLabel}
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-darker/95 p-4 backdrop-blur-sm"
          data-gallery-modal
          onClick={closeModal}
          role="dialog"
        >
          <div
            className="relative flex max-h-[92vh] w-full max-w-5xl flex-col items-center"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              aria-label="Cerrar resultados"
              className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center text-white/75 transition-colors duration-150 hover:text-white active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage md:right-6 md:top-6"
              onClick={closeModal}
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
                    onPointerCancel={handleModalPointerCancel}
                    onPointerDown={handleModalPointerDown}
                    onPointerMove={handleModalPointerMove}
                    onPointerUp={handleModalPointerUp}
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
                        onClick={() => navigateModal(-1)}
                        type="button"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        aria-label="Imagen siguiente"
                        className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-white/75 transition-colors duration-150 hover:text-white active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage md:right-6"
                        onClick={() => navigateModal(1)}
                        type="button"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  ) : null}
                </div>

                <p className="mt-4 max-w-md px-4 text-center font-sans text-xs leading-[1.7] text-white/65">
                  Las fotografías se publican con consentimiento informado del paciente. Los
                  resultados individuales pueden variar.
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
      ) : null}
    </section>
  );
}

type CatalogCardProps = {
  catalog: GalleryCatalog;
  index: number;
  isExpanded: boolean;
  isSelecting: boolean;
  isRestoring: boolean;
  isReturning: boolean;
  isSelected: boolean;
  isSelectedMode: boolean;
  isTransitioning: boolean;
  onBlur: () => void;
  onClick: () => void;
  onFocus: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

function CatalogCard({
  catalog,
  index,
  isExpanded,
  isSelecting,
  isRestoring,
  isReturning,
  isSelected,
  isSelectedMode,
  isTransitioning,
  onBlur,
  onClick,
  onFocus,
  onMouseEnter,
  onMouseLeave,
}: CatalogCardProps) {
  const cover = getCatalogCover(catalog);
  const serviceCount = catalog.services.length;
  const isHiddenInSelectedMode = isSelectedMode && !isSelected;
  const isRestoringHidden = isRestoring && !isReturning;
  const isSelectingHidden = isSelecting && isHiddenInSelectedMode;
  const mobileState = isSelectedMode && !isSelected ? "hidden" : "visible";
  const desktopFlexClass = isHiddenInSelectedMode
    ? "lg:w-0 lg:flex-none"
    : isExpanded
      ? "lg:flex-[2.15_1_0%]"
      : "lg:flex-[0.76_1_0%]";
  const interactionClass = isTransitioning
    ? "hover:border-sage/60"
    : "hover:-translate-y-0.5 hover:border-sage/60";
  const transitionClass = isRestoring
    ? "transition-[opacity,border-color,transform,filter] duration-[220ms]"
    : isSelectingHidden
      ? "transition-[max-height,opacity,border-color,transform,filter] duration-[260ms]"
    : "transition-[max-height,flex,filter,opacity,transform,border-color,width] duration-[420ms]";
  const visibilityClass = isHiddenInSelectedMode
    ? "max-h-0 min-h-0 basis-0 border-0 opacity-0 pointer-events-none lg:max-h-0 lg:min-h-0"
    : isRestoringHidden
      ? "max-h-[260px] opacity-0 pointer-events-none lg:max-h-none"
      : "max-h-[260px] opacity-100 lg:max-h-none";
  const imageMotionClass = isTransitioning ? "" : "group-hover:scale-[1.035]";

  return (
    <button
      aria-label={catalog.name}
      aria-expanded={isSelectedMode && isSelected ? true : undefined}
      aria-hidden={isHiddenInSelectedMode || isRestoringHidden ? true : undefined}
      className={`group relative flex min-h-11 shrink-0 aspect-[3/2] overflow-hidden border border-sage/25 bg-darker/40 text-left shadow-card-soft outline-none ${transitionClass} ease-[cubic-bezier(0.23,1,0.32,1)] ${interactionClass} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-sage lg:aspect-[3/4] lg:h-full lg:min-h-11 lg:border ${visibilityClass} ${desktopFlexClass}`}
      data-gallery-catalog
      data-gallery-restore-state={
        isRestoring ? (isReturning ? "anchor" : "pending") : undefined
      }
      data-gallery-selected-catalog={isSelectedMode && isSelected ? true : undefined}
      data-mobile-state={mobileState}
      onBlur={onBlur}
      onClick={onClick}
      onFocus={onFocus}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      tabIndex={isHiddenInSelectedMode || isRestoringHidden ? -1 : 0}
      type="button"
    >
      {cover ? (
        <picture className="absolute inset-0">
          <source media="(max-width: 767px)" srcSet={cover.mobile.src} />
          <img
            alt=""
            className={`h-full w-full object-cover transition-transform duration-500 ease-out ${imageMotionClass}`}
            draggable={false}
            loading={index === 0 ? "eager" : "lazy"}
            src={cover.desktop.src}
          />
        </picture>
      ) : (
        <span
          aria-hidden="true"
          className={`absolute inset-0 bg-gradient-to-br ${getCatalogTone(index)}`}
        />
      )}

      <span className={`absolute inset-0 bg-gradient-to-t ${getCatalogTone(index)}`} />
      <span className="relative flex min-h-[180px] w-full flex-col justify-end gap-5 p-5 text-white lg:min-h-0 lg:p-6">
        <span className="flex items-center justify-between gap-4">
          <span
            className={`font-sans text-2xs uppercase tracking-brand-tight text-sage transition-opacity duration-300 ${
              isExpanded
                ? "lg:opacity-100"
                : "lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100"
            }`}
          >
            {catalog.eyebrow}
          </span>
          <span className="shrink-0 bg-copper px-3 py-1 font-sans text-2xs uppercase tracking-[0.14em] text-white">
            {serviceCount}
          </span>
        </span>
        <span className="relative block lg:min-h-[9rem]">
          <span
            aria-hidden="true"
            className={`block font-serif text-3xl leading-tight transition-[opacity,transform] duration-300 md:text-4xl ${
              isExpanded
                ? "lg:translate-y-0 lg:opacity-100"
                : "lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-visible:translate-y-0 lg:group-focus-visible:opacity-100"
            }`}
            data-gallery-catalog-name-horizontal
          >
            {catalog.name}
          </span>
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute bottom-0 left-1/2 hidden -translate-x-1/2 whitespace-nowrap font-serif text-2xl leading-none text-white transition-[opacity,transform] duration-300 lg:block lg:[writing-mode:vertical-rl] lg:rotate-180 ${
              isExpanded
                ? "lg:translate-y-2 lg:opacity-0"
                : "lg:translate-y-0 lg:opacity-100 lg:group-hover:opacity-0 lg:group-focus-visible:opacity-0"
            }`}
            data-gallery-catalog-name-vertical
          >
            {catalog.name}
          </span>
          <span
            className={`mt-3 block max-w-sm font-sans text-sm leading-[1.7] text-white/75 opacity-100 transition-opacity duration-300 ${
              isExpanded
                ? "lg:opacity-100"
                : "lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100"
            }`}
          >
            {catalog.description}
          </span>
        </span>
      </span>
    </button>
  );
}

type SelectedCatalogCardProps = {
  catalog: GalleryCatalog;
  onClick: () => void;
};

function SelectedCatalogCard({ catalog, onClick }: SelectedCatalogCardProps) {
  const cover = getCatalogCover(catalog);

  return (
    <button
      aria-label={`Volver a catalogos desde ${catalog.name}`}
      className="group relative flex min-h-[220px] overflow-hidden border border-sage/25 bg-darker/40 text-left shadow-card-soft outline-none transition-[filter,transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-sage/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-sage lg:min-h-full"
      data-gallery-selected-catalog
      onClick={onClick}
      type="button"
    >
      {cover ? (
        <picture className="absolute inset-0">
          <source media="(max-width: 767px)" srcSet={cover.mobile.src} />
          <img
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
            draggable={false}
            src={cover.desktop.src}
          />
        </picture>
      ) : (
        <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-darker to-dark" />
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-darker/92 via-darker/36 to-transparent" />
      <span className="relative flex w-full flex-col justify-end p-5 text-white lg:p-6">
        <span className="font-sans text-2xs uppercase tracking-brand-tight text-sage">Catalogo activo</span>
        <span className="mt-2 font-serif text-3xl leading-tight md:text-4xl">{catalog.name}</span>
        <span className="mt-4 font-sans text-sm leading-[1.7] text-white/75">
          Toca esta tarjeta para volver a todos los catalogos.
        </span>
      </span>
    </button>
  );
}

type ServiceCardProps = {
  service: GalleryService;
  onClick: () => void;
};

function ServiceCard({ service, onClick }: ServiceCardProps) {
  const result = getServiceResult(service);
  const caseCount = result?.modalImages.length ?? 0;

  return (
    <button
      aria-label={
        caseCount > 0
          ? `Ver resultados de ${service.title}`
          : `${service.title}. Sin fotos de casos disponibles`
      }
      className="group flex min-h-11 flex-col justify-between border border-sage/20 bg-darker/45 p-5 text-left shadow-card-soft outline-none transition-[border-color,transform,background-color] duration-300 hover:-translate-y-0.5 hover:border-copper/65 hover:bg-darker/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
      data-gallery-service
      onClick={onClick}
      type="button"
    >
      <span>
        <span className="block font-serif text-2xl leading-tight text-white">{service.title}</span>
        <span className="mt-3 block font-sans text-sm leading-[1.7] text-white/70">
          {service.description}
        </span>
      </span>
      <span className="mt-8 flex items-center justify-between gap-4 border-t border-sage/15 pt-4 font-sans text-2xs uppercase tracking-[0.16em]">
        <span className={caseCount > 0 ? "text-sage" : "text-white/50"}>
          {caseCount > 0 ? `${caseCount} fotos` : "Sin fotos"}
        </span>
        <span className="text-copper transition-transform duration-300 group-hover:translate-x-1">
          Ver
        </span>
      </span>
    </button>
  );
}
