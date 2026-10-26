import { Brand } from "../atoms/Brand";

import Link from "next/link";

export function CourseDetailNav() {
  return (
    <>
      <header className="flex h-[72px] items-center justify-between bg-[#F4EADC] px-5 md:px-12">
        <Link href="/" className="font-brand text-[22px] text-[#E57A3A]">
          <Brand />
        </Link>
        <nav className="hidden items-center gap-8 font-display text-sm md:flex">
          <Link href="/">Inicio</Link>
          <Link href="/cursos">Cursos</Link>
          <Link href="/dashboard">Academia</Link>
          <Link href="/#contacto">Contacto</Link>
        </nav>
        <div className="flex items-center gap-4 font-display text-sm">
          <Link className="hidden text-[#8C5A32] sm:block" href="/perfil">
            Mi Cuenta
          </Link>
          <Link
            className="rounded-lg bg-[#C94A46] px-5 py-2.5 font-semibold text-[#FAF5ED]"
            href="/registro"
          >
            Inscribirme
          </Link>
        </div>
      </header>
    </>
  );
}
