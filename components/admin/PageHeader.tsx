export function PageHeader({
  eyebrow = "Operación",
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-8">
      <p className="font-subtitle text-[11px] uppercase tracking-[3px] text-brand">
        {eyebrow} <span aria-hidden>✦</span>
      </p>
      <h1 className="mt-3 font-display text-[2.6rem] leading-none text-foreground sm:text-5xl">
        {title}
      </h1>
      {description && (
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
      )}
      {children && <div className="mt-6">{children}</div>}
    </header>
  );
}
