import { createEvent, fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Reveal } from "@/components/Reveal";

let intersectionCallback: IntersectionObserverCallback | null = null;
let rafQueue: FrameRequestCallback[] = [];
const originalIntersectionObserver = window.IntersectionObserver;

function mockMatchMedia({ reduce = false, mobile = false } = {}) {
  vi.stubGlobal("matchMedia", vi.fn((query: string) => ({
    matches: query.includes("prefers-reduced-motion") ? reduce : mobile,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })));
}

class ControlledIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds = [];

  constructor(callback: IntersectionObserverCallback) {
    intersectionCallback = callback;
  }

  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
}

function flushAnimationFrame() {
  const queue = rafQueue;
  rafQueue = [];
  queue.forEach((callback) => callback(performance.now()));
}

function reveal(element: Element) {
  act(() => {
    flushAnimationFrame();
    flushAnimationFrame();
    intersectionCallback?.(
      [{ isIntersecting: true, target: element } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
  });
}

describe("Reveal", () => {
  beforeEach(() => {
    intersectionCallback = null;
    rafQueue = [];
    mockMatchMedia();
    window.IntersectionObserver = ControlledIntersectionObserver;
    vi.stubGlobal("requestAnimationFrame", vi.fn((callback: FrameRequestCallback) => {
      rafQueue.push(callback);
      return rafQueue.length;
    }));
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
  });

  afterEach(() => {
    window.IntersectionObserver = originalIntersectionObserver;
    vi.unstubAllGlobals();
  });

  it("uses a restrained default reveal duration", () => {
    render(<Reveal><span>Contenido</span></Reveal>);

    const wrapper = screen.getByText("Contenido").parentElement;

    expect(wrapper).toHaveStyle("transition-duration: 520ms");
  });

  it("uses premium preset defaults for cards and media", () => {
    render(
      <>
        <Reveal preset="card"><span>Card</span></Reveal>
        <Reveal preset="media"><span>Media</span></Reveal>
      </>,
    );

    const card = screen.getByText("Card").parentElement;
    const media = screen.getByText("Media").parentElement;

    expect(card).toHaveStyle("transition-duration: 460ms");
    expect(card?.style.transform).toBe("translate3d(0px, 12px, 0) scale(1)");
    expect(media).toHaveStyle("transition-duration: 620ms");
    expect(media).toHaveStyle("transition-property: opacity, transform, clip-path");
    expect(media?.style.transform).toBe("translate3d(0px, 12px, 0) scale(1.015)");
    expect(media).toHaveStyle("clip-path: inset(0 0 12% 0)");
  });

  it("keeps mobile reveal motion vertical even when a desktop x offset is provided", () => {
    mockMatchMedia({ mobile: true });

    render(<Reveal x={24} y={0}><span>Mobile</span></Reveal>);

    const wrapper = screen.getByText("Mobile").parentElement;

    expect(wrapper?.style.transform).toBe("translate3d(0px, 12px, 0) scale(1)");
  });

  it("reveals media with a subtle clip and scale transition", () => {
    render(<Reveal preset="media"><span>Media</span></Reveal>);

    const wrapper = screen.getByText("Media").parentElement;

    reveal(wrapper!);

    expect(wrapper?.style.transform).toBe("translate3d(0, 0, 0) scale(1)");
    expect(wrapper).toHaveStyle("clip-path: inset(0 0 0 0)");
    expect(wrapper).toHaveStyle("will-change: opacity, transform, clip-path");
  });

  it("can keep media motion without clipping decorative overflow", () => {
    render(<Reveal preset="media" clip={false}><span>Media sin recorte</span></Reveal>);

    const wrapper = screen.getByText("Media sin recorte").parentElement;

    expect(wrapper).toHaveStyle("transition-duration: 620ms");
    expect(wrapper).toHaveStyle("transition-property: opacity, transform");
    expect(wrapper?.style.transform).toBe("translate3d(0px, 12px, 0) scale(1.015)");
    expect(wrapper?.style.clipPath).toBe("");
  });

  it("only hints will-change while the reveal transition is running", () => {
    render(<Reveal><span>Contenido</span></Reveal>);

    const wrapper = screen.getByText("Contenido").parentElement;
    expect(wrapper).toHaveStyle("will-change: auto");

    reveal(wrapper!);
    expect(wrapper).toHaveStyle("will-change: opacity, transform");

    act(() => {
      const transitionEnd = createEvent.transitionEnd(wrapper!);
      Object.defineProperty(transitionEnd, "propertyName", { value: "transform" });
      fireEvent(wrapper!, transitionEnd);
    });
    expect(wrapper).toHaveStyle("will-change: auto");
  });
});
