import type { GalleryService } from "./types";
import { getServicePreview, getServiceResult } from "./utils";

type ServiceCardProps = {
  index: number;
  isVisible: boolean;
  service: GalleryService;
  onClick: () => void;
};

export function ServiceCard({ index, isVisible, service, onClick }: ServiceCardProps) {
  const result = getServiceResult(service);
  const caseCount = result?.modalImages.length ?? 0;
  const preview = getServicePreview(result);
  const serviceStateClass = isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0";
  const surfaceClass = preview
    ? "bg-darker/50"
    : "bg-gradient-to-br from-darker/92 via-dark/78 to-forest-2/48";

  return (
    <button
      aria-label={
        caseCount > 0
          ? `Ver resultados de ${service.title}`
          : `${service.title}. Sin fotos de casos disponibles`
      }
      aria-hidden={isVisible ? undefined : true}
      className={`group relative flex min-h-[180px] overflow-hidden border border-sage/20 p-4 text-left shadow-card-soft outline-none transition-[border-color,transform,background-color,opacity] duration-[220ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:translate-y-0 motion-reduce:transition-none hover:-translate-y-0.5 hover:border-copper/65 hover:bg-darker/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage md:min-h-0 lg:p-5 ${surfaceClass} ${serviceStateClass}`}
      data-gallery-service
      data-gallery-service-has-preview={preview ? true : false}
      data-gallery-service-position={index + 1}
      data-gallery-service-state={isVisible ? "open" : "closed"}
      onClick={onClick}
      style={{ transitionDelay: isVisible ? `${60 + index * 35}ms` : "0ms" }}
      tabIndex={isVisible ? undefined : -1}
      type="button"
    >
      {preview ? (
        <picture className="absolute inset-0" data-gallery-service-preview>
          <source media="(min-width: 1024px)" srcSet={preview.desktop.src} />
          <source media="(min-width: 768px)" srcSet={preview.tablet.src} />
          <img
            alt=""
            className="h-full w-full object-cover opacity-75 transition-transform duration-500 ease-out group-hover:scale-[1.035]"
            draggable={false}
            loading="lazy"
            src={preview.tablet.src}
          />
        </picture>
      ) : (
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-darker/92 via-dark/78 to-forest-2/48"
          data-gallery-service-empty-surface
        />
      )}
      <span
        className="absolute inset-0"
        data-gallery-service-reading-overlay="gradient"
        style={{
          backgroundImage:
            "linear-gradient(to top, hsl(var(--brand-darker) / 0.96), hsl(var(--brand-darker) / 0.58), hsl(var(--brand-darker) / 0.82))",
        }}
      />
      <span className="relative z-10 flex h-full w-full flex-col justify-between">
        <span>
          <span className="block font-serif text-xl leading-tight text-white md:text-lg xl:text-xl">
            {service.title}
          </span>
          <span className="mt-2 block overflow-hidden font-sans text-xs leading-[1.55] text-white/70 md:[-webkit-box-orient:vertical] md:[-webkit-line-clamp:2] md:[display:-webkit-box]">
            {service.description}
          </span>
        </span>
        <span className="mt-4 flex items-center justify-between gap-4 border-t border-sage/15 pt-3 font-sans text-2xs uppercase tracking-[0.16em]">
          <span className={caseCount > 0 ? "text-sage" : "text-white/50"}>
            {caseCount > 0 ? `${caseCount} fotos` : "Sin fotos"}
          </span>
          <span className="text-copper transition-transform duration-300 group-hover:translate-x-1">
            Ver
          </span>
        </span>
      </span>
    </button>
  );
}
