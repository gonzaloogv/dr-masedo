import type { GalleryCatalog } from "./types";
import { getCatalogCover, getCatalogTone } from "./utils";

type CatalogCardProps = {
  catalog: GalleryCatalog;
  index: number;
  isExpanded: boolean;
  isSelecting: boolean;
  isRestoring: boolean;
  isReturning: boolean;
  isSelected: boolean;
  isSelectedMode: boolean;
  isTransitioning: boolean;
  onBlur: () => void;
  onClick: () => void;
  onFocus: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

export function CatalogCard({
  catalog,
  index,
  isExpanded,
  isSelecting,
  isRestoring,
  isReturning,
  isSelected,
  isSelectedMode,
  isTransitioning,
  onBlur,
  onClick,
  onFocus,
  onMouseEnter,
  onMouseLeave,
}: CatalogCardProps) {
  const cover = getCatalogCover(catalog);
  const serviceCount = catalog.services.length;
  const isHiddenInSelectedMode = isSelectedMode && !isSelected;
  const isRestoringHidden = isRestoring && !isReturning;
  const isSelectingHidden = isSelecting && isHiddenInSelectedMode;
  const selectMotionState = isSelecting ? (isSelected ? "anchor" : "exiting") : undefined;
  const mobileState = isSelectedMode && !isSelected ? "hidden" : "visible";
  const desktopFlexClass = isHiddenInSelectedMode
    ? "lg:w-0 lg:flex-none"
    : isExpanded
      ? "lg:flex-[2.15_1_0%]"
      : "lg:flex-[0.76_1_0%]";
  const interactionClass = isTransitioning
    ? "hover:border-sage/60"
    : "hover:-translate-y-0.5 hover:border-sage/60";
  const transitionClass = isRestoring
    ? "transition-[opacity,border-color,transform,filter] duration-[220ms]"
    : isSelecting
      ? "transition-[max-height,opacity,border-color,transform,filter] duration-[300ms]"
      : "transition-[max-height,flex,filter,opacity,transform,border-color,width] duration-[420ms]";
  const selectMotionClass = isSelecting
    ? isSelected
      ? "lg:-translate-x-5 lg:scale-[0.992]"
      : "lg:translate-x-6"
    : "";
  const visibilityClass = isHiddenInSelectedMode
    ? "h-0 max-h-0 !min-h-0 basis-0 border-0 opacity-0 pointer-events-none lg:h-full lg:max-h-0 lg:!min-h-0"
    : isRestoringHidden
      ? "max-h-[260px] opacity-0 pointer-events-none lg:max-h-none"
      : "max-h-[260px] opacity-100 lg:max-h-none";
  const imageMotionClass = isTransitioning ? "" : "group-hover:scale-[1.035]";

  return (
    <button
      aria-label={catalog.name}
      aria-expanded={isSelectedMode && isSelected ? true : undefined}
      aria-hidden={isHiddenInSelectedMode || isRestoringHidden ? true : undefined}
      className={`group relative flex min-h-11 shrink-0 aspect-[3/2] overflow-hidden border border-sage/25 bg-darker/40 text-left shadow-card-soft outline-none ${transitionClass} ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:translate-x-0 motion-reduce:translate-y-0 motion-reduce:scale-100 ${interactionClass} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-sage lg:aspect-[3/4] lg:h-full lg:min-h-11 lg:border ${selectMotionClass} ${visibilityClass} ${desktopFlexClass}`}
      data-gallery-catalog
      data-gallery-restore-state={
        isRestoring ? (isReturning ? "anchor" : "pending") : undefined
      }
      data-gallery-select-motion={selectMotionState}
      data-gallery-selected-catalog={isSelectedMode && isSelected ? true : undefined}
      data-mobile-state={mobileState}
      onBlur={onBlur}
      onClick={onClick}
      onFocus={onFocus}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      tabIndex={isHiddenInSelectedMode || isRestoringHidden ? -1 : 0}
      type="button"
    >
      {cover ? (
        <picture className="absolute inset-0">
          <source media="(min-width: 1024px)" srcSet={cover.desktop.src} />
          <source media="(min-width: 768px)" srcSet={cover.tablet.src} />
          <source media="(max-width: 767px)" srcSet={cover.mobile.src} />
          <img
            alt=""
            className={`h-full w-full object-cover transition-transform duration-500 ease-out ${imageMotionClass}`}
            draggable={false}
            loading={index === 0 ? "eager" : "lazy"}
            src={cover.desktop.src}
          />
        </picture>
      ) : (
        <span
          aria-hidden="true"
          className={`absolute inset-0 bg-gradient-to-br ${getCatalogTone(index)}`}
        />
      )}

      <span className={`absolute inset-0 bg-gradient-to-t ${getCatalogTone(index)}`} />
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-darker/95 via-darker/56 to-transparent"
        data-gallery-bottom-gradient
      />
      <span
        aria-hidden="true"
        className="absolute right-5 top-5 z-10 bg-copper px-3 py-1 font-sans text-2xs uppercase tracking-[0.14em] text-white lg:right-6 lg:top-6"
        data-gallery-service-count
      >
        {serviceCount}
      </span>
      <span className="relative flex min-h-[180px] w-full flex-col justify-end gap-5 p-5 text-white lg:min-h-0 lg:p-6">
        <span className="flex items-center justify-between gap-4">
          <span
            className={`font-sans text-2xs uppercase tracking-brand-tight text-sage transition-opacity duration-300 ${
              isExpanded
                ? "lg:opacity-100"
                : "lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100"
            }`}
          >
            {catalog.eyebrow}
          </span>
        </span>
        <span className="relative block lg:min-h-[9rem]">
          <span
            aria-hidden="true"
            className={`block font-serif text-3xl leading-tight transition-[opacity,transform] duration-300 md:text-4xl ${
              isExpanded
                ? "lg:translate-y-0 lg:opacity-100"
                : "lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-visible:translate-y-0 lg:group-focus-visible:opacity-100"
            }`}
            data-gallery-catalog-name-horizontal
          >
            {catalog.name}
          </span>
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute bottom-0 left-1/2 hidden -translate-x-1/2 whitespace-nowrap font-serif text-2xl leading-none text-white transition-[opacity,transform] duration-300 lg:block lg:[writing-mode:vertical-rl] lg:rotate-180 ${
              isExpanded
                ? "lg:translate-y-2 lg:opacity-0"
                : "lg:translate-y-0 lg:opacity-100 lg:group-hover:opacity-0 lg:group-focus-visible:opacity-0"
            }`}
            data-gallery-catalog-name-vertical
          >
            {catalog.name}
          </span>
          <span
            className={`mt-3 block max-w-sm font-sans text-sm leading-[1.7] text-white/75 opacity-100 transition-opacity duration-300 ${
              isExpanded
                ? "lg:opacity-100"
                : "lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100"
            }`}
          >
            {catalog.description}
          </span>
        </span>
      </span>
    </button>
  );
}
