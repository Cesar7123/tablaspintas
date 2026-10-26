import type { Metadata } from "next";
import { CoursesPanel } from "@/components/admin/panels/CoursesPanel";

export const metadata: Metadata = { title: "Cursos · Admin | Tablas Pintas" };

export default function AdminCoursesPage() {
  return <CoursesPanel />;
}
