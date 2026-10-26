# Tablas Pintas — Frontend Integration Guide

Use this document to connect the Next.js/React frontend to the NestJS backend at `https://api.tablaspintas.com/v1`.

---

## Table of Contents

1. [Base URL & Versioning](#base-url--versioning)
2. [Authentication Strategy](#authentication-strategy)
3. [CSRF Protection](#csrf-protection)
4. [CORS & Cookies](#cors--cookies)
5. [Error Response Shape](#error-response-shape)
6. [Roles](#roles)
7. [Endpoints](#endpoints)
   - [Auth](#auth)
   - [Users](#users)
   - [Courses](#courses)
   - [CMS](#cms)
   - [Contact](#contact)
   - [Payments](#payments)
   - [Admin](#admin)
   - [Certificates](#certificates)
8. [Webhooks](#webhooks)
9. [Email Templates](#email-templates)
10. [CMS Data Model for UI](#cms-data-model-for-ui)
11. [Common Frontend Patterns](#common-frontend-patterns)

---

## Base URL & Versioning

```text
Production:  https://api.tablaspintas.com/v1
Local:       http://localhost:3000/v1
```

All endpoints are prefixed with `/v1`.

---

## Authentication Strategy

- **Access token**: short-lived JWT (1 hour). Store in memory only (e.g. React Context/Zustand). Send as `Authorization: Bearer <token>`.
- **Refresh token**: long-lived (30 days), stored in `HttpOnly` cookie named `refresh_token` scoped to `/v1/auth`. Do not read it from JavaScript.
- On 401, call `POST /v1/auth/refresh` with `credentials: 'include'` and `X-CSRF-Token` header to obtain a new access token.
- On logout, call `POST /v1/auth/logout` with the same CSRF header.

### Role checks

The JWT payload contains:

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "user",
  "type": "access"
}
```

There is also a numeric `user_role` field in user responses:

- `0` = normal user
- `1` = admin

---

## CSRF Protection

Only two endpoints require a CSRF token because they use the refresh cookie:

- `POST /v1/auth/refresh`
- `POST /v1/auth/logout`

Flow:

1. Login/Register sets a non-HttpOnly `csrf_token` cookie (path `/v1`).
2. Read that cookie in JS.
3. Send it as header `X-CSRF-Token` on refresh/logout.
4. Refresh returns a new `csrf_token` cookie; update your stored value.

Example:

```ts
const csrf = document.cookie.match(/csrf_token=([^;]+)/)?.[1];

await fetch('/v1/auth/refresh', {
  method: 'POST',
  credentials: 'include',
  headers: { 'X-CSRF-Token': csrf ?? '' },
});
```

Bearer-token endpoints do **not** need CSRF.

---

## CORS & Cookies

- Production allowed origin: `https://tablaspintas.com`
- Local allowed origins: `http://localhost:3000`, `http://localhost:3001`
- Always send `credentials: 'include'` for auth routes so cookies are transmitted.

---

## Error Response Shape

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Course not found",
    "status": 404,
    "timestamp": "2026-09-09T14:20:00.000Z",
    "request_id": "req_abc123xyz",
    "path": "/v1/courses/123"
  }
}
```

Common codes: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `RESOURCE_NOT_FOUND`, `CONFLICT`, `TOO_MANY_REQUESTS`, `INTERNAL_SERVER_ERROR`.

---

## Roles

| role | user_role | description |
|------|-----------|-------------|
| `user` | `0` | Default registered user |
| `admin` | `1` | Can manage courses, CMS, enrollments, certificates |

Admin creation is done via script or SQL, never through public registration.

---

## Endpoints

### Auth

#### `POST /v1/auth/csrf`

Public. Returns/sets the CSRF token needed for refresh/logout.

**Response:**

```json
{
  "csrf_token_required": true,
  "csrf_token": "..."
}
```

#### `POST /v1/auth/register`

Public. Creates a normal user.

**Body:**

```json
{
  "email": "usuario@ejemplo.com",
  "full_name": "María García",
  "password": "SeguroPassword123!",
  "phone": "+52 612 123 4567"
}
```

Password rules: 12-128 chars, at least one uppercase, one lowercase, one number, one special character.

**Response (201):**

```json
{
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "full_name": "María García",
    "role": "user",
    "user_role": 0,
    "created_at": "2026-09-09T..."
  },
  "access_token": "...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

Also sets `refresh_token` and `csrf_token` cookies.

#### `POST /v1/auth/login`

Public.

**Body:**

```json
{
  "email": "usuario@ejemplo.com",
  "password": "SeguroPassword123!"
}
```

**Response (200):** same shape as register.

#### `POST /v1/auth/refresh`

Public but requires valid refresh cookie + `X-CSRF-Token` header.

**Response (200):**

```json
{
  "access_token": "...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

#### `POST /v1/auth/logout`

Requires JWT + refresh cookie + `X-CSRF-Token` header.

**Response (200):**

```json
{ "message": "Logged out successfully" }
```

#### `POST /v1/auth/forgot-password`

Public.

**Body:** `{ "email": "..." }`

**Response:** `{ "message": "If the email exists, password reset instructions were sent" }`

#### `POST /v1/auth/reset-password`

Public.

**Body:**

```json
{
  "token": "reset-token-from-email",
  "new_password": "NuevaPassword123!"
}
```

**Response:** `{ "message": "Password reset successfully", "must_login_again": true }`

---

### Users

All require `Authorization: Bearer <token>`.

#### `GET /v1/users/me`

Returns current user profile.

**Response:**

```json
{
  "id": "uuid",
  "email": "...",
  "full_name": "...",
  "phone": "...",
  "role": "user",
  "user_role": 0,
  "preferences": {
    "class_reminder": true,
    "novelties": true,
    "email_notifications": true
  },
  "courses_bought": 3,
  "courses_completed": 1,
  "courses_pending": 2,
  "last_login_at": "2026-09-09T...",
  "created_at": "2026-09-09T...",
  "updated_at": "2026-09-09T..."
}
```

#### `GET /v1/users/me/courses`

Query params: `page`, `limit`, `status` (`active`, `completed`, `expired`).

**Response:**

```json
{
  "courses": [
    {
      "id": "uuid",
      "title": "Charcutería Básica",
      "instructor_name": "Chef María",
      "status": "active",
      "thumbnail_url": "...",
      "enrolled_at": "...",
      "access_until": "...",
      "date_of_transmission": "...",
      "attended_live_session": false,
      "has_certificate": false
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 1,
    "total_count": 3
  }
}
```

#### `GET /v1/users/me/certificates`

**Response:**

```json
{
  "certificates": [
    {
      "id": "uuid",
      "course_id": "uuid",
      "course_title": "...",
      "certificate_code": "CERT-2026-000001",
      "pdf_url": "...",
      "issued_at": "..."
    }
  ],
  "total": 1
}
```

#### `PUT /v1/users/me`

**Body:**

```json
{
  "full_name": "María Actualizada",
  "phone": "+52 612 987 6543",
  "preferences": {
    "class_reminder": false,
    "novelties": true,
    "email_notifications": true
  }
}
```

#### `POST /v1/users/me/change-password`

**Body:**

```json
{
  "current_password": "ActualPassword123!",
  "new_password": "NuevaPassword123!"
}
```

**Response:** `{ "message": "Password changed successfully", "must_login_again": true }`

#### `GET /v1/users/me/export`

Returns the user's full data for GDPR/ARCO export.

#### `DELETE /v1/users/me`

Requires current password.

**Body:** `{ "current_password": "..." }`

---

### Courses

#### `GET /v1/courses`

Public.

Query params: `page`, `limit`, `search`, `tags` (comma-separated IDs), `sort` (`newest`, `oldest`, `price_asc`, `price_desc`).

**Response:**

```json
{
  "courses": [
    {
      "id": "uuid",
      "title": "...",
      "subtitle": "...",
      "instructor_name": "...",
      "price_mxn": 1500,
      "price_usd": 89.99,
      "duration_days": 30,
      "thumbnail_url": "...",
      "occupancy": 50,
      "date_of_transmission": "...",
      "tags": ["Principiante", "Charcuterie"],
      "average_rating": 4.8,
      "total_comments": 5
    }
  ],
  "pagination": { "current_page": 1, "total_pages": 5, "total_count": 48 }
}
```

#### `GET /v1/courses/:id`

Public.

**Response includes:** full description, images, `course_content`, `whats_included`, `google_meet_link`, comments preview, tags, average rating.

#### `POST /v1/courses`

Admin only.

**Body:**

```json
{
  "title": "Charcutería Avanzada",
  "subtitle": "Técnicas profesionales",
  "description": "Curso avanzado...",
  "instructor_name": "Chef Juan",
  "price_mxn": 2500,
  "price_usd": 149.99,
  "duration_days": 45,
  "thumbnail_url": "https://...",
  "images": ["https://..."],
  "course_content": [{ "title": "Módulo 1", "description": "Intro" }],
  "whats_included": [{ "title": "Certificado", "description": "Certificado profesional" }],
  "occupancy": 15,
  "pdf_base_certificate": "https://...",
  "pdf_sign_position": "bottom_right",
  "google_meet_link": "https://meet.google.com/xxx-xxx-xxx",
  "google_drive_recorded_link": "https://drive.google.com/...",
  "date_of_transmission": "2026-10-15T19:00:00.000Z",
  "published": false,
  "tag_ids": ["tag-id-1"]
}
```

#### `PUT /v1/courses/:id`

Admin only. Same body as create but all fields optional.

#### `DELETE /v1/courses/:id`

Admin only. Soft-deletes (archives) the course.

#### `POST /v1/courses/:id/comments`

Authenticated. User must have a completed enrollment for this course.

**Body:**

```json
{
  "comment": "Excelente curso, muy completo",
  "rating": 5
}
```

#### `GET /v1/courses/:id/comments`

Public.

Query params: `page`, `limit`, `sort` (`recent`, `helpful`, `rating_high`, `rating_low`).

**Response:**

```json
{
  "comments": [...],
  "pagination": { "current_page": 1, "total_count": 12 },
  "average_rating": 4.7
}
```

#### `GET /v1/tags`

Public. Query param `search`.

#### `POST /v1/tags`

Admin only. Body `{ "title": "Principiante" }`.

---

### CMS

Pages are managed by key: `home`, `courses`, `contact`.

#### `GET /v1/content/:pageKey`

Public. Returns the published page content.

**Home response example:**

```json
{
  "page_key": "home",
  "first_text": "Conoce Tablas Pintas",
  "title": "Cursos que inspiran",
  "subtitle": "...",
  "hero_image_url": "...",
  "status": "published",
  "published_at": "...",
  "hero_slides": [
    {
      "id": "uuid",
      "title": "Bienvenidos",
      "hero_subtitle": "...",
      "text": "...",
      "has_buttons": true,
      "button1_link": "/cursos",
      "button1_title": "Ver cursos",
      "button2_link": "/contacto",
      "button2_title": "Contactar",
      "image_url": "...",
      "video_url": null,
      "sort_order": 0
    }
  ],
  "about_sections": [
    {
      "id": "uuid",
      "title": "Nuestra experiencia",
      "subtitle": "Aprende con profesionales.",
      "image_url": "...",
      "sort_order": 0
    }
  ],
  "selected_comments": [
    {
      "id": "uuid",
      "user_name": "María García",
      "comment": "Excelente curso",
      "rating": 5,
      "is_verified_purchase": true,
      "course_id": "uuid",
      "course_title": "Charcutería Básica",
      "created_at": "..."
    }
  ]
}
```

#### `PUT /v1/admin/content/:pageKey`

Admin only. Creates or updates a page.

**Body:**

```json
{
  "first_text": "Conoce Tablas Pintas",
  "title": "Cursos que inspiran",
  "subtitle": "...",
  "hero_image_url": "https://...",
  "status": "published",
  "hero_slides": [
    {
      "title": "Bienvenidos",
      "hero_subtitle": "...",
      "text": "...",
      "has_buttons": true,
      "button1_link": "/cursos",
      "button1_title": "Ver cursos",
      "button2_link": "/contacto",
      "button2_title": "Contactar",
      "image_url": "https://..."
    }
  ],
  "about_sections": [
    { "title": "Nuestra experiencia", "subtitle": "...", "image_url": "https://..." }
  ],
  "selected_comment_ids": ["comment-uuid-1", "comment-uuid-2"]
}
```

Each hero slide must have `image_url` or `video_url`.

#### `GET /v1/site-settings`

Public.

**Response:**

```json
{
  "slogan": "Aprende, crea y comparte.",
  "phone": "+52 612 123 4567",
  "email": "hola@tablaspintas.com",
  "address": "La Paz, Baja California Sur",
  "sociallinks": [
    { "network": "instagram", "url": "https://instagram.com/tablaspintas" }
  ]
}
```

#### `PUT /v1/admin/site-settings`

Admin only.

**Body:**

```json
{
  "slogan": "...",
  "phone": "...",
  "email": "...",
  "address": "...",
  "social_links": [
    { "network": "instagram", "url": "https://..." }
  ]
}
```

---

### Contact

#### `POST /v1/contact`

Public.

**Body:**

```json
{
  "name": "María García",
  "email": "maria@ejemplo.com",
  "phone": "+52 612 123 4567",
  "subject": "Información de cursos",
  "message": "Me gustaría conocer próximos cursos."
}
```

#### `GET /v1/admin/contact`

Admin only. Query params: `page`, `limit`.

#### `PATCH /v1/admin/contact/:id`

Admin only. Body `{ "status": "read" }` (`new`, `read`, `replied`, `archived`).

---

### Payments

#### `POST /v1/enrollments/checkout`

Authenticated. Initiates Stripe Checkout or PayPal order.

**Body:**

```json
{
  "course_id": "uuid",
  "currency": "MXN",
  "provider": "stripe"
}
```

**Response (Stripe):**

```json
{
  "checkout_session_id": "cs_test_...",
  "checkout_url": "https://checkout.stripe.com/...",
  "expires_at": "2026-09-09T..."
}
```

**Response (PayPal):**

```json
{
  "checkout_order_id": "...",
  "checkout_url": "https://www.paypal.com/...",
  "expires_at": "2026-09-09T..."
}
```

After successful payment, the provider webhook completes the enrollment automatically.

---

### Admin

All require admin JWT.

#### `GET /v1/admin/users`

Query params: `page`, `limit`, `search`.

#### `GET /v1/admin/enrollments`

Query params: `page`, `limit`, `status`, `course_id`.

#### `GET /v1/admin/analytics`

**Response:**

```json
{
  "overview": {
    "total_users": 48,
    "total_revenue_mxn": 125000,
    "total_enrollments": 156,
    "courses_published": 12
  },
  "recent_enrollments": [...],
  "monthly_revenue": [],
  "top_courses": [...]
}
```

---

### Certificates

#### `POST /v1/certificates/generate`

Admin only.

**Body:**

```json
{
  "user_id": "uuid",
  "course_id": "uuid",
  "enrollment_id": "uuid",
  "pdf_url": "https://storage.example.com/certificates/cert-001.pdf"
}
```

#### `GET /v1/certificates/:id`

Authenticated. Users can access their own certificates; admins can access any.

---

## Webhooks

These are called by Stripe/PayPal, not the frontend:

- `POST /v1/webhooks/stripe`
- `POST /v1/webhooks/paypal`

They require valid provider signatures and are not throttled.

---

## Email Templates

Resend sends Spanish emails for:

- Welcome
- Course purchase confirmation
- Password reset
- Enrollment confirmation
- Certificate available
- Payment failed
- New contact submission notification to admin

Email sending is skipped if `RESEND_API_KEY` is not configured.

---

## CMS Data Model for UI

### Home page (`/v1/content/home`)

```ts
interface HomePage {
  first_text?: string;
  title?: string;
  subtitle?: string;
  hero_slides: {
    title?: string;
    hero_subtitle?: string;
    text?: string;
    has_buttons: boolean;
    button1_link?: string;
    button1_title?: string;
    button2_link?: string;
    button2_title?: string;
    image_url?: string;
    video_url?: string;
  }[];
  about_sections: {
    title: string;
    subtitle: string;
    image_url?: string;
  }[];
  selected_comments: {
    user_name: string;
    comment: string;
    rating?: number;
    is_verified_purchase: boolean;
    course_title: string;
  }[];
}
```

### Courses page (`/v1/content/courses`)

```ts
interface CoursesPage {
  first_text?: string;
  title?: string;
  subtitle?: string;
  hero_image_url?: string;
}
```

### Contact page (`/v1/content/contact`)

```ts
interface ContactPage {
  first_text?: string;
  title?: string;
  subtitle?: string;
  hero_image_url?: string;
}
```

### Site settings (`/v1/site-settings`)

```ts
interface SiteSettings {
  slogan?: string;
  phone?: string;
  email?: string;
  address?: string;
  sociallinks: { network: string; url: string }[];
}
```

---

## Common Frontend Patterns

### Axios interceptor for refresh

```ts
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push((token) => {
            original.headers['Authorization'] = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }
      isRefreshing = true;
      const csrf = document.cookie.match(/csrf_token=([^;]+)/)?.[1] ?? '';
      const { data } = await axios.post('/v1/auth/refresh', {}, {
        withCredentials: true,
        headers: { 'X-CSRF-Token': csrf },
      });
      setAccessToken(data.access_token);
      refreshSubscribers.forEach((cb) => cb(data.access_token));
      refreshSubscribers = [];
      isRefreshing = false;
      original.headers['Authorization'] = `Bearer ${data.access_token}`;
      return api(original);
    }
    return Promise.reject(error);
  },
);
```

### Fetch wrapper

```ts
async function apiFetch(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  });
}
```

---

## Environment Variables for Frontend

```env
NEXT_PUBLIC_API_URL=https://api.tablaspintas.com/v1
NEXT_PUBLIC_FRONTEND_URL=https://tablaspintas.com
```

Do not expose backend secrets in the frontend bundle.
