import { ArrowIcon } from "./ArrowIcon";

type ButtonProps = { children: React.ReactNode; href?: string; variant?: "primary" | "ghost"; type?: "button" | "submit" };

export function Button({ children, href, variant = "primary", type = "button" }: ButtonProps) {
  const content = <>{children} <ArrowIcon /></>;
  return href ? <a className={`button ${variant}`} href={href}>{content}</a> : <button className={`button ${variant}`} type={type}>{content}</button>;
}
