import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "@/App";

afterEach(() => {
  vi.restoreAllMocks();
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

  it("keeps carousel arrow controls outside reveal clipping", () => {
    const { container } = render(<App />);

    const galleryCarousel = container.querySelector<HTMLElement>("[data-gallery-carousel]");
    const galleryReveal = galleryCarousel?.parentElement as HTMLElement | null;

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

  it("renders a responsive carousel with only real result categories", () => {
    const { container } = render(<App />);
    const gallery = container.querySelector("#galeria");
    expect(gallery).toBeInTheDocument();
    if (!gallery) return;

    const carousel = gallery.querySelector("[data-gallery-carousel]");
    expect(carousel).toBeInTheDocument();
    expect(carousel).toHaveAttribute(
      "data-autoplay-interval",
      "4000"
    );
    expect(carousel?.className).toContain("aspect-[3/4]");
    expect(carousel?.className).toContain("md:aspect-[3/2]");
    expect(gallery.querySelector("[data-gallery-mosaic]")).not.toBeInTheDocument();
    expect(gallery.querySelector("[data-gallery-track]")).not.toBeInTheDocument();
    expect(gallery.querySelectorAll("[data-gallery-dot]").length).toBe(0);
    const previousButton = screen.getByRole("button", { name: /ver resultado anterior/i });
    const nextButton = screen.getByRole("button", { name: /ver resultado siguiente/i });
    expect(previousButton.className).toContain("rounded-full");
    expect(previousButton.className).toContain("lg:bg-darker/80");
    expect(previousButton.className).toContain("left-0");
    expect(previousButton.className).not.toContain("-left");
    expect(nextButton.className).toContain("lg:hover:bg-copper");
    expect(nextButton.className).toContain("right-0");
    expect(nextButton.className).not.toContain("-right");

    const slides = gallery.querySelectorAll("[data-gallery-slide]");
    expect(slides.length).toBe(3);
    const mamoplastiaDesktopPreview = gallery.querySelector('[data-result-id="mamoplastia-aumento"] img');
    const abdominoplastiaDesktopPreview = gallery.querySelector('[data-result-id="abdominoplastia"] img');
    const pexiaDesktopPreview = gallery.querySelector('[data-result-id="pexia-protesis"] img');

    expect(mamoplastiaDesktopPreview).toHaveAttribute("src", expect.stringContaining("/t_optimize/"));
    expect(mamoplastiaDesktopPreview).toHaveAttribute("src", expect.stringContaining("mamoplastia-01_32"));
    expect(abdominoplastiaDesktopPreview).toHaveAttribute("src", expect.stringContaining("/t_optimize/"));
    expect(abdominoplastiaDesktopPreview).toHaveAttribute("src", expect.stringContaining("abdominoplastia-01_32"));
    expect(pexiaDesktopPreview).toHaveAttribute("src", expect.stringContaining("/t_optimize/"));
    expect(pexiaDesktopPreview).toHaveAttribute("src", expect.stringContaining("pex-01_32"));

    const mamoplastiaMobilePreview = gallery.querySelector('[data-result-id="mamoplastia-aumento"] source');
    const abdominoplastiaMobilePreview = gallery.querySelector('[data-result-id="abdominoplastia"] source');
    const pexiaMobilePreview = gallery.querySelector('[data-result-id="pexia-protesis"] source');

    expect(mamoplastiaMobilePreview).toHaveAttribute("srcset", expect.stringContaining("/t_mobile/"));
    expect(mamoplastiaMobilePreview).toHaveAttribute("srcset", expect.stringContaining("mamoplastia-01_llctwx"));
    expect(abdominoplastiaMobilePreview).toHaveAttribute("srcset", expect.stringContaining("/t_mobile/"));
    expect(abdominoplastiaMobilePreview).toHaveAttribute("srcset", expect.stringContaining("abdominoplastia-01_fatsey"));
    expect(pexiaMobilePreview).toHaveAttribute("srcset", expect.stringContaining("/t_mobile/"));
    expect(pexiaMobilePreview).toHaveAttribute("srcset", expect.stringContaining("pex-01_vdffzs"));
    expect(
      gallery.querySelector('[data-result-id="mamoplastia-aumento"] source')?.getAttribute("srcset")
    ).not.toContain("/t_optimize/");
    expect(within(gallery as HTMLElement).queryByText(/rinoplastia/i)).not.toBeInTheDocument();
    expect(within(gallery as HTMLElement).queryByText(/liposucci/i)).not.toBeInTheDocument();
    expect(within(gallery as HTMLElement).queryByText(/espacio reservado/i)).not.toBeInTheDocument();
  });

  it("keeps inactive gallery slides out of the keyboard order while preserving modal open behavior", () => {
    const { container } = render(<App />);
    const gallery = container.querySelector("#galeria");
    expect(gallery).toBeInTheDocument();
    if (!gallery) return;

    const slides = Array.from(gallery.querySelectorAll<HTMLButtonElement>("[data-gallery-slide]"));
    expect(slides).toHaveLength(3);

    expect(slides[0]).toHaveAttribute("tabindex", "0");
    expect(slides[0]).toHaveAttribute("aria-hidden", "false");
    slides.slice(1).forEach((slide) => {
      expect(slide).toHaveAttribute("tabindex", "-1");
      expect(slide).toHaveAttribute("aria-hidden", "true");
    });

    fireEvent.click(slides[0]);
    expect(screen.getByRole("dialog", { name: /mamoplastia de aumento/i })).toBeInTheDocument();
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
      const firstSlide = container.querySelector<HTMLButtonElement>(
        '[data-result-id="mamoplastia-aumento"]'
      );
      expect(firstSlide).toBeInTheDocument();
      if (!firstSlide) return;

      fireEvent.click(firstSlide);
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

  it("locks page scroll while the mobile menu or gallery modal is open", () => {
    const { container } = render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /abrir men/i }));
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.click(screen.getByRole("button", { name: /cerrar men/i }));
    expect(document.documentElement.style.overflow).toBe("");
    expect(document.body.style.overflow).toBe("");

    const firstSlide = container.querySelector<HTMLButtonElement>("[data-gallery-slide]");
    expect(firstSlide).toBeInTheDocument();
    if (!firstSlide) return;

    fireEvent.click(firstSlide);
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
