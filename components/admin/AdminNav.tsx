"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ExternalLink,
  FileText,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  LogOut,
  ReceiptText,
  Users,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { Brand } from "@/components/atoms/Brand";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Users;
  exact?: boolean;
};

const groups: { label: string; items: NavItem[] }[] = [
  {
    label: "Operación",
    items: [
      { href: "/admin", label: "Resumen", icon: LayoutDashboard, exact: true },
      { href: "/admin/usuarios", label: "Usuarios", icon: Users },
      { href: "/admin/inscripciones", label: "Inscripciones", icon: ReceiptText },
      { href: "/admin/contacto", label: "CRM contacto", icon: Inbox },
    ],
  },
  {
    label: "Catálogo",
    items: [
      { href: "/admin/cursos", label: "Cursos", icon: GraduationCap },
      { href: "/admin/cms", label: "CMS", icon: FileText },
    ],
  },
];

export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const signOut = async () => {
    await logout();
    onNavigate?.();
    router.replace("/");
  };

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="px-6 pb-6 pt-7">
        <Link href="/" onClick={onNavigate} aria-label="Ir al inicio de Tablas Pintas">
          <Brand />
        </Link>
        <p className="mt-2 font-subtitle text-[11px] uppercase tracking-[2px] text-sidebar-muted">
          Panel de administración
        </p>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Secciones de administración">
        {groups.map((group) => (
          <div key={group.label} className="mb-6">
            <p className="px-3 pb-2 font-subtitle text-[11px] uppercase tracking-[2px] text-sidebar-muted">
              {group.label}
            </p>
            <ul className="flex flex-col gap-1">
              {group.items.map(({ href, label, icon: Icon, exact }) => {
                const active = exact ? pathname === href : pathname.startsWith(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors duration-200",
                        active
                          ? "bg-primary/15 font-semibold text-sidebar-accent"
                          : "text-sidebar-foreground/75 hover:bg-white/5 hover:text-sidebar-foreground",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0 transition-colors duration-200",
                          active
                            ? "text-sidebar-accent"
                            : "text-sidebar-muted group-hover:text-sidebar-foreground",
                        )}
                        aria-hidden
                      />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-sidebar-border p-4">
        {user && (
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full border border-sidebar-accent font-subtitle text-xs text-sidebar-accent">
              {user.initials}
            </span>
            <span className="flex min-w-0 flex-col">
              <strong className="truncate text-sm font-semibold">{user.name}</strong>
              <small className="truncate text-xs text-sidebar-muted">{user.email}</small>
            </span>
          </div>
        )}
        <div className="mt-3 flex items-center justify-between gap-2">
          <Link
            href="/"
            onClick={onNavigate}
            className="inline-flex items-center gap-1.5 text-xs text-sidebar-muted transition-colors duration-200 hover:text-sidebar-foreground"
          >
            <ExternalLink className="size-3.5" aria-hidden /> Ver sitio
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-1.5 text-xs text-sidebar-muted transition-colors duration-200 hover:text-[#e06a72]"
          >
            <LogOut className="size-3.5" aria-hidden /> Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
