"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "../PageHeader";
import { DataTable } from "../DataTable";
import { StatusBadge } from "../StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ContactPanel() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    api
      .adminContact("limit=50")
      .then((data) => setEntries(data.contacts || data.messages || []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const previous = entries;
    setEntries((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item)),
    );
    setFeedback("");
    try {
      await api.updateContact(id, status);
    } catch {
      setEntries(previous);
      setFeedback("No pudimos actualizar el estado. Intenta de nuevo.");
    }
  };

  return (
    <>
      <PageHeader
        title="CRM contacto"
        description="Gestiona solicitudes y seguimiento comercial."
      />
      {feedback && (
        <p className="mb-4 text-sm font-semibold text-destructive" role="alert">
          {feedback}
        </p>
      )}
      <DataTable
        columns={["Nombre", "Email", "Asunto", "Estado", "Acción"]}
        loading={loading}
        rows={entries.map((item: any) => [
          <span key={`name-${item.id}`} className="font-semibold">
            {item.name}
          </span>,
          item.email,
          item.subject || "—",
          <StatusBadge key={`badge-${item.id}`} value={item.status || "new"} />,
          <Select
            key={`action-${item.id}`}
            value={item.status || "new"}
            onValueChange={(value) => void updateStatus(item.id, value)}
          >
            <SelectTrigger className="h-8 w-36 text-xs" aria-label={`Cambiar estado de ${item.name}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Nuevo</SelectItem>
              <SelectItem value="read">Leído</SelectItem>
              <SelectItem value="replied">Respondido</SelectItem>
              <SelectItem value="archived">Archivado</SelectItem>
            </SelectContent>
          </Select>,
        ])}
      />
    </>
  );
}
