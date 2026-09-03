const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api";

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
    message: "Invalid server response",
  }));

  if (!response.ok) {
    throw new Error(
      data.message || "Something went wrong",
    );
  }

  return data;
}

/* =========================================================
   AUTH TYPES
   ========================================================= */

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyEmailPayload {
  email: string;
  otp: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ResendVerificationPayload {
  email: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  isEmailVerified: boolean;
  role: "student" | "admin";
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: AuthUser;
  requiresVerification?: boolean;
  email?: string;
  expiresAt?: string;
}

/* =========================================================
   REGISTER
   ========================================================= */

export async function register(
  payload: RegisterPayload,
): Promise<AuthResponse> {
  return request<AuthResponse>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

/* =========================================================
   VERIFY EMAIL
   ========================================================= */

export async function verifyEmail(
  payload: VerifyEmailPayload,
): Promise<AuthResponse> {
  return request<AuthResponse>(
    "/auth/verify-email",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

/* =========================================================
   RESEND VERIFICATION
   ========================================================= */

export async function resendVerification(
  payload: ResendVerificationPayload,
): Promise<AuthResponse> {
  return request<AuthResponse>(
    "/auth/resend-verification",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

/* =========================================================
   LOGIN
   ========================================================= */

export async function login(
  payload: LoginPayload,
): Promise<AuthResponse> {
  return request<AuthResponse>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

/* =========================================================
   FORGOT PASSWORD
   ========================================================= */

export async function forgotPassword(
  payload: ForgotPasswordPayload,
): Promise<AuthResponse> {
  return request<AuthResponse>(
    "/auth/forgot-password",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

/* =========================================================
   RESET PASSWORD
   ========================================================= */

export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<AuthResponse> {
  return request<AuthResponse>(
    "/auth/reset-password",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}