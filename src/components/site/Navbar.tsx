import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS, openWhatsApp } from "@/lib/site";
import { useActiveSection } from "@/hooks/use-active-section";
import { smoothScrollToHash } from "@/lib/smooth-scroll";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const sectionIds = useMemo(() => NAV_LINKS.map((l) => l.href.replace("#", "")), []);
  const activeId = useActiveSection(sectionIds);

  useEffect(() => {
    let frame = 0;
    const update = () => setIsScrolled(window.scrollY > 60);
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => () => { if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current); }, []);

  const openMenu = useCallback(() => {
    if (closeTimerRef.current) { window.clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
    setIsOpen(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setIsEntering(true)));
  }, []);

  const closeMenu = useCallback((restoreFocus = true) => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    setIsEntering(false);
    closeTimerRef.current = window.setTimeout(() => {
      setIsOpen(false);
      closeTimerRef.current = null;
      if (restoreFocus) menuButtonRef.current?.focus();
    }, 320);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    requestAnimationFrame(() => closeButtonRef.current?.focus());

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenu();
      } else if (e.key === "Tab" && mobileMenuRef.current) {
        const focusable = Array.from(
          mobileMenuRef.current.querySelectorAll<HTMLElement>("button, a, [tabindex]:not([tabindex='-1'])")
        ).filter((el) => !el.hasAttribute("disabled"));
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeMenu]);

  const handleLinkClick = (href: string, isMobile = false) => {
    if (isMobile) {
      closeMenu();
      smoothScrollToHash(href, 320);
    } else {
      smoothScrollToHash(href);
    }
  };

  return (
    <nav
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300",
        isScrolled
          ? "bg-dark/80 backdrop-blur-md shadow-navbar"
          : "bg-transparent",
      )}
    >
      <div
        className={cn(
          "w-full px-4 lg:px-10 flex items-center justify-between transition-[height] duration-300",
          isScrolled ? "h-20 lg:h-16" : "h-20",
        )}
      >
        <a
          href="#inicio"
          onClick={(e) => { e.preventDefault(); handleLinkClick("#inicio"); }}
          className="flex flex-col leading-tight"
        >
          <span className="font-script text-sm text-white/85">DR.</span>
          <span className="font-script text-[28px] text-white">Masedo Carlos Dante</span>
        </a>

        <ul className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            const id = link.href.replace("#", "");
            const isActive = activeId === id;
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); handleLinkClick(link.href); }}
                  className={cn(
                    "relative font-sans text-xs tracking-brand-tight uppercase transition-colors pb-1",
                    isActive ? "text-white" : "text-white/70 hover:text-white",
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      "absolute left-0 -bottom-0.5 h-px bg-sage transition-[width,opacity] duration-200",
                      isActive ? "w-full opacity-100" : "w-0 opacity-0",
                    )}
                  />
                </a>
              </li>
            );
          })}
        </ul>

        <button type="button" onClick={() => openWhatsApp()} className="hidden lg:inline-block btn-compact">
          Solicitar consulta
        </button>

        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => (isOpen ? closeMenu() : openMenu())}
          className="flex h-11 w-11 items-center justify-center text-white lg:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage"
          aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
          aria-controls="mobile-menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          style={{
            backgroundColor: isEntering ? "hsl(0 0% 0% / 0.4)" : "hsl(0 0% 0% / 0)",
            backdropFilter: isEntering ? "blur(4px)" : "blur(0px)",
            transition: "background-color 300ms ease, backdrop-filter 300ms ease",
          }}
          onClick={() => closeMenu()}
        >
          <div
            id="mobile-menu"
            ref={mobileMenuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menú principal"
            className="fixed top-0 right-0 bg-copper rounded-bl-2xl"
            style={{
              width: "75%",
              maxWidth: 320,
              transform: isEntering ? "translateX(0)" : "translateX(100%)",
              transition: "transform 280ms cubic-bezier(0.32, 0.72, 0, 1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col px-6 pt-8 pb-6 relative">
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => closeMenu()}
                className="absolute top-5 right-5 flex h-11 w-11 items-center justify-center text-white/80 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                aria-label="Cerrar menú"
              >
                <X size={24} />
              </button>

              <div className="mb-3 mt-2">
                <span className="block font-script text-sm text-white/85">DR.</span>
                <span className="block font-script text-[22px] text-white">Masedo Carlos Dante</span>
              </div>

              <hr className="border-white/20 my-3" />

              <nav className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => {
                  const id = link.href.replace("#", "");
                  const isActive = activeId === id;
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={(e) => { e.preventDefault(); handleLinkClick(link.href, true); }}
                      className={cn(
                        "py-3 font-sans text-base border-l-2 pl-3 transition-colors",
                        isActive
                          ? "text-white border-white"
                          : "text-white/80 border-transparent hover:text-white",
                      )}
                    >
                      {link.label}
                    </a>
                  );
                })}
              </nav>

              <button
                type="button"
                onClick={() => { closeMenu(false); openWhatsApp(); }}
                className="w-full mt-8 py-4 bg-dark text-white font-sans text-xs tracking-[0.12em] uppercase rounded hover:opacity-90 active:scale-[0.98] transition-[opacity,transform] duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Solicitar consulta
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
