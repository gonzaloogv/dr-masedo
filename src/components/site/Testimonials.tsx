import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode, TouchEvent } from "react";
import { ChevronLeft, ChevronRight, Star, ThumbsUp } from "lucide-react";
import { Reveal } from "@/components/Reveal";

const TESTIMONIALS = [
  { id: 1, name: "Magali90a", stars: 5,
    text: "1 MES Y 11 DÍAS. 425CC MUY FELIZ ❤️ Hola chicas, pasaron 1 mes y 11 días, me retiraron los puntos y hago vida normal. No me duele nada y el doctor ya me dejó comenzar el gym, utilizar bici y tomar sol. Estoy MUY contenta con el tamaño y cómo me van quedando; desinflamaron y bajaron rápido con los masajes. Creo que me hubiese gustado tmb un 450cc, pero con este tamaño me siento muy conforme y feliz ❤️." },
  { id: 2, name: "RosM", stars: 5,
    text: "AL FIN LLEGÓ EL DÍA, LA MEJOR DECISIÓN. 30 DÍAS DE OPERADA. VIDA NORMAL! No puedo pedir mejor recuperación: ya no hay molestias. El control salió perfecto, tengo el alta para empezar el gym y recuperé la movilidad de brazos en un 100%, siempre con cuidado en esfuerzos y carga de peso. Ya pude ponerme corpiño normal y sigo con masajes todos los días, mucha crema y a seguir recuperándome." },
  { id: 3, name: "MolinasAgustina", stars: 5,
    text: "AUMENTO DE MAMAS, ME OPERÉ EL 13 DE ENERO CONTENTÍSIMO Y FELIZ DE MI POST. La cirugía es muy estética y en casa, con la medicación, podés estar sin dolores con el reposo necesario. A un mes, con la ayuda de los masajes, los pechos se sienten muy normales. Son hermosos, muy naturales. Me coloqué 375cc MENTOR. Muy feliz y recomiendo siempre la atención y el profesionalismo del Dr Dante Masedo!" },
  { id: 4, name: "veronicanneme", stars: 5,
    text: "Lo adoro🙌 excelente profesional, súper detallista y perfeccionista en la armonización del cuerpo ❤️" },
];

const AUTOPLAY_MS = 7000;

