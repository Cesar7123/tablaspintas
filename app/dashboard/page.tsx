"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/organisms/Navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthContext";
import { api, Enrollment } from "@/lib/api";

export default function DashboardPage() {
  const { user, isLoading, isInitialized } = useAuth();
  const [courses, setCourses] = useState<Enrollment[]>([]);
  const [certificates, setCertificates] = useState(0);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!isInitialized || isLoading || !user) return;
    Promise.all([api.myCourses("limit=50"), api.certificates()])
      .then(([enrolled, issued]) => {
        setCourses(enrolled.courses);
        setCertificates(issued.total);
      })
      .catch((err) => setError(err.message));
  }, [isInitialized, isLoading, user]);
  const active = courses.filter((course) => course.status === "active");
  const completed = courses.filter((course) => course.status === "completed");
  return (
    <ProtectedRoute>
      <Navigation solid />
      <main className="dashboard-page">
        <header className="dashboard-head flex flex-wrap">
          <div>
            <p className="eyebrow mustard-text">Academia Tablas Pintas</p>
            <h1>
              Tu <em>Academia</em>
            </h1>
          </div>
          <aside className="next-class">
            <span className="eyebrow mustard-text">Próxima sesión</span>
            {active[0] ? (
              <>
                <strong>
                  {new Date(active[0].date_of_transmission).toLocaleString("es-MX", {
                    dateStyle: "full",
                  })}
                </strong>
                <p>
                  {active[0].title}
                  <br />
                  {new Date(active[0].date_of_transmission).toLocaleTimeString("es-MX", {
                    timeStyle: "short",
                  })}
                </p>
                {active[0].google_meet_link && (
                  <a href={active[0].google_meet_link} target="_blank" rel="noreferrer">
                    Entrar a la sesión +
                  </a>
                )}
              </>
            ) : (
              <p>No tienes sesiones próximas.</p>
            )}
          </aside>
        </header>
        {error && (
          <p className="form-status" role="alert">
            {error}
          </p>
        )}
        <section className="dashboard-library first-library">
          <div className="subhead">
            <h2>Tus cursos</h2>
            <a href="/cursos">Explorar catálogo →</a>
          </div>
          <div className="course-list">
            {courses.length ? (
              courses.map((course) => (
                <a className="course-progress-row" href={`/cursos/${course.id}`} key={course.id}>
                  <span className="progress-thumb mustard">
                    <b>TP</b>
                  </span>
                  <span className="course-row-copy">
                    <strong>{course.title}</strong>
                    <small>
                      Acceso hasta {new Date(course.access_until).toLocaleDateString("es-MX")}
                    </small>
                  </span>
                  <span className={`status-pill ${course.status === "active" ? "current" : ""}`}>
                    {course.status === "completed"
                      ? "Completado"
                      : course.status === "expired"
                        ? "Expirado"
                        : "Activo"}
                  </span>
                  <span className="row-arrow">→</span>
                </a>
              ))
            ) : (
              <p className="form-status">Aún no tienes cursos inscritos.</p>
            )}
          </div>
        </section>
        <section className="dashboard-library completed">
          <div className="subhead">
            <h2>Certificados</h2>
            <span className="library-note">{certificates} disponibles</span>
          </div>
          {completed.length ? (
            completed.map((course) => (
              <a
                className="completed-row"
                href="/perfil#certificados"
                key={`completed-${course.id}`}
              >
                <span className="progress-thumb orange">
                  <b>✓</b>
                </span>
                <span className="course-row-copy">
                  <strong>{course.title}</strong>
                  <small>Curso completado</small>
                </span>
                <span className="certificate">Ver certificado →</span>
              </a>
            ))
          ) : (
            <p className="form-status">Completa un curso para obtener certificado.</p>
          )}
        </section>
      </main>
    </ProtectedRoute>
  );
}
