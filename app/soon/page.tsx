import type { Metadata } from "next";
import { ComingSoon } from "@/components/organisms/ComingSoon";

export const metadata: Metadata = {
  title: "Tablas Pintas | Próximamente",
  description: "Estamos preparando la escuela de composición culinaria Tablas Pintas.",
};

export default function SoonPage() {
  return (
    <>
      <a className="skip-link" href="#contenido">
        Ir al contenido
      </a>
      <ComingSoon />
    </>
  );
}
