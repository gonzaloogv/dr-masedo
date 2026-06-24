import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
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
const GALLERY_SELECT_SETTLE_MS = 190;
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
    tablet: {
      ...image,
      src: withCloudinaryTransform(image.src, "t_acotado"),
    },
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

function getServiceGridLayout(serviceCount: number) {
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

function withCloudinaryTransform(src: string, transformation: string) {
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

function getServicePreview(result: ResultSet | null) {
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
  const galleryStageRef = useRef<HTMLDivElement | null>(null);
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
  const servicesCatalog = isSelectedLayout ? selectedCatalog : null;
  const areServicesInteractive = servicesPanelState === "open";
  const serviceGridLayout = servicesCatalog ? getServiceGridLayout(servicesCatalog.services.length) : null;
  const catalogOverflowClass = "overflow-hidden";
  const catalogHoverRoomClass = catalogPanelState === "open" ? "lg:-my-0.5 lg:py-0.5" : "";
  const servicesOverflowClass = servicesPanelState === "open" ? "overflow-visible" : "overflow-hidden";

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

    if (window.innerWidth < 768) {
      window.requestAnimationFrame(() => {
        galleryStageRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
      });
    }

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
            ref={galleryStageRef}
            className={`grid transition-[gap] duration-[450ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none ${
              isSelectedLayout ? "gap-5 lg:grid-cols-[minmax(210px,280px)_1fr] lg:items-stretch" : "gap-0"
            }`}
            data-gallery-motion-stage
            data-state={galleryViewState}
          >
            <div
              className={`flex flex-col ${catalogOverflowClass} ${catalogHoverRoomClass} opacity-100 transition-[max-height,opacity,transform,gap] duration-[450ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none lg:h-[540px] lg:max-h-none lg:flex-row lg:gap-2 ${
                isSelectedLayout ? "max-h-[260px] gap-0" : "max-h-[2000px] gap-3"
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
              className={`grid ${servicesOverflowClass} transition-[opacity,transform] duration-[420ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none md:transition-[grid-template-rows,max-height,opacity,transform] ${
                servicesPanelState === "open"
                  ? "grid-rows-[1fr] max-h-[3200px] translate-y-0 opacity-100 md:max-h-[1200px]"
                  : servicesPanelState === "closing"
                    ? "pointer-events-none grid-rows-[0fr] max-h-[3200px] translate-y-1 opacity-0 md:max-h-[1200px]"
                    : "pointer-events-none grid-rows-[0fr] max-h-0 translate-y-3 opacity-0"
              }`}
              data-gallery-services
              data-state={servicesPanelState}
            >
              <div className={`min-h-0 ${servicesOverflowClass}`}>
                {servicesCatalog && serviceGridLayout ? (
                  <div
                    className="grid grid-cols-2 gap-3 md:h-[540px] md:grid-cols-[repeat(var(--gallery-service-cols),minmax(0,1fr))] md:grid-rows-[repeat(var(--gallery-service-rows),minmax(0,1fr))] lg:h-[540px]"
                    data-gallery-service-cells={serviceGridLayout.cells}
                    data-gallery-services-grid
                    style={
                      {
                        "--gallery-service-cols": String(serviceGridLayout.columns),
                        "--gallery-service-rows": String(serviceGridLayout.rows),
                      } as CSSProperties
                    }
                  >
                    {servicesCatalog.services.map((service, index) => (
                      <ServiceCard
                        key={service.title}
                        index={index}
                        isVisible={areServicesInteractive}
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
  const selectMotionState = isSelecting ? (isSelected ? "anchor" : "exiting") : undefined;
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
    : isSelecting
      ? "transition-[max-height,opacity,border-color,transform,filter] duration-[300ms]"
    : "transition-[max-height,flex,filter,opacity,transform,border-color,width] duration-[420ms]";
  const selectMotionClass = isSelecting
    ? isSelected
      ? "lg:-translate-x-5 lg:scale-[0.992]"
      : "lg:translate-x-6"
    : "";
  const visibilityClass = isHiddenInSelectedMode
    ? "h-0 max-h-0 !min-h-0 basis-0 border-0 opacity-0 pointer-events-none lg:h-full lg:max-h-0 lg:!min-h-0"
    : isRestoringHidden
      ? "max-h-[260px] opacity-0 pointer-events-none lg:max-h-none"
      : "max-h-[260px] opacity-100 lg:max-h-none";
  const imageMotionClass = isTransitioning ? "" : "group-hover:scale-[1.035]";

  return (
    <button
      aria-label={catalog.name}
      aria-expanded={isSelectedMode && isSelected ? true : undefined}
      aria-hidden={isHiddenInSelectedMode || isRestoringHidden ? true : undefined}
      className={`group relative flex min-h-11 shrink-0 aspect-[3/2] overflow-hidden border border-sage/25 bg-darker/40 text-left shadow-card-soft outline-none ${transitionClass} ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:translate-x-0 motion-reduce:translate-y-0 motion-reduce:scale-100 ${interactionClass} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-sage lg:aspect-[3/4] lg:h-full lg:min-h-11 lg:border ${selectMotionClass} ${visibilityClass} ${desktopFlexClass}`}
      data-gallery-catalog
      data-gallery-restore-state={
        isRestoring ? (isReturning ? "anchor" : "pending") : undefined
      }
      data-gallery-select-motion={selectMotionState}
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
          <source media="(min-width: 1024px)" srcSet={cover.desktop.src} />
          <source media="(min-width: 768px)" srcSet={cover.tablet.src} />
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
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-darker/95 via-darker/56 to-transparent"
        data-gallery-bottom-gradient
      />
      <span
        aria-hidden="true"
        className="absolute right-5 top-5 z-10 bg-copper px-3 py-1 font-sans text-2xs uppercase tracking-[0.14em] text-white lg:right-6 lg:top-6"
        data-gallery-service-count
      >
        {serviceCount}
      </span>
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
          <source media="(min-width: 1024px)" srcSet={cover.desktop.src} />
          <source media="(min-width: 768px)" srcSet={cover.tablet.src} />
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
  index: number;
  isVisible: boolean;
  service: GalleryService;
  onClick: () => void;
};

function ServiceCard({ index, isVisible, service, onClick }: ServiceCardProps) {
  const result = getServiceResult(service);
  const caseCount = result?.modalImages.length ?? 0;
  const preview = getServicePreview(result);
  const serviceStateClass = isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0";
  const surfaceClass = preview
    ? "bg-darker/50"
    : "bg-gradient-to-br from-darker/92 via-dark/78 to-forest-2/48";

  return (
    <button
      aria-label={
        caseCount > 0
          ? `Ver resultados de ${service.title}`
          : `${service.title}. Sin fotos de casos disponibles`
      }
      aria-hidden={isVisible ? undefined : true}
      className={`group relative flex min-h-[180px] overflow-hidden border border-sage/20 p-4 text-left shadow-card-soft outline-none transition-[border-color,transform,background-color,opacity] duration-[220ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:translate-y-0 motion-reduce:transition-none hover:-translate-y-0.5 hover:border-copper/65 hover:bg-darker/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage md:min-h-0 lg:p-5 ${surfaceClass} ${serviceStateClass}`}
      data-gallery-service
      data-gallery-service-has-preview={preview ? true : false}
      data-gallery-service-position={index + 1}
      data-gallery-service-state={isVisible ? "open" : "closed"}
      onClick={onClick}
      style={{ transitionDelay: isVisible ? `${60 + index * 35}ms` : "0ms" }}
      tabIndex={isVisible ? undefined : -1}
      type="button"
    >
      {preview ? (
        <picture className="absolute inset-0" data-gallery-service-preview>
          <source media="(min-width: 1024px)" srcSet={preview.desktop.src} />
          <source media="(min-width: 768px)" srcSet={preview.tablet.src} />
          <img
            alt=""
            className="h-full w-full object-cover opacity-75 transition-transform duration-500 ease-out group-hover:scale-[1.035]"
            draggable={false}
            loading="lazy"
            src={preview.tablet.src}
          />
        </picture>
      ) : (
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-darker/92 via-dark/78 to-forest-2/48"
          data-gallery-service-empty-surface
        />
      )}
      <span
        className="absolute inset-0"
        data-gallery-service-reading-overlay="gradient"
        style={{
          backgroundImage:
            "linear-gradient(to top, hsl(var(--brand-darker) / 0.96), hsl(var(--brand-darker) / 0.58), hsl(var(--brand-darker) / 0.82))",
        }}
      />
      <span className="relative z-10 flex h-full w-full flex-col justify-between">
        <span>
          <span className="block font-serif text-xl leading-tight text-white md:text-lg xl:text-xl">
            {service.title}
          </span>
          <span className="mt-2 block overflow-hidden font-sans text-xs leading-[1.55] text-white/70 md:[-webkit-box-orient:vertical] md:[-webkit-line-clamp:2] md:[display:-webkit-box]">
            {service.description}
          </span>
        </span>
        <span className="mt-4 flex items-center justify-between gap-4 border-t border-sage/15 pt-3 font-sans text-2xs uppercase tracking-[0.16em]">
          <span className={caseCount > 0 ? "text-sage" : "text-white/50"}>
            {caseCount > 0 ? `${caseCount} fotos` : "Sin fotos"}
          </span>
          <span className="text-copper transition-transform duration-300 group-hover:translate-x-1">
            Ver
          </span>
        </span>
      </span>
    </button>
  );
}
