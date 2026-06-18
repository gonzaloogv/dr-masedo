import { useEffect, useState } from "react";

/**
 * Devuelve el id de la sección actualmente visible en el viewport.
 * Usa el punto de referencia a ~35% desde arriba del viewport:
 * la sección activa es la última cuyo top está por encima de ese punto.
 */
export function useActiveSection(sectionIds: string[]) {
  const [activeId, setActiveId] = useState<string>(sectionIds[0] ?? "");

  useEffect(() => {
    let frame = 0;

    const compute = () => {
      const referenceY = window.scrollY + window.innerHeight * 0.35;
      let current = sectionIds[0] ?? "";
      let bestTop = -Infinity;

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top + window.scrollY;
        if (top <= referenceY && top > bestTop) {
          bestTop = top;
          current = id;
        }
      }
      setActiveId(current);
    };

    const scheduleCompute = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        compute();
      });
    };

    compute();
    window.addEventListener("scroll", scheduleCompute, { passive: true });
    window.addEventListener("resize", scheduleCompute);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleCompute);
      window.removeEventListener("resize", scheduleCompute);
    };
  }, [sectionIds]);

  return activeId;
}
