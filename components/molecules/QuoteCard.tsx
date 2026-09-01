export function QuoteCard({ name, role, quote, featured = false }: { name: string; role: string; quote: string; featured?: boolean }) {
  return <blockquote className={`quote-card ${featured ? "featured" : ""}`}><span className="quote-mark">“</span><p>{quote}</p><footer><strong>{name}</strong><span>{role}</span></footer></blockquote>;
}
