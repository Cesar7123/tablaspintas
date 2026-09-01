import { ArrowIcon } from "../atoms/ArrowIcon";
import { Eyebrow } from "../atoms/Eyebrow";
import { images } from "../../lib/content";

export function HeroGridVariant() {
  return <section className="hero hero-grid-variant"><div className="hero-grid-image" style={{ backgroundImage: `url(${images.composition})` }} /><div className="hero-grid-copy"><Eyebrow tone="gold">Una mesa · muchas historias</Eyebrow><h1>El sabor<br /><em>también se diseña.</em></h1><p>Aprende a componer tablas que cuentan algo antes del primer bocado.</p><a className="button primary" href="/cursos">Explorar la academia <ArrowIcon /></a></div><span className="variant-index">01 / 03</span></section>;
}

export function HeroEditorialVariant() {
  return <section className="hero hero-editorial-variant" style={{ backgroundImage: `url(${images.fruit})` }}><div className="hero-overlay" /><div className="editorial-top"><Eyebrow tone="gold">Tablas Pintas presenta</Eyebrow><span>Vol. 01 · Ciudad de México</span></div><div className="editorial-copy"><h1>Hazlo<br /><em>delicioso.</em></h1><p>El arte de presentar alimentos, explicado sin complicaciones.</p><div className="hero-actions"><a className="button primary" href="/registro">Comenzar ahora <ArrowIcon /></a><a className="text-link" href="/cursos">Ver cursos</a></div></div><div className="editorial-footer"><span>Arte / Sabor / Presentación</span><span>Desliza para descubrir ↓</span></div></section>;
}
