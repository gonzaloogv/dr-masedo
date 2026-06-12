import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { InstagramIcon } from "./InstagramIcon";
import { INSTAGRAM_URL, openWhatsApp } from "@/lib/site";

const INFO = [
  { icon: Phone, label: "Teléfono", value: "03624-428782 / 03624-413405", sub: "Consultorios Güemes" },
  { icon: Mail, label: "Email", value: "dantemasedo@hotmail.com", sub: "Respondemos en 24-48 horas hábiles" },
  { icon: MapPin, label: "Consultorio", value: "Remedios de Escalada 599", sub: "Resistencia, Chaco — Consultorios Güemes" },
  { icon: Clock, label: "Horarios", value: "Lunes a Viernes: 10:00 — 20:00", sub: "" },
  { icon: InstagramIcon, label: "Instagram", value: "@dr.masedo", sub: "", href: INSTAGRAM_URL },
] as const;

const MAPS_EMBED =
  "https://maps.google.com/maps?q=Remedios+de+Escalada+599,+Resistencia,+Chaco,+Argentina&output=embed&z=15";

const MAPS_EXTERNAL =
  "https://maps.google.com/?q=Remedios+de+Escalada+599,+Resistencia,+Chaco";

export function Contact() {
  return (
    <section id="contacto" className="py-20 md:py-28 lg:py-32 bg-darker">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-14 lg:mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="w-12 h-px bg-copper opacity-40" />
            <span className="eyebrow">Contacto</span>
            <span className="w-12 h-px bg-copper opacity-40" />
          </div>
          <h2 className="h-display text-white">
            Agendá tu{" "}
            <span className="font-serif italic font-normal text-sage">consulta</span>
          </h2>
          {/* 0.9rem: subtítulo de sección — entre text-sm (14px) y text-base (16px). */}
          {/* No migrar a token: jerarquía intencional del diseño. */}
          <p className="mt-4 max-w-2xl mx-auto font-sans text-white/45 text-[0.9rem] leading-[1.8]">
            Escribinos por WhatsApp o llamanos directamente. Te respondemos en
            24-48 horas hábiles.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Map */}
          <div className="order-2 lg:order-1 flex flex-col gap-3">
            <div
              className="overflow-hidden w-full min-h-[400px] rounded-lg flex-1"
              style={{ border: "1px solid hsl(var(--brand-sage) / 0.1)" }}
            >
              <iframe
                title="Ubicación Consultorios Güemes"
                src={MAPS_EMBED}
                width="100%"
                height="100%"
                className="block w-full h-full min-h-[400px] rounded-lg border-0 transition-[filter] duration-500 md:hover:[filter:none]"
                style={{ filter: "grayscale(0.4) contrast(0.9) brightness(0.95)" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a
              href={MAPS_EXTERNAL}
              target="_blank"
              rel="noreferrer"
              className="self-end font-sans text-xs tracking-widest uppercase text-sage/70 hover:text-sage transition"
            >
              Abrir en Google Maps →
            </a>
          </div>

          {/* Info */}
          <div
            className="order-1 lg:order-2 flex flex-col gap-8 rounded-lg p-6 lg:p-8 min-h-[400px]"
            style={{ border: "1px solid hsl(var(--brand-sage) / 0.1)" }}
          >
            <div>
              <p className="mb-6 font-sans text-xs tracking-widest uppercase text-sage">
                Información de contacto
              </p>

              <div className="flex flex-col gap-5">
                {INFO.map((item) => (
                  <div key={item.label} className="flex gap-4">
                    <div
                      className="w-10 h-10 flex items-center justify-center flex-shrink-0 text-sage rounded-md border border-sage/15"
                      style={{ backgroundColor: "hsl(var(--brand-forest-2) / 0.4)" }}
                    >
                      <item.icon size={16} />
                    </div>
                    <div>
                      <p className="font-sans text-xs tracking-widest uppercase text-sage mb-0.5">
                        {item.label}
                      </p>
                      {"href" in item && item.href ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noreferrer"
                          className="font-sans text-white text-sm hover:text-sage transition"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="font-sans text-white text-sm">{item.value}</p>
                      )}
                      {item.sub && (
                        <p className="font-sans text-white/35 text-xs">{item.sub}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp */}
            <button
              onClick={openWhatsApp}
              className="mt-auto w-full py-4 flex items-center justify-center gap-3 rounded-lg text-white font-sans font-medium text-xs tracking-brand-tight transition-all duration-300 hover:opacity-90"
              style={{ backgroundColor: "hsl(var(--brand-whatsapp))" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Contactar por WhatsApp
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
