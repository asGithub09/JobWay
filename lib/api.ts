const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:5000/api";

type ApiError = Error & {
  status?: number;
  code?: string;
};

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      credentials: "include",
    },
  );

  const data = await response.json().catch(() => ({
    success: false,
    message: "Invalid server response.",
  }));

  if (!response.ok) {
    const error = new Error(
      data.message || "Request failed.",
    ) as ApiError;

    error.status = response.status;
    error.code = data.code;

    throw error;
  }

  return data as T;
}

/* =========================
   AUTH
========================= */

export type RegisterPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

export type VerifyEmailPayload = {
  userId: string;
  otp: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthUser = {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
  isEmailVerified?: boolean;
};

export type AuthResponse = {
  success?: boolean;
  message?: string;
  token?: string;
  user?: AuthUser;
  userId?: string;
  [key: string]: unknown;
};

export function register(
  payload: RegisterPayload,
) {
  return request<AuthResponse>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function verifyEmail(
  payload: VerifyEmailPayload,
) {
  return request<AuthResponse>(
    "/auth/verify-email",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function login(
  payload: LoginPayload,
) {
  return request<AuthResponse>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

/* =========================
   COURSES
========================= */

export type CourseFaculty = {
  _id?: string;
  id?: string;
  name?: string;
  designation?: string;
  profileImage?: string;
};

export type Course = {
  _id?: string;
  id?: string;
  title?: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  category?: string;
  thumbnailUrl?: string;
  faculty?: CourseFaculty[];
  language?: string;
  level?: string;
  duration?: string;
  validity?: string;
  price?: number;
  discountedPrice?: number;
  isFeatured?: boolean;
  featured?: boolean;
  status?: string;
  [key: string]: unknown;
};

export type CoursesResponse = {
  success?: boolean;
  courses?: Course[];
  message?: string;
};

export function getCourses() {
  return request<CoursesResponse>("/courses");
}