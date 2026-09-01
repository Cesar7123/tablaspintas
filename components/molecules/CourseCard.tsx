import { ArrowIcon } from "../atoms/ArrowIcon";
import type { Course } from "../../lib/content";

export function CourseCard({ course, index }: { course: Course; index: number }) {
  return (
    <article className={`course-card ${course.tone}`}>
      <a
        className="course-card-link"
        href={`/cursos/${course.slug}`}
        aria-label={`Ver ${course.title}`}
      >
        <div className="course-card-image">
          <img src={course.image} alt="" loading="lazy" />
        </div>
        <div className="course-card-content">
          <div className="card-top">
            <span>{course.level}</span>
            <span>TP / 0{index + 1}</span>
          </div>
          <h3>{course.title}</h3>
          <p>{course.description}</p>
          <div className="card-meta">
            <span>{course.time}</span>
            <span>En vivo por Zoom</span>
          </div>
          <div className="card-bottom">
            <strong>{course.price}</strong>
            <span>Inscríbete</span>
          </div>
        </div>
      </a>
    </article>
  );
}
