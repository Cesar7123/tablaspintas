"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Suspense } from "react";
import { Brand } from "@/components/atoms/Brand";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthContext";
import { api, Course } from "@/lib/api";

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="checkout-page">
          <p>Cargando checkout...</p>
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const { user, isInitialized } = useAuth();
  const params = useSearchParams();
  const id = params.get("course") || params.get("curso");
  const [course, setCourse] = useState<Course | null>(null);
  const [provider, setProvider] = useState<"stripe" | "paypal">("stripe");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (id)
      api
        .course(id)
        .then(setCourse)
        .catch((err) => setError(err.message));
  }, [id]);
  const startCheckout = async () => {
    if (!course || !user) return;
    setLoading(true);
    try {
      const response = await api.checkout({ course_id: course.id, currency: "MXN", provider });
      window.location.href = response.checkout_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos iniciar el pago.");
      setLoading(false);
    }
  };
  return (
    <ProtectedRoute>
      <header className="checkout-nav">
        <a href="/">
          <Brand />
        </a>
        <a href="/cursos">← Volver al catálogo</a>
      </header>
      <main className="checkout-page">
        <header className="checkout-heading">
          <p className="eyebrow mustard-text">Finaliza tu inscripción</p>
          <h1>
            Tu próxima
            <br />
            <em>obra maestra</em>
          </h1>
          <p>Completa tu pago en una pasarela segura.</p>
          {user && <p>Compra para {user.email}</p>}
        </header>
        {error && (
          <p className="form-status" role="alert">
            {error}
          </p>
        )}
        {course ? (
          <section className="checkout-summary">
            <div className="summary-course">
              {course.thumbnail_url && <img src={course.thumbnail_url} alt={course.title} />}
              <div>
                <span>Curso seleccionado</span>
                <h2>{course.title}</h2>
                <p>
                  {course.instructor_name} · {course.duration_days} días de acceso
                </p>
              </div>
              <strong>${Number(course.price_mxn).toLocaleString("es-MX")} MXN</strong>
            </div>
            <div className="payment-section">
              <label htmlFor="provider">Método de pago</label>
              <select
                id="provider"
                value={provider}
                onChange={(event) => setProvider(event.target.value as "stripe" | "paypal")}
              >
                <option value="stripe">Stripe</option>
                <option value="paypal">PayPal</option>
              </select>
              <button
                className="button button-primary"
                onClick={startCheckout}
                disabled={loading || !isInitialized || !user}
              >
                {loading ? "Redirigiendo..." : "Continuar al pago"}
              </button>
              <small>El pago se completa en {provider === "stripe" ? "Stripe" : "PayPal"}.</small>
            </div>
          </section>
        ) : (
          <p>Cargando curso...</p>
        )}
      </main>
    </ProtectedRoute>
  );
}
