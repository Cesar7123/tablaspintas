import { notFound } from "next/navigation";
import { CourseDetailNav } from "@/components/molecules/CourseDetailNav";
import { SectionHeader } from "@/components/molecules/SectionHeader";
import { courses } from "@/lib/content";
import { InteriorHeader } from "@/components/organisms/InteriorHeader";
import { Navigation } from "@/components/organisms/Navigation";
const learnItems = [
  [
    "Selección y Curaduría",
    "Aprende a identificar ingredientes premium por textura, maduración y origen para crear combinaciones armoniosas.",
  ],
  [
    "Técnicas de Corte",
    "Domina cortes artísticos: abanicos, rollos, cubos estilizados y láminas decorativas.",
  ],
  [
    "Composición Visual",
    "Principios de color, simetría y balance para crear tablas que sean verdaderas obras de arte.",
  ],
  [
    "Maridaje y Acompañamiento",
    "Frutas de temporada, frutos secos, mermeladas y vinos que complementan cada tabla.",
  ],
];

const modules = [
  [
    "Introducción y Materiales",
    "Presentación del taller, herramientas necesarias y tipos de tablas.",
  ],
  [
    "Selección de Ingredientes",
    "Criterios de calidad, temporada y proveedores para quesos, carnes y frutas.",
  ],
  [
    "Técnicas de Corte y Presentación",
    "Práctica en vivo: abanicos, rosas de jamón, cubos artísticos y láminas.",
  ],
  [
    "Composición y Montaje",
    "Armonía visual, uso del espacio, colores y alturas en la tabla final.",
  ],
  [
    "Maridaje y Servicio",
    "Vinos, cervezas artesanales y bebidas que acompañan cada estilo de tabla.",
  ],
];

const includes = [
  [
    "LIVE",
    "Sesión en Vivo por Zoom",
    "Clase interactiva de 3 horas con práctica guiada por la Chef.",
  ],
  ["CERT", "Certificado Digital", "Descarga tu certificado de Diseñador de Tablas al finalizar."],
  [
    "REPLAY",
    "Acceso a la Grabación",
    "Si no pudiste asistir en vivo, la grabación queda disponible para ti.",
  ],
  [
    "PDF",
    "Material de Apoyo PDF",
    "Guía descargable con técnicas, recetas y proveedores recomendados.",
  ],
  [
    "COM",
    "Comunidad Privada",
    "Acceso al grupo exclusivo de alumnos para compartir tus creaciones.",
  ],
];

const faqs = [
  [
    "¿Necesito experiencia previa?",
    "No, el curso está diseñado para todos los niveles. La Chef te guía paso a paso desde lo más básico hasta técnicas avanzadas.",
  ],
  [
    "¿Qué pasa si no puedo asistir en vivo?",
    "La grabación de la sesión queda disponible para ti y tu certificado se activa igual al finalizar la clase.",
  ],
  [
    "¿Cuándo recibo mi certificado?",
    "El certificado PDF está disponible para descargar inmediatamente después de que termina la sesión de Zoom.",
  ],
  [
    "¿Qué materiales necesito?",
    "Recibirás una lista de materiales sugeridos por correo antes del curso. No es obligatorio tenerlos todos.",
  ],
  [
    "¿Puedo tomar el curso desde cualquier país?",
    "Sí, las sesiones son por Zoom y aceptamos pagos internacionales. Solo verifica el huso horario.",
  ],
  [
    "¿Hay cupos limitados?",
    "Sí, cada sesión mantiene un máximo de 25 personas para conservar una práctica cercana y guiada.",
  ],
];

const testimonials = [
  [
    "Ana Lucía M.",
    "Evento Corporativo",
    "El curso de tablas premium transformó completamente la forma en que presento mis eventos.",
  ],
  [
    "Roberto G.",
    "Emprendedor Gastronómico",
    "Tomé el taller sin experiencia previa y en una sola sesión aprendí técnicas que uso en mi negocio.",
  ],
  [
    "Valentina S.",
    "Amante de la Cocina",
    "La Chef María Elena es increíblemente paciente y detallista. Súper recomendado.",
  ],
];