function ArrowButton({ onClick, children, side }: { onClick: () => void; children: ReactNode; side: "left" | "right" }) {
  return (
    <button
      onClick={onClick}
      aria-label={side === "left" ? "Anterior" : "Siguiente"}
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

export function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [isInteractionPaused, setIsInteractionPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== "undefined" && Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches),
  );
  const total = TESTIMONIALS.length;
  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);
  const isAutoplayPaused = reducedMotion || isInteractionPaused;

  useEffect(() => {
    const mediaQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(Boolean(mediaQuery?.matches));

    updatePreference();
    mediaQuery?.addEventListener?.("change", updatePreference);
    return () => mediaQuery?.removeEventListener?.("change", updatePreference);
  }, []);

  useEffect(() => {
    if (isAutoplayPaused) return;
    const id = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [isAutoplayPaused, next]);

  const touchStartX = useRef<number | null>(null);
  const dragOffset = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const mobileCardsRef = useRef<(HTMLElement | null)[]>([]);
  const [mobileViewportHeight, setMobileViewportHeight] = useState<number | null>(null);

  const CARD_W = 65, GAP = 5, OFFSET = 17.5;
  const SLOT = CARD_W + GAP;
  const trackTransform = (idx: number, drag = 0) =>
    `translateX(calc(${OFFSET}vw - ${idx * SLOT}vw + ${drag}px))`;

  useLayoutEffect(() => {
    const mobileQuery = window.matchMedia?.("(max-width: 1023px)");
    const activeCard = mobileCardsRef.current[current];

    const updateHeight = () => {
      if (mobileQuery && !mobileQuery.matches) {
        setMobileViewportHeight(null);
        return;
      }

      const nextHeight = activeCard?.offsetHeight ?? 0;
      setMobileViewportHeight(nextHeight > 0 ? Math.ceil(nextHeight) : null);
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    mobileQuery?.addEventListener?.("change", updateHeight);

    const observer = typeof ResizeObserver !== "undefined" && activeCard
      ? new ResizeObserver(updateHeight)
      : null;
    observer?.observe(activeCard);

    return () => {
      window.removeEventListener("resize", updateHeight);
      mobileQuery?.removeEventListener?.("change", updateHeight);
      observer?.disconnect();
    };
  }, [current]);

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    dragOffset.current = 0;
    if (trackRef.current) trackRef.current.style.transition = "none";
  };
  const handleTouchMove = (e: TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.touches[0].clientX - touchStartX.current;
    dragOffset.current = delta;
    if (trackRef.current) trackRef.current.style.transform = trackTransform(current, delta);
  };
  const handleTouchEnd = () => {
    const delta = dragOffset.current;
    if (trackRef.current) {
      trackRef.current.style.transition = reducedMotion ? "none" : "transform 350ms ease-out";
    }
    if (delta < -50) next();
    else if (delta > 50) prev();
    else if (trackRef.current) trackRef.current.style.transform = trackTransform(current);
    touchStartX.current = null;
    dragOffset.current = 0;
  };

  const visible = [(current - 1 + total) % total, current, (current + 1) % total];

  return (
    <section
      id="testimonios"
      aria-labelledby="testimonios-title"
      className="py-20 md:py-28 lg:py-32 relative overflow-hidden bg-forest"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <Reveal preset="section" delay={0}>
          <div className="text-center mb-14 lg:mb-16">
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className={`h-px bg-copper opacity-40 ${reducedMotion ? "" : "animate-[grow-line_900ms_ease-out_both]"}`} style={{ width: "3rem" }} />
              <span className="font-sans text-xs tracking-brand-widest uppercase text-sage">Testimonios</span>
              <span className={`h-px bg-copper opacity-40 ${reducedMotion ? "" : "animate-[grow-line_900ms_ease-out_both]"}`} style={{ width: "3rem" }} />
            </div>
            <h2 id="testimonios-title" className="h-display-light text-white">
              Lo que dicen <span className="text-sage">nuestros pacientes</span>
            </h2>
            <p className="font-sans text-sage/90 text-sm md:text-base mt-4 max-w-xl mx-auto">
              Comentarios sobre la experiencia de atención, confianza y seguimiento
            </p>
          </div>
        </Reveal>

        <Reveal preset="media" clip={false} delay={80}>
          <div
            className="relative"
            style={{ overflow: "visible" }}
            onMouseEnter={() => setIsInteractionPaused(true)}
            onMouseLeave={() => setIsInteractionPaused(false)}
            onFocusCapture={() => setIsInteractionPaused(true)}
            onBlurCapture={() => setIsInteractionPaused(false)}
          >
            <ArrowButton onClick={prev} side="left"><ChevronLeft size={18} /></ArrowButton>
            <ArrowButton onClick={next} side="right"><ChevronRight size={18} /></ArrowButton>

          <div
            className="hidden lg:grid gap-6 items-center"
            style={{ gridTemplateColumns: "15% 70% 15%" }}
          >
            {visible.map((idx, pos) => {
              const t = TESTIMONIALS[idx];
              const isCenter = pos === 1;
              const isLeft = pos === 0;
              return (
                <article
                  key={`${t.id}-${pos}`}
                  aria-hidden={!isCenter}
                  className={[
                    "relative bg-copper transition-[opacity,transform,filter,border-color,box-shadow] duration-300 overflow-hidden",
                    isCenter
                      ? `p-10 scale-[1.02] opacity-100 border-t-2 border-sage shadow-card-hero ${reducedMotion ? "" : "animate-[fade-in_300ms_ease-out_both]"}`
                      : "p-6 scale-[0.95] opacity-45 blur-[1px] border-t-2 border-transparent pointer-events-none",
                  ].join(" ")}
                  style={
                    !isCenter
                      ? {
                          maskImage: isLeft
                            ? "linear-gradient(to right, transparent 0%, black 80%)"
                            : "linear-gradient(to left, transparent 0%, black 80%)",
                          WebkitMaskImage: isLeft
                            ? "linear-gradient(to right, transparent 0%, black 80%)"
                            : "linear-gradient(to left, transparent 0%, black 80%)",
                        }
                      : undefined
                  }
                >
                  {isCenter && (
                    <div
                      className="absolute top-0 left-0 right-0 h-px"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, hsl(var(--brand-sage)), transparent)",
                        boxShadow: "0 0 20px hsl(var(--brand-sage) / 0.6)",
                      }}
                    />
                  )}

                  {isCenter && (
                    <span
                      aria-hidden="true"
                      className="absolute -top-4 left-4 font-serif font-bold leading-none select-none pointer-events-none"
                      style={{ fontSize: "8rem", color: "hsl(var(--brand-sage) / 0.18)" }}
                    >
                      "
                    </span>
                  )}

                  <div className="flex gap-1 mb-5 relative">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star
                        key={i}
                        size={isCenter ? 16 : 14}
                        className={`fill-gold text-gold ${reducedMotion ? "" : "animate-[star-pop_360ms_ease-out_both]"}`}
                        style={{ animationDelay: `${i * 60}ms` }}
                      />
                    ))}
                  </div>
                  <blockquote
                    className={`font-sans leading-[1.75] mb-8 relative ${
                      isCenter ? "text-white text-base" : "text-white/90 text-[0.9rem]"
                    }`}
                  >
                    "{t.text}"
                  </blockquote>
                  <Author t={t} />
                </article>
              );
            })}
          </div>

          <div
            data-testimonials-mobile-viewport
            className="lg:hidden overflow-hidden w-screen -mx-6"
            style={{
              height: mobileViewportHeight ? `${mobileViewportHeight}px` : undefined,
              transitionProperty: "height",
              transitionDuration: reducedMotion ? "0ms" : "220ms",
              transitionTimingFunction: "ease-out",
            }}
          >
            <div
              ref={trackRef}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="flex items-start"
              style={{
                gap: `${GAP}vw`,
                width: `${total * SLOT + OFFSET}vw`,
                transform: trackTransform(current),
                transition: reducedMotion ? "none" : "transform 350ms ease-out",
                willChange: "transform",
              }}
            >
              {TESTIMONIALS.map((t, idx) => {
                const isActive = idx === current;
                return (
                  <article
                    key={t.id}
                    ref={(node) => {
                      mobileCardsRef.current[idx] = node;
                    }}
                    className={[
                      "relative flex-shrink-0 p-7 bg-copper transition-[opacity,transform,border-color,box-shadow] duration-200 overflow-hidden",
                      isActive
                        ? "opacity-100 scale-100 border-t-2 border-sage shadow-card-elevated"
                        : "opacity-60 scale-[0.96] border-t-2 border-transparent",
                    ].join(" ")}
                    style={{ width: `${CARD_W}vw` }}
                  >
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute -top-3 left-3 font-serif font-bold leading-none select-none pointer-events-none"
                        style={{ fontSize: "5rem", color: "hsl(var(--brand-sage) / 0.18)" }}
                      >
                        "
                      </span>
                    )}
                    <div className="flex gap-1 mb-4 relative">
                      {Array.from({ length: t.stars }).map((_, i) => (
                        <Star key={i} size={13} className="fill-gold text-gold" />
                      ))}
                    </div>
                    <blockquote className="font-sans text-white text-[0.9rem] leading-[1.75] mb-6 relative">
                      "{t.text}"
                    </blockquote>
                    <Author t={t} compact />
                  </article>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mt-10">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={`Ir al testimonio ${i + 1}`}
                className="flex h-11 w-11 items-center justify-center rounded-full transition-[background-color,transform] duration-200 hover:bg-white/5 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
              >
                <span
                  aria-hidden="true"
                  className={[
                    "block rounded-full transition-[width,height,background-color] duration-300",
                    i === current
                      ? "w-8 h-1.5 bg-sage"
                      : "w-2 h-2 bg-copper hover:bg-copper",
                  ].join(" ")}
                />
              </button>
            ))}
          </div>

          <div className="mt-4 mx-auto max-w-[200px] h-px bg-white/10 overflow-hidden">
            <div
              key={`${current}-${isAutoplayPaused}`}
              data-testimonials-progress
              className="h-full bg-sage origin-left"
              style={{
                animation: isAutoplayPaused ? "none" : `progress-bar ${AUTOPLAY_MS}ms linear forwards`,
                width: isAutoplayPaused ? "0%" : "100%",
              }}
            />
          </div>
          </div>
        </Reveal>

      </div>

      <style>{`
        @keyframes star-pop {
          0% { opacity: 0; transform: scale(0.4); }
          60% { opacity: 1; transform: scale(1.15); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateX(8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes progress-bar {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes grow-line {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
    </section>
  );
}

function Author({ t, compact = false }: { t: typeof TESTIMONIALS[number]; compact?: boolean }) {
  const size = compact ? 38 : 44;
  return (
    <div className="flex items-center gap-3">
      <div
        className="rounded-full flex items-center justify-center flex-shrink-0 p-[2px]"
        style={{
          width: size,
          height: size,
          background: "linear-gradient(135deg, hsl(var(--brand-sage)) 0%, hsl(var(--brand-forest-2)) 100%)",
        }}
      >
        <div
          className="w-full h-full rounded-full flex items-center justify-center"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, hsl(var(--brand-forest-2)) 0%, hsl(var(--brand-darker)) 100%)",
            boxShadow: "inset 0 0 0 1px hsl(var(--brand-darker))",
          }}
        >
          <ThumbsUp aria-hidden="true" size={compact ? 15 : 17} strokeWidth={2} className="text-sage" />
        </div>
      </div>
      <div>
        <p className={`font-sans text-white font-semibold ${compact ? "text-xs" : "text-[0.9rem]"}`}>
          {t.name}
        </p>
      </div>
    </div>
  );
}
