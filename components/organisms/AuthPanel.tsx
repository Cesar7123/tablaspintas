"use client";

import { FormEvent, useState } from "react";
import { Brand } from "../atoms/Brand";
import { Button } from "../atoms/Button";

export function AuthPanel({ register = false }: { register?: boolean }) {
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSent(true); }
  return <main className="auth-page"><a className="auth-brand" href="/"><Brand /></a><section className="auth-panel"><p className="eyebrow mustard-text">{register ? "Empieza tu camino" : "Bienvenido de vuelta"}</p><h1>{register ? "Crea tu cuenta" : "Inicia sesión"}</h1><p className="auth-intro">{register ? "Guarda tus cursos, certificados y progreso en un solo lugar." : "Continúa aprendiendo el arte de presentar alimentos."}</p><form onSubmit={submit}>{register && <><label htmlFor="name">Nombre completo</label><input id="name" required placeholder="Tu nombre" /></>}<label htmlFor="email">Correo electrónico</label><input id="email" type="email" required placeholder="tu@email.com" /><label htmlFor="password">Contraseña</label><input id="password" type="password" required placeholder="Mínimo 8 caracteres" />{!register && <a className="forgot" href="mailto:hola@tablaspintas.mx">¿Olvidaste tu contraseña?</a>}<Button type="submit">{register ? "Crear cuenta" : "Entrar"}</Button>{sent && <p className="form-status" role="status">{register ? "Cuenta creada. Revisa tu correo." : "Sesión iniciada correctamente."}</p>}</form><p className="auth-switch">{register ? "¿Ya tienes cuenta?" : "¿Aún no tienes cuenta?"} <a href={register ? "/login" : "/registro"}>{register ? "Inicia sesión" : "Regístrate"}</a></p></section></main>;
}
