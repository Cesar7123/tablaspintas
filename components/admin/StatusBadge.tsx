import { Badge } from "@/components/ui/badge";

const statusMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "brand" | "outline" }> = {
  paid: { label: "Pagado", variant: "success" },
  completed: { label: "Completado", variant: "success" },
  published: { label: "Publicado", variant: "success" },
  replied: { label: "Respondido", variant: "success" },
  active: { label: "Activa", variant: "success" },
  pending: { label: "Pendiente", variant: "warning" },
  new: { label: "Nuevo", variant: "brand" },
  read: { label: "Leído", variant: "default" },
  draft: { label: "Borrador", variant: "default" },
  archived: { label: "Archivado", variant: "default" },
  user: { label: "Usuario", variant: "default" },
  admin: { label: "Admin", variant: "brand" },
  failed: { label: "Fallido", variant: "destructive" },
  cancelled: { label: "Cancelado", variant: "destructive" },
  expired: { label: "Expirada", variant: "destructive" },
};

export function StatusBadge({ value }: { value?: string | null }) {
  const key = String(value ?? "").toLowerCase();
  const entry = statusMap[key] ?? {
    label: value ? String(value) : "—",
    variant: "default" as const,
  };
  return <Badge variant={entry.variant}>{entry.label}</Badge>;
}
