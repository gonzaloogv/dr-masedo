const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

let activeScrollFrame: number | null = null;

export function smoothScrollToHash(hash: string, delay = 0) {
  const target = document.querySelector<HTMLElement>(hash);
  if (!target) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    target.scrollIntoView({ block: "start" });
    return;
  }

  const start = window.scrollY;
  const end = target.getBoundingClientRect().top + window.scrollY;
  const distance = end - start;
  const duration = Math.min(1200, Math.max(650, Math.abs(distance) * 0.45));
  const startScroll = () => {
    if (activeScrollFrame) cancelAnimationFrame(activeScrollFrame);
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, start + distance * easeInOutCubic(progress));
      if (progress < 1) activeScrollFrame = requestAnimationFrame(tick);
      else activeScrollFrame = null;
    };

    activeScrollFrame = requestAnimationFrame(tick);
  };

  if (delay > 0) window.setTimeout(startScroll, delay);
  else startScroll();
}
