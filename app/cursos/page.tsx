"use client";

import { useEffect, useState } from "react";
import { InteriorHeader } from "@/components/organisms/InteriorHeader";
import { api, Course } from "@/lib/api";

export default function CoursesCatalogPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams({ limit: "24", sort });
    if (search.trim()) params.set("search", search.trim());
    setLoading(true);
    api
      .courses(params.toString())
      .then((data) => setCourses(data.courses))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search, sort]);

  return (
    <>
      <InteriorHeader
        eyebrow="La academia"
        title={
          <>
            Aprende a crear
            <br />
            <em>algo memorable</em>
          </>
        }
        description="Explora nuestra colección de cursos en vivo y encuentra el punto de partida perfecto para tu próximo gran montaje."
      />
      <main className="catalog-page">
        <div className="catalog-toolbar">
          <label className="sr-only" htmlFor="course-search">
            Buscar cursos
          </label>
          <input
            id="course-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar cursos..."
          />
          <span>{loading ? "Cargando cursos..." : `${courses.length} cursos disponibles`}</span>
          <label className="sr-only" htmlFor="course-sort">
            Ordenar
          </label>
          <select id="course-sort" value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="newest">Más recientes</option>
            <option value="oldest">Más antiguos</option>
            <option value="price_asc">Precio menor</option>
            <option value="price_desc">Precio mayor</option>
          </select>
        </div>
        {error && (
          <p className="form-status" role="alert">
            {error}
          </p>
        )}
        {!loading && !courses.length && (
          <p className="form-status">No encontramos cursos con esos filtros.</p>
        )}
        <div className="catalog-grid">
          {courses.map((course) => (
            <a className="course-card" href={`/cursos/${course.id}`} key={course.id}>
              <div className="course-card-image">
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt={course.title} />
                ) : (
                  <span>Tablas Pintas</span>
                )}
              </div>
              <div className="course-card-copy">
                <span className="eyebrow mustard-text">
                  {course.tags?.join(" · ") || "Curso en vivo"}
                </span>
                <h2>{course.title}</h2>
                <p>{course.subtitle || course.description}</p>
                <strong>${Number(course.price_mxn).toLocaleString("es-MX")} MXN</strong>
              </div>
            </a>
          ))}
        </div>
      </main>
    </>
  );
}
