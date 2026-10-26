"use client";

import { FormEvent, useEffect, useState } from "react";
import { Save } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader } from "../PageHeader";
import { ImageUpload } from "../ImageUpload";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CmsPanel() {
  const [page, setPage] = useState("home");
  const [form, setForm] = useState({
    first_text: "",
    title: "",
    subtitle: "",
    hero_image_url: "",
    status: "draft",
  });
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{ message: string; tone: "ok" | "error" } | null>(null);

  useEffect(() => {
    setLoading(true);
    setHeroFile(null);
    api
      .content(page)
      .then((data) => {
        setForm({
          first_text: String(data.first_text || ""),
          title: String(data.title || ""),
          subtitle: String(data.subtitle || ""),
          hero_image_url: String(data.hero_image_url || ""),
          status: String(data.status || "draft"),
        });
        setStatus(null);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [page]);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const payload = { ...form, hero_image_url: heroFile ? undefined : form.hero_image_url };
      await api.updateContent(page, payload, heroFile ?? undefined);
      setHeroFile(null);
      setStatus({ message: "Contenido guardado.", tone: "ok" });
    } catch (err) {
      setStatus({
        message: err instanceof Error ? err.message : "No se pudo guardar.",
        tone: "error",
      });
    }
  };

  const fields = [
    { key: "first_text", label: "Texto superior" },
    { key: "title", label: "Título" },
    { key: "subtitle", label: "Subtítulo" },
  ] as const;

  return (
    <>
      <PageHeader
        title="CMS"
        description="Edita el contenido publicado sin desplegar código."
      />
      <Card>
        <CardHeader>
          <CardTitle>Contenido de página</CardTitle>
          <CardDescription>
            Selecciona la página y ajusta los textos principales.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={save} className="grid gap-4">
            <div className="flex flex-col gap-2 sm:max-w-xs">
              <Label htmlFor="cms-page">Página</Label>
              <Select value={page} onValueChange={setPage}>
                <SelectTrigger id="cms-page">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="courses">Cursos</SelectItem>
                  <SelectItem value="contact">Contacto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {fields.map(({ key, label }) => (
              <div key={key} className="flex flex-col gap-2">
                <Label htmlFor={`cms-${key}`}>{label}</Label>
                <Input
                  id={`cms-${key}`}
                  disabled={loading}
                  value={form[key]}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, [key]: event.target.value }))
                  }
                />
              </div>
            ))}
            <ImageUpload
              label="Imagen hero"
              currentUrl={form.hero_image_url}
              file={heroFile}
              onFileChange={setHeroFile}
              onRemove={() => {
                setHeroFile(null);
                setForm((current) => ({ ...current, hero_image_url: "" }));
              }}
              disabled={loading}
            />
            <div className="flex flex-col gap-2 sm:max-w-xs">
              <Label htmlFor="cms-status">Estado</Label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, status: value }))
                }
              >
                <SelectTrigger id="cms-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button type="submit" variant="brand" disabled={loading}>
                <Save aria-hidden /> Guardar contenido
              </Button>
              {status && (
                <p
                  className={
                    status.tone === "ok"
                      ? "text-sm font-semibold text-[hsl(var(--success))]"
                      : "text-sm font-semibold text-destructive"
                  }
                  role={status.tone === "ok" ? "status" : "alert"}
                >
                  {status.message}
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
