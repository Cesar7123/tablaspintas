import { SectionHeader } from "../molecules/SectionHeader";
import { QuoteCard } from "../molecules/QuoteCard";
import { testimonials } from "../../lib/content";

export function Testimonials() {
  return <section id="catalogo" className="testimonials"><SectionHeader eyebrow="Testimonios" dark>Lo que dicen nuestros<br /><em>alumnos</em></SectionHeader><div className="quote-grid">{testimonials.map((item, index) => <QuoteCard key={item.name} {...item} featured={index === 0} />)}</div></section>;
}
