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
