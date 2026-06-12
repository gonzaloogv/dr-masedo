import { useEffect, useRef, useState } from "react";
import { openWhatsApp } from "@/lib/site";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";

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
  { value: 98, suffix: "%", label: "Pacientes satisfechos", format: "plain" },
];

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
      // easeOutCubic
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
  const scrollToAbout = () =>
    document.querySelector("#sobre-mi")?.scrollIntoView({ behavior: "smooth" });

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
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://res.cloudinary.com/dlligh5yj/video/upload/Video_portada_mtihyy.mp4"
            type="video/mp4"
          />
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
        <p className="font-sans text-xs tracking-brand-ultra uppercase text-sage mb-6">
          Cirugía Plástica Reconstructiva, Quemados y Clínica Estética
        </p>

        <h1
          className="text-white mb-2 font-sans font-light leading-[1.1]"
          style={{ fontSize: "clamp(3rem, 8vw, 6.5rem)" }}
        >
          Dr. Masedo
        </h1>
        <h1
          className="mb-8 italic font-serif font-medium text-sage leading-[1.1]"
          style={{ fontSize: "clamp(3rem, 8vw, 6.5rem)" }}
        >
          Carlos Dante
        </h1>

        <div className="flex items-center justify-center gap-4 mb-10">
          <div className="h-px w-16 bg-copper" />
          <p className="font-sans text-xs tracking-brand-wider uppercase text-white/70">
            Estética · Reconstructiva · Confianza
          </p>
          <div className="h-px w-16 bg-copper" />
        </div>

        <p className="font-sans text-white/60 max-w-xl mx-auto mb-12 leading-[1.8]">
          Más de 35 años de experiencia transformando vidas con técnicas de vanguardia,
          resultados naturales y un trato verdaderamente humano.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={openWhatsApp} className="btn-primary">Solicitar consulta</button>
          <a
            href="#sobre-mi"
            onClick={(e) => { e.preventDefault(); scrollToAbout(); }}
            className="btn-outline"
          >
            Conocer más
          </a>
        </div>
      </div>


      {/* Stats Bar — visible también en mobile */}
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
