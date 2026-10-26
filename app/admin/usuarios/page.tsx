import type { Metadata } from "next";
import { UsersPanel } from "@/components/admin/panels/UsersPanel";

export const metadata: Metadata = { title: "Usuarios · Admin | Tablas Pintas" };

export default function AdminUsersPage() {
  return <UsersPanel />;
}
