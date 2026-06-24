import type { CSSProperties, RefObject } from "react";

import { CatalogCard } from "./CatalogCard";
import { GALLERY_CATALOGS } from "./data";
import { ServiceCard } from "./ServiceCard";
import type { GalleryCatalog, GalleryService, GalleryViewState } from "./types";
import type { ServiceGridLayout } from "./utils";

type GalleryStageProps = {
  areServicesInteractive: boolean;
  catalogHoverRoomClass: string;
  catalogOverflowClass: string;
  catalogPanelState: string;
  galleryStageRef: RefObject<HTMLDivElement | null>;
  galleryViewState: GalleryViewState;
  hoveredCatalogId: string | null;
  isSelectedLayout: boolean;
  returningCatalogId: string | null;
  selectedCatalog: GalleryCatalog | null;
  selectedCatalogId: string | null;
  serviceGridLayout: ServiceGridLayout | null;
  servicesCatalog: GalleryCatalog | null;
  servicesOverflowClass: string;
  servicesPanelState: string;
  onCatalogSelect: (catalog: GalleryCatalog) => void;
  onHoverCatalogChange: (catalogId: string | null) => void;
  onSelectedCatalogReturn: (catalog: GalleryCatalog) => void;
  onServiceSelect: (catalog: GalleryCatalog, service: GalleryService) => void;
};

export function GalleryStage({
  areServicesInteractive,
  catalogHoverRoomClass,
  catalogOverflowClass,
  catalogPanelState,
  galleryStageRef,
  galleryViewState,
  hoveredCatalogId,
  isSelectedLayout,
  returningCatalogId,
  selectedCatalog,
  selectedCatalogId,
  serviceGridLayout,
  servicesCatalog,
  servicesOverflowClass,
  servicesPanelState,
  onCatalogSelect,
  onHoverCatalogChange,
  onSelectedCatalogReturn,
  onServiceSelect,
}: GalleryStageProps) {
  return (
    <div
      ref={galleryStageRef}
      className={`grid transition-[gap] duration-[450ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none ${
        isSelectedLayout ? "gap-5 lg:grid-cols-[minmax(210px,280px)_1fr] lg:items-stretch" : "gap-0"
      }`}
      data-gallery-motion-stage
      data-state={galleryViewState}
    >
      <div
        className={`flex flex-col ${catalogOverflowClass} ${catalogHoverRoomClass} opacity-100 transition-[max-height,opacity,transform,gap] duration-[450ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none lg:h-[540px] lg:max-h-none lg:flex-row lg:gap-2 ${
          isSelectedLayout ? "max-h-[260px] gap-0" : "max-h-[2000px] gap-3"
        }`}
        data-gallery-catalogs
        data-gallery-mobile-collapse
        data-state={catalogPanelState}
      >
        {GALLERY_CATALOGS.map((catalog, index) => {
          const isSelected = isSelectedLayout && selectedCatalog?.id === catalog.id;
          const activeCatalogId =
            galleryViewState === "open"
              ? hoveredCatalogId
              : isSelectedLayout
                ? selectedCatalogId
                : null;

          return (
            <CatalogCard
              key={catalog.id}
              catalog={catalog}
              index={index}
              isExpanded={activeCatalogId ? activeCatalogId === catalog.id : false}
              isSelecting={galleryViewState === "selecting"}
              isRestoring={galleryViewState === "restoring"}
              isReturning={galleryViewState === "restoring" && returningCatalogId === catalog.id}
              isSelected={isSelected}
              isSelectedMode={isSelectedLayout}
              isTransitioning={galleryViewState !== "open"}
              onClick={() => {
                if (galleryViewState === "selected" && isSelected && selectedCatalog) {
                  onSelectedCatalogReturn(selectedCatalog);
                  return;
                }

                if (galleryViewState !== "open") {
                  return;
                }

                onCatalogSelect(catalog);
              }}
              onMouseEnter={() => {
                if (galleryViewState === "open") {
                  onHoverCatalogChange(catalog.id);
                }
              }}
              onMouseLeave={() => onHoverCatalogChange(null)}
              onFocus={() => {
                if (galleryViewState === "open") {
                  onHoverCatalogChange(catalog.id);
                }
              }}
              onBlur={() => onHoverCatalogChange(hoveredCatalogId === catalog.id ? null : hoveredCatalogId)}
            />
          );
        })}
      </div>

      <div
        aria-hidden={servicesPanelState === "open" ? undefined : true}
        className={`grid ${servicesOverflowClass} transition-[opacity,transform] duration-[420ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none md:transition-[grid-template-rows,max-height,opacity,transform] ${
          servicesPanelState === "open"
            ? "grid-rows-[1fr] max-h-[3200px] translate-y-0 opacity-100 md:max-h-[1200px]"
            : servicesPanelState === "closing"
              ? "pointer-events-none grid-rows-[0fr] max-h-[3200px] translate-y-1 opacity-0 md:max-h-[1200px]"
              : "pointer-events-none grid-rows-[0fr] max-h-0 translate-y-3 opacity-0"
        }`}
        data-gallery-services
        data-state={servicesPanelState}
      >
        <div className={`min-h-0 ${servicesOverflowClass}`}>
          {servicesCatalog && serviceGridLayout ? (
            <div
              className="grid grid-cols-2 gap-3 md:h-[540px] md:grid-cols-[repeat(var(--gallery-service-cols),minmax(0,1fr))] md:grid-rows-[repeat(var(--gallery-service-rows),minmax(0,1fr))] lg:h-[540px]"
              data-gallery-service-cells={serviceGridLayout.cells}
              data-gallery-services-grid
              style={
                {
                  "--gallery-service-cols": String(serviceGridLayout.columns),
                  "--gallery-service-rows": String(serviceGridLayout.rows),
                } as CSSProperties
              }
            >
              {servicesCatalog.services.map((service, index) => (
                <ServiceCard
                  key={service.title}
                  index={index}
                  isVisible={areServicesInteractive}
                  service={service}
                  onClick={() => onServiceSelect(servicesCatalog, service)}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
