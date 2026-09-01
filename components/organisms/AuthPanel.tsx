"use client";

import { Formik, Form, Field, ErrorMessage, useFormikContext } from "formik";
import * as Yup from "yup";
import { Brand } from "../atoms/Brand";
import { Button } from "../atoms/Button";
import { useRouter } from "next/navigation";
import { useAuth } from "../auth/AuthContext";

export function AuthPanel({ register = false }: { register?: boolean }) {
  const router = useRouter();
  const { login } = useAuth();
  const schema = Yup.object({ name: register ? Yup.string().min(2, "Escribe tu nombre completo").required("Tu nombre es obligatorio") : Yup.string(), email: Yup.string().email("Usa un correo válido").required("Tu correo es obligatorio"), password: Yup.string().required("La contraseña es obligatoria") });
  return <main className="auth-page"><a className="auth-brand" href="/"><Brand /></a><section className="auth-panel"><p className="eyebrow mustard-text">{register ? "Empieza tu camino" : "Bienvenido de vuelta"}</p><h1>{register ? "Crea tu cuenta" : "Inicia sesión"}</h1><p className="auth-intro">{register ? "Guarda tus cursos, certificados y progreso en un solo lugar." : "Continúa aprendiendo el arte de presentar alimentos."}</p>{!register && <p className="form-status">Demo: user@test.com / user</p>}<Formik initialValues={{ name: "", email: "", password: "" }} validationSchema={schema} onSubmit={(values, actions) => { if (register) { actions.setStatus("Registro disponible próximamente."); } else if (login(values.email, values.password)) { router.push("/perfil"); } else { actions.setStatus("Correo o contraseña incorrectos."); } actions.setSubmitting(false); }}><Form>{register && <><label htmlFor="name">Nombre completo</label><Field id="name" name="name" placeholder="Tu nombre" /><ErrorMessage name="name" component="span" className="field-error text-xs text-raspberry" /></>}<label htmlFor="email">Correo electrónico</label><Field id="email" name="email" type="email" placeholder="tu@email.com" /><ErrorMessage name="email" component="span" className="field-error text-xs text-raspberry" /><label htmlFor="password">Contraseña</label><Field id="password" name="password" type="password" placeholder={register ? "Tu contraseña" : "user"} /><ErrorMessage name="password" component="span" className="field-error text-xs text-raspberry" />{!register && <a className="forgot" href="mailto:hola@tablaspintas.mx">¿Olvidaste tu contraseña?</a>}<Button type="submit">{register ? "Crear cuenta" : "Entrar"}</Button><AuthStatus /></Form></Formik><p className="auth-switch">{register ? "¿Ya tienes cuenta?" : "¿Aún no tienes cuenta?"} <a href={register ? "/login" : "/registro"}>{register ? "Inicia sesión" : "Regístrate"}</a></p></section></main>;
}

function AuthStatus() { const { status } = useFormikContext<{ name: string; email: string; password: string }>(); return status ? <p className="form-status" role="status">{status}</p> : null; }
