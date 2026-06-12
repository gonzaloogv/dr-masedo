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
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <p className="font-script text-sm text-sage/85 uppercase mb-1">DR.</p>
              <p className="font-script text-white text-[28px]">Masedo Carlos Dante</p>
              <p className="font-sans text-xs tracking-widest uppercase text-sage mt-1">
                Cirugía Plástica Reconstructiva · Quemados · Clínica Estética
              </p>
            </div>

            <p className="font-sans text-white/35 text-sm leading-[1.8] max-w-xs mb-8">
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
                className="w-9 h-9 flex items-center justify-center border border-sage/20 text-sage hover:opacity-70 transition"
              >
                <Instagram size={16} />
              </a>
            </div>
          </div>

          {/* Links */}
          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <p className="font-sans text-xs tracking-widest uppercase text-sage mb-6">{col.title}</p>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#servicios"
                      onClick={(e) => { e.preventDefault(); goToServices(); }}
                      className="font-sans text-sm text-white/35 hover:text-sage transition-colors"
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

      {/* Divider */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-sans text-xs text-white/20">
            © 2026 Dr. Masedo Carlos Dante · Todos los derechos reservados · MP 3.479 — MN 91.339
          </p>
          <div className="flex items-center gap-6">
            {LEGAL.map((item) => (
              <a key={item} href="#" className="font-sans text-xs text-white/20 hover:text-sage transition-colors">
                {item}
              </a>
            ))}
            <button
              onClick={scrollToTop}
              aria-label="Volver arriba"
              className="w-9 h-9 flex items-center justify-center border border-sage/15 text-sage hover:opacity-70 transition"
            >
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
