/*
 * JobWay Frontend API Layer
 *
 * IMPORTANT:
 * The dedicated JobWay backend has not been created yet.
 *
 * These functions intentionally do NOT connect to the old OJDV backend.
 * They provide the interface required by the existing authentication UI.
 *
 * When the new JobWay backend is created, these functions will be connected
 * to the new backend without requiring the authentication pages themselves
 * to be rewritten.
 */

type ApiError = Error & {
  status?: number;
  code?: string;
};

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

function backendNotConfigured(): never {
  const error = new Error(
    "JobWay backend is not connected yet. Authentication will be enabled when the dedicated JobWay backend is created.",
  ) as ApiError;

  error.code = "BACKEND_NOT_CONFIGURED";

  throw error;
}

export function register(_payload: RegisterPayload): Promise<AuthResponse> {
  return Promise.reject(backendNotConfigured());
}

export function verifyEmail(
  _payload: VerifyEmailPayload,
): Promise<AuthResponse> {
  return Promise.reject(backendNotConfigured());
}

export function login(_payload: LoginPayload): Promise<AuthResponse> {
  return Promise.reject(backendNotConfigured());
}