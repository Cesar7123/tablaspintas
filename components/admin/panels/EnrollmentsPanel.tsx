"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "../PageHeader";
import { DataTable } from "../DataTable";
import { StatusBadge } from "../StatusBadge";

export function EnrollmentsPanel() {
  const [data, setData] = useState<any>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .adminEnrollments("limit=50")
      .then(setData)
      .catch(() => setData({ enrollments: [] }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader title="Inscripciones" description="Seguimiento de pagos, acceso y alumnos." />
      <DataTable
        columns={["Alumno", "Curso", "Pago", "Monto", "Fecha"]}
        loading={loading}
        rows={(data?.enrollments || []).map((item: any, index: number) => [
          <span key={`user-${item.id ?? index}`} className="font-semibold">
            {item.user?.full_name || item.user_name || "—"}
          </span>,
          item.course?.title || item.course_title || "—",
          <StatusBadge key={`status-${item.id ?? index}`} value={item.payment_status} />,
          `${item.amount_paid || item.amount || 0} ${item.currency || "MXN"}`,
          item.enrolled_at ? new Date(item.enrolled_at).toLocaleDateString("es-MX") : "—",
        ])}
      />
    </>
  );
}
