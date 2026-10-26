"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Navigation } from "@/components/organisms/Navigation";
import { api, Course } from "@/lib/api";

export default function CourseDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .course(params.slug)
      .then(setCourse)
      .catch((err) => setError(err.message));
  }, [params.slug]);

  if (error)
    return (
      <>
        <Navigation solid />
        <main className="catalog-page">
          <p className="form-status" role="alert">
            {error}
          </p>
          <button onClick={() => router.back()}>Volver</button>
        </main>
      </>
    );
  if (!course)
    return (
      <>
        <Navigation solid />
        <main className="catalog-page">
          <p>Cargando curso...</p>
        </main>
      </>
    );

  const content = course.course_content || [];
  const included = course.whats_included || [];
  return (
    <main className="min-h-screen overflow-hidden bg-[#F4EADC] text-[#3D3530]">
      <Navigation solid />
      <section className="grid gap-8 bg-[#F5F2ED] p-5 md:grid-cols-[1.05fr_1fr] md:gap-12 md:p-12">
        <div className="h-[300px] overflow-hidden rounded-2xl bg-[#E8DFD2] md:h-[450px]">
          {course.thumbnail_url && (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="flex flex-col gap-5 pt-2">
          <span className="w-fit rounded-lg bg-[#F0B23E] px-3.5 py-1.5 font-display text-xs font-semibold text-[#F4EADC]">
            Curso en vivo
          </span>
          <h1 className="font-brand text-4xl leading-relaxed text-[#F0B23E] md:text-[42px]">
            {course.title}
          </h1>
          <p className="font-subtitle text-[22px] leading-[1.6] text-[#eb6c23]">
            {course.subtitle || course.description}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-[#DCD8CB] py-3 font-display text-sm">
            <span>{course.duration_days} días de acceso</span>
            <span>{course.occupancy} cupos</span>
            <span>
              {new Date(course.date_of_transmission).toLocaleString("es-MX", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          </div>
          <p>
            Imparte <strong>{course.instructor_name}</strong>
          </p>
          <strong className="font-brand text-4xl text-[#faa032]">
            ${Number(course.price_mxn).toLocaleString("es-MX")} MXN
          </strong>
          <a
            href={`/checkout?course=${course.id}`}
            className="rounded-lg bg-[#C94A46] px-12 py-4 text-center font-display text-base font-bold text-[#F4EADC]"
          >
            Inscribirme Ahora
          </a>
        </div>
      </section>
      <Detail title="Descripción">
        <p>{course.description}</p>
      </Detail>
      <Detail title="Contenido">
        <div className="flex flex-col gap-3">
          {content.map((item, index) => (
            <article className="rounded-lg bg-[#F4EADC] p-5" key={`${item.title}-${index}`}>
              <h3 className="font-subtitle text-lg font-semibold text-[#7BA45B]">{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </Detail>
      <Detail title="Qué incluye">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {included.map((item) => (
            <article className="rounded-lg bg-[#F4EADC] p-5" key={item.title}>
              <h3 className="font-subtitle font-semibold text-[#E57A3A]">{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </Detail>
      <Detail title={`Opiniones (${course.total_comments || 0})`}>
        <div className="grid gap-5 md:grid-cols-3">
          {(course.comments || []).map((comment) => (
            <blockquote className="rounded-lg bg-[#F4EADC] p-6" key={comment.id}>
              <div className="text-[#F0B23E]">{"★".repeat(comment.rating || 0)}</div>
              <p className="mt-3 italic">“{comment.comment}”</p>
              <strong>{comment.user_name}</strong>
            </blockquote>
          ))}
        </div>
      </Detail>
    </main>
  );
}

function Detail({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-[#DCD8CB] bg-[#F5F2ED] p-5 md:p-12">
      <h2 className="mb-6 font-brand text-3xl text-[#E57A3A]">{title}</h2>
      {children}
    </section>
  );
}