export function generateStaticParams() {
  return courses.map(({ slug }) => ({ slug }));
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = courses.find((item) => item.slug === slug);

  if (!course) notFound();

  return (
    <main className="min-h-screen overflow-hidden bg-[#F4EADC] text-[#3D3530]">
      <Navigation solid />
      <CourseHero course={course} />
      <DetailSection title="Lo Que Aprenderás" color="text-[#7BA45B]">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {learnItems.map(([title, text]) => (
            <article className="rounded-lg bg-[#F4EADC] p-6" key={title}>
              <span className="mb-3 block font-brand text-2xl text-[#E57A3A]">✦</span>
              <h3 className="font-subtitle text-lg font-semibold text-[#E57A3A]">{title}</h3>
              <p className="mt-2 font-display text-sm leading-[1.5]">{text}</p>
            </article>
          ))}
        </div>
      </DetailSection>
      <DetailSection
        title="Contenido del Curso"
        color="text-[#8C5A32]"
        subtitle="Sesión en vivo de 3 horas con práctica guiada en tiempo real."
      >
        <div className="flex flex-col gap-3">
          {modules.map(([title, text], index) => (
            <article className="flex gap-4 rounded-lg bg-[#F4EADC] p-5 md:px-6" key={title}>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#F0B23E] font-display font-bold text-[#F4EADC]">
                {index + 1}
              </span>
              <div>
                <h3 className="font-subtitle text-[17px] font-semibold text-[#7BA45B]">{title}</h3>
                <p className="font-display text-sm leading-5">{text}</p>
              </div>
            </article>
          ))}
        </div>
      </DetailSection>
      <DetailSection title="Qué Incluye" color="text-[#E57A3A]">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {includes.map(([icon, title, text]) => (
            <article className="rounded-lg bg-[#F4EADC] p-5" key={title}>
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#F0B23E] font-display text-[10px] font-bold text-[#F4EADC]">
                {icon}
              </span>
              <h3 className="mt-3 font-subtitle text-[15px] font-semibold text-[#E57A3A]">
                {title}
              </h3>
              <p className="mt-2 font-display text-[13px] leading-[1.4]">{text}</p>
            </article>
          ))}
        </div>
      </DetailSection>
      <DetailSection title="Lo Que Dicen Nuestros Alumnos" color="text-[#7BA45B]">
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map(([name, role, quote]) => (
            <blockquote className="rounded-lg bg-[#F4EADC] p-6" key={name}>
              <div className="font-display text-[#F0B23E]">★★★★★</div>
              <p className="mt-3 font-display text-sm italic leading-[1.55]">“{quote}”</p>
              <footer className="mt-5 flex items-center gap-3">
                <span className="h-9 w-9 rounded-full bg-[#8C5A32]" />
                <span className="flex flex-col font-display">
                  <strong className="text-sm text-[#8C5A32]">{name}</strong>
                  <small>{role}</small>
                </span>
              </footer>
            </blockquote>
          ))}
        </div>
      </DetailSection>
      <DetailSection title="Preguntas Frecuentes" color="text-[#F0B23E]">
        <div className="flex flex-col gap-3">
          {faqs.map(([question, answer]) => (
            <details className="group rounded-lg bg-[#F4EADC] p-5" key={question}>
              <summary className="cursor-pointer list-none font-subtitle text-base font-semibold text-[#E57A3A]">
                <span className="mr-3 text-[#C94A46] transition group-open:inline-block group-open:rotate-90">
                  ▸
                </span>
                {question}
              </summary>
              <p className="mt-3 pl-6 font-display text-sm leading-[1.5]">{answer}</p>
            </details>
          ))}
        </div>
      </DetailSection>
      <footer className="bg-[#F0B23E] px-5 py-10 text-center font-display text-sm text-[#3D3530]">
        Tablas Pintas · El arte de presentar alimentos
      </footer>
    </main>
  );
}

function Breadcrumb({ title }: { title: string }) {
  return (
    <div className="flex gap-2 px-5 py-4 font-display text-[13px] text-[#8C5A32] md:px-12">
      <a href="/">Inicio</a>
      <span>/</span>
      <a href="/cursos">Cursos</a>
      <span>/</span>
      <span className="font-semibold">{title}</span>
    </div>
  );
}

function CourseHero({ course }: { course: (typeof courses)[number] }) {
  return (
    <section className="grid gap-8 bg-[#F5F2ED] p-5 md:grid-cols-[1.05fr_1fr] md:gap-12 md:p-12">
      <div className="h-[300px] overflow-hidden rounded-2xl bg-[#E8DFD2] md:h-[450px]">
        <img src={course.image} alt={course.title} className="h-full w-full object-cover" />
      </div>
      <div className="flex flex-col gap-5 pt-2">
        <span className="w-fit rounded-lg bg-[#F0B23E] px-3.5 py-1.5 font-display text-xs font-semibold text-[#F4EADC]">
          Nivel {course.level}
        </span>
        <h1 className="font-brand text-4xl leading-relaxed text-[#F0B23E] drop-shadow-[0_4px_2px_#00000080] md:text-[42px]">
          {course.title}
        </h1>
        <p className="font-subtitle text-[22px] leading-[1.6] text-[#eb6c23]">
          {course.description}
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-[#DCD8CB] py-3 font-display text-sm">
          {/* <span>◷ {course.time}</span> */}
          <span>◌ 15 Julio, 2026</span>
          <span>▣ Zoom en Vivo</span>
          <span>◉ 25 cupos</span>
        </div>
        <div className="flex items-center gap-3 pt-1">
          <span className="h-11 w-11 rounded-full bg-[#8C5A32]" />
          <div className="flex flex-col font-display">
            <strong className="text-sm text-[#7a2a28]">Chef María Elena Ríos</strong>
            <span className="text-[13px]">
              Especialista en Tablas Artesanales · 12 años de experiencia
            </span>
          </div>
        </div>
        <div className="flex items-end gap-4 pt-1">
          <strong className="font-brand text-4xl leading-relaxed text-[#faa032]">$1,299 MXN</strong>
          <del className="pb-1 font-display text-base text-[#8C5A32]">$1,899 MXN</del>
        </div>
        <a
          href={`/checkout?curso=${course.slug}`}
          className="rounded-lg bg-[#C94A46] px-12 py-4 text-center font-display text-base font-bold text-[#F4EADC] transition hover:bg-[#a93e3b]"
        >
          Inscribirme Ahora
        </a>
      </div>
    </section>
  );
}

function DetailSection({
  title,
  color,
  subtitle,
  children,
}: {
  title: string;
  color: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-[#DCD8CB] bg-[#F5F2ED] p-5 md:p-12">
      <SectionHeader variant="detail" color={color} description={subtitle}>
        {title}
      </SectionHeader>
      {children}
    </section>
  );
}
