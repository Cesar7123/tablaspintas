"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/organisms/Navigation";
import { ProfileForm } from "@/components/organisms/ProfileForm";
import { AuthUser, useAuth } from "@/components/auth/AuthContext";
import { api, Certificate } from "@/lib/api";

export default function ProfilePage() {
  const { user, isLoading, isInitialized, logout } = useAuth();
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!isInitialized || isLoading || !user) return;
    api
      .certificates()
      .then((issued) => setCertificates(issued.certificates))
      .catch((err) => setError(err.message));
  }, [isInitialized, isLoading, user]);
  if (!user)
    return (
      <>
        <Navigation solid />
        <main className="account-page">
          <p>{error || "Cargando perfil..."}</p>
        </main>
      </>
    );
  return (
    <>
      <Navigation solid />
      <main className="account-page">
        <aside className="account-nav">
          <span className="eyebrow mustard-text">Mi espacio</span>
          <div className="profile-identity">
            <span className="profile-avatar">
              {user.full_name
                .split(/\s+/)
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </span>
            <div>
              <strong>{user.full_name}</strong>
              <small>{user.email}</small>
            </div>
          </div>
          <div className="profile-stats">
            <span>
              <b>{user.courses_bought || 0}</b>
              <small>Cursos</small>
            </span>
            <span>
              <b>{certificates.length}</b>
              <small>Certificados</small>
            </span>
            <span>
              <b>{user.courses_completed || 0}</b>
              <small>Completados</small>
            </span>
          </div>
          <nav>
            <a className="active" href="/perfil">
              Perfil y ajustes
            </a>
            <a href="/dashboard">Mis cursos</a>
            <a
              href="/"
              onClick={(event) => {
                event.preventDefault();
                logout().then(() => {
                  router.push("/");
                });
              }}
            >
              Cerrar sesión
            </a>
          </nav>
        </aside>
        <section className="account-content">
          <p className="eyebrow mustard-text">Perfil y ajustes</p>
          <h2>Tu información</h2>
          <ProfileForm user={user} />
          <div className="settings-divider">
            <h3>Preferencias de correo</h3>
            <PreferenceForm user={user} />
          </div>
          <div className="settings-divider certificates" id="certificados">
            <h3>Mis certificados</h3>
            {certificates.length ? (
              certificates.map((certificate) => (
                <div className="security-row" key={certificate.id}>
                  <span>
                    <strong>{certificate.course_title}</strong>
                    <small>
                      {certificate.certificate_code} ·{" "}
                      {new Date(certificate.issued_at).toLocaleDateString("es-MX")}
                    </small>
                  </span>
                  <a href={certificate.pdf_url} target="_blank" rel="noreferrer">
                    Descargar
                  </a>
                </div>
              ))
            ) : (
              <p>No tienes certificados disponibles.</p>
            )}
          </div>
          <div className="danger-zone">
            <h3>Zona de riesgo</h3>
            <p>Solicita eliminación de cuenta al equipo de Tablas Pintas.</p>
            <a href="mailto:hola@tablaspintas.mx?subject=Eliminar%20cuenta">
              Solicitar eliminación de cuenta
            </a>
          </div>
        </section>
      </main>
    </>
  );
}

function PreferenceForm({ user }: { user: AuthUser }) {
  const { setUserFromApi } = useAuth();
  const [preferences, setPreferences] = useState(
    user.preferences || { class_reminder: true, novelties: true, email_notifications: true },
  );
  const save = async (key: keyof typeof preferences, value: boolean) => {
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    const updated = await api.updateMe({ preferences: next });
    setUserFromApi(updated);
  };
  return (
    <>
      {(
        [
          ["class_reminder", "Recordatorios de clase"],
          ["novelties", "Novedades de Tablas Pintas"],
          ["email_notifications", "Notificaciones por correo"],
        ] as const
      ).map(([key, label]) => (
        <label className="toggle-row" key={key}>
          <span>
            <strong>{label}</strong>
            <small>Gestiona los avisos que recibes.</small>
          </span>
          <input
            type="checkbox"
            checked={preferences[key]}
            onChange={(event) => save(key, event.target.checked)}
          />
        </label>
      ))}
    </>
  );
}
