"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader } from "../PageHeader";
import { DataTable } from "../DataTable";
import { StatusBadge } from "../StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function UsersPanel() {
  const [data, setData] = useState<any>();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback((term: string) => {
    setLoading(true);
    api
      .adminUsers(term ? `search=${encodeURIComponent(term)}` : "")
      .then((payload) => setData(payload))
      .catch(() => setData({ users: [] }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load("");
  }, [load]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    load(search);
  };

  return (
    <>
      <PageHeader
        title="Usuarios"
        description="Consulta usuarios, actividad y cursos adquiridos."
      />
      <form
        onSubmit={submit}
        className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center"
        role="search"
      >
        <Input
          className="sm:max-w-sm"
          placeholder="Buscar por nombre o email"
          aria-label="Buscar por nombre o email"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Button type="submit" variant="brand">
          <Search aria-hidden /> Buscar
        </Button>
      </form>
      <DataTable
        columns={["Nombre", "Email", "Rol", "Cursos", "Alta"]}
        loading={loading}
        rows={(data?.users || []).map((user: any) => [
          <span key={`name-${user.id}`} className="font-semibold">
            {user.full_name}
          </span>,
          user.email,
          <StatusBadge key={`role-${user.id}`} value={user.role} />,
          user.courses_bought ?? 0,
          user.created_at ? new Date(user.created_at).toLocaleDateString("es-MX") : "—",
        ])}
      />
    </>
  );
}
