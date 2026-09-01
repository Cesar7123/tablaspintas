"use client";

import { useState } from "react";
import { ArrowIcon } from "../atoms/ArrowIcon";
import { Brand } from "../atoms/Brand";

export function Navigation({ solid = false }: { solid?: boolean }) {
  const [open, setOpen] = useState(false);
  const links = solid ? [["Inicio", "/"], ["Nosotros", "/#nosotros"], ["Cursos", "/cursos"], ["Catálogo", "/catalogo"], ["Contacto", "/#contacto"], ["Inicia sesión", "/login"]] : [["Inicio", "#inicio"], ["Nosotros", "#nosotros"], ["Cursos", "/cursos"], ["Catálogo", "/catalogo"], ["Contacto", "#contacto"], ["Inicia sesión", "/login"]];
  return <nav className={`nav ${solid ? "nav-solid" : ""}`} aria-label="Navegación principal"><a href={solid ? "/" : "#inicio"}><Brand /></a><button className="menu-toggle" aria-expanded={open} aria-controls="nav-links" onClick={() => setOpen(!open)}>Menú <span>{open ? "×" : "＋"}</span></button><div id="nav-links" className={`nav-links ${open ? "open" : ""}`}>{links.map(([label, href]) => <a className={label === "Inicia sesión" ? "nav-login" : ""} key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}</div><a className="nav-cta" href="/registro">Inscríbete</a></nav>;
}
