import { useRef, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { openWhatsApp } from "@/lib/site";
import { getResultSetByServiceTitle } from "@/lib/results";
import { Reveal } from "@/components/Reveal";

const INITIAL_VISIBLE = 6;

type Service = { title: string; description: string };
type Category = { id: string; label: string; services: Service[] };
type ServicesProps = {
  onOpenResult?: (resultId: string) => void;
};

const CATEGORIES: Category[] = [
  {
    id: "estetica",
    label: "Cirugía Estética",
    services: [
      { title: "Abdominoplastía", description: "Extirpación de piel sobrante y tensado de musculatura abdominal para lograr un abdomen plano y definido." },
      { title: "Aumento de mamas", description: "Implantes de silicona de alta cohesión o lipotransferencia para aumentar el volumen y mejorar la proporción mamaria." },
      { title: "Rinoplastia", description: "Remodelación de la nariz para mejorar forma, proporción y armonía con el resto del rostro. Técnica abierta y cerrada." },
      { title: "Liposucción", description: "Eliminación de acumulaciones de grasa localizada resistentes a dieta y ejercicio, con técnica de alta precisión." },
      { title: "Otoplastia", description: "Corrección de orejas prominentes o asimétricas con técnica mínimamente invasiva y alta satisfacción del paciente." },
      { title: "Blefaroplastia", description: "Corrección del exceso de piel en párpados superiores e inferiores, rejuveneciendo la mirada y eliminando ojeras." },
      { title: "Ginecomastia", description: "Reducción del tejido mamario masculino mediante liposucción o extirpación glandular, con resultados definitivos." },
      { title: "Lipoescultura", description: "Técnica avanzada de alta definición para esculpir el cuerpo modelando con la propia grasa del paciente." },
      { title: "Implante capilar", description: "Trasplante de cabello por técnica FUE para tratar la alopecia con resultados naturales y permanentes." },
      { title: "Reducción de mamas", description: "Reducción del volumen mamario en casos de macromastia, aliviando molestias físicas y mejorando la proporción." },
      { title: "Aumento de glúteos", description: "Voluminización y remodelación de glúteos mediante implantes o lipotransferencia para un contorno natural." },
      { title: "Mastopexia", description: "Levantamiento mamario para corregir la ptosis y restaurar la forma y posición natural de las mamas." },
      { title: "Cirugía maxilofacial", description: "Corrección de asimetrías y deformidades de la cara, mandíbula y maxilar superior con enfoque funcional y estético." },
      { title: "Reconstrucción mamaria", description: "Cirugía reconstructiva post-mastectomía con implantes o colgajos propios, con abordaje multidisciplinario." },
      { title: "Lifting", description: "Rejuvenecimiento facial que tensa y reposiciona los tejidos del rostro y cuello con resultados naturales y duraderos." },
      { title: "Dermolipectomía", description: "Extirpación de exceso de piel y grasa en diversas zonas del cuerpo, especialmente tras pérdidas de peso importantes." },
      { title: "Cirugía de pómulos", description: "Implantes malares o lipofilling para dar volumen y proyección a los pómulos, armonizando el tercio medio del rostro." },
    ],
  },
  {
    id: "medicina",
    label: "Medicina Estética",
    services: [
      { title: "Ácido hialurónico", description: "Rellenos dérmicos para hidratación, volumen y suavizado de arrugas con resultados inmediatos y reversibles." },
      { title: "Botox", description: "Toxina botulínica para relajar músculos de expresión y suavizar líneas dinámicas del rostro de forma precisa." },
      { title: "Flebología", description: "Tratamiento de varices y arañas vasculares mediante escleroterapia o láser vascular con mínima invasión." },
      { title: "Plasma Rico en Plaquetas", description: "Bioestimulación con factores de crecimiento propios para rejuvenecer y regenerar la piel desde adentro." },
      { title: "Rinomodelación", description: "Corrección no quirúrgica de la nariz mediante rellenos estratégicos para mejorar su perfil sin cirugía." },
      { title: "HIFU", description: "Ultrasonido focalizado de alta intensidad para lifting sin cirugía y reafirmación cutánea en capas profundas." },
      { title: "Rejuvenecimiento facial", description: "Tratamiento integral combinado para mejorar textura, luminosidad y firmeza del rostro de forma global." },
      { title: "Hilos tensores", description: "Inserción de hilos absorbibles para levantar y tensar tejidos faciales sin intervención quirúrgica." },
      { title: "Eliminación de ojeras", description: "Tratamiento con rellenos o plasma para atenuar ojeras profundas y surcos bajo los ojos." },
      { title: "Medicina Ortomolecular", description: "Tratamiento nutricional personalizado para optimizar la salud celular y el bienestar integral del paciente." },
      { title: "Blefaroplastia sin cirugía", description: "Mejora del contorno ocular con plasma o radiofrecuencia, sin necesidad de bisturí ni recuperación prolongada." },
      { title: "Rellenos faciales", description: "Volumización y modelado facial con ácido hialurónico en diferentes zonas para un resultado armónico." },
    ],
  },
  {
    id: "dermatologia",
    label: "Belleza & Dermatología",
    services: [
      { title: "Borrar tatuajes", description: "Eliminación de tatuajes con tecnología láser Q-Switch de alta precisión y mínimas molestias en la piel." },
      { title: "Tratamiento para estrías", description: "Corrección de estrías mediante láser fraccionado, plasma o mesoterapia local según el tipo y extensión." },
      { title: "Mesoterapia", description: "Microinyecciones de vitaminas y principios activos para revitalizar y nutrir la piel en profundidad." },
      { title: "Tratamiento de celulitis", description: "Protocolos combinados de carboxiterapia, endermologie y radiofrecuencia para reducir la celulitis eficazmente." },
      { title: "Depilación láser", description: "Eliminación definitiva del vello no deseado con tecnología láser diodo de última generación." },
      { title: "Microdermoabrasión", description: "Exfoliación mecánica profunda para mejorar textura, manchas y poros de la piel de forma no invasiva." },
      { title: "Peeling", description: "Exfoliación química con ácidos para renovar la piel, unificar el tono y reducir manchas e imperfecciones." },
      { title: "Eliminar cicatrices", description: "Tratamiento de cicatrices con láser fraccionado, plasma o técnicas de revisión quirúrgica según el caso." },
    ],
  },
];

export function Services({ onOpenResult }: ServicesProps) {
  const [activeId, setActiveId] = useState("estetica");
  const [expanded, setExpanded] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const current = CATEGORIES.find((c) => c.id === activeId)!;
  const hasMore = current.services.length > INITIAL_VISIBLE;
  const hiddenCount = current.services.length - INITIAL_VISIBLE;

  const handleCategoryChange = (id: string) => {
    setActiveId(id);
    setExpanded(false);
  };

  const handleToggle = () => {
    if (expanded) {
      setExpanded(false);
      requestAnimationFrame(() => {
        const sectionTop = sectionRef.current
          ? window.scrollY + sectionRef.current.getBoundingClientRect().top
          : 0;
        window.scrollTo({ top: Math.max(sectionTop - 80, 0), behavior: "auto" });
      });
    } else {
      setExpanded(true);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="servicios"
      aria-labelledby="servicios-title"
      className="py-20 md:py-28 lg:py-32 bg-cream"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <Reveal preset="section" delay={0}>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-14 lg:mb-16 gap-8">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <span className="eyebrow-line" />
                <span className="eyebrow text-copper-dark">Procedimientos</span>
              </div>
              <h2 id="servicios-title" className="h-display text-darker">
                Cirugía plástica y estética <span className="h-accent">en Resistencia</span>
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const isActive = activeId === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={[
                      "min-h-11 px-5 py-2.5 font-sans text-2xs tracking-brand-wide uppercase border transition-[background-color,border-color,color,transform] duration-200 ease-out active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper",
                      isActive
                        ? "bg-copper text-white border-copper"
                        : "bg-transparent text-copper border-forest-2/40 hover:border-copper",
                    ].join(" ")}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </Reveal>

        <div className="flex flex-wrap items-stretch gap-px bg-border">
          {current.services.slice(0, INITIAL_VISIBLE).map((service, idx) => (
            <Reveal
              key={service.title}
              preset="card"
              delay={Math.min(idx * 45, 180)}
              className="w-full sm:w-[calc(50%-0.5px)] lg:w-[calc(33.333%-0.67px)] flex flex-col"
            >
              <ServiceCard service={service} onOpenResult={onOpenResult} />
            </Reveal>
          ))}

          {hasMore &&
            current.services.slice(INITIAL_VISIBLE).map((service, idx) => (
              <div
                key={service.title}
                className={[
                  "w-full sm:w-[calc(50%-0.5px)] lg:w-[calc(33.333%-0.67px)] flex flex-col overflow-hidden",
                  "transition-[max-height,opacity,transform] duration-500 ease-out",
                  expanded
                    ? "max-h-[600px] opacity-100 translate-y-0"
                    : "max-h-0 opacity-0 -translate-y-2 pointer-events-none",
                ].join(" ")}
                style={{
                  transitionDelay: expanded ? `${Math.min(idx * 40, 300)}ms` : "0ms",
                }}
                aria-hidden={!expanded}
              >
                <ServiceCard service={service} onOpenResult={onOpenResult} />
              </div>
            ))}
        </div>

        {hasMore && (
          <div className="flex justify-center mt-10">
            <button
              onClick={handleToggle}
              className="group inline-flex min-h-11 items-center gap-3 px-6 py-3 font-sans text-2xs tracking-[0.18em] uppercase text-copper border border-copper/40 hover:border-copper hover:bg-copper hover:text-white active:scale-[0.97] transition-[background-color,border-color,color,transform] duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
              aria-expanded={expanded}
            >
              <span>
                {expanded ? "Ver menos" : `Ver todos los servicios (${hiddenCount} más)`}
              </span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        )}

        <div className="text-center mt-14">
          <p className="font-sans text-sm text-muted-foreground mb-6">
            ¿No encontrás lo que buscás? Consultá por otros procedimientos disponibles.
          </p>
          <button onClick={() => openWhatsApp()} className="btn-primary">Solicitar información</button>
        </div>
      </div>
    </section>
  );
}

function ServiceCard({
  service,
  onOpenResult,
}: {
  service: Service;
  onOpenResult?: (resultId: string) => void;
}) {
  const linkedResult = getResultSetByServiceTitle(service.title);

  return (
    <div className="group p-8 lg:p-10 flex flex-col gap-4 h-full bg-cream hover:bg-forest transition-colors duration-500 cursor-default">
      <span className="text-xl text-sage transition-colors duration-300 group-hover:text-white/70">✦</span>
      <h3 className="font-sans text-[1.1rem] font-semibold text-darker group-hover:text-white transition-colors duration-300">
        {service.title}
      </h3>
      <p className="font-sans text-sm leading-[1.8] text-muted-foreground group-hover:text-white/65 transition-colors duration-300">
        {service.description}
      </p>
      <div className="mt-auto pt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        <button
          onClick={() =>
            openWhatsApp(
              `Hola Dr. Masedo, me gustaría recibir información sobre el procedimiento de ${service.title}.`
            )
          }
          className="inline-flex min-h-11 items-center gap-2 pr-2 text-sage hover:opacity-75 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
        >
          <span className="font-sans text-xs tracking-widest uppercase">Consultar</span>
          <ArrowRight size={14} />
        </button>
        {linkedResult && onOpenResult && (
          <button
            type="button"
            onClick={() => onOpenResult(linkedResult.id)}
            className="inline-flex min-h-11 items-center gap-2 border border-copper-dark/30 px-3 py-2 text-copper-dark transition-[background-color,border-color,color,opacity,transform] duration-200 hover:bg-copper hover:!text-white active:scale-[0.97] group-hover:border-[#D9B092]/70 group-hover:text-[#D9B092] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
            aria-label={`Ver resultados de ${service.title}`}
          >
            <span className="font-sans text-xs tracking-widest uppercase">Ver resultados</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
