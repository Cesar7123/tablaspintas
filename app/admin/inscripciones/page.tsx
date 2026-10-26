import type { Metadata } from "next";
import { EnrollmentsPanel } from "@/components/admin/panels/EnrollmentsPanel";

export const metadata: Metadata = { title: "Inscripciones · Admin | Tablas Pintas" };

export default function AdminEnrollmentsPage() {
  return <EnrollmentsPanel />;
}
