import { ImageFrame } from "../atoms/ImageFrame";
import { SectionHeader } from "../molecules/SectionHeader";
import { pillars } from "../../lib/content";

export function Pillars() {
  return <section id="nosotros" className="section about"><SectionHeader eyebrow="Nuestro concepto" description="Cada tabla es una obra de arte que combina selección cuidadosa, curación experta y composición visual impecable.">Tres pilares del<br /><em>arte culinario</em></SectionHeader><div className="pillars">{pillars.map((pillar, index) => <article className={`pillar ${index % 2 ? "reverse" : ""}`} key={pillar.number}><div className="pillar-copy"><span className="number">{pillar.number}</span><h3>{pillar.title}</h3><p>{pillar.text}</p></div><ImageFrame src={pillar.image} alt={pillar.title} /></article>)}</div></section>;
}
