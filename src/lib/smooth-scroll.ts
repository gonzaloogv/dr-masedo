let pendingScrollTimer: number | null = null;

function scrollToHash(hash: string) {
  const target = document.querySelector<HTMLElement>(hash);
  if (!target) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  target.scrollIntoView({
    block: "start",
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });
}

export function smoothScrollToHash(hash: string, delay = 0) {
  if (pendingScrollTimer) {
    window.clearTimeout(pendingScrollTimer);
    pendingScrollTimer = null;
  }

  if (delay > 0) {
    pendingScrollTimer = window.setTimeout(() => {
      pendingScrollTimer = null;
      scrollToHash(hash);
    }, delay);
    return;
  }

  scrollToHash(hash);
}
