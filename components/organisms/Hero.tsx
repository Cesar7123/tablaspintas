import { ArrowIcon } from "../atoms/ArrowIcon";
import { Eyebrow } from "../atoms/Eyebrow";
import { images } from "../../lib/content";

export function Hero() {
  return <section id="inicio" className="hero" style={{ backgroundImage: `url(${images.hero})` }}><div className="hero-overlay" /><span className="side-label left">EST. 2020</span><span className="side-label right">CIUDAD DE MÉXICO</span><div className="hero-copy"><Eyebrow tone="gold">Arte <i>•</i> Sabor <i>•</i> Presentación</Eyebrow><h1>Tablas<br /><em>Pintas</em></h1><p className="hero-title">El arte de presentar alimentos</p><p className="hero-description">Transformamos ingredientes simples en obras maestras comestibles. Aprende a crear tablas de frutas, quesos y embutidos que deleitan la vista y el paladar.</p><div className="hero-actions"><a className="button primary" href="/cursos">Ver cursos <ArrowIcon /></a><a className="button ghost" href="/catalogo">Explorar catálogo</a></div></div><div className="hero-note">Composición<br />que se comparte</div></section>;
}
