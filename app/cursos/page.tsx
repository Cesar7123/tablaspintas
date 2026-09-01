import { CourseCard } from "@/components/molecules/CourseCard";
import { InteriorHeader } from "@/components/organisms/InteriorHeader";
import { Reveal } from "@/components/atoms/Reveal";
import { courses } from "@/lib/content";

export default function CoursesCatalogPage() {
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
          <span>{courses.length} cursos disponibles</span>
          <span>
            Todos los niveles <b>⌄</b>
          </span>
        </div>
        <div className="catalog-grid">
          {courses.map((course, index) => (
            <Reveal key={course.slug}>
              <CourseCard course={course} index={index} />
            </Reveal>
          ))}
        </div>
      </main>
    </>
  );
}
