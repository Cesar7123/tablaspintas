"use client";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://localhost:3000/v1").replace(
  /\/$/,
  "",
);

export type ApiUser = {
  id: string;
  email: string;
  full_name: string;
  phone?: string | null;
  role: "user" | "admin";
  user_role?: 0 | 1;
  preferences?: UserPreferences;
  courses_bought?: number;
  courses_completed?: number;
  courses_pending?: number;
  created_at?: string;
};

export type UserPreferences = {
  class_reminder: boolean;
  novelties: boolean;
  email_notifications: boolean;
};

export type Course = {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  instructor_name: string;
  price_mxn: number;
  price_usd?: number;
  duration_days: number;
  thumbnail_url?: string;
  images?: string[];
  course_content?: { title: string; description: string }[];
  whats_included?: { title: string; description: string }[];
  occupancy: number;
  google_meet_link?: string;
  google_drive_recorded_link?: string;
  date_of_transmission: string;
  published?: boolean;
  tags?: string[];
  average_rating?: number;
  total_comments?: number;
  comments?: CommentItem[];
};

export type CommentItem = {
  id: string;
  user_name: string;
  comment: string;
  rating?: number;
  is_verified_purchase?: boolean;
  created_at: string;
};

export type Enrollment = Course & {
  status: "active" | "completed" | "expired";
  enrolled_at: string;
  access_until: string;
  attended_live_session: boolean;
  has_certificate: boolean;
};

export type Certificate = {
  id: string;
  course_id: string;
  course_title: string;
  certificate_code: string;
  pdf_url: string;
  issued_at: string;
};

export type ApiErrorShape = {
  error?: { code?: string; message?: string } | string;
  message?: string;
};

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

const ACCESS_TOKEN_STORAGE_KEY = "tablas-pintas-access-token";

function storedAccessToken() {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

let accessToken: string | null = storedAccessToken();
let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof window === "undefined") return;
  try {
    if (token) window.sessionStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
    else window.sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  } catch {
    // Session storage can be unavailable in privacy-restricted browsers.
  }
}

export function getAccessToken() {
  return accessToken;
}

function csrfToken() {
  if (typeof document === "undefined") return "";
  return document.cookie.match(/(?:^|; )csrf_token=([^;]+)/)?.[1] ?? "";
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let body: T & ApiErrorShape;
  try {
    body = text ? JSON.parse(text) : ({} as T & ApiErrorShape);
  } catch {
    body = {} as T & ApiErrorShape;
  }
  if (!response.ok) {
    const error = typeof body.error === "string" ? body.error : body.error?.message || body.message;
    throw new ApiError(
      error || `Request failed (${response.status})`,
      response.status,
      typeof body.error === "object" ? body.error.code : undefined,
    );
  }
  return body as T;
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "X-CSRF-Token": csrfToken() },
    })
      .then(async (response) => {
        if (!response.ok) return null;
        const data = await parseResponse<{ access_token: string }>(response);
        setAccessToken(data.access_token);
        return data.access_token;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });
  if (response.status === 401 && retry && !path.includes("/auth/refresh")) {
    const token = await refreshAccessToken();
    if (token) return apiFetch<T>(path, options, false);
  }
  return parseResponse<T>(response);
}

function multipartBody(fields: Record<string, unknown>, fileField: string, file: File) {
  const body = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) continue;
    body.append(key, typeof value === "string" ? value : JSON.stringify(value));
  }
  body.append(fileField, file);
  return body;
}

