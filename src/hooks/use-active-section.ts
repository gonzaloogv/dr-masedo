import { useEffect, useState } from "react";

/**
 * Devuelve el id de la sección actualmente visible en el viewport.
 * Usa el punto de referencia a ~35% desde arriba del viewport:
 * la sección activa es la última cuyo top está por encima de ese punto.
 */
export function useActiveSection(sectionIds: string[]) {
  const [activeId, setActiveId] = useState<string>(sectionIds[0] ?? "");

  useEffect(() => {
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

    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, [sectionIds]);

  return activeId;
}
