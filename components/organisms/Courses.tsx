import { SectionHeader } from "../molecules/SectionHeader";
import { CourseCard } from "../molecules/CourseCard";
import { courses } from "../../lib/content";

export function Courses() {
  return <section id="cursos" className="section courses"><SectionHeader eyebrow="Aprende con nosotros" description="Sesiones en vivo por Zoom. Certificado descargable al finalizar. Replay disponible si no puedes asistir en tiempo real.">Cursos <em>en vivo</em></SectionHeader><div className="course-grid">{courses.map((course, index) => <CourseCard key={course.title} course={course} index={index} />)}</div></section>;
}
