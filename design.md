# Tablas Pintas: Directrices de Diseño

## Dirección creativa

Landing editorial para una escuela de composición culinaria. La experiencia debe
sentirse como abrir un cuaderno de recetas de autor: cálida, táctil, precisa y un
poco inesperada. La referencia principal es `Tablas.pen`.

## Paleta

| Token | Valor | Uso |
| --- | --- | --- |
| `--cream` | `#f5f2ed` | Fondo principal |
| `--beige` | `#e8dfd2` | Superficies cálidas |
| `--orange` | `#eb6c23` | Marca, destacados |
| `--raspberry` | `#b53a43` | CTA de navegación |
| `--mustard` | `#d99a20` | CTA primario, detalles |
| `--leaf` | `#5a7551` | Títulos de pilares |
| `--ink` | `#34221b` | Texto principal |
| `--muted` | `#6f655e` | Texto secundario |
| `--dark` | `#33231f` | Secciones de contraste |

La paleta debe mantenerse cálida y con contraste. No introducir gradientes neón,
azules fríos ni superficies blancas puras.

## Tipografía

- Marca: `Cheap Potatoes Black`, cargada desde `/public/fonts` mediante `next/font/local`.
- Display: `CFCrayons-Regular`, para titulares, números y citas.
- Subtítulos y etiquetas: `Congreso de Perros`, para el carácter manuscrito/editorial del diseño.
- Cuerpo: sans-serif del sistema, 16px base, line-height 1.6, para conservar legibilidad.
- Los tokens `--font-brand`, `--font-display` y `--font-subtitle` se aplican desde `app/fonts.ts`.
- Titular hero: `clamp(3.5rem, 10vw, 8rem)`; nunca reducir el h1 a menos de 48px en desktop.

## Layout

- Contenedor máximo: 1200px, padding lateral fluido `clamp(20px, 6vw, 80px)`.
- Navegación de 80px, sticky, translúcida sobre el hero.
- Hero de 720px desktop con imagen a sangre, overlay oscuro y copy alineado a la izquierda.
- Secciones de contenido con mucho aire: 100px vertical desktop, 64px mobile.
- Pilares alternan texto e imagen. Cards de curso en grid de tres columnas.
- Evitar simetría excesiva: usar etiquetas verticales, líneas divisorias y elementos offset.

## Componentes

La arquitectura React sigue Atomic Design:

- `components/atoms`: `Brand`, `Button`, `Eyebrow`, `ArrowIcon`, `ImageFrame`.
- `components/molecules`: `SectionHeader`, `CourseCard`, `QuoteCard`.
- `components/organisms`: navegación, hero, formulario, pilares, cursos, testimonios, contacto y footer.
- `components/sections`: `LandingPage`, composición de la página completa.
- `lib`: contenido editorial y datos de cursos/testimonios, separado de presentación.

- Botón primario: mostaza, texto ink, radius 6px, mínimo 44px de alto.
- Botón secundario: transparente, borde cream, radius 6px.
- Card: radius 18px, padding 28px, sombra suave al hover, sin transformar layout.
- Inputs: borde ink al focus, anillo visible, label siempre visible.
- Iconos: SVG lineal, no emojis.

## Movimiento

- Entrada inicial: fade + translateY de 20px, 500ms, stagger de 80ms.
- GSAP: `Reveal` usa `ScrollTrigger` para entradas por viewport; animar sólo `opacity` y `transform`.
- Importar GSAP sólo en Client Components y limpiar contextos en unmount.
- Hover: 180-250ms, sólo color, sombra o translateY máximo 2px.
- Imágenes: zoom sutil al hover (`scale(1.03)`) dentro de overflow hidden.
- Respetar `prefers-reduced-motion`; eliminar transformaciones y transiciones no esenciales.

## Accesibilidad y responsive

- Skip link, landmarks semánticos, jerarquía h1 > h2 > h3.
- Todos los links y botones deben ser accesibles por teclado con focus visible.
- Labels asociados a inputs; feedback de envío junto al formulario.
- Breakpoints de referencia: 375px, 768px, 1024px, 1440px.
- Sin scroll horizontal; en mobile la navegación se convierte en menú desplegable.
- Imágenes con `alt`, `loading="lazy"` fuera del hero y espacio reservado.

## Fuente de decisiones

Estas reglas combinan la estructura observada en `Tablas.pen` con las recomendaciones
UI/UX Pro Max para producto food/culinary, y la capa de taste: textura orgánica,
composición editorial, un acento dominante por sección y transiciones con respiración.

## Rutas

- `/`: landing principal.
- `/cursos`: catálogo completo con `CourseCard` compartido.
- `/catalogo`: alias de navegación que redirige al catálogo de cursos.
- `/cursos/[slug]`: detalle individual de curso.
- `/login` y `/registro`: autenticación visual.
- `/checkout`: checkout de pago.
- `/perfil`: perfil y preferencias.
- `/dashboard`: academia y progreso.
- `not-found.tsx`: estado 404 editorial.