export const api = {
  health: () => apiFetch<{ message: string }>("/health", { method: "GET" }),
  csrf: () => apiFetch<{ csrf_token?: string }>("/auth/csrf", { method: "POST" }),
  login: (body: { email: string; password: string }) =>
    apiFetch<{ user: ApiUser; access_token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  register: (body: { email: string; full_name: string; password: string; phone?: string }) =>
    apiFetch<{ user: ApiUser; access_token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  logout: () =>
    apiFetch<{ message: string }>("/auth/logout", {
      method: "POST",
      headers: { "X-CSRF-Token": csrfToken() },
    }),
  me: () => apiFetch<ApiUser>("/users/me"),
  updateMe: (
    body: Partial<Pick<ApiUser, "full_name" | "phone">> & { preferences?: UserPreferences },
  ) => apiFetch<ApiUser>("/users/me", { method: "PUT", body: JSON.stringify(body) }),
  changePassword: (body: { current_password: string; new_password: string }) =>
    apiFetch<{ message: string; must_login_again: boolean }>("/users/me/change-password", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  deleteMe: (current_password: string) =>
    apiFetch<void>("/users/me", { method: "DELETE", body: JSON.stringify({ current_password }) }),
  exportMe: () => apiFetch<unknown>("/users/me/export"),
  courses: (query = "") =>
    apiFetch<{
      courses: Course[];
      pagination?: { total_count: number; current_page: number; total_pages: number };
    }>(`/courses${query ? `?${query}` : ""}`),
  course: (id: string) => apiFetch<Course>(`/courses/${id}`),
  comments: (id: string) =>
    apiFetch<{ comments: CommentItem[]; average_rating?: number }>(`/courses/${id}/comments`),
  addComment: (id: string, body: { comment: string; rating: number }) =>
    apiFetch<CommentItem>(`/courses/${id}/comments`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  tags: () => apiFetch<{ tags: { id: string; title: string; slug?: string }[] }>("/tags"),
  myCourses: (query = "") =>
    apiFetch<{ courses: Enrollment[]; pagination?: { total_count: number } }>(
      `/users/me/courses${query ? `?${query}` : ""}`,
    ),
  certificates: () =>
    apiFetch<{ certificates: Certificate[]; total: number }>("/users/me/certificates"),
  checkout: (body: { course_id: string; currency: string; provider: "stripe" | "paypal" }) =>
    apiFetch<{ checkout_url: string }>("/enrollments/checkout", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  content: (page: string) => apiFetch<Record<string, unknown>>(`/content/${page}`),
  settings: () => apiFetch<Record<string, unknown>>("/site-settings"),
  contact: (body: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
  }) => apiFetch<{ message: string }>("/contact", { method: "POST", body: JSON.stringify(body) }),
  adminAnalytics: () => apiFetch<Record<string, any>>("/admin/analytics"),
  adminUsers: (query = "") =>
    apiFetch<{ users: ApiUser[]; pagination?: any }>(`/admin/users${query ? `?${query}` : ""}`),
  adminEnrollments: (query = "") =>
    apiFetch<{ enrollments: any[]; pagination?: any }>(
      `/admin/enrollments${query ? `?${query}` : ""}`,
    ),
  adminContact: (query = "") =>
    apiFetch<{ contacts: any[]; messages?: any[]; pagination?: any }>(
      `/admin/contact${query ? `?${query}` : ""}`,
    ),
  updateContact: (id: string, status: string) =>
    apiFetch<any>(`/admin/contact/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
  createCourse: (body: Partial<Course> & { tag_ids?: string[] }, thumbnail?: File) =>
    apiFetch<Course>("/courses", {
      method: "POST",
      body: thumbnail ? multipartBody(body, "thumbnail", thumbnail) : JSON.stringify(body),
    }),
  updateCourse: (id: string, body: Partial<Course> & { tag_ids?: string[] }, thumbnail?: File) =>
    apiFetch<Course>(`/courses/${id}`, {
      method: "PUT",
      body: thumbnail ? multipartBody(body, "thumbnail", thumbnail) : JSON.stringify(body),
    }),
  deleteCourse: (id: string) => apiFetch<void>(`/courses/${id}`, { method: "DELETE" }),
  updateContent: (page: string, body: Record<string, unknown>, heroImage?: File) =>
    apiFetch<Record<string, unknown>>(`/admin/content/${page}`, {
      method: "PUT",
      body: heroImage ? multipartBody(body, "hero_image", heroImage) : JSON.stringify(body),
    }),
  updateSettings: (body: Record<string, unknown>) =>
    apiFetch<Record<string, unknown>>("/admin/site-settings", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
};
