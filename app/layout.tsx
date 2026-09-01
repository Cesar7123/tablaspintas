import type { Metadata } from "next";
import "./globals.css";
import { cheapPotatoes, cfCrayons, congresoDePerros } from "./fonts";

export const metadata: Metadata = {
  title: "Tablas Pintas | El arte de presentar alimentos",
  description: "Cursos en vivo para crear tablas de frutas, quesos y embutidos.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body className={`${cheapPotatoes.variable} ${cfCrayons.variable} ${congresoDePerros.variable}`}>{children}</body></html>;
}
