import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode, TouchEvent } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const TESTIMONIALS = [
  { id: 1, name: "Valentina M.", age: 32, procedure: "Rinoplastia", initials: "VM", stars: 5,
    text: "El Dr. Masedo superó todas mis expectativas. Desde la primera consulta sentí una confianza inmediata: explicó todo el procedimiento con paciencia, escuchó mis deseos y el resultado fue absolutamente natural. Recuperé mi autoestima." },
  { id: 2, name: "Carolina R.", age: 41, procedure: "Lifting Facial", initials: "CR", stars: 5,
    text: "Después de investigar durante meses, elegí al Dr. Masedo y no me arrepiento. El seguimiento post-operatorio fue impecable y hoy, a un año de la cirugía, me siento diez años más joven. Profesionalismo absoluto." },
  { id: 3, name: "Lucía A.", age: 28, procedure: "Mamoplastia de Aumento", initials: "LA", stars: 5,
    text: "Un médico extraordinario que entiende que la cirugía plástica no es vanidad, es bienestar. Los resultados son increíbles, totalmente naturales. Me atendió en todo momento con respeto y seriedad." },
  { id: 4, name: "Marcela T.", age: 47, procedure: "Abdominoplastia", initials: "MT", stars: 5,
    text: "Luego de mi pérdida de peso necesitaba esta intervención y el Dr. Masedo fue la elección perfecta. El equipo de clínica es maravilloso, las instalaciones son de primer nivel y el resultado cambió mi vida." },
  { id: 5, name: "Sofía G.", age: 35, procedure: "Bichectomía", initials: "SG", stars: 5,
    text: "Desde la consulta inicial hasta la última revisión, el trato fue excelente. El Dr. Masedo tiene una capacidad única para entender qué quiere el paciente y plasmarlo en un resultado bello y equilibrado." },
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
  const [isPaused, setIsPaused] = useState(false);
  const total = TESTIMONIALS.length;
  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [isPaused, next]);

  const touchStartX = useRef<number | null>(null);
  const dragOffset = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const CARD_W = 65, GAP = 5, OFFSET = 17.5;
  const SLOT = CARD_W + GAP;
  const trackTransform = (idx: number, drag = 0) =>
    `translateX(calc(${OFFSET}vw - ${idx * SLOT}vw + ${drag}px))`;

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
    if (trackRef.current) trackRef.current.style.transition = "transform 350ms ease-out";
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
        <div className="text-center mb-14 lg:mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="h-px bg-copper opacity-40 animate-[grow-line_900ms_ease-out_both]" style={{ width: "3rem" }} />
            <span className="font-sans text-xs tracking-brand-widest uppercase text-sage">Testimonios</span>
            <span className="h-px bg-copper opacity-40 animate-[grow-line_900ms_ease-out_both]" style={{ width: "3rem" }} />
          </div>
          <h2 id="testimonios-title" className="h-display-light text-white">
            Lo que dicen <span className="text-sage">nuestros pacientes</span>
          </h2>
          <p className="font-sans text-sage/90 text-sm md:text-base mt-4 max-w-xl mx-auto">
            Comentarios sobre la experiencia de atención, confianza y seguimiento
          </p>
        </div>

        <div
          className="relative"
          style={{ overflow: "visible" }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
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
                      ? "p-10 scale-[1.02] opacity-100 border-t-2 border-sage shadow-card-hero animate-[fade-in_500ms_ease-out_both]"
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
                        className="fill-gold text-gold animate-[star-pop_500ms_ease-out_both]"
                        style={{ animationDelay: `${i * 80}ms` }}
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

          <div className="lg:hidden overflow-hidden w-screen -mx-6">
            <div
              ref={trackRef}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="flex"
              style={{
                gap: `${GAP}vw`,
                width: `${total * SLOT + OFFSET}vw`,
                transform: trackTransform(current),
                transition: "transform 350ms ease-out",
                willChange: "transform",
              }}
            >
              {TESTIMONIALS.map((t, idx) => {
                const isActive = idx === current;
                return (
                  <article
                    key={t.id}
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
              key={`${current}-${isPaused}`}
              className="h-full bg-sage origin-left"
              style={{
                animation: isPaused ? "none" : `progress-bar ${AUTOPLAY_MS}ms linear forwards`,
                width: isPaused ? "0%" : "100%",
              }}
            />
          </div>
        </div>

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
          <span className={`font-sans font-semibold text-sage ${compact ? "text-2xs" : "text-xs"}`}>
            {t.initials}
          </span>
        </div>
      </div>
      <div>
        <p className={`font-sans text-white font-semibold ${compact ? "text-xs" : "text-[0.9rem]"}`}>
          {t.name}
        </p>
        <p className={`font-sans text-sage ${compact ? "text-xs" : "text-xs"}`}>
          {t.procedure} · {t.age} años
        </p>
      </div>
    </div>
  );
}
