"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { AdminNav } from "./AdminNav";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-sidebar-border lg:block">
        <AdminNav />
      </aside>
      <div className="flex min-h-screen flex-col lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-card/90 px-4 backdrop-blur-sm sm:px-6 lg:px-10">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden"
                aria-label="Abrir menú de administración"
              >
                <Menu aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-72 border-sidebar-border bg-sidebar p-0"
              hideClose
            >
              <SheetTitle className="sr-only">Navegación de administración</SheetTitle>
              <SheetDescription className="sr-only">
                Secciones del panel de administración de Tablas Pintas.
              </SheetDescription>
              <AdminNav onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <p className="font-subtitle text-[11px] uppercase tracking-[2px] text-muted-foreground">
            Tablas Pintas <span className="text-brand" aria-hidden>✦</span> Panel de
            administración
          </p>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
