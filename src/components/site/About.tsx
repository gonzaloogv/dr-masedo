import { openWhatsApp } from "@/lib/site";
import { Reveal } from "@/components/Reveal";

const FACTS = [
  { label: "Especialidad", value: "Cirugía Plástica Reconstructiva, Quemados y Clínica Estética" },
  { label: "Matrícula", value: "MP 3.479 — MN 91.339" },
  { label: "Asociaciones", value: "SCPN, SACPER, AACI" },
  { label: "Consultorio", value: "Consultorios Güemes — Resistencia, Chaco" },
];

export function About() {
  return (
    <section
      id="sobre-mi"
      aria-labelledby="sobre-mi-title"
      className="relative py-20 md:py-28 lg:py-32 overflow-hidden bg-cream"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center gap-4 mb-4">
          <span className="eyebrow-line" />
          <span className="eyebrow text-copper-dark">Sobre mí</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <Reveal preset="media" clip={false} className="relative" x={-24} y={0} delay={0}>
            <div
              className="absolute -top-6 -left-6 w-full h-full hidden lg:block"
              style={{ border: "2px solid hsl(var(--brand-sage) / 0.4)" }}
            />
            <div
              className="relative z-10 w-full overflow-hidden"
              style={{ height: "clamp(350px, 50vw, 600px)", maxHeight: 600 }}
            >
              <img
                src="https://res.cloudinary.com/dz9tuwczf/image/upload/t_optimize/consultorio_dante_masedo-37_pmuhop.jpg"
                alt="Dr. Masedo Carlos Dante, cirujano plástico en Resistencia, Chaco"
                width={1200}
                height={1600}
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-8 -right-6 z-20 hidden lg:block bg-forest px-5 py-4">
              <p className="font-sans text-[11px] tracking-brand-tight uppercase text-white/70 text-center mb-1">
                Miembro certificado
              </p>
              <p className="font-serif italic text-white text-lg text-center">
                Dr. Masedo Carlos Dante
              </p>
            </div>
          </Reveal>
          <Reveal preset="text" className="relative z-10" x={24} y={0} delay={90}>
            <h2 id="sobre-mi-title" className="h-display-light mb-8 text-darker">
              Cirujano plástico en{" "}
              <span className="h-display text-forest-2">Resistencia, Chaco</span>
            </h2>

            <p className="body-text mb-6">
              El Dr. Masedo Carlos Dante es médico especialista en Cirugía Plástica Reconstructiva,
              Quemados y Clínica Estética, con más de 35 años de trayectoria en el norte argentino
              y formación de posgrado en los centros médicos más reconocidos del país.
            </p>

            <p className="body-text mb-8">
              Su práctica abarca tanto la cirugía estética como la reconstructiva y el tratamiento
              de quemados, combinando precisión técnica con un enfoque profundamente humano.
              Cada paciente es único, y cada tratamiento refleja esa singularidad.
            </p>

            <div className="grid grid-cols-2 gap-6 mb-10">
              {FACTS.map((item) => (
                <div key={item.label}>
                  <p className="font-sans text-xs tracking-widest uppercase text-sage mb-1">
                    {item.label}
                  </p>
                  <p className="font-sans text-sm text-forest-2 font-medium">{item.value}</p>
                </div>
              ))}
            </div>

            <button onClick={() => openWhatsApp()} className="btn-primary">Agendar consulta</button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
