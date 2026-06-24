import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "@/App";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
});

describe("landing", () => {
  it("renders the doctor landing page", () => {
    render(<App />);

    expect(screen.getAllByText(/Masedo Carlos Dante/i).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: /solicitar consulta/i }).length).toBeGreaterThan(0);
  });

  it("uses the optimized hero video sources with mp4 fallback and poster", () => {
    const { container } = render(<App />);

    const video = container.querySelector("section#inicio video");
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute(
      "poster",
      "https://res.cloudinary.com/dz9tuwczf/image/upload/v1781273535/Screenshot_2026-06-12_111155_edited_jfkl6s.png"
    );

    const webm = container.querySelector('section#inicio source[type="video/webm"]');
    const mp4 = container.querySelector('section#inicio source[type="video/mp4"]');
    expect(webm).toHaveAttribute(
      "src",
      "https://res.cloudinary.com/dz9tuwczf/video/upload/v1781273346/hero-bg-optimizado_hcq1aj.webm"
    );
    expect(mp4).toHaveAttribute(
      "src",
      "https://res.cloudinary.com/dz9tuwczf/video/upload/v1781273343/hero-bg-optimizado_ezlkoo.mp4"
    );
  });

  it("uses remote clinic photos and service-focused hero stats", () => {
    const { container } = render(<App />);

    expect(screen.getByLabelText("15+ Servicios disponibles")).toBeInTheDocument();
    expect(screen.getByText(/servicios disponibles/i)).toBeInTheDocument();
    expect(screen.queryByText("98%")).not.toBeInTheDocument();

    const aboutImage = container.querySelector('img[alt*="cirujano plástico"]');
    const trainingImage = container.querySelector('img[alt*="Consultorios Güemes"]');
    expect(aboutImage).toHaveAttribute(
      "src",
      "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/consultorio_dante_masedo-37_pmuhop.jpg"
    );
    expect(trainingImage).toHaveAttribute(
      "src",
      "https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/consultorio_dante_masedo-17_1_eyvvya.jpg"
    );
  });

  it("keeps the About portrait frame and certification badge outside reveal clipping", () => {
    const { container } = render(<App />);

    const aboutImage = container.querySelector<HTMLImageElement>('#sobre-mi img[src*="consultorio_dante_masedo-37"]');
    const revealWrapper = aboutImage?.parentElement?.parentElement as HTMLElement | null;
    const frame = revealWrapper?.querySelector<HTMLDivElement>(".absolute.-top-6.-left-6");
    const badge = revealWrapper?.querySelector<HTMLDivElement>(".absolute.bottom-8.-right-6");

    expect(revealWrapper?.style.clipPath).toBe("");
    expect(frame).toBeInTheDocument();
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent(/Dr\. Masedo Carlos Dante/i);
  });

  it("keeps gallery and testimonial controls outside reveal clipping", () => {
    const { container } = render(<App />);

    const galleryStage = container.querySelector<HTMLElement>("[data-gallery-motion-stage]");
    const galleryReveal = galleryStage?.parentElement as HTMLElement | null;

    const testimonialsCarousel = Array.from(
      container.querySelectorAll<HTMLElement>("#testimonios div")
    ).find(
      (element) =>
        element.style.overflow === "visible" &&
        element.querySelector('button[aria-label="Anterior"]') &&
        element.querySelector('button[aria-label="Siguiente"]')
    );
    const testimonialsReveal = testimonialsCarousel?.parentElement as HTMLElement | null;

    expect(galleryReveal?.style.clipPath).toBe("");
    expect(galleryReveal?.style.transitionProperty).toBe("opacity, transform");
    expect(testimonialsReveal?.style.clipPath).toBe("");
    expect(testimonialsReveal?.style.transitionProperty).toBe("opacity, transform");
  });

  it("removes Google review claims and keeps contact actions accessible", () => {
    render(<App />);

    expect(screen.queryByText(/reseñas verificadas en google/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /03624-428782/i })).toHaveAttribute(
      "href",
      "tel:+543624428782"
    );
    expect(screen.getByRole("link", { name: /dantemasedo@hotmail.com/i })).toHaveAttribute(
      "href",
      "mailto:dantemasedo@hotmail.com"
    );

    const menuButton = screen.getByRole("button", { name: /abrir menú/i });
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    expect(menuButton).toHaveAttribute("aria-controls", "mobile-menu");
  });

  it("ships valid crawler files for production SEO", () => {
    const indexPath = resolve(process.cwd(), "index.html");
    const robotsPath = resolve(process.cwd(), "public", "robots.txt");
    const sitemapPath = resolve(process.cwd(), "public", "sitemap.xml");
    const siteConfigPath = resolve(process.cwd(), "src", "lib", "site.ts");

    expect(existsSync(indexPath)).toBe(true);
    expect(existsSync(robotsPath)).toBe(true);
    expect(existsSync(sitemapPath)).toBe(true);

    const index = readFileSync(indexPath, "utf8");
    const robots = readFileSync(robotsPath, "utf8");
    const siteConfig = readFileSync(siteConfigPath, "utf8");
    const oldDomain = ["drmasedo", "com", "ar"].join(".");

    expect([index, robots, siteConfig].join("\n")).not.toContain(oldDomain);
    expect(index).toContain('href="https://drmasedo.com/"');
    expect(index).toContain('content="https://drmasedo.com/"');
    expect(index).toContain('"@id": "https://drmasedo.com/#physician"');
    expect(index).toContain('"url": "https://drmasedo.com/"');
    expect(robots).toMatch(/^User-agent:\s*\*$/m);
    expect(robots).toMatch(/^Allow:\s*\/$/m);
    expect(robots).toMatch(/^Sitemap:\s*https:\/\/drmasedo\.com\/sitemap\.xml$/m);
    expect(robots).not.toMatch(/<!doctype|<html/i);

    const sitemap = readFileSync(sitemapPath, "utf8");

    expect(sitemap).not.toContain(oldDomain);
    expect(sitemap).toContain("<loc>https://drmasedo.com/</loc>");
  });

  it("declares production favicon and social preview assets", () => {
    const indexPath = resolve(process.cwd(), "index.html");
    const imagePath = (...segments: string[]) => resolve(process.cwd(), "public", "images", ...segments);

    expect(existsSync(imagePath("favicon.svg"))).toBe(true);
    expect(existsSync(imagePath("apple-touch-icon.png"))).toBe(true);
    expect(existsSync(imagePath("icon-192.png"))).toBe(true);
    expect(existsSync(imagePath("icon-512.png"))).toBe(true);
    expect(existsSync(imagePath("og-image.png"))).toBe(true);

    const index = readFileSync(indexPath, "utf8");

    expect(index).toContain('<link rel="icon" type="image/svg+xml" href="/images/favicon.svg" />');
    expect(index).toContain('<link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png" />');
    expect(index).toContain('<link rel="icon" type="image/png" sizes="192x192" href="/images/icon-192.png" />');
    expect(index).toContain('<link rel="icon" type="image/png" sizes="512x512" href="/images/icon-512.png" />');
    expect(index).toContain('<meta property="og:image" content="https://drmasedo.com/images/og-image.png" />');
    expect(index).toContain('<meta name="twitter:image" content="https://drmasedo.com/images/og-image.png" />');
  });

  it("shows result CTAs only for services with linked clinical photos", () => {
    render(<App />);

    expect(
      screen.getByRole("button", { name: /ver resultados de abdominoplast/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /ver resultados de aumento de mamas/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /ver resultados de rinoplastia/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /ver resultados de liposucci/i })
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /ver todos los servicios/i }));
    expect(
      screen.getByRole("button", { name: /ver resultados de mastopexia/i })
    ).toBeInTheDocument();
  });

  it("opens a procedure-specific result modal from Services", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /ver resultados de abdominoplast/i }));

    const dialog = screen.getByRole("dialog", { name: /abdominoplast/i });
    expect(within(dialog).getByRole("img", { name: /abdominoplastia/i })).toHaveAttribute(
      "src",
      expect.stringContaining("abdominoplastia-01")
    );
    expect(within(dialog).getByRole("img", { name: /abdominoplastia/i })).not.toHaveAttribute(
      "src",
      expect.stringContaining("/t_mobile/")
    );
    expect(within(dialog).queryByText(/mamoplastia/i)).not.toBeInTheDocument();
    expect(within(dialog).getByText(/1 \/ 3/i)).toBeInTheDocument();
  });

  it("keeps result CTAs visually distinct and touch controls large enough", () => {
    render(<App />);

    const resultButtons = screen.getAllByRole("button", { name: /ver resultados/i });
    expect(resultButtons.length).toBeGreaterThan(0);
    expect(resultButtons[0].className).toMatch(/text-copper/);

    const firstTestimonialDot = screen.getByRole("button", {
      name: /ir al testimonio 1/i,
    });
    expect(firstTestimonialDot.className).toContain("h-11");
    expect(firstTestimonialDot.className).toContain("w-11");

    const footerTopButton = screen.getByRole("button", { name: /volver arriba/i });
    expect(footerTopButton.className).toContain("h-11");
    expect(footerTopButton.className).toContain("w-11");
  });

  it("renders gallery procedure catalogs instead of the old carousel", () => {
    const { container } = render(<App />);
    const gallery = container.querySelector<HTMLElement>("#galeria");
    expect(gallery).toBeInTheDocument();
    if (!gallery) return;

    expect(gallery.querySelector("[data-gallery-catalogs]")).toBeInTheDocument();
    expect(gallery.querySelector("[data-gallery-carousel]")).not.toBeInTheDocument();
    expect(gallery.querySelector("[data-gallery-mosaic]")).not.toBeInTheDocument();
    expect(gallery.querySelector("[data-carousel-track]")).not.toBeInTheDocument();
    expect(gallery.querySelectorAll("[data-gallery-dot]").length).toBe(0);

    [
      "Mamas",
      "Rostro",
      "Cuerpo",
      "Cirugia masculina",
      "Capilar",
      "Medicina estetica",
      "Piel y laser",
    ].forEach((label) => {
      expect(within(gallery).getByRole("button", { name: new RegExp(label, "i") })).toBeInTheDocument();
    });

    const catalogCards = gallery.querySelectorAll("[data-gallery-catalog]");
    expect(catalogCards.length).toBe(7);
    catalogCards.forEach((card) => {
      expect(card.className).toContain("min-h-11");
      expect(card.className).toContain("transition-");
    });
  });

  it("preserves the gallery section visual identity while using the new catalog layout", () => {
    const { container } = render(<App />);
    const gallery = container.querySelector<HTMLElement>("#galeria");
    expect(gallery).toBeInTheDocument();
    if (!gallery) return;

    expect(gallery.className).toContain("bg-dark");
    expect(gallery.className).toContain("py-20");
    expect(gallery.className).toContain("md:py-28");
    expect(gallery.className).toContain("lg:py-32");
    expect(gallery.className).not.toContain("bg-[#f4f1ec]");

    const eyebrow = within(gallery).getByText(/^Resultados$/i);
    expect(eyebrow.className).toContain("font-sans");
    expect(eyebrow.className).toContain("tracking-brand-widest");
    expect(eyebrow.className).toContain("text-sage");

    const heading = within(gallery).getByRole("heading", { name: /galer.a de trabajos/i });
    expect(heading.className).toContain("h-display-light");
    expect(heading.className).toContain("text-white");
  });

  it("uses desktop vertical catalog labels and mobile collapse motion states", () => {
    const { container } = render(<App />);
    const gallery = container.querySelector<HTMLElement>("#galeria");
    expect(gallery).toBeInTheDocument();
    if (!gallery) return;

    const catalogPanel = gallery.querySelector<HTMLElement>("[data-gallery-catalogs]");
    const servicesPanel = gallery.querySelector<HTMLElement>("[data-gallery-services]");
    expect(catalogPanel).toHaveAttribute("data-state", "open");
    expect(catalogPanel).toHaveAttribute("data-gallery-mobile-collapse", "true");
    expect(catalogPanel?.className).toContain("transition-[max-height,opacity,transform,gap]");
    expect(catalogPanel?.className).toContain("max-h-[2000px]");
    expect(catalogPanel?.className).not.toContain("max-h-[1400px]");
    expect(catalogPanel?.className).toContain("lg:h-[540px]");
    expect(servicesPanel).toHaveAttribute("data-state", "closed");
    expect(servicesPanel?.className).toContain("grid-rows-[0fr]");

    const firstCatalog = gallery.querySelector<HTMLElement>("[data-gallery-catalog]");
    const countBadge = firstCatalog?.querySelector<HTMLElement>("[data-gallery-service-count]");
    const bottomGradient = firstCatalog?.querySelector<HTMLElement>("[data-gallery-bottom-gradient]");
    const firstCatalogDesktopPreview = firstCatalog?.querySelector<HTMLImageElement>("img");
    const firstCatalogSources = Array.from(
      firstCatalog?.querySelectorAll<HTMLSourceElement>("picture source") ?? []
    );
    const verticalName = firstCatalog?.querySelector<HTMLElement>("[data-gallery-catalog-name-vertical]");
    const horizontalName = firstCatalog?.querySelector<HTMLElement>("[data-gallery-catalog-name-horizontal]");
    expect(firstCatalog?.className).toContain("aspect-[3/2]");
    expect(firstCatalog?.className).toContain("lg:aspect-[3/4]");
    expect(countBadge).toBeInTheDocument();
    expect(countBadge?.textContent).toBe("4");
    expect(countBadge?.className).toContain("absolute");
    expect(countBadge?.className).toContain("lg:bottom-6");
    expect(countBadge?.className).toContain("lg:right-6");
    expect(bottomGradient).toBeInTheDocument();
    expect(bottomGradient?.className).toContain("h-2/3");
    expect(bottomGradient?.className).toContain("from-darker/95");
    expect(firstCatalogSources[0]).toHaveAttribute("media", "(min-width: 1024px)");
    expect(firstCatalogSources[0]).toHaveAttribute("srcset", expect.stringContaining("/t_mobile/"));
    expect(firstCatalogSources[1]).toHaveAttribute("media", "(min-width: 768px)");
    expect(firstCatalogSources[1]).toHaveAttribute("srcset", expect.stringContaining("/t_acotado/"));
    expect(firstCatalogSources[2]).toHaveAttribute("media", "(max-width: 767px)");
    expect(firstCatalogSources[2]).toHaveAttribute("srcset", expect.stringContaining("/t_optimize/"));
    expect(firstCatalogDesktopPreview).toHaveAttribute("src", expect.stringContaining("/t_mobile/"));
    expect(firstCatalogDesktopPreview).toHaveAttribute("src", expect.stringContaining("mamoplastia-01_llctwx"));
    expect(verticalName).toBeInTheDocument();
    expect(verticalName?.className).toContain("lg:[writing-mode:vertical-rl]");
    expect(verticalName?.className).toContain("lg:rotate-180");
    expect(verticalName?.className).toContain("lg:group-hover:opacity-0");
    expect(horizontalName).toBeInTheDocument();
    expect(horizontalName?.className).toContain("lg:opacity-0");
    expect(horizontalName?.className).toContain("lg:group-hover:opacity-100");

    vi.useFakeTimers();
    fireEvent.click(within(gallery).getByRole("button", { name: /mamas/i }));

    expect(catalogPanel).toHaveAttribute("data-state", "collapsed");
    expect(catalogPanel?.className).toContain("max-h-[260px]");
    expect(gallery.querySelector("[data-gallery-motion-stage]")).toHaveAttribute("data-state", "selecting");
    expect(servicesPanel).toHaveAttribute("data-state", "closed");
    expect(servicesPanel?.className).toContain("grid-rows-[0fr]");
    const settlingHiddenCatalogs = Array.from(
      gallery.querySelectorAll<HTMLElement>('[data-mobile-state="hidden"]')
    );
    expect(settlingHiddenCatalogs.length).toBe(6);
    settlingHiddenCatalogs.forEach((catalog) => {
      expect(catalog).toHaveAttribute("data-gallery-select-motion", "exiting");
      expect(catalog.className).toContain("transition-[max-height,opacity");
      expect(catalog.className).toContain("!min-h-0");
      expect(catalog.className).toContain("h-0");
      expect(catalog.className).not.toContain("translate-y-2");
      expect(catalog.className).not.toContain("scale-[0.985]");
      expect(catalog.className).toContain("lg:translate-x-6");
      expect(catalog.className).not.toContain("transition-[max-height,flex");
    });
    expect(gallery.querySelector("[data-gallery-selected-catalog]")).toHaveAttribute(
      "data-gallery-select-motion",
      "anchor"
    );
    expect(gallery.querySelector("[data-gallery-selected-catalog]")?.className).toContain(
      "lg:-translate-x-5"
    );
    expect(gallery.querySelector("[data-gallery-selected-catalog]")?.className).toContain(
      "duration-[300ms]"
    );
    expect(gallery.querySelectorAll("[data-gallery-service]").length).toBe(4);
    gallery.querySelectorAll<HTMLButtonElement>("[data-gallery-service]").forEach((service) => {
      expect(service).toHaveAttribute("data-gallery-service-state", "closed");
      expect(service).toHaveAttribute("tabindex", "-1");
      expect(service.className).toContain("translate-y-2");
      expect(service.className).toContain("opacity-0");
    });

    act(() => {
      vi.advanceTimersByTime(190);
    });

    expect(gallery.querySelector("[data-gallery-motion-stage]")).toHaveAttribute("data-state", "selected");
    expect(servicesPanel).toHaveAttribute("data-state", "open");
    expect(servicesPanel?.className).toContain("transition-[opacity,transform]");
    expect(servicesPanel?.className).toContain(
      "md:transition-[grid-template-rows,max-height,opacity,transform]"
    );
    expect(servicesPanel?.className).toContain("grid-rows-[1fr]");
    expect(servicesPanel?.className).toContain("max-h-[3200px]");
    expect(servicesPanel?.className).not.toContain("max-h-[2600px]");
    expect(servicesPanel?.className).toContain("md:max-h-[1200px]");
    const serviceCards = Array.from(gallery.querySelectorAll<HTMLButtonElement>("[data-gallery-service]"));
    expect(serviceCards.length).toBe(4);
    serviceCards.forEach((service) => {
      expect(service).toHaveAttribute("data-gallery-service-state", "open");
      expect(service).not.toHaveAttribute("tabindex");
      expect(service.className).toContain("translate-y-0");
      expect(service.className).toContain("opacity-100");
    });
    expect(serviceCards[0]?.style.transitionDelay).toBe("60ms");
    expect(serviceCards[1]?.style.transitionDelay).toBe("95ms");
    expect(gallery.querySelectorAll('[data-mobile-state="hidden"]').length).toBe(6);
    const selectedCatalog = gallery.querySelector<HTMLElement>("[data-gallery-selected-catalog]");
    expect(selectedCatalog).toBeInTheDocument();
    expect(selectedCatalog?.className).toContain("lg:max-h-none");

    const hiddenCatalogs = Array.from(
      gallery.querySelectorAll<HTMLElement>('[data-mobile-state="hidden"]')
    );
    hiddenCatalogs.forEach((catalog) => {
      expect(catalog).toHaveAttribute("aria-hidden", "true");
      expect(catalog).toHaveAttribute("tabindex", "-1");
      expect(catalog.className).toContain("lg:w-0");
      expect(catalog.className).toContain("lg:flex-none");
      expect(catalog.className).not.toContain("lg:opacity-100");
      expect(catalog.className).not.toContain("lg:pointer-events-auto");
    });
  });

  it("keeps mobile gallery selection anchored when lower catalog cards collapse", () => {
    const originalInnerWidth = window.innerWidth;
    const originalRequestAnimationFrame = window.requestAnimationFrame;
    const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
    const scrollIntoView = vi.fn();

    Object.defineProperty(window, "innerWidth", { configurable: true, value: 390 });
    window.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    }) as typeof window.requestAnimationFrame;
    HTMLElement.prototype.scrollIntoView = scrollIntoView;

    try {
      const { container } = render(<App />);
      const gallery = container.querySelector<HTMLElement>("#galeria");
      expect(gallery).toBeInTheDocument();
      if (!gallery) return;

      fireEvent.click(within(gallery).getByRole("button", { name: "Capilar" }));

      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
    } finally {
      Object.defineProperty(window, "innerWidth", { configurable: true, value: originalInnerWidth });
      window.requestAnimationFrame = originalRequestAnimationFrame;
      HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
      vi.restoreAllMocks();
    }
  });

  it("maps service-section procedures into gallery catalogs without gallery-only services", () => {
    vi.useFakeTimers();
    try {
      const { container } = render(<App />);
      const gallery = container.querySelector<HTMLElement>("#galeria");
      expect(gallery).toBeInTheDocument();
      if (!gallery) return;

      const openCatalog = (label: RegExp) => {
        fireEvent.click(within(gallery).getByRole("button", { name: label }));
        act(() => {
          vi.advanceTimersByTime(190);
        });
      };

      const closeCatalog = () => {
        fireEvent.click(gallery.querySelector<HTMLButtonElement>("[data-gallery-selected-catalog]")!);
        act(() => {
          vi.advanceTimersByTime(340);
        });
      };

      openCatalog(/rostro/i);

      expect(within(gallery).getByRole("button", { name: /otoplastia/i })).toBeInTheDocument();
      expect(within(gallery).getByRole("button", { name: /cirugia maxilofacial/i })).toBeInTheDocument();
      expect(within(gallery).getByRole("button", { name: /cirugia de pomulos/i })).toBeInTheDocument();
      expect(within(gallery).getByRole("button", { name: /lifting/i })).toBeInTheDocument();

      closeCatalog();
      openCatalog(/cirugia masculina/i);

      expect(within(gallery).getByRole("button", { name: /ginecomastia/i })).toBeInTheDocument();
      expect(within(gallery).queryByRole("button", { name: /marcacion abdominal/i })).not.toBeInTheDocument();

      closeCatalog();
      openCatalog(/capilar/i);

      expect(within(gallery).getByRole("button", { name: /implante capilar/i })).toBeInTheDocument();
      expect(within(gallery).queryByRole("button", { name: /tratamientos capilares/i })).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("shows services for a selected catalog and returns to all catalogs from the selected rail", () => {
    vi.useFakeTimers();
    try {
      const { container } = render(<App />);
      const gallery = container.querySelector<HTMLElement>("#galeria");
      expect(gallery).toBeInTheDocument();
      if (!gallery) return;

      fireEvent.click(within(gallery).getByRole("button", { name: /mamas/i }));
      act(() => {
        vi.advanceTimersByTime(190);
      });

      expect(gallery.querySelector("[data-gallery-services]")).toBeInTheDocument();
      expect(gallery.querySelector("[data-gallery-selected-catalog]")).toBeInTheDocument();
      expect(within(gallery).getByRole("button", { name: /aumento de mamas/i })).toBeInTheDocument();
      expect(within(gallery).getByRole("button", { name: /mastopexia/i })).toBeInTheDocument();
      expect(within(gallery).getByRole("button", { name: /reduccion de mamas/i })).toBeInTheDocument();

      fireEvent.click(gallery.querySelector<HTMLButtonElement>("[data-gallery-selected-catalog]")!);

      expect(gallery.querySelector("[data-gallery-motion-stage]")).toHaveAttribute("data-state", "closing");
      expect(gallery.querySelector("[data-gallery-services]")).toHaveAttribute("data-state", "closing");
      expect(gallery.querySelector("[data-gallery-catalogs]")).toHaveAttribute("data-state", "closing");
      expect(gallery.querySelector("[data-gallery-selected-catalog]")).toBeInTheDocument();
      expect(gallery.querySelector("[data-gallery-services]")).toHaveTextContent(/aumento de mamas/i);

      act(() => {
        vi.advanceTimersByTime(260);
      });

      expect(gallery.querySelector("[data-gallery-motion-stage]")).toHaveAttribute("data-state", "restoring");
      expect(gallery.querySelector("[data-gallery-services]")).toHaveAttribute("data-state", "closed");
      expect(gallery.querySelectorAll('[data-mobile-state="hidden"]').length).toBe(0);
      const restoringCards = Array.from(
        gallery.querySelectorAll<HTMLElement>('[data-gallery-restore-state="pending"]')
      );
      expect(restoringCards.length).toBeGreaterThan(0);
      restoringCards.forEach((card) => {
        expect(card.className).toContain("opacity-0");
        expect(card.className).toContain("transition-[opacity");
        expect(card.className).not.toContain("transition-[max-height,flex");
      });

      act(() => {
        vi.advanceTimersByTime(80);
      });

      expect(gallery.querySelector("[data-gallery-motion-stage]")).toHaveAttribute("data-state", "open");
      expect(gallery.querySelector("[data-gallery-services]")).toHaveAttribute("data-state", "closed");
      expect(gallery.querySelector("[data-gallery-catalogs]")).toBeInTheDocument();
      expect(gallery.querySelector("[data-gallery-catalogs]")).toHaveAttribute("data-state", "open");
    } finally {
      vi.useRealTimers();
    }
  });

  it("lays out gallery services in six-cell grids with responsive previews only for photographed services", () => {
    vi.useFakeTimers();
    try {
      const { container } = render(<App />);
      const gallery = container.querySelector<HTMLElement>("#galeria");
      expect(gallery).toBeInTheDocument();
      if (!gallery) return;

      const openCatalog = (label: RegExp) => {
        fireEvent.click(within(gallery).getByRole("button", { name: label }));
        act(() => {
          vi.advanceTimersByTime(190);
        });
      };

      const closeCatalog = () => {
        fireEvent.click(gallery.querySelector<HTMLButtonElement>("[data-gallery-selected-catalog]")!);
        act(() => {
          vi.advanceTimersByTime(340);
        });
      };

      openCatalog(/mamas/i);

      const servicesGrid = gallery.querySelector<HTMLElement>("[data-gallery-services-grid]");
      expect(servicesGrid).toBeInTheDocument();
      expect(servicesGrid).toHaveAttribute("data-gallery-service-cells", "6");
      expect(servicesGrid?.className).toContain("grid-cols-2");
      expect(servicesGrid?.className).toContain("md:h-[540px]");
      expect(servicesGrid?.className).toContain("lg:h-[540px]");
      expect(servicesGrid?.className).toContain("md:grid-cols-[repeat(var(--gallery-service-cols),minmax(0,1fr))]");
      expect(servicesGrid?.className).toContain("md:grid-rows-[repeat(var(--gallery-service-rows),minmax(0,1fr))]");
      expect(servicesGrid?.style.getPropertyValue("--gallery-service-cols")).toBe("3");
      expect(servicesGrid?.style.getPropertyValue("--gallery-service-rows")).toBe("2");

      const photographedService = within(gallery).getByRole("button", { name: /aumento de mamas/i });
      const preview = photographedService.querySelector<HTMLElement>("[data-gallery-service-preview]");
      const readingOverlay = photographedService.querySelector<HTMLElement>(
        "[data-gallery-service-reading-overlay]"
      );
      const desktopSource = photographedService.querySelector<HTMLSourceElement>(
        'source[media="(min-width: 1024px)"]'
      );
      const tabletSource = photographedService.querySelector<HTMLSourceElement>(
        'source[media="(min-width: 768px)"]'
      );
      const previewImage = photographedService.querySelector<HTMLImageElement>("img");
      const photographedDescription = within(photographedService).getByText(
        /mamoplastia de aumento con seguimiento fotografico/i
      );
      expect(photographedService).toHaveAttribute("data-gallery-service-has-preview", "true");
      expect(preview).toBeInTheDocument();
      expect(readingOverlay).toBeInTheDocument();
      expect(readingOverlay).toHaveAttribute("data-gallery-service-reading-overlay", "gradient");
      expect(readingOverlay?.className).toContain("absolute");
      expect(photographedDescription.className).toContain("text-white/70");
      expect(photographedDescription.className).not.toContain("text-white/72");
      expect(desktopSource?.srcset).toContain("/t_optimize/");
      expect(tabletSource?.srcset).toContain("/t_acotado/");
      expect(previewImage?.src).toContain("/t_acotado/");

      const emptyService = within(gallery).getByRole("button", { name: /reduccion de mamas/i });
      const emptyServiceStatus = within(emptyService).getByText(/sin fotos/i);
      expect(emptyService).toHaveAttribute("data-gallery-service-has-preview", "false");
      expect(emptyService.querySelector("[data-gallery-service-preview]")).not.toBeInTheDocument();
      expect(emptyService.querySelector("[data-gallery-service-empty-surface]")).toBeInTheDocument();
      expect(emptyServiceStatus.className).toContain("text-white/50");
      expect(emptyServiceStatus.className).not.toContain("text-white/55");

      closeCatalog();
      openCatalog(/cirugia masculina/i);

      const singleServiceGrid = gallery.querySelector<HTMLElement>("[data-gallery-services-grid]");
      const singleService = within(gallery).getByRole("button", { name: /ginecomastia/i });
      expect(singleServiceGrid).toHaveAttribute("data-gallery-service-cells", "6");
      expect(singleServiceGrid?.style.getPropertyValue("--gallery-service-cols")).toBe("3");
      expect(singleServiceGrid?.style.getPropertyValue("--gallery-service-rows")).toBe("2");
      expect(singleService).toHaveAttribute("data-gallery-service-position", "1");
    } finally {
      vi.useRealTimers();
    }
  });

  it("opens result photos or a no-photos state from gallery services", () => {
    vi.useFakeTimers();
    const { container } = render(<App />);
    const gallery = container.querySelector<HTMLElement>("#galeria");
    expect(gallery).toBeInTheDocument();
    if (!gallery) return;

    fireEvent.click(within(gallery).getByRole("button", { name: /mamas/i }));
    act(() => {
      vi.advanceTimersByTime(190);
    });
    fireEvent.click(within(gallery).getByRole("button", { name: /aumento de mamas/i }));

    let dialog = screen.getByRole("dialog", { name: /mamoplastia de aumento/i });
    expect(within(dialog).getByRole("img", { name: /mamoplastia de aumento/i })).toHaveAttribute(
      "src",
      expect.stringContaining("mamoplastia-01")
    );
    expect(within(dialog).getByText(/1 \/ 4/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /cerrar resultados/i }));
    fireEvent.click(within(gallery).getByRole("button", { name: /reduccion de mamas/i }));

    dialog = screen.getByRole("dialog", { name: /reduccion de mamas/i });
    expect(within(dialog).getByText(/no hay fotos de casos disponibles/i)).toBeInTheDocument();
    expect(within(dialog).queryByRole("img")).not.toBeInTheDocument();
  });

  it("preloads adjacent modal images when a gallery result opens", async () => {
    const originalImage = window.Image;
    const preloadedSources: string[] = [];

    class MockImage {
      decoding = "";

      set src(value: string) {
        preloadedSources.push(value);
      }

      get src() {
        return "";
      }
    }

    Object.defineProperty(window, "Image", {
      configurable: true,
      writable: true,
      value: MockImage,
    });

    try {
      const { container } = render(<App />);
      const gallery = container.querySelector<HTMLElement>("#galeria");
      expect(gallery).toBeInTheDocument();
      if (!gallery) return;

      fireEvent.click(within(gallery).getByRole("button", { name: /mamas/i }));
      await waitFor(() => {
        expect(within(gallery).getByRole("button", { name: /aumento de mamas/i })).toBeInTheDocument();
      });
      fireEvent.click(within(gallery).getByRole("button", { name: /aumento de mamas/i }));
      await screen.findByRole("dialog", { name: /mamoplastia de aumento/i });

      await waitFor(() => {
        expect(preloadedSources).toEqual(
          expect.arrayContaining([
            expect.stringContaining("mamoplastia-02"),
            expect.stringContaining("mamoplastia-04"),
          ])
        );
      });
    } finally {
      Object.defineProperty(window, "Image", {
        configurable: true,
        writable: true,
        value: originalImage,
      });
    }
  });

  it("supports modal image swipe and mouse drag between images", () => {
    vi.useFakeTimers();
    const { container } = render(<App />);
    const gallery = container.querySelector<HTMLElement>("#galeria");
    expect(gallery).toBeInTheDocument();
    if (!gallery) return;

    fireEvent.click(within(gallery).getByRole("button", { name: /mamas/i }));
    act(() => {
      vi.advanceTimersByTime(190);
    });
    fireEvent.click(within(gallery).getByRole("button", { name: /aumento de mamas/i }));

    const dialog = screen.getByRole("dialog", { name: /mamoplastia de aumento/i });
    expect(within(dialog).getByText(/1 \/ 4/i)).toBeInTheDocument();

    const modalGesture = dialog.querySelector("[data-modal-gesture]");
    expect(modalGesture).toBeInTheDocument();
    if (!modalGesture) return;

    const fireModalPointer = (
      type: "pointerdown" | "pointermove" | "pointerup",
      options: {
        pointerId: number;
        pointerType: "mouse" | "touch";
        clientX: number;
        clientY: number;
        button?: number;
      }
    ) => {
      const event = new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        clientX: options.clientX,
        clientY: options.clientY,
        button: options.button ?? 0,
      });

      Object.defineProperties(event, {
        isPrimary: { value: true },
        pointerId: { value: options.pointerId },
        pointerType: { value: options.pointerType },
      });

      fireEvent(modalGesture, event);
    };

    fireModalPointer("pointerdown", {
      pointerId: 1,
      pointerType: "touch",
      clientX: 220,
      clientY: 120,
    });
    fireModalPointer("pointermove", {
      pointerId: 1,
      pointerType: "touch",
      clientX: 120,
      clientY: 124,
    });
    fireModalPointer("pointerup", {
      pointerId: 1,
      pointerType: "touch",
      clientX: 120,
      clientY: 124,
    });

    expect(within(dialog).getByText(/2 \/ 4/i)).toBeInTheDocument();
    expect(within(dialog).getByRole("img", { name: /mamoplastia de aumento caso 2/i })).toHaveAttribute(
      "src",
      expect.stringContaining("mamoplastia-02")
    );

    fireModalPointer("pointerdown", {
      pointerId: 2,
      pointerType: "mouse",
      button: 0,
      clientX: 120,
      clientY: 120,
    });
    fireModalPointer("pointermove", {
      pointerId: 2,
      pointerType: "mouse",
      button: 0,
      clientX: 220,
      clientY: 122,
    });
    fireModalPointer("pointerup", {
      pointerId: 2,
      pointerType: "mouse",
      button: 0,
      clientX: 220,
      clientY: 122,
    });

    expect(within(dialog).getByText(/1 \/ 4/i)).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: /mamoplastia de aumento/i })).toBeInTheDocument();
  });

  it("locks page scroll while the mobile menu or gallery modal is open", () => {
    vi.useFakeTimers();
    const { container } = render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /abrir men/i }));
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.click(screen.getByRole("button", { name: /cerrar men/i }));
    expect(document.documentElement.style.overflow).toBe("");
    expect(document.body.style.overflow).toBe("");

    const gallery = container.querySelector<HTMLElement>("#galeria");
    expect(gallery).toBeInTheDocument();
    if (!gallery) return;

    fireEvent.click(within(gallery).getByRole("button", { name: /mamas/i }));
    act(() => {
      vi.advanceTimersByTime(190);
    });
    fireEvent.click(within(gallery).getByRole("button", { name: /aumento de mamas/i }));
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.click(screen.getByRole("button", { name: /cerrar resultados/i }));
    expect(document.documentElement.style.overflow).toBe("");
    expect(document.body.style.overflow).toBe("");
  });

  it("honors reduced motion by disabling testimonial autoplay progress", () => {
    vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
    const setIntervalSpy = vi.spyOn(window, "setInterval");

    const { container } = render(<App />);

    expect(setIntervalSpy).not.toHaveBeenCalled();
    const progress = container.querySelector<HTMLElement>("[data-testimonials-progress]");
    expect(progress).toBeInTheDocument();
    expect(progress?.style.animation).toBe("none");
    expect(progress?.style.width).toBe("0%");
  });

  it("keeps contact links as full-row touch targets", () => {
    render(<App />);

    const phone = screen.getByRole("link", { name: /tel.fono.*03624-428782/i });
    const email = screen.getByRole("link", { name: /email.*dantemasedo@hotmail.com/i });
    const instagram = screen.getByRole("link", { name: /instagram.*@dr\.masedo/i });

    [phone, email, instagram].forEach((link) => {
      expect(link.className).toContain("min-h-11");
      expect(link.className).toContain("w-full");
      expect(link.className).toContain("p-2");
    });
  });

  it("keeps footer service links as full-row touch targets", () => {
    render(<App />);

    ["Abdominoplastía", "Botox", "Borrar tatuajes"].forEach((label) => {
      const link = screen.getByRole("link", { name: label });
      expect(link.className).toContain("min-h-11");
      expect(link.className).toContain("w-full");
      expect(link.className).toContain("px-2");
    });
  });

  it("keeps the desktop navbar until xl and uses dynamic viewport height for the hero", () => {
    const { container } = render(<App />);

    expect(container.querySelector("section#inicio")?.className).toContain("min-h-[100dvh]");
    expect(container.querySelector("section#inicio")?.className).not.toContain("min-h-screen");
    expect(container.querySelector("nav ul")?.className).toContain("hidden xl:flex");
    expect(container.querySelector("nav .btn-compact")?.className).toContain("hidden xl:inline-block");
    expect(screen.getByRole("button", { name: /abrir men/i }).className).toContain("xl:hidden");
  });

  it("keeps brand CTA colors while preserving non-invasive contrast fixes", () => {
    const css = readFileSync(resolve(process.cwd(), "src", "index.css"), "utf8");
    expect(css).toMatch(/\.btn-primary[\s\S]*bg-copper text-white/);
    expect(css).toMatch(/\.btn-compact[\s\S]*bg-copper text-white/);

    const { container } = render(<App />);

    const lightSectionEyebrows = [
      container.querySelector("#sobre-mi .eyebrow"),
      container.querySelector("#servicios .eyebrow"),
    ];
    lightSectionEyebrows.forEach((eyebrow) => {
      expect(eyebrow?.className).toContain("text-copper-dark");
    });

    const activeServiceCategory = Array.from(
      container.querySelectorAll<HTMLButtonElement>("#servicios button")
    ).find((button) => button.textContent?.includes("Est"));
    expect(activeServiceCategory?.className).toContain("bg-copper");
    expect(activeServiceCategory?.className).not.toContain("bg-copper-dark");

    const testimonialCards = Array.from(
      container.querySelectorAll("section#testimonios article")
    );
    expect(testimonialCards.some((card) => card.className.includes("opacity-25"))).toBe(false);
    testimonialCards
      .filter((card) => card.getAttribute("aria-hidden") === "true")
      .forEach((card) => {
        expect(card.className).toContain("opacity-45");
      });
  });

  it("uses restrained reveal motion for testimonials and contact blocks", () => {
    const { container } = render(<App />);

    const hasRevealAncestor = (element: Element | null) => {
      let current = element?.parentElement ?? null;
      while (current) {
        if (current instanceof HTMLElement && current.style.transitionProperty === "opacity, transform") {
          return true;
        }
        current = current.parentElement;
      }
      return false;
    };

    expect(hasRevealAncestor(container.querySelector("#testimonios-title"))).toBe(true);
    expect(hasRevealAncestor(container.querySelector("#contacto-title"))).toBe(true);
    expect(hasRevealAncestor(container.querySelector("#contacto address"))).toBe(true);
  });

  it("credits the site developer in the footer", () => {
    render(<App />);

    expect(screen.getByText(/desarrollado por/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /gonzalo gomez vignudo/i })).toHaveAttribute(
      "href",
      "https://gonzaloogv.dev/"
    );
  });
});
