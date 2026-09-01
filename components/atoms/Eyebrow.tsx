export function Eyebrow({ children, tone = "mustard-text" }: { children: React.ReactNode; tone?: string }) {
  return <p className={`eyebrow ${tone}`}>{children}</p>;
}
