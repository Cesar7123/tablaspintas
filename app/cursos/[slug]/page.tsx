import { notFound } from "next/navigation";
import { Button } from "@/components/atoms/Button";
import { InteriorHeader } from "@/components/organisms/InteriorHeader";
import { courses } from "@/lib/content";

export function generateStaticParams() { return courses.map(({ slug }) => ({ slug })); }

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = courses.find((item) => item.slug === slug);
  if (!course) notFound();
  return <><InteriorHeader eyebrow={`${course.level} · Curso en vivo`} title={<>{course.title}</>} description={course.description} /><main className="detail-page"><div className="detail-image"><img src={course.image} alt={course.title} /></div><div className="detail-info"><span className="number">CURSO TP / 0{courses.indexOf(course) + 1}</span><h2>Lo que vas a<br /><em>descubrir</em></h2><ul>{course.lessons.map((lesson) => <li key={lesson}>{lesson}</li>)}</ul><div className="detail-buy"><div><span>Inversión</span><strong>{course.price}</strong><small>{course.time} · Zoom en vivo</small></div><Button href={`/checkout?curso=${course.slug}`}>Reservar mi lugar</Button></div></div></main></>;
}
