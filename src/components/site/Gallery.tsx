import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { Reveal } from "@/components/Reveal";

type GalleryItem = {
  id: number;
  category: string;
  label: string;
  procedure: string;
  span: string;
  src?: string;
  alt?: string;
};

const GALLERY: GalleryItem[] = [
  {
    id: 1,
    category: "mamas",
    label: "MAMAS",
    procedure: "Mamoplastia de Aumento",
    span: "md:col-span-1 md:row-span-2",
    src: "https://res.cloudinary.com/dz9tuwczf/image/upload/w_1200,q_auto,f_auto/v1781227409/dr._Masedo_2_yxycw5.png",
    alt: "Resultado Mamoplastia de Aumento — Dr. Masedo Carlos Dante",
  },
  {
    id: 2,
    category: "cuerpo",
    label: "CUERPO",
    procedure: "Lipoescultura",
    span: "md:col-span-1 md:row-span-1",
  },
  {
    id: 3,
    category: "rostro",
    label: "ROSTRO",
    procedure: "Lifting Facial",
    span: "md:col-span-1 md:row-span-1",
  },
  {
    id: 4,
    category: "mamas",
    label: "MAMAS",
    procedure: "Mamoplastia de Aumento",
    span: "md:col-span-1 md:row-span-1",
    src: "https://res.cloudinary.com/dz9tuwczf/image/upload/w_1200,q_auto,f_auto/v1781227408/dr._Masedo_1_zqd73m.png",
    alt: "Resultado Mamoplastia de Aumento — Dr. Masedo Carlos Dante",
  },
  {
    id: 5,
    category: "mamas",
    label: "MAMAS",
    procedure: "Mamoplastia de Aumento",
    span: "md:col-span-1 md:row-span-1",
    src: "https://res.cloudinary.com/dz9tuwczf/image/upload/w_1200,q_auto,f_auto/v1781227407/dr._Masedo_fb6nxe.png",
    alt: "Resultado Mamoplastia de Aumento — Dr. Masedo Carlos Dante",
  },
];

export function Gallery() {
  const [lightbox, setLightbox] = useState<{ open: boolean; index: number } | null>(null);

  // Only items with real images participate in the lightbox
  const lightboxItems = GALLERY.filter((g) => !!g.src);

  const close = useCallback(() => setLightbox(null), []);
  const navigate = useCallback(
    (dir: "prev" | "next") => {
      setLightbox((curr) => {
        if (!curr) return curr;
        const len = lightboxItems.length;
        if (len === 0) return curr;
        const next = dir === "prev" ? (curr.index - 1 + len) % len : (curr.index + 1) % len;
        return { open: true, index: next };
      });
    },
    [lightboxItems.length]
  );

  useEffect(() => {
    if (!lightbox?.open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") navigate("prev");
      else if (e.key === "ArrowRight") navigate("next");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, close, navigate]);

  const active = lightbox?.open ? lightboxItems[lightbox.index] : null;

  return (
    <section id="galeria" className="py-20 md:py-28 lg:py-32 overflow-x-hidden bg-dark">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <Reveal y={16} delay={0}>
          <div className="text-center mb-14 lg:mb-16">
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="w-12 h-px bg-copper opacity-40" />
              <span className="font-sans text-xs tracking-brand-widest uppercase text-sage">Resultados</span>
              <span className="w-12 h-px bg-copper opacity-40" />
            </div>
            <h2 className="h-display-light text-white">
              Galería de <span className="text-sage">trabajos</span>
            </h2>
            <p className="mt-4 max-w-xl mx-auto font-sans text-white/50 text-[0.9rem] leading-[1.8]">
              Cada imagen representa una historia de transformación y confianza. Todos los casos
              fueron realizados con el consentimiento de nuestros pacientes.
            </p>
          </div>
        </Reveal>

        {/* Mosaic */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3" style={{ gridAutoRows: "280px" }}>
          {GALLERY.map((item, idx) => {
            const lightboxIndex = item.src ? lightboxItems.findIndex((l) => l.id === item.id) : -1;
            const handleClick = () => {
              if (lightboxIndex >= 0) setLightbox({ open: true, index: lightboxIndex });
            };
            return (
              <Reveal
                key={item.id}
                x={0}
                y={0}
                scale={0.98}
                delay={idx * 60}
                className={`col-span-1 row-span-1 ${item.span}`}
              >
                <button
                  onClick={handleClick}
                  className="relative overflow-hidden cursor-pointer group w-full h-full"
                  disabled={!item.src}
                >
                  {item.src ? (
                    <img
                      src={item.src}
                      alt={item.alt ?? item.procedure}
                      className="w-full h-full object-cover cursor-pointer"
                      loading="lazy"
                    />
                  ) : (
                    <ImagePlaceholder label={`${item.label} · ${item.procedure}`} />
                  )}
                  {/* Hover overlay */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col items-center justify-center"
                    style={{ backgroundColor: "hsl(var(--brand-darker) / 0.7)" }}
                  >
                    <p className="font-sans text-xs tracking-widest uppercase text-sage mb-2">
                      {item.label}
                    </p>
                    <p className="font-serif text-white text-2xl">{item.procedure}</p>
                  </div>
                  {/* Badge */}
                  <div
                    className="absolute top-3 left-3 px-3 py-1 z-10"
                    style={{ backgroundColor: "hsl(var(--brand-dark) / 0.9)" }}
                  >
                    <span className="font-sans text-2xs tracking-brand-tight uppercase text-sage whitespace-nowrap">
                      {item.label}
                    </span>
                  </div>
                </button>
              </Reveal>
            );
          })}
        </div>

        {/* Note */}
        <div
          className="mt-10 p-6 flex items-start gap-4"
          style={{
            backgroundColor: "hsl(var(--brand-forest-2) / 0.2)",
            borderLeft: "2px solid hsl(var(--brand-forest-2))",
          }}
        >
          <span className="text-sage text-[1.4rem] leading-none">ℹ</span>
          <p className="font-sans text-sm leading-[1.7] text-white/55">
            Las fotografías de antes y después se exhiben con el consentimiento informado de cada
            paciente. Los resultados individuales pueden variar según el estado de salud, la
            anatomía y el seguimiento post-operatorio de cada caso.
          </p>
        </div>
      </div>

      {/* Lightbox */}
      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darker/95 backdrop-blur-sm transition-opacity duration-300"
          onClick={close}
        >
          <button
            className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-10"
            onClick={(e) => { e.stopPropagation(); close(); }}
            aria-label="Cerrar"
          >
            <X size={28} />
          </button>
          <button
            className="absolute left-6 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors z-10"
            onClick={(e) => { e.stopPropagation(); navigate("prev"); }}
            aria-label="Anterior"
          >
            <ChevronLeft size={36} />
          </button>
          <div className="flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={active.src}
              alt={active.alt ?? active.procedure}
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
            />
            <p className="text-2xs text-white/40 text-center mt-4 max-w-md px-4">
              Las fotografías se publican con consentimiento informado del paciente. Los resultados individuales pueden variar.
            </p>
          </div>
          <button
            className="absolute right-6 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors z-10"
            onClick={(e) => { e.stopPropagation(); navigate("next"); }}
            aria-label="Siguiente"
          >
            <ChevronRight size={36} />
          </button>
        </div>
      )}
    </section>
  );
}
