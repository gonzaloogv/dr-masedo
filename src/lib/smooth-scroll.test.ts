import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { smoothScrollToHash } from "@/lib/smooth-scroll";

function mockMatchMedia(matches: boolean) {
  vi.stubGlobal("matchMedia", vi.fn((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })));
}

function createTarget(id: string) {
  const target = document.createElement("section");
  target.id = id;
  target.scrollIntoView = vi.fn();
  document.body.append(target);
  return target;
}

describe("smoothScrollToHash", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockMatchMedia(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("resolves the target after the mobile menu delay", () => {
    smoothScrollToHash("#late-target", 320);

    const target = createTarget("late-target");

    vi.advanceTimersByTime(319);
    expect(target.scrollIntoView).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(target.scrollIntoView).toHaveBeenCalledWith({
      block: "start",
      behavior: "smooth",
    });
  });

  it("cancels a pending delayed scroll when a new target is requested", () => {
    const firstTarget = createTarget("first-target");
    const secondTarget = createTarget("second-target");

    smoothScrollToHash("#first-target", 320);
    smoothScrollToHash("#second-target");

    expect(secondTarget.scrollIntoView).toHaveBeenCalledWith({
      block: "start",
      behavior: "smooth",
    });

    vi.advanceTimersByTime(320);
    expect(firstTarget.scrollIntoView).not.toHaveBeenCalled();
  });

  it("uses an automatic scroll behavior when reduced motion is preferred", () => {
    mockMatchMedia(true);
    const target = createTarget("reduced-motion-target");

    smoothScrollToHash("#reduced-motion-target");

    expect(target.scrollIntoView).toHaveBeenCalledWith({
      block: "start",
      behavior: "auto",
    });
  });
});
