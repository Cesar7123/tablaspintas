# Page Override: Admin Panel

> Overrides `MASTER.md` for `/admin/*`. MASTER.md palette (red restaurant) is stale;
> this page follows the real site palette in `app/globals.css`.

**Project:** Tablas Pintas — Panel de administración
**Updated:** 2026-09-23
**Density:** 7/10 (dense dashboard) | **Motion:** 3/10 (subtle) | **Variance:** 3/10 (centered)

## Direction (taste)

One family: warm artisan light UI + espresso dark sidebar. One accent per view:
ember for eyebrows/links, mustard for primary buttons, leaf/raspberry only for status
semantics. No generic blue-SaaS look (database match was generic; deliberately rejected
to stay coherent with the public site).

## Tokens (HSL, defined in `app/globals.css` `:root`)

| Token | Value | Source |
|-------|-------|--------|
| `--background` | `38 29% 95%` | cream `#f5f2ed` |
| `--foreground` | `17 32% 15%` | ink `#34221b` |
| `--card` | `40 60% 98%` | warm white `#fdfbf7` |
| `--primary` / fg | `40 74% 49%` / ink | mustard `#d99a20`, 6.2:1 |
| `--brand` / fg | `22 83% 43%` / cream | ember `#c95513`, 4:1 on cream |
| `--secondary`, `--surface-muted` | `36 32% 87%` | beige `#e8dfd2` |
| `--muted-foreground` | `25 8% 40%` | `#6f655e`, 5.1:1 on cream |
| `--destructive` | `356 51% 47%` | raspberry `#b53a43` |
| `--success` | `105 18% 39%` | leaf `#5a7551`, 4.6:1 with cream |
| `--border` | `33 23% 83%` | `#ded5ca` |
| `--input` | `30 12% 54%` | 3:1 control borders |
| `--ring` | `22 83% 43%` | ember focus, 4:1 |
| `--sidebar` | `12 24% 16%` | espresso `#33231f` |
| `--sidebar-accent` | `40 74% 49%` | mustard active item |

Note: `--muted` (hex) already exists for the public site; shadcn muted surface uses
`--surface-muted` to avoid collision.

## Layout

- Left fixed sidebar 288px (espresso), groups: Operación (Resumen, Usuarios,
  Inscripciones, CRM contacto) + Catálogo (Cursos, CMS). Footer: user chip, Ver sitio,
  Cerrar sesión.
- Mobile: sidebar becomes a Sheet drawer (side=left) from a top-bar Menu button; top bar
  sticky, h-16, card/90 + backdrop blur.
- Sections are routes (`/admin`, `/admin/usuarios`, ...) → deep-linkable, active state via
  `usePathname`, `aria-current="page"`.

## Components

shadcn/ui (new-york style) in `components/ui/`: button, card, badge, input, textarea,
label, separator, skeleton, table, select, sheet. Icons: lucide only, never emoji.
Typography: headings `font-display`, eyebrows/table heads/badges `font-subtitle`
(uppercase + wide tracking), data Arial 14px.

## Rules

- Status colors: paid/completed/published/replied/active → success; pending → warning
  (mustard); new/admin → brand (ember); failed/cancelled/expired → destructive;
  draft/read/archived → neutral.
- Loading = table skeleton rows (no spinners). Empty = "Sin registros." muted row.
- Errors: `role="alert"` destructive text + retry affordance; success: `role="status"`.
- Transitions 150–300ms; global `prefers-reduced-motion` block covers motion.
- Auth: admin check = `role === "admin" || user_role === 1` (`isAdmin()` in
  `lib/auth-store.ts`). After login, admins redirect to `/admin`, users to `/perfil`
  (`AuthPanel` effect + explicit replace). `ProtectedRoute admin` guards the layout.
