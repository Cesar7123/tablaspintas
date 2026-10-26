"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { api, Course } from "@/lib/api";
import { PageHeader } from "../PageHeader";
import { DataTable } from "../DataTable";
import { ImageUpload } from "../ImageUpload";
import { DateTime, toInputValue } from "../DateTime";
import { StatusBadge } from "../StatusBadge";
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
import { Textarea } from "@/components/ui/textarea";

const emptyForm = {
  title: "",
  subtitle: "",
  description: "",
  instructor_name: "",
  price_mxn: "",
  duration_days: "30",
  occupancy: "25",
  date_of_transmission: "",
  google_meet_link: "",
  thumbnail_url: "",
  published: false,
};

export function CoursesPanel() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextPage, setNextPage] = useState(2);
  const [form, setForm] = useState(emptyForm);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyCourseId, setBusyCourseId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ message: string; tone: "ok" | "error" } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api
      .courses("limit=50&sort=newest")
      .then((data) => {
        setCourses(data.courses);
        setHasMore((data.pagination?.current_page ?? 1) < (data.pagination?.total_pages ?? 1));
        setNextPage((data.pagination?.current_page ?? 1) + 1);
      })
      .catch(() => {
        setCourses([]);
        setHasMore(false);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setField = (key: keyof typeof emptyForm, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }));

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const data = await api.courses(`limit=100&page=${nextPage}`);
      setCourses((current) => [...current, ...data.courses]);
      setHasMore((data.pagination?.current_page ?? nextPage) < (data.pagination?.total_pages ?? nextPage));
      setNextPage((data.pagination?.current_page ?? nextPage) + 1);
    } catch (err) {
      setStatus({
        message: err instanceof Error ? err.message : "No se pudieron cargar más cursos.",
        tone: "error",
      });
    } finally {
      setLoadingMore(false);
    }
  };

  const toForm = (course: Course) => ({
    title: course.title ?? "",
    subtitle: course.subtitle ?? "",
    description: course.description ?? "",
    instructor_name: course.instructor_name ?? "",
    price_mxn: String(course.price_mxn ?? ""),
    duration_days: String(course.duration_days ?? 30),
    occupancy: String(course.occupancy ?? 25),
    date_of_transmission: course.date_of_transmission
      ? toInputValue(new Date(course.date_of_transmission), "datetime")
      : "",
    google_meet_link: course.google_meet_link ?? "",
    thumbnail_url: course.thumbnail_url ?? "",
    published: Boolean(course.published),
  });

  const payloadFromForm = (): Partial<Course> => ({
    title: form.title,
    subtitle: form.subtitle,
    description: form.description,
    instructor_name: form.instructor_name,
    price_mxn: Number(form.price_mxn),
    duration_days: Number(form.duration_days),
    occupancy: Number(form.occupancy),
    date_of_transmission: new Date(form.date_of_transmission).toISOString(),
    google_meet_link: form.google_meet_link,
    thumbnail_url: thumbnailFile ? undefined : form.thumbnail_url,
    published: form.published,
  });

  const editCourse = (course: Course) => {
    setEditingCourseId(course.id);
    setForm(toForm(course));
    setThumbnailFile(null);
    setStatus(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingCourseId(null);
    setForm(emptyForm);
    setThumbnailFile(null);
    setStatus(null);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.date_of_transmission) {
      setStatus({ message: "Selecciona la fecha y hora de transmisión.", tone: "error" });
      return;
    }
    setSaving(true);
    try {
      const payload = payloadFromForm();
      if (editingCourseId) {
        await api.updateCourse(editingCourseId, payload, thumbnailFile ?? undefined);
        setStatus({ message: "Curso actualizado.", tone: "ok" });
      } else {
        await api.createCourse(payload, thumbnailFile ?? undefined);
        setStatus({ message: "Curso creado.", tone: "ok" });
      }
      setEditingCourseId(null);
      setForm(emptyForm);
      setThumbnailFile(null);
      load();
    } catch (err) {
      setStatus({
        message: err instanceof Error ? err.message : "No se pudo crear el curso.",
        tone: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (course: Course) => {
    setBusyCourseId(course.id);
    try {
      await api.updateCourse(course.id, { published: !course.published });
      setCourses((current) => current.map((item) =>
        item.id === course.id ? { ...item, published: !course.published } : item,
      ));
      setStatus({
        message: course.published ? "Curso despublicado." : "Curso publicado.",
        tone: "ok",
      });
    } catch (err) {
      setStatus({
        message: err instanceof Error ? err.message : "No se pudo cambiar el estado del curso.",
        tone: "error",
      });
    } finally {
      setBusyCourseId(null);
    }
  };

  const removeCourse = async (course: Course) => {
    if (!window.confirm(`¿Eliminar el curso «${course.title}»? Esta acción no se puede deshacer.`)) return;
    setBusyCourseId(course.id);
    try {
      await api.deleteCourse(course.id);
      setCourses((current) => current.filter((item) => item.id !== course.id));
      setStatus({ message: "Curso eliminado.", tone: "ok" });
      if (editingCourseId === course.id) cancelEdit();
    } catch (err) {
      setStatus({
        message: err instanceof Error ? err.message : "No se pudo eliminar el curso.",
        tone: "error",
      });
    } finally {
      setBusyCourseId(null);
    }
  };

  const shortFields = [
    { key: "title", label: "Título", type: "text" },
    { key: "subtitle", label: "Subtítulo", type: "text" },
    { key: "instructor_name", label: "Instructor", type: "text" },
    { key: "price_mxn", label: "Precio MXN", type: "number" },
    { key: "duration_days", label: "Días de acceso", type: "number" },
    { key: "occupancy", label: "Cupos", type: "number" },
    { key: "date_of_transmission", label: "Fecha y hora", type: "datetime" },
    { key: "google_meet_link", label: "Enlace Google Meet", type: "url" },
  ] as const;

  return (
    <>
      <PageHeader title="Cursos" description="Administra, edita y publica la oferta de cursos." />
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{editingCourseId ? "Editar curso" : "Nuevo curso"}</CardTitle>
          <CardDescription>
            {editingCourseId
              ? "Actualiza la información del curso y guarda los cambios."
              : "Completa la información y publica cuando estés listo."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            {shortFields.map(({ key, label, type }) =>
              type === "datetime" ? (
                <DateTime
                  key={key}
                  id={`course-${key}`}
                  label={label}
                  mode="datetime"
                  required
                  disabled={saving}
                  value={form[key]}
                  onChange={(value) => setField(key, value)}
                />
              ) : (
                <div key={key} className="flex flex-col gap-2">
                  <Label htmlFor={`course-${key}`}>{label}</Label>
                  <Input
                    id={`course-${key}`}
                    required
                    type={type}
                    min={type === "number" ? 0 : undefined}
                    step={key === "price_mxn" ? "0.01" : undefined}
                    value={form[key]}
                    onChange={(event) => setField(key, event.target.value)}
                  />
                </div>
              ),
            )}
            <ImageUpload
              className="sm:col-span-2"
              label="Imagen del curso"
              currentUrl={form.thumbnail_url}
              file={thumbnailFile}
              onFileChange={setThumbnailFile}
              onRemove={() => {
                setThumbnailFile(null);
                setField("thumbnail_url", "");
              }}
              disabled={saving}
            />
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="course-description">Descripción</Label>
              <Textarea
                id="course-description"
                required
                rows={4}
                value={form.description}
                onChange={(event) => setField("description", event.target.value)}
              />
            </div>
            <label
              htmlFor="course-published"
              className="flex cursor-pointer items-center gap-2.5 sm:col-span-2"
            >
              <input
                id="course-published"
                type="checkbox"
                className="size-4 cursor-pointer accent-[hsl(var(--brand))]"
                checked={form.published}
                onChange={(event) => setField("published", event.target.checked)}
              />
              <span className="text-sm">Publicar inmediatamente</span>
            </label>
            <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
              <Button type="submit" variant="brand" disabled={saving}>
                {editingCourseId ? <Check aria-hidden /> : <Plus aria-hidden />}
                {saving ? "Guardando…" : editingCourseId ? "Guardar cambios" : "Crear curso"}
              </Button>
              {editingCourseId && (
                <Button type="button" variant="outline" onClick={cancelEdit} disabled={saving}>
                  <X aria-hidden /> Cancelar
                </Button>
              )}
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
      <DataTable
        title="Cursos existentes"
        description={`${courses.length}${hasMore ? "+" : ""} cursos cargados`}
        columns={["Título", "Instructor", "Precio", "Transmisión", "Estado", "Acciones"]}
        loading={loading}
        emptyLabel="Todavía no hay cursos registrados."
        rows={courses.map((course) => [
          <div key={`title-${course.id}`} className="flex min-w-44 items-center gap-3">
            {course.thumbnail_url ? (
              <img src={course.thumbnail_url} alt="" className="size-12 rounded-md object-cover" />
            ) : (
              <div aria-hidden className="flex size-12 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                TP
              </div>
            )}
            <div>
              <p className="font-semibold">{course.title}</p>
              {course.subtitle && <p className="max-w-52 truncate text-xs text-muted-foreground">{course.subtitle}</p>}
            </div>
          </div>,
          course.instructor_name,
          new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(course.price_mxn),
          course.date_of_transmission
            ? new Date(course.date_of_transmission).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })
            : "—",
          <StatusBadge key={`state-${course.id}`} value={course.published ? "published" : "draft"} />,
          <div key={`actions-${course.id}`} className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => editCourse(course)}
              aria-label={`Editar ${course.title}`}
            >
              <Pencil aria-hidden /> Editar
            </Button>
            <Button
              type="button"
              variant={course.published ? "secondary" : "brand"}
              size="sm"
              disabled={busyCourseId === course.id}
              onClick={() => togglePublished(course)}
            >
              {course.published ? "Despublicar" : "Publicar"}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              disabled={busyCourseId === course.id}
              onClick={() => removeCourse(course)}
              aria-label={`Eliminar ${course.title}`}
              title="Eliminar curso"
            >
              <Trash2 aria-hidden />
            </Button>
          </div>,
        ])}
      />
      {hasMore && !loading && (
        <div className="mt-4 flex justify-center">
          <Button type="button" variant="outline" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? "Cargando cursos…" : "Cargar más cursos"}
          </Button>
        </div>
      )}
    </>
  );
}
