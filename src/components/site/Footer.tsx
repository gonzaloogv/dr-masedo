import { ArrowUp, Instagram } from "lucide-react";
import { INSTAGRAM_URL } from "@/lib/site";

const FOOTER_COLS = [
  { title: "Cirugía Estética", links: ["Abdominoplastía", "Aumento de mamas", "Rinoplastia", "Liposucción", "Lifting", "Blefaroplastia"] },
  { title: "Medicina Estética", links: ["Botox", "Ácido hialurónico", "HIFU", "Hilos tensores", "Plasma Rico en Plaquetas", "Rinomodelación"] },
  { title: "Belleza & Dermatología", links: ["Depilación láser", "Peeling", "Mesoterapia", "Eliminar cicatrices", "Borrar tatuajes"] },
];

const BADGES = ["SCPN", "SACPER", "AACI"];
const LEGAL = ["Política de Privacidad", "Términos y Condiciones"];

export function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const goToServices = () =>
    document.querySelector("#servicios")?.scrollIntoView({ behavior: "smooth" });

  return (
    <footer className="bg-deepest">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <p className="font-script text-sm text-sage/85 uppercase mb-1">DR.</p>
              <p className="font-script text-white text-[28px]">Masedo Carlos Dante</p>
              <p className="font-sans text-xs tracking-widest uppercase text-sage mt-1">
                Cirugía Plástica Reconstructiva · Quemados · Clínica Estética
              </p>
            </div>

            <p className="font-sans text-white/70 text-sm leading-[1.8] max-w-xs mb-8">
              Comprometidos con la excelencia médica y el bienestar de cada paciente.
              Tu transformación comienza aquí.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              {BADGES.map((b) => (
                <span
                  key={b}
                  className="px-3 py-1.5 text-xs tracking-widest border border-sage/20 text-sage font-sans"
                >
                  {b}
                </span>
              ))}
            </div>

            <div className="flex gap-3">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-11 w-11 items-center justify-center border border-sage/25 text-sage hover:opacity-70 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
              >
                <Instagram size={16} />
              </a>
            </div>
          </div>

          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <p className="font-sans text-xs tracking-widest uppercase text-sage mb-6">{col.title}</p>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#servicios"
                      onClick={(e) => { e.preventDefault(); goToServices(); }}
                      className="-mx-2 flex min-h-11 w-full items-center rounded px-2 font-sans text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-sage focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="font-sans text-xs text-white/60">
              © 2026 Dr. Masedo Carlos Dante · Todos los derechos reservados · MP 3.479 — MN 91.339
            </p>
            <p className="mt-2 font-sans text-[11px] tracking-wide text-white/35">
              Desarrollado por{" "}
              <a
                href="https://gonzaloogv.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sage/75 transition-colors hover:text-sage"
              >
                Gonzalo Gomez Vignudo
              </a>
            </p>
          </div>
          <div className="flex items-center gap-6">
            {LEGAL.map((item) => (
              <span key={item} className="font-sans text-xs text-white/60">
                {item}
              </span>
            ))}
            <button
              onClick={scrollToTop}
              aria-label="Volver arriba"
              className="flex h-11 w-11 items-center justify-center border border-sage/25 text-sage hover:opacity-70 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
            >
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
