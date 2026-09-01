import { Brand } from "../atoms/Brand";

export function CourseDetailNav() {
  return (
    <>
      <header className="flex h-[72px] items-center justify-between bg-[#F4EADC] px-5 md:px-12">
        <a href="/" className="font-brand text-[22px] text-[#E57A3A]">
          <Brand />
        </a>
        <nav className="hidden items-center gap-8 font-display text-sm md:flex">
          <a href="/">Inicio</a>
          <a href="/cursos">Cursos</a>
          <a href="/dashboard">Academia</a>
          <a href="/#contacto">Contacto</a>
        </nav>
        <div className="flex items-center gap-4 font-display text-sm">
          <a className="hidden text-[#8C5A32] sm:block" href="/perfil">
            Mi Cuenta
          </a>
          <a
            className="rounded-lg bg-[#C94A46] px-5 py-2.5 font-semibold text-[#FAF5ED]"
            href="/registro"
          >
            Inscribirme
          </a>
        </div>
      </header>
    </>
  );
}
