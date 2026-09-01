import { ArrowIcon } from "../atoms/ArrowIcon";
import { SectionHeader } from "../molecules/SectionHeader";
import { ContactForm } from "./ContactForm";

export function Contact() {
  return <section id="contacto" className="section contact"><SectionHeader eyebrow="Contáctanos" description="Escríbenos para más información sobre nuestros cursos, catálogos personalizados o eventos especiales.">¿Listo para crear tu<br /><em>obra maestra?</em></SectionHeader><div className="contact-body"><ContactForm /><aside className="contact-aside"><span className="aside-stamp">TP</span><p>Hagamos algo<br /><em>delicioso</em><br />juntos.</p><a href="mailto:hola@tablaspintas.mx">hola@tablaspintas.mx <ArrowIcon /></a><span>Ciudad de México · México</span></aside></div></section>;
}
