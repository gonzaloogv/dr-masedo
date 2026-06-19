export const WHATSAPP_NUMBER = "5493624611145";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
export const PHONE_DISPLAY = "+54 9 362 461-1145";
export const EMAIL = "dantemasedo@hotmail.com";
export const ADDRESS = "Consultorios Güemes — Resistencia, Chaco";
export const INSTAGRAM_URL = "https://www.instagram.com/dr.masedo/";

export const openWhatsApp = (message?: unknown) => {
  const text = typeof message === "string" ? message : "";
  const url = text
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
    : WHATSAPP_URL;
  window.open(url, "_blank");
};

export const NAV_LINKS = [
  { label: "Inicio", href: "#inicio" },
  { label: "Sobre mí", href: "#sobre-mi" },
  { label: "Formación", href: "#formacion" },
  { label: "Servicios", href: "#servicios" },
  { label: "Galería", href: "#galeria" },
  { label: "Testimonios", href: "#testimonios" },
  { label: "Contacto", href: "#contacto" },
];
