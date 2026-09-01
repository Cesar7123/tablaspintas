"use client";

import { Formik, Form, Field, ErrorMessage, useFormikContext } from "formik";
import * as Yup from "yup";
import { Button } from "../atoms/Button";

const schema = Yup.object({ card: Yup.string().matches(/^[0-9 ]{16,19}$/, "Escribe un número de tarjeta válido").required("El número de tarjeta es obligatorio"), expiry: Yup.string().matches(/^(0[1-9]|1[0-2])\s?\/\s?\d{2}$/, "Usa el formato MM / AA").required("El vencimiento es obligatorio"), cvv: Yup.string().matches(/^\d{3,4}$/, "Usa 3 o 4 dígitos").required("El CVV es obligatorio"), holder: Yup.string().min(3, "Escribe el nombre completo").required("El nombre es obligatorio") });

export function PaymentForm() {
  return <Formik initialValues={{ card: "", expiry: "", cvv: "", holder: "" }} validationSchema={schema} onSubmit={(_, actions) => { actions.setStatus("Pago preparado. Conectaremos la pasarela de pago próximamente."); actions.setSubmitting(false); }}><Form><label htmlFor="card">Número de tarjeta</label><Field id="card" name="card" placeholder="1234 5678 9012 3456" inputMode="numeric" /><ErrorMessage name="card" component="span" className="field-error text-xs text-raspberry" /><div className="input-row"><div><label htmlFor="expiry">Vencimiento</label><Field id="expiry" name="expiry" placeholder="MM / AA" /><ErrorMessage name="expiry" component="span" className="field-error text-xs text-raspberry" /></div><div><label htmlFor="cvv">CVV</label><Field id="cvv" name="cvv" placeholder="123" inputMode="numeric" /><ErrorMessage name="cvv" component="span" className="field-error text-xs text-raspberry" /></div></div><label htmlFor="holder">Nombre en la tarjeta</label><Field id="holder" name="holder" placeholder="Nombre completo" /><ErrorMessage name="holder" component="span" className="field-error text-xs text-raspberry" /><Button type="submit">Pagar $1,506.84 MXN</Button><small>Pago seguro. Tus datos están protegidos.</small><PaymentStatus /></Form></Formik>;
}

function PaymentStatus() { const { status } = useFormikContext<{ card: string; expiry: string; cvv: string; holder: string }>(); return status ? <p className="form-status" role="status">{status}</p> : null; }
