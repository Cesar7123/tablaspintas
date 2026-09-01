"use client";

import { FormEvent, useState } from "react";
import { Button } from "../atoms/Button";

export function ContactForm() {
  const [status, setStatus] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Gracias. Te escribiremos muy pronto.");
    event.currentTarget.reset();
  }
  return <form onSubmit={submit}><label htmlFor="name">Nombre completo</label><input id="name" name="name" placeholder="Tu nombre" required /><label htmlFor="email">Correo electrónico</label><input id="email" name="email" type="email" placeholder="tu@email.com" required /><label htmlFor="phone">Teléfono</label><input id="phone" name="phone" type="tel" placeholder="+52 55 0000 0000" /><label htmlFor="message">Cuéntanos un poco más</label><textarea id="message" name="message" rows={4} placeholder="¿Qué tienes en mente?" required /><Button type="submit">Enviar mensaje</Button>{status && <p className="form-status" role="status">{status}</p>}</form>;
}
