import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { Reveal } from "@/components/Reveal";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { getResultSetById } from "@/lib/results";
import { GALLERY_CATALOGS } from "./gallery/data";
import { GalleryModal } from "./gallery/GalleryModal";
import { GalleryStage } from "./gallery/GalleryStage";
import type {
  DragState,
  GalleryCatalog,
  GalleryProps,
  GalleryService,
  GalleryViewState,
  ModalState,
} from "./gallery/types";
import {
  DRAG_THRESHOLD_PX,
  GALLERY_CLOSE_TRANSITION_MS,
  GALLERY_RESTORE_SETTLE_MS,
  GALLERY_SELECT_SETTLE_MS,
  TAP_TOLERANCE_PX,
  getServiceGridLayout,
  getServiceResult,
} from "./gallery/utils";

export type { ResultRequest } from "./gallery/types";

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

  const anchorGalleryStageOnStackedLayout = useCallback(() => {
    if (window.innerWidth < 1024) {
      window.requestAnimationFrame(() => {
        const galleryStage = galleryStageRef.current;
        if (!galleryStage) return;

        const galleryStageTop = window.scrollY + galleryStage.getBoundingClientRect().top;
        const nav = document.querySelector("nav");
        const navHeight = nav?.getBoundingClientRect().height || 80;
        const anchorOffset = navHeight + 20;
        const previousScrollBehavior = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = "auto";
        window.scrollTo(window.scrollX, Math.max(0, galleryStageTop - anchorOffset));
        document.documentElement.style.scrollBehavior = previousScrollBehavior;
      });
    }
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

    anchorGalleryStageOnStackedLayout();

    const selectTimer = window.setTimeout(() => {
      setGalleryViewState("selected");
      anchorGalleryStageOnStackedLayout();
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
      anchorGalleryStageOnStackedLayout();

      const openTimer = window.setTimeout(() => {
        setGalleryViewState("open");
        setReturningCatalogId(null);
        anchorGalleryStageOnStackedLayout();
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
          <GalleryStage
            areServicesInteractive={areServicesInteractive}
            catalogHoverRoomClass={catalogHoverRoomClass}
            catalogOverflowClass={catalogOverflowClass}
            catalogPanelState={catalogPanelState}
            galleryStageRef={galleryStageRef}
            galleryViewState={galleryViewState}
            hoveredCatalogId={hoveredCatalogId}
            isSelectedLayout={isSelectedLayout}
            returningCatalogId={returningCatalogId}
            selectedCatalog={selectedCatalog}
            selectedCatalogId={selectedCatalogId}
            serviceGridLayout={serviceGridLayout}
            servicesCatalog={servicesCatalog}
            servicesOverflowClass={servicesOverflowClass}
            servicesPanelState={servicesPanelState}
            onCatalogSelect={handleCatalogSelect}
            onHoverCatalogChange={(catalogId) => {
              setHoveredCatalogId((current) => (catalogId === null && current ? null : catalogId));
            }}
            onSelectedCatalogReturn={handleSelectedCatalogReturn}
            onServiceSelect={handleServiceSelect}
          />
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
        <GalleryModal
          activeImage={activeImage}
          activeResult={activeResult}
          closeButtonRef={closeButtonRef}
          dialogLabel={dialogLabel}
          modal={modal}
          modalDragOffset={modalDragOffset}
          onClose={closeModal}
          onNavigate={navigateModal}
          onPointerCancel={handleModalPointerCancel}
          onPointerDown={handleModalPointerDown}
          onPointerMove={handleModalPointerMove}
          onPointerUp={handleModalPointerUp}
        />
      ) : null}
    </section>
  );
}
