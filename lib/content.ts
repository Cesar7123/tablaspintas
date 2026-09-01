export const images = {
  hero: "https://images.unsplash.com/photo-1629567971554-0cc0883dd57b?auto=format&fit=crop&w=1800&q=85",
  fruit: "https://images.unsplash.com/photo-1737065188555-0b379bbf78da?auto=format&fit=crop&w=1000&q=85",
  cheese: "https://images.unsplash.com/photo-1768140210087-4059e0b9efc7?auto=format&fit=crop&w=1000&q=85",
  composition: "https://images.unsplash.com/photo-1733410647375-3be1697aa4f1?auto=format&fit=crop&w=1000&q=85",
};

export type Course = { slug: string; level: string; title: string; description: string; time: string; price: string; tone: string; image: string; lessons: string[] };
export const courses: Course[] = [
  { slug: "tabla-de-quesos-clasica", level: "Principiante", title: "Tabla de Quesos Clásica", description: "Aprende los fundamentos de la composición con quesos artesanales y acompañamientos perfectos.", time: "3 horas", price: "$890 MXN", tone: "mustard", image: images.cheese, lessons: ["La tabla como lienzo", "Selección de quesos", "Acompañamientos y balance"] },
  { slug: "frutas-tropicales-exoticas", level: "Intermedio", title: "Frutas Tropicales & Exóticas", description: "Descubre cómo seleccionar, cortar y presentar frutas tropicales para crear tablas vibrantes y llenas de sabor.", time: "4 horas", price: "$1,200 MXN", tone: "leaf", image: images.fruit, lessons: ["Color y temporada", "Cortes esenciales", "Composición tropical"] },
  { slug: "tabla-premium-para-eventos", level: "Avanzado", title: "Tabla Premium para Eventos", description: "Crea tablas espectaculares para bodas, corporativos y celebraciones. Incluye cascadas, flores comestibles y diseño a gran escala.", time: "5 horas", price: "$1,800 MXN", tone: "orange", image: images.composition, lessons: ["Diseño a gran escala", "Cascadas comestibles", "Montaje para eventos"] },
];

export const pillars = [
  { number: "01", title: "Selección de frutas", text: "Elegimos frutas de temporada en su punto óptimo de maduración. Cada pieza es seleccionada por su color, textura y sabor.", image: images.fruit },
  { number: "02", title: "Quesos & embutidos", text: "Curamos una selección artesanal de quesos y embutidos de productores locales. Cada ingrediente cuenta una historia.", image: images.cheese },
  { number: "03", title: "Composición visual", text: "Dominamos el arte de la presentación. Equilibrio, contraste y armonía guían cada disposición.", image: images.composition },
];

export const testimonials = [
  { name: "María González", role: "Curso: Quesos Clásica", quote: "El curso de quesos cambió completamente mi forma de ver la presentación de alimentos. Ahora mis cenas son el tema de conversación." },
  { name: "Carlos Mendoza", role: "Curso: Frutas Tropicales", quote: "Increíble la calidad de la enseñanza en vivo. Pude hacer preguntas en tiempo real y el certificado llegó al instante." },
  { name: "Ana Lucía Reyes", role: "Curso: Tabla Premium", quote: "Las técnicas de cascada y flores comestibles elevaron mi servicio de catering a otro nivel." },
];
