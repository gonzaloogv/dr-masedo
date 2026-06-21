import { useEffect, useRef, useState } from "react";
import { openWhatsApp } from "@/lib/site";
import { smoothScrollToHash } from "@/lib/smooth-scroll";

type Stat = {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  format?: "plain" | "thousands";
};

const STATS: Stat[] = [
  { value: 35, suffix: "+", label: "Años de experiencia", format: "plain" },
  { value: 3200, suffix: "+", label: "Procedimientos realizados", format: "thousands" },
  { value: 15, suffix: "+", label: "Servicios disponibles", format: "plain" },
];

const HERO_VIDEO_WEBM =
  "https://res.cloudinary.com/dz9tuwczf/video/upload/v1781273346/hero-bg-optimizado_hcq1aj.webm";
const HERO_VIDEO_MP4 =
  "https://res.cloudinary.com/dz9tuwczf/video/upload/v1781273343/hero-bg-optimizado_ezlkoo.mp4";
const HERO_POSTER =
  "https://res.cloudinary.com/dz9tuwczf/image/upload/v1781273535/Screenshot_2026-06-12_111155_edited_jfkl6s.png";

function formatNumber(n: number, format: Stat["format"]) {
  const rounded = Math.round(n);
  if (format === "thousands") return rounded.toLocaleString("es-AR");
  return String(rounded);
}

function AnimatedCounter({ stat, start }: { stat: Stat; start: boolean }) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!start) return;
    const duration = 1800;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(eased * stat.value);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [start, stat.value]);

  return (
    <span className="font-sans text-white text-2xl sm:text-3xl font-semibold whitespace-nowrap tabular-nums">
      {stat.prefix ?? ""}
      {formatNumber(current, stat.format)}
      {stat.suffix ?? ""}
    </span>
  );
}

export function Hero() {
  const scrollToAbout = () => smoothScrollToHash("#sobre-mi");

  const statsRef = useRef<HTMLDivElement | null>(null);
  const [startCount, setStartCount] = useState(false);

  useEffect(() => {
    if (!statsRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setStartCount(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 },
    );
    observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="inicio"
      aria-labelledby="inicio-title"
      className="relative w-full min-h-[100dvh] flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={HERO_POSTER}
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        >
          <source src={HERO_VIDEO_WEBM} type="video/webm" />
          <source src={HERO_VIDEO_MP4} type="video/mp4" />
        </video>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, hsl(var(--brand-darker) / 0.92) 0%, hsl(var(--brand-dark) / 0.85) 50%, hsl(var(--brand-forest-2) / 0.7) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto w-full pt-24 pb-32 sm:pb-28">
        <p className="mx-auto mb-6 max-w-[20rem] font-sans text-[10px] sm:text-xs tracking-brand-wider sm:tracking-brand-ultra uppercase text-sage leading-relaxed">
          Cirugía Plástica Reconstructiva, Quemados y Clínica Estética
        </p>

        <h1
          id="inicio-title"
          className="text-white mb-2 font-sans font-light leading-[1.1]"
          style={{ fontSize: "clamp(3rem, 8vw, 6.5rem)" }}
        >
          <span className="block">Dr. Masedo</span>
          {" "}
          <span className="block mt-2 mb-8 italic font-serif font-medium text-sage">
            Carlos Dante
          </span>
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-10">
          <div className="h-px w-14 sm:w-16 bg-copper" />
          <p className="max-w-[14rem] sm:max-w-none text-center font-sans text-xs tracking-brand-tight sm:tracking-brand-wider uppercase text-white/70 leading-relaxed">
            Estética · Reconstructiva · Confianza
          </p>
          <div className="h-px w-14 sm:w-16 bg-copper" />
        </div>

        <p className="font-sans text-white/75 max-w-xl mx-auto mb-12 leading-[1.8] px-1">
          Más de 35 años de experiencia transformando vidas con técnicas de vanguardia,
          resultados naturales y un trato verdaderamente humano.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={() => openWhatsApp()} className="btn-primary">Solicitar consulta</button>
          <a
            href="#sobre-mi"
            onClick={(e) => { e.preventDefault(); scrollToAbout(); }}
            className="btn-outline"
          >
            Conocer más
          </a>
        </div>
      </div>

      <div
        ref={statsRef}
        className="absolute bottom-0 left-0 right-0 grid grid-cols-3 backdrop-blur"
        style={{
          backgroundColor: "hsl(var(--brand-dark) / 0.9)",
          borderTop: "1px solid hsl(var(--brand-sage) / 0.15)",
        }}
      >
        {STATS.map((stat, i) => (
          <div
            key={stat.label}
            className="flex flex-col items-center justify-center py-4 sm:py-5 px-2"
            style={{ borderRight: i < 2 ? "1px solid hsl(var(--brand-sage) / 0.2)" : "none" }}
            aria-label={`${formatNumber(stat.value, stat.format)}${stat.suffix ?? ""} ${stat.label}`}
          >
            <AnimatedCounter stat={stat} start={startCount} />
            <span className="font-sans text-sage text-3xs sm:text-2xs tracking-brand-tight uppercase mt-1 text-center leading-tight">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
