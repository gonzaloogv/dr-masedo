import { useEffect, useRef, useState, ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number; // ms
  duration?: number; // ms
  as?: keyof JSX.IntrinsicElements;
  /** Distancia inicial en px (vertical) */
  y?: number;
  /** Distancia inicial en px (horizontal) */
  x?: number;
  /** Escala inicial */
  scale?: number;
  /** Threshold del IntersectionObserver */
  threshold?: number;
};

/**
 * Animación de entrada premium (fade + transform sutil) al entrar al viewport.
 * Solo se activa en desktop (lg+: ≥1024px). En mobile/tablet y con
 * `prefers-reduced-motion: reduce`, el contenido se muestra visible sin animación.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  duration = 700,
  as: Tag = "div",
  y = 16,
  x = 0,
  scale = 1,
  threshold = 0.15,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  // Detectar reduced-motion de forma síncrona para el primer render
  // y evitar el flash de "oculto" cuando no se debe animar.
  const getInitialAnimate = () => {
    if (typeof window === "undefined") return false;
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };
  const [animate] = useState<boolean>(getInitialAnimate);
  const [visible, setVisible] = useState<boolean>(!getInitialAnimate());

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (!animate) return;

    let raf1 = 0;
    let raf2 = 0;
    let observer: IntersectionObserver | null = null;

    // Esperar 2 frames para garantizar que el navegador pinte el estado
    // oculto antes de que el observer pueda dispararlo a visible.
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setVisible(true);
                observer?.disconnect();
              }
            });
          },
          { threshold, rootMargin: "0px 0px -40px 0px" },
        );
        observer.observe(node);
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      observer?.disconnect();
    };
  }, [animate, threshold]);

  const Comp = Tag as any;

  const hiddenTransform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  const visibleTransform = "translate3d(0, 0, 0) scale(1)";

  return (
    <Comp
      ref={ref as any}
      className={cn("will-change-transform", className)}
      style={{
        opacity: animate ? (visible ? 1 : 0) : 1,
        transform: animate ? (visible ? visibleTransform : hiddenTransform) : "none",
        transitionProperty: animate ? "opacity, transform" : "none",
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </Comp>
  );
}
