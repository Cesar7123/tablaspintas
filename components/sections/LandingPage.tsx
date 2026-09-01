import { Navigation } from "../organisms/Navigation";
import { Hero } from "../organisms/Hero";
import { Pillars } from "../organisms/Pillars";
import { Courses } from "../organisms/Courses";
import { Testimonials } from "../organisms/Testimonials";
import { Contact } from "../organisms/Contact";
import { Footer } from "../organisms/Footer";
import { Reveal } from "../atoms/Reveal";
// Opciones de hero: descomenta sólo una para probar una dirección alternativa.
import { HeroGridVariant, HeroEditorialVariant } from "../organisms/HeroVariants";

export function LandingPage() {
  return <><Navigation /><Hero />{/* Para mostrar una variante manualmente, reemplaza Hero por HeroGridVariant o HeroEditorialVariant. */}<div className="marquee" aria-label="Especialidades"><span>Selección de frutas</span><b /><span>Quesos & embutidos</span><b /><span>Composición visual</span><b /><span>Cursos en vivo</span><b /><span>Certificados</span></div><main id="contenido"><Reveal><Pillars /></Reveal><Reveal><Courses /></Reveal><Reveal><Testimonials /></Reveal><Reveal><Contact /></Reveal></main><Footer /></>;
}
