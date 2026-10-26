import { Brand } from "../atoms/Brand";
import { Button } from "../atoms/Button";
import { Eyebrow } from "../atoms/Eyebrow";

export function ComingSoon() {
  return (
    <main id="contenido" className="soon">
      <header className="nav soon-nav">
        <Brand />
        <a className="soon-mail" href="mailto:hola@tablaspintas.mx">hola@tablaspintas.mx</a>
      </header>
      <section className="soon-hero" aria-labelledby="soon-title">
        <span className="side-label right" aria-hidden="true">Escuela de composición culinaria</span>
        <div className="soon-copy">
          <Eyebrow>En construcción · 2026</Eyebrow>
          <h1 id="soon-title">
            Estamos preparando <em>la mesa.</em>
          </h1>
          <p className="soon-subtitle">Muy pronto abrimos nuestra escuela.</p>
          <p className="soon-description">
            Cursos en vivo para crear tablas de frutas, quesos y embutidos. Estamos afinando cada detalle para recibirte.
          </p>
          <div className="hero-actions">
            <Button href="mailto:hola@tablaspintas.mx">Escríbenos</Button>
          </div>
        </div>
        <div className="soon-stamp" aria-hidden="true">
          <span>Pronto</span>
          <strong>TP</strong>
          <span>2026</span>
        </div>
      </section>
      <div className="marquee" aria-label="Especialidades">
        <span>Frutas</span>
        <b />
        <span>Quesos</span>
        <b />
        <span>Embutidos</span>
        <b />
        <span>Cursos en vivo</span>
      </div>
      <footer className="footer">
        <Brand />
        <p>El arte de presentar alimentos.</p>
        <span>© 2020—2026 Tablas Pintas</span>
      </footer>
    </main>
  );
}
