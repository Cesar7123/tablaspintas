import type { Metadata } from "next";
import { ContactPanel } from "@/components/admin/panels/ContactPanel";

export const metadata: Metadata = { title: "CRM contacto · Admin | Tablas Pintas" };

export default function AdminContactPage() {
  return <ContactPanel />;
}
