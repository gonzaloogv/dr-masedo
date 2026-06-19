import { fireEvent, render, screen, within } from "@testing-library/react";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import App from "@/App";

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
      "https://res.cloudinary.com/dz9tuwczf/image/upload/v1781272538/consultorio_dante_masedo-37_pmuhop.jpg"
    );
    expect(trainingImage).toHaveAttribute(
      "src",
      "https://res.cloudinary.com/dz9tuwczf/image/upload/v1781272538/consultorio_dante_masedo-17_1_eyvvya.jpg"
    );
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
    expect(
      screen.getByRole("button", { name: /ver resultado anterior/i }).className
    ).toContain("rounded-full");
    expect(
      screen.getByRole("button", { name: /ver resultado anterior/i }).className
    ).toContain("lg:bg-darker/80");
    expect(
      screen.getByRole("button", { name: /ver resultado siguiente/i }).className
    ).toContain("lg:hover:bg-copper");

    const slides = gallery.querySelectorAll("[data-gallery-slide]");
    expect(slides.length).toBe(3);
    expect(gallery.querySelector('[data-result-id="mamoplastia-aumento"] img')).toHaveAttribute(
      "src",
      expect.stringContaining("mamoplastia-01_32")
    );
    expect(gallery.querySelector('[data-result-id="abdominoplastia"] img')).toHaveAttribute(
      "src",
      expect.stringContaining("abdominoplastia-01_32")
    );
    expect(gallery.querySelector('[data-result-id="pexia-protesis"] img')).toHaveAttribute(
      "src",
      expect.stringContaining("pex-01_32")
    );
    expect(
      gallery.querySelector('[data-result-id="mamoplastia-aumento"] source')
    ).toHaveAttribute("srcset", expect.stringContaining("mamoplastia-01_llctwx"));
    expect(gallery.querySelector('[data-result-id="abdominoplastia"] source')).toHaveAttribute(
      "srcset",
      expect.stringContaining("abdominoplastia-01_fatsey")
    );
    expect(gallery.querySelector('[data-result-id="pexia-protesis"] source')).toHaveAttribute(
      "srcset",
      expect.stringContaining("pex-01_vdffzs")
    );
    expect(within(gallery as HTMLElement).queryByText(/rinoplastia/i)).not.toBeInTheDocument();
    expect(within(gallery as HTMLElement).queryByText(/liposucci/i)).not.toBeInTheDocument();
    expect(within(gallery as HTMLElement).queryByText(/espacio reservado/i)).not.toBeInTheDocument();
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
