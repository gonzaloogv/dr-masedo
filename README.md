# Dr. Masedo Carlos Dante

Landing single-page para el Dr. Masedo Carlos Dante, medico cirujano especializado en cirugia plastica reconstructiva, quemados y clinica estetica. El sitio esta enfocado en presencia institucional, SEO local para Resistencia, Chaco, y conversion por contacto directo.

## Stack

- React 18
- Vite
- TypeScript
- Tailwind CSS
- Vitest + Testing Library
- ESLint

## Requisitos

- Node.js 20 o superior
- npm como gestor oficial del proyecto

## Comandos

```bash
npm install
npm run dev
npm run lint
npm test
npm run build
npm run preview
```

## Estructura principal

```text
src/
  components/
    site/          Secciones de la landing
  hooks/           Hooks de navegacion y estado de seccion
  lib/             Datos compartidos y utilidades
  test/            Tests de la landing
public/
  images/          Assets publicos usados por la app
  robots.txt
  sitemap.xml
```

## SEO tecnico

El SEO base vive en `index.html`:

- `title` y `meta description` orientados a busqueda local.
- Open Graph para compartir la landing.
- JSON-LD con datos del medico y ubicacion de atencion.
- `robots.txt` y `sitemap.xml` en `public/`.

Si cambia el dominio final, tambien hay que actualizar:

- URLs canonicas y Open Graph en `index.html`.
- `Sitemap` en `public/robots.txt`.
- `<loc>` en `public/sitemap.xml`.

## Contenido y medios

- Cloudinary aloja las imagenes clinicas y videos principales.
- `src/lib/results.ts` concentra los resultados de galeria.
- La galeria usa imagenes 3:2 en desktop y 3:4 en mobile.
- La modal de resultados usa las imagenes completas de cada procedimiento.

## Produccion

Antes de publicar:

```bash
npm run lint
npm test
npm run build
```

El build final queda en `dist/`.
