import { Eyebrow } from "../atoms/Eyebrow";

export function SectionHeader({ eyebrow, children, description, dark = false }: { eyebrow: string; children: React.ReactNode; description?: string; dark?: boolean }) {
  return <header className="section-header"><Eyebrow tone={dark ? "mustard" : "mustard-text"}>{eyebrow}</Eyebrow><h2>{children}</h2>{description && <p>{description}</p>}</header>;
}
