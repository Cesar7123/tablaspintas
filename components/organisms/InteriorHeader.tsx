import { Navigation } from "./Navigation";

export function InteriorHeader({ eyebrow, title, description }: { eyebrow: string; title: React.ReactNode; description: string }) {
  return <><Navigation solid /><header className="interior-hero"><p className="eyebrow mustard-text">{eyebrow}</p><h1>{title}</h1><p>{description}</p></header></>;
}
