import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { getResultSetById, RESULT_SETS } from "@/lib/results";

export type ResultRequest = {
  resultId: string;
  requestKey: number;
};

type GalleryProps = {
  resultRequest?: ResultRequest | null;
};

type ModalState = {
  resultId: string;
  index: number;
};

type GallerySlide = {
  id: string;
  resultId: string;
  label: string;
  procedure: string;
  src: string;
  alt: string;
  mobileSrc: string;
  totalImages: number;
};

const AUTOPLAY_DELAY = 4000;
const RESULT_ORDER = ["mamoplastia-aumento", "abdominoplastia", "pexia-protesis"];

function buildSlides(): GallerySlide[] {
  return RESULT_ORDER.map((resultId) => {
    const result = RESULT_SETS.find((item) => item.id === resultId);
    const coverImage = result?.galleryImages[0];
    const mobileCoverImage = result?.modalImages[0];
    if (!result || !coverImage || !mobileCoverImage) return null;

    return {
      id: result.id,
      resultId: result.id,
      label: result.label,
      procedure: result.procedure,
      src: coverImage.src,
      alt: coverImage.alt,
      mobileSrc: mobileCoverImage.src,
      totalImages: result.modalImages.length,
    };
  }).filter((slide): slide is GallerySlide => Boolean(slide));
}

