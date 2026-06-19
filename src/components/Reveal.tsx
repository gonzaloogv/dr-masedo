import { useEffect, useRef, useState, type ReactNode, type TransitionEvent } from "react";

type RevealPreset = "section" | "text" | "media" | "card";

type RevealProps = {
  children: ReactNode;
  className?: string;
  preset?: RevealPreset;
  clip?: boolean;
  delay?: number; // ms
  duration?: number; // ms
  /** Distancia inicial en px (vertical) */
  y?: number;
  /** Distancia inicial en px (horizontal) */
  x?: number;
  /** Escala inicial */
  scale?: number;
  /** Threshold del IntersectionObserver */
  threshold?: number;
};

type RevealMotionConfig = {
  duration: number;
  threshold: number;
  x: number;
  y: number;
  scale: number;
  clipPath?: string;
};

const DEFAULT_MOTION: RevealMotionConfig = {
  duration: 520,
  threshold: 0.15,
  x: 0,
  y: 16,
  scale: 1,
};

const PRESET_MOTION: Record<RevealPreset, RevealMotionConfig> = {
  section: {
    duration: 500,
    threshold: 0.12,
    x: 0,
    y: 14,
    scale: 1,
  },
  text: {
    duration: 460,
    threshold: 0.18,
    x: 0,
    y: 10,
    scale: 1,
  },
  media: {
    duration: 620,
    threshold: 0.12,
    x: 0,
    y: 12,
    scale: 1.015,
    clipPath: "inset(0 0 12% 0)",
  },
  card: {
    duration: 460,
    threshold: 0.12,
    x: 0,
    y: 12,
    scale: 1,
  },
};

function shouldAnimateReveal() {
  if (typeof window === "undefined") return false;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function shouldUseCompactMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 767px)").matches;
}

/**
 * Animación de entrada premium (fade + transform sutil) al entrar al viewport.
 * Se activa en todos los tamaños de pantalla. Con
 * `prefers-reduced-motion: reduce`, el contenido se muestra visible sin animación.
 */
export function Reveal({
  children,
  className,
  preset,
  clip = true,
  delay = 0,
  duration,
  y,
  x,
  scale,
  threshold,
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [{ animate, startsVisible, compactMotion }] = useState(() => {
    const animate = shouldAnimateReveal();
    return { animate, startsVisible: !animate, compactMotion: shouldUseCompactMotion() };
  });
  const [visible, setVisible] = useState<boolean>(startsVisible);
  const [isRevealing, setIsRevealing] = useState(false);
  const presetMotion = preset ? PRESET_MOTION[preset] : DEFAULT_MOTION;
  const resolvedX = x ?? presetMotion.x;
  const resolvedY = y ?? presetMotion.y;
  const hiddenX = compactMotion ? 0 : resolvedX;
  const hiddenY = compactMotion
    ? resolvedX !== 0 && resolvedY === 0
      ? 12
      : Math.sign(resolvedY || 1) * Math.min(Math.abs(resolvedY), 12)
    : resolvedY;
  const resolvedScale = scale ?? presetMotion.scale;
  const resolvedDuration = duration ?? presetMotion.duration;
  const resolvedThreshold = threshold ?? presetMotion.threshold;
  const usesClipReveal = clip && Boolean(presetMotion.clipPath);

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
                setIsRevealing(true);
                setVisible(true);
                observer?.disconnect();
              }
            });
          },
          { threshold: resolvedThreshold, rootMargin: "0px 0px -40px 0px" },
        );
        observer.observe(node);
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      observer?.disconnect();
    };
  }, [animate, resolvedThreshold]);

  const transitionProperty = usesClipReveal ? "opacity, transform, clip-path" : "opacity, transform";
  const hiddenTransform = `translate3d(${hiddenX}px, ${hiddenY}px, 0) scale(${resolvedScale})`;
  const visibleTransform = "translate3d(0, 0, 0) scale(1)";
  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.currentTarget !== event.target) return;
    if (
      event.propertyName === "opacity" ||
      event.propertyName === "transform" ||
      event.propertyName === "clip-path"
    ) {
      setIsRevealing(false);
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      onTransitionEnd={handleTransitionEnd}
      style={{
        opacity: animate ? (visible ? 1 : 0) : 1,
        transform: animate ? (visible ? visibleTransform : hiddenTransform) : "none",
        clipPath: usesClipReveal && animate
          ? visible
            ? "inset(0 0 0 0)"
            : presetMotion.clipPath
          : undefined,
        transitionProperty: animate ? transitionProperty : "none",
        transitionDuration: `${resolvedDuration}ms`,
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        transitionDelay: `${delay}ms`,
        willChange: animate && isRevealing ? transitionProperty : "auto",
      }}
    >
      {children}
    </div>
  );
}
