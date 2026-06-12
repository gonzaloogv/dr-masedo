import { useEffect, useState } from "react";
import { NAV_LINKS } from "@/lib/site";
import { useActiveSection } from "@/hooks/use-active-section";
import { smoothScrollToHash } from "@/lib/smooth-scroll";
import { cn } from "@/lib/utils";

const SECTION_IDS = NAV_LINKS.map((l) => l.href.replace("#", ""));

/**
 * Indicador de progreso lateral (solo desktop):
 * - Línea vertical con dots por sección
 * - La barra de progreso se interpola entre dots según la posición real
 *   de scroll dentro de cada sección, así siempre coincide con el dot activo.
 */
export function SectionProgress() {
  const activeId = useActiveSection(SECTION_IDS);
  const [progress, setProgress] = useState(0); // 0..1 a lo largo de los dots
  const [showAfterHero, setShowAfterHero] = useState(false);

  useEffect(() => {
    const compute = () => {
      const referenceY = window.scrollY + window.innerHeight * 0.35;

      // Tops de cada sección
      const tops = SECTION_IDS.map((id) => {
        const el = document.getElementById(id);
        return el ? el.getBoundingClientRect().top + window.scrollY : null;
      });

      // Mostrar el indicador una vez que pasamos el Hero (primera sección)
      const firstTop = tops[0] ?? 0;
      const secondTop = tops[1] ?? firstTop + window.innerHeight;
      setShowAfterHero(referenceY > secondTop - window.innerHeight * 0.3);

      // Encontrar índice activo + cuánto avanzamos hacia el siguiente
      let activeIndex = 0;
      for (let i = 0; i < tops.length; i++) {
        const top = tops[i];
        if (top != null && top <= referenceY) activeIndex = i;
      }

      const currentTop = tops[activeIndex] ?? 0;
      const nextTop = tops[activeIndex + 1];
      let intra = 0;
      if (nextTop != null && nextTop > currentTop) {
        intra = Math.min(1, Math.max(0, (referenceY - currentTop) / (nextTop - currentTop)));
      } else if (activeIndex === tops.length - 1) {
        // Última sección: usar fin de documento
        const docEnd = document.documentElement.scrollHeight - window.innerHeight;
        const remaining = Math.max(1, docEnd - currentTop);
        intra = Math.min(1, Math.max(0, (window.scrollY - currentTop) / remaining));
      }

      // Total normalizado: posición del dot activo + fracción al siguiente
      const denom = Math.max(1, SECTION_IDS.length - 1);
      setProgress((activeIndex + intra) / denom);
    };

    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, []);

  const handleClick = (href: string) => {
    smoothScrollToHash(href);
  };

  return (
    <div
      className={cn(
        "hidden lg:flex fixed right-6 xl:right-8 top-1/2 -translate-y-1/2 z-30",
        "transition-opacity duration-500",
        showAfterHero ? "opacity-100" : "opacity-0 pointer-events-none",
      )}
    >
      <div className="relative flex flex-col items-center justify-between py-1 px-2 h-[280px]">
        {/* Línea de fondo */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1.5 bottom-1.5 w-px bg-white/15" />
        {/* Barra de progreso (alineada al recorrido de los dots) */}
        <div
          className="absolute left-1/2 -translate-x-1/2 top-1.5 w-px bg-sage transition-[height] duration-200 ease-out"
          style={{ height: `calc((100% - 12px) * ${progress})` }}
        />

        {NAV_LINKS.map((link) => {
          const id = link.href.replace("#", "");
          const isActive = activeId === id;
          return (
            <button
              key={link.href}
              type="button"
              onClick={() => handleClick(link.href)}
              className="group relative flex items-center justify-center w-3 h-3"
              aria-label={`Ir a ${link.label}`}
            >
              <span
                className={cn(
                  "block rounded-full transition-all duration-300",
                  isActive
                    ? "w-3 h-3 bg-sage shadow-dot-ring"
                    : "w-1.5 h-1.5 bg-white/40 group-hover:bg-white/80",
                )}
              />
              <span
                className={cn(
                  "absolute right-full mr-3 whitespace-nowrap font-sans text-2xs tracking-brand-wide uppercase",
                  "px-2 py-1 rounded bg-dark/90 backdrop-blur text-white",
                  "opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-200 pointer-events-none",
                )}
              >
                {link.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
