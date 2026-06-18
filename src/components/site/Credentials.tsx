import { GraduationCap, Globe } from "lucide-react";
import { Reveal } from "@/components/Reveal";

const EDUCATION = [
  {
    period: "1991",
    title: "Médico Cirujano",
    institution: "Universidad Nacional del Nordeste — Facultad de Medicina",
    detail: "Egresado el 25 de septiembre de 1991",
  },
  {
    period: "1998",
    title: "Especialista en Cirugía Plástica y Quemados",
    institution: "Ministerio de Salud Pública y Acción Social de la Nación",
    detail: "Otorgado el 27 de agosto de 1998",
  },
  {
    period: "2003",
    title: "Especialista en Clínica Estética",
    institution:
      "Asociación Médica Argentina — Escuela de Graduados / Asociación Argentina de Clínica Estética",
    detail: "Otorgado el 17 de diciembre de 2003",
  },
  {
    period: "",
    title: "Certificación de Especialista — A.M.A.",
    institution: "Asociación Médica Argentina",
    detail: "",
  },
];

const MEMBERSHIPS = [
  "Miembro Titular de la Sociedad de Cirugía Plástica del Nordeste (SCPN)",
  "Miembro Titular de la Sociedad Argentina de Cirugía Plástica, Estética y Reparadora (SACPER)",
  "Miembro Adherente de la Asociación Argentina de Cirugía Infantil (AACI) — desde 1998",
];

export function Credentials() {
  return (
    <section id="formacion" aria-labelledby="formacion-title" className="py-20 md:py-28 lg:py-32 bg-darker">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <Reveal y={16} delay={0}>
          <div className="text-center mb-14 lg:mb-16">
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="w-12 h-px bg-copper opacity-40" />
              <span className="eyebrow">Formación & Títulos</span>
              <span className="w-12 h-px bg-copper opacity-40" />
            </div>
            <h2 id="formacion-title" className="h-display text-white">
              Formación en cirugía plástica{" "}
              <span className="h-accent-sage italic-none">& membresías</span>
            </h2>
          </div>
        </Reveal>

        <div className="flex flex-col lg:flex-row gap-16 items-stretch">
          <div className="w-full lg:w-[60%] flex flex-col">
            <div>
              <div className="flex items-center gap-3 mb-10">
                <GraduationCap size={20} className="text-sage" />
                <h3 className="font-sans text-white text-sm tracking-brand-wider uppercase">
                  Educación & Formación
                </h3>
              </div>

              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-px bg-forest-2" />
                <div className="flex flex-col gap-10 pl-8">
                  {EDUCATION.map((item, i) => (
                    <Reveal key={i} y={14} delay={i * 60}>
                      <div className="relative">
                        <div
                          className="absolute -left-8 top-1.5 w-3 h-3 rounded-full bg-sage"
                          style={{ transform: "translateX(-5px)" }}
                        />
                        {item.period && (
                          <p className="font-sans text-xs tracking-widest text-copper mb-1">
                            {item.period}
                          </p>
                        )}
                        <h4 className="font-sans text-white text-base font-semibold mb-1">
                          {item.title}
                        </h4>
                        <p className="font-sans text-sage text-sm mb-1">{item.institution}</p>
                        {item.detail && (
                          <p className="font-sans text-xs text-white/65">{item.detail}</p>
                        )}
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>

            <Reveal y={14} delay={120} className="mt-12">
              <div className="flex items-center gap-3 mb-8">
                <Globe size={20} className="text-sage" />
                <h3 className="font-sans text-white text-sm tracking-brand-wider uppercase">
                  Membresías & Sociedades
                </h3>
              </div>
              <ul className="flex flex-col gap-3">
                {MEMBERSHIPS.map((item) => (
                  <li key={item} className="flex items-start gap-3 font-sans text-sm text-white/65">
                    <span className="w-1.5 h-1.5 rounded-full bg-sage flex-shrink-0 mt-2" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <div className="hidden lg:block lg:w-[40%] relative overflow-hidden rounded-md" style={{ minHeight: 520 }}>
            <img
              src="https://res.cloudinary.com/dz9tuwczf/image/upload/v1781272538/consultorio_dante_masedo-17_1_eyvvya.jpg"
              alt="Consultorios Güemes en Resistencia, Chaco, donde atiende el Dr. Masedo Carlos Dante"
              width={1200}
              height={1600}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
