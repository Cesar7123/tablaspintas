"use client";

import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { ArrowIcon } from "../atoms/ArrowIcon";
import { Brand } from "../atoms/Brand";

export function Navigation({ solid = false }: { solid?: boolean }) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
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
      <a href="/" className="font-brand text-[22px] text-[#E57A3A]">
        <Brand />
      </a>
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
          <a
            key={href}
            href={href}
            onClick={() => setOpen(false)}
          >
            {label}
          </a>
        ))}
        {user ? (
          <>
            <a className="avatar" href="/perfil" aria-label="Abrir perfil">
              {user.initials}
            </a>
          </>
        ) : (
          <a className="nav-cta" href="/login">
            Iniciar sesión
          </a>
        )}
      </div>
    </nav>
  );
}
