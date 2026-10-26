"use client";

import { useState } from "react";
import Link from "next/link";
import { isAdmin, useAuth } from "../auth/AuthContext";
import { Brand } from "../atoms/Brand";

export function Navigation({ solid = false }: { solid?: boolean }) {
  const [open, setOpen] = useState(false);
  const { user, isLoading, isInitialized } = useAuth();
  const sessionReady = isInitialized && !isLoading;
  const links = solid
    ? [
        ["Inicio", "/"],
        ["Nosotros", "/#nosotros"],
        ["Cursos", "/cursos"],
        ["Contacto", "/#contacto"],
      ]
    : [
        ["Inicio", "#inicio"],
        ["Nosotros", "#nosotros"],
        ["Cursos", "/cursos"],
        ["Contacto", "#contacto"],
      ];
  return (
    <nav className={`nav ${solid ? "nav-solid" : ""}`} aria-label="Navegación principal">
      <Link href="/" className="font-brand text-[22px] text-[#E57A3A]">
        <Brand />
      </Link>
      <button
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="nav-links"
        onClick={() => setOpen(!open)}
      >
        Menú <span>{open ? "×" : "＋"}</span>
      </button>
      <div id="nav-links" className={`nav-links ${open ? "open" : ""}`}>
        {links.map(([label, href]) => (
          <Link key={href} href={href} onClick={() => setOpen(false)}>
            {label}
          </Link>
        ))}
        {!sessionReady ? null : user ? (
          <>
            {isAdmin(user) && <Link href="/admin">Admin</Link>}
            <Link href="/dashboard">Academia</Link>
            <Link className="avatar" href="/perfil" aria-label="Abrir perfil">
              {user.initials}
            </Link>
          </>
        ) : (
          <Link className="nav-cta" href="/login">
            Iniciar sesión
          </Link>
        )}
      </div>
    </nav>
  );
}
