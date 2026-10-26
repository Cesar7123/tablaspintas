"use client";

import { useCallback, useEffect, useState } from "react";
import { BookOpen, CreditCard, DollarSign, Users } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader } from "../PageHeader";
import { DataTable } from "../DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function OverviewPanel() {
  const [data, setData] = useState<any>();
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api
      .adminAnalytics()
      .then((payload) => {
        setData(payload);
        setError("");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "No pudimos cargar el resumen."));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error)
    return (
      <>
        <PageHeader title="Resumen" description="Rendimiento de Tablas Pintas en tiempo real." />
        <Card className="border-destructive/40">
          <CardContent className="flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
            <Button variant="outline" onClick={load}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </>
    );

  const overview = data?.overview || {};
  const metrics = [
    { label: "Usuarios", value: overview.total_users ?? 0, icon: Users },
    {
      label: "Ingresos MXN",
      value: `$${Number(overview.total_revenue_mxn || 0).toLocaleString("es-MX")}`,
      icon: DollarSign,
    },
    { label: "Inscripciones", value: overview.total_enrollments ?? 0, icon: CreditCard },
    { label: "Cursos publicados", value: overview.courses_published ?? 0, icon: BookOpen },
  ];

  return (
    <>
      <PageHeader title="Resumen" description="Rendimiento de Tablas Pintas en tiempo real." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-start justify-between gap-4 p-5">
              <div className="min-w-0">
                <p className="font-subtitle text-[11px] uppercase tracking-[1.5px] text-muted-foreground">
                  {label}
                </p>
                {data ? (
                  <strong className="mt-2 block font-display text-3xl leading-none text-foreground">
                    {value}
                  </strong>
                ) : (
                  <Skeleton className="mt-2 h-8 w-24" />
                )}
              </div>
              <span className="grid size-10 shrink-0 place-items-center rounded-md bg-primary/25 text-[#8a6414]">
                <Icon className="size-5" aria-hidden />
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <DataTable
          title="Inscripciones recientes"
          columns={["Alumno", "Curso", "Monto"]}
          loading={!data}
          rows={(data?.recent_enrollments || []).map((item: any) => [
            item.user_name,
            item.course_title,
            `$${item.amount || 0}`,
          ])}
        />
        <DataTable
          title="Cursos destacados"
          columns={["Curso", "Inscripciones", "Ingresos"]}
          loading={!data}
          rows={(data?.top_courses || []).map((item: any) => [
            item.title,
            item.enrollments,
            `$${item.revenue_mxn || 0}`,
          ])}
        />
      </div>
    </>
  );
}
