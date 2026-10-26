"use client";

import { Formik, Form, Field, ErrorMessage, useFormikContext } from "formik";
import * as Yup from "yup";
import { Button } from "../atoms/Button";
import { ApiUser } from "@/lib/api";
import { useAuth } from "../auth/AuthContext";

export function ProfileForm({ user }: { user: ApiUser }) {
  const { updateProfile } = useAuth();

  return (
    <Formik
      enableReinitialize
      initialValues={{ name: user.full_name, email: user.email, phone: user.phone || "" }}
      validationSchema={Yup.object({
        name: Yup.string()
          .min(2, "Escribe tu nombre completo")
          .required("El nombre es obligatorio"),
        email: Yup.string().email("Usa un correo válido").required("El correo es obligatorio"),
        phone: Yup.string(),
      })}
      onSubmit={async (values, actions) => {
        try {
          await updateProfile({ full_name: values.name, phone: values.phone });
          actions.setStatus("Cambios guardados correctamente.");
        } catch (error) {
          actions.setStatus(
            error instanceof Error ? error.message : "No pudimos guardar los cambios.",
          );
        } finally {
          actions.setSubmitting(false);
        }
      }}
    >
      <Form className="settings-form">
        <label htmlFor="profile-name">Nombre completo</label>
        <Field id="profile-name" name="name" />
        <ErrorMessage name="name" component="span" className="field-error text-xs text-raspberry" />
        <label htmlFor="profile-email">Correo electrónico</label>
        <Field id="profile-email" name="email" type="email" disabled />
        <ErrorMessage
          name="email"
          component="span"
          className="field-error text-xs text-raspberry"
        />
        <label htmlFor="profile-phone">Teléfono</label>
        <Field id="profile-phone" name="phone" />
        <Button type="submit">Guardar cambios</Button>
        <ProfileStatus />
      </Form>
    </Formik>
  );
}

function ProfileStatus() {
  const { status } = useFormikContext<{ name: string; email: string; phone: string }>();
  return status ? (
    <p className="form-status" role="status">
      {status}
    </p>
  ) : null;
}
