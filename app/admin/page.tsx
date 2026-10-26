import type { Metadata } from "next";
import { OverviewPanel } from "@/components/admin/panels/OverviewPanel";

export const metadata: Metadata = { title: "Resumen · Admin | Tablas Pintas" };

export default function AdminOverviewPage() {
  return <OverviewPanel />;
}
