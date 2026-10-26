import type { Metadata } from "next";
import { CmsPanel } from "@/components/admin/panels/CmsPanel";

export const metadata: Metadata = { title: "CMS · Admin | Tablas Pintas" };

export default function AdminCmsPage() {
  return <CmsPanel />;
}
