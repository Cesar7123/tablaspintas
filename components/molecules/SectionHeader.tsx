import { Eyebrow } from "../atoms/Eyebrow";

export function SectionHeader({
  eyebrow,
  children,
  description,
  dark = false,
  variant = "default",
  color = "text-[#E57A3A]",
}: {
  eyebrow?: string;
  children: React.ReactNode;
  description?: string;
  dark?: boolean;
  variant?: "default" | "detail";
  color?: string;
}) {
  if (variant === "detail")
    return (
      <header className="mb-6 text-left">
        <h2 className={`font-brand text-[32px] leading-relaxed ${color}`}>{children}</h2>
        {description && (
          <p className="mt-2 font-subtitle text-2xl leading-[1.35] text-[#E57A3A]">{description}</p>
        )}
      </header>
    );
  return (
    <header className="section-header">
      <Eyebrow tone={dark ? "mustard" : "mustard-text"}>{eyebrow}</Eyebrow>
      <h2>{children}</h2>
      {description && <p>{description}</p>}
    </header>
  );
}