export function Gallery({ resultRequest }: GalleryProps) {
  const slides = useMemo(buildSlides, []);
  const [activeIndex, setActiveIndex] = useState(0);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const sectionRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const goToPreviousSlide = useCallback(() => {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToNextSlide = useCallback(() => {
    setActiveIndex((current) => (current + 1) % slides.length);
  }, [slides.length]);

  const openResult = useCallback((resultId: string, index = 0) => {
    lastFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setModal({ resultId, index });
  }, []);

  const close = useCallback(() => {
    setModal(null);
    requestAnimationFrame(() => lastFocusedRef.current?.focus());
  }, []);

  const navigateModal = useCallback((direction: "prev" | "next") => {
    setModal((current) => {
      if (!current) return current;

      const result = getResultSetById(current.resultId);
      const total = result?.modalImages.length ?? 0;
      if (!total) return current;

      const index =
        direction === "prev"
          ? (current.index - 1 + total) % total
          : (current.index + 1) % total;
      return { ...current, index };
    });
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(Boolean(mediaQuery?.matches));

    updatePreference();
    mediaQuery?.addEventListener?.("change", updatePreference);
    return () => mediaQuery?.removeEventListener?.("change", updatePreference);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.35 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!resultRequest) return;
    openResult(resultRequest.resultId, 0);
  }, [openResult, resultRequest]);

  useEffect(() => {
    if (!isInView || isPaused || modal || reducedMotion || slides.length <= 1) return;

    const interval = window.setInterval(goToNextSlide, AUTOPLAY_DELAY);
    return () => window.clearInterval(interval);
  }, [goToNextSlide, isInView, isPaused, modal, reducedMotion, slides.length]);

  useEffect(() => {
    if (!modal) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      } else if (event.key === "ArrowLeft") {
        navigateModal("prev");
      } else if (event.key === "ArrowRight") {
        navigateModal("next");
      } else if (event.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            "button, [href], [tabindex]:not([tabindex='-1'])"
          )
        ).filter((element) => !element.hasAttribute("disabled"));
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, modal, navigateModal]);

  useEffect(() => {
    if (modal) closeButtonRef.current?.focus();
  }, [modal]);

  const activeResult = modal ? getResultSetById(modal.resultId) : null;
  const activeImage = activeResult?.modalImages[modal?.index ?? 0] ?? null;

  return (
    <section
      ref={sectionRef}
      id="galeria"
      aria-labelledby="galeria-title"
      className="overflow-x-hidden bg-dark py-20 md:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <Reveal y={16} delay={0}>
          <div className="mb-12 text-center lg:mb-14">
            <div className="mb-4 flex items-center justify-center gap-4">
              <span className="h-px w-12 bg-copper opacity-40" />
              <span className="font-sans text-xs uppercase tracking-brand-widest text-sage">
                Resultados
              </span>
              <span className="h-px w-12 bg-copper opacity-40" />
            </div>
            <h2 id="galeria-title" className="h-display-light text-white">
              Galería de <span className="text-sage">trabajos</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl font-sans text-[0.9rem] leading-[1.8] text-white/75">
              Casos disponibles de las principales categorías quirúrgicas, publicados siempre con
              consentimiento informado.
            </p>
          </div>
        </Reveal>

        <Reveal y={18} delay={80}>
          <div
            data-gallery-carousel
            data-autoplay-interval={AUTOPLAY_DELAY}
            className="relative mx-auto aspect-[3/4] w-full max-w-6xl bg-darker/40 shadow-[0_28px_90px_rgba(0,0,0,0.24)] md:aspect-[3/2]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocus={() => setIsPaused(true)}
            onBlur={() => setIsPaused(false)}
          >
            <div className="h-full overflow-hidden">
              <div
                data-carousel-track
                className="flex h-full transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
              >
                {slides.map((slide) => (
                  <button
                    key={slide.id}
                    type="button"
                    data-gallery-slide
                    data-result-id={slide.resultId}
                    className="group relative h-full min-w-full overflow-hidden text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-sage"
                    onClick={() => openResult(slide.resultId, 0)}
                    aria-label={`${slide.label} - ${slide.procedure}`}
                  >
                    <picture className="block h-full w-full">
                      <source media="(max-width: 767px)" srcSet={slide.mobileSrc} />
                      <img
                        src={slide.src}
                        alt={slide.alt}
                        className="h-full w-full select-none object-cover transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.012]"
                        draggable={false}
                        loading={slide.id === slides[0]?.id ? "eager" : "lazy"}
                      />
                    </picture>
                    <SlideOverlay slide={slide} />
                  </button>
                ))}
              </div>
            </div>

            <GalleryArrowButton onClick={goToPreviousSlide} side="left" ariaLabel="Ver resultado anterior">
              <ChevronLeft size={28} />
            </GalleryArrowButton>

            <GalleryArrowButton onClick={goToNextSlide} side="right" ariaLabel="Ver resultado siguiente">
              <ChevronRight size={28} />
            </GalleryArrowButton>

          </div>
        </Reveal>

        <div
          className="mx-auto mt-10 flex max-w-6xl items-start gap-4 p-6"
          style={{
            backgroundColor: "hsl(var(--brand-forest-2) / 0.2)",
            borderLeft: "2px solid hsl(var(--brand-forest-2))",
          }}
        >
          <span className="text-[1.4rem] leading-none text-sage" aria-hidden="true">
            i
          </span>
          <p className="font-sans text-sm leading-[1.7] text-white/75">
            Las fotografías clínicas disponibles se publican con consentimiento informado. Los
            resultados individuales pueden variar según el estado de salud, la anatomía y el
            seguimiento post-operatorio de cada caso.
          </p>
        </div>
      </div>

      {activeResult && activeImage && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Resultados de ${activeResult.procedure}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-darker/95 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <button
            ref={closeButtonRef}
            type="button"
            className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center text-white/75 transition-colors duration-150 hover:text-white active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage md:right-6 md:top-6"
            onClick={(event) => {
              event.stopPropagation();
              close();
            }}
            aria-label="Cerrar resultados"
          >
            <X size={28} />
          </button>

          {activeResult.modalImages.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-white/75 transition-colors duration-150 hover:text-white active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage md:left-6"
                onClick={(event) => {
                  event.stopPropagation();
                  navigateModal("prev");
                }}
                aria-label={`Foto anterior de ${activeResult.procedure}`}
              >
                <ChevronLeft size={34} />
              </button>
              <button
                type="button"
                className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-white/75 transition-colors duration-150 hover:text-white active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage md:right-6"
                onClick={(event) => {
                  event.stopPropagation();
                  navigateModal("next");
                }}
                aria-label={`Siguiente foto de ${activeResult.procedure}`}
              >
                <ChevronRight size={34} />
              </button>
            </>
          )}

          <div
            className="flex max-h-[92vh] w-full max-w-5xl flex-col items-center"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 text-center">
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

            <img
              src={activeImage.src}
              alt={activeImage.alt}
              className="max-h-[72vh] max-w-[88vw] object-contain"
            />
            <p className="mt-4 max-w-md px-4 text-center font-sans text-xs leading-[1.7] text-white/65">
              Las fotografías se publican con consentimiento informado del paciente. Los resultados
              individuales pueden variar.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function GalleryArrowButton({
  onClick,
  children,
  side,
  ariaLabel,
}: {
  onClick: () => void;
  children: ReactNode;
  side: "left" | "right";
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={[
        "absolute top-1/2 -translate-y-1/2 w-11 h-11 rounded-full text-white",
        "flex items-center justify-center cursor-pointer z-20 transition-[background-color,border-color,transform,opacity] duration-200 ease-out active:scale-95",
        "lg:bg-darker/80 lg:backdrop-blur-sm lg:border lg:border-sage/50",
        "lg:hover:bg-copper lg:hover:border-copper lg:hover:scale-110",
        "lg:shadow-card-soft",
        side === "left" ? "-left-[18px] lg:-left-10" : "-right-[18px] lg:-right-10",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function SlideOverlay({ slide }: { slide: GallerySlide }) {
  return (
    <>
      <div className="absolute left-5 top-5 z-20 bg-dark/90 px-4 py-2 md:left-7 md:top-7">
        <span className="font-sans text-2xs uppercase tracking-brand-tight text-sage">
          {slide.label}
        </span>
      </div>

      <div className="absolute right-5 top-5 z-20 bg-copper px-4 py-2 md:right-7 md:top-7">
        <span className="font-sans text-2xs uppercase tracking-[0.14em] text-white">
          {slide.totalImages} casos
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-darker/92 via-darker/36 to-transparent px-5 pb-6 pt-20 text-left md:hidden">
        <p className="font-serif text-2xl leading-tight text-white md:text-4xl">
          {slide.procedure}
        </p>
        <p className="mt-3 font-sans text-xs uppercase tracking-[0.16em] text-white/70">
          Tocá para ver todos los casos
        </p>
      </div>

      <div className="absolute inset-0 z-10 hidden items-center justify-center bg-darker/68 px-8 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 md:flex">
        <div className="text-center">
          <p className="font-serif text-4xl leading-tight text-white lg:text-5xl">
            {slide.procedure}
          </p>
          <span className="mt-6 inline-flex min-h-11 items-center border border-white/60 px-6 py-3 font-sans text-xs uppercase tracking-[0.16em] text-white transition-[background-color,border-color,color] duration-300 group-hover:border-copper group-hover:bg-copper">
            Ver {slide.totalImages} resultados →
          </span>
        </div>
      </div>
    </>
  );
}
