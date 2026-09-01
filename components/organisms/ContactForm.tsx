"use client";

import { Formik, Form, Field, ErrorMessage, useFormikContext } from "formik";
import * as Yup from "yup";
import { Button } from "../atoms/Button";

export function ContactForm() {
  return <Formik initialValues={{ name: "", email: "", phone: "", message: "" }} validationSchema={Yup.object({ name: Yup.string().min(2, "Escribe tu nombre completo").required("Tu nombre es obligatorio"), email: Yup.string().email("Usa un correo válido").required("Tu correo es obligatorio"), phone: Yup.string(), message: Yup.string().min(10, "Cuéntanos un poco más").required("El mensaje es obligatorio") })} onSubmit={(_, actions) => { actions.resetForm(); actions.setStatus("Gracias. Te escribiremos muy pronto."); }}><Form><label htmlFor="name">Nombre completo</label><Field id="name" name="name" placeholder="Tu nombre" /><ErrorMessage name="name" component="span" className="field-error text-xs text-raspberry" /><label htmlFor="email">Correo electrónico</label><Field id="email" name="email" type="email" placeholder="tu@email.com" /><ErrorMessage name="email" component="span" className="field-error text-xs text-raspberry" /><label htmlFor="phone">Teléfono</label><Field id="phone" name="phone" type="tel" placeholder="+52 55 0000 0000" /><label htmlFor="message">Cuéntanos un poco más</label><Field as="textarea" id="message" name="message" rows={4} placeholder="¿Qué tienes en mente?" /><ErrorMessage name="message" component="span" className="field-error text-xs text-raspberry" /><Button type="submit">Enviar mensaje</Button><FormikStatus /></Form></Formik>;
}

function FormikStatus() { const { status } = useFormikContext<{ name: string; email: string; phone: string; message: string }>(); return status ? <p className="form-status" role="status">{status}</p> : null; }
