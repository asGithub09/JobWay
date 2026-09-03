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

/* ============================================================
   AUTH TYPES
   ============================================================ */

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

/* ============================================================
   AUTH FUNCTIONS
   ============================================================ */

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

/* ============================================================
   LEAD GENERATION
   ============================================================ */

export type LeadGoal =
  | "government"
  | "private";

export type LeadInterest =
  | "free-courses"
  | "job-ready-courses"
  | "mock-tests"
  | "job-updates";

export type LeadStatus =
  | "new"
  | "contacted"
  | "interested"
  | "converted"
  | "not-interested";

export interface CreateLeadPayload {
  name: string;
  phone: string;
  email: string;
  goal: LeadGoal;
  interests: LeadInterest[];
  source?: string;
}

export interface Lead {
  id?: string;
  _id?: string;

  name: string;
  phone: string;
  email: string;

  goal: LeadGoal;
  interests: LeadInterest[];

  source: string;
  status: LeadStatus;

  createdAt: string;
  updatedAt?: string;
}

export interface CreateLeadResponse {
  success: boolean;
  message: string;
  lead?: Lead;
}

export interface LeadStats {
  total: number;
  government: number;
  private: number;
  freeCourses: number;
  jobReadyCourses: number;
  mockTests: number;
  jobUpdates: number;
}

export interface GetLeadsFilters {
  search?: string;
  goal?: LeadGoal;
  interest?: LeadInterest;
  status?: LeadStatus;
  page?: number;
  limit?: number;
}

export interface GetLeadsResponse {
  success: boolean;
  message?: string;
  leads: Lead[];
  stats: LeadStats;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/* ============================================================
   AUTH TOKEN HELPER
   ============================================================ */

function getAuthToken(): string {
  if (typeof window === "undefined") {
    return "";
  }

  return (
    localStorage.getItem("jobway_token") ||
    ""
  );
}

/* ============================================================
   CREATE LEAD
   ============================================================ */

export async function createLead(
  payload: CreateLeadPayload,
): Promise<CreateLeadResponse> {
  return request<CreateLeadResponse>(
    "/leads",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

/* ============================================================
   ADMIN — GET LEADS
   ============================================================ */

export async function getLeads(
  filters: GetLeadsFilters = {},
): Promise<GetLeadsResponse> {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set(
      "search",
      filters.search,
    );
  }

  if (filters.goal) {
    params.set(
      "goal",
      filters.goal,
    );
  }

  if (filters.interest) {
    params.set(
      "interest",
      filters.interest,
    );
  }

  if (filters.status) {
    params.set(
      "status",
      filters.status,
    );
  }

  if (filters.page) {
    params.set(
      "page",
      String(filters.page),
    );
  }

  if (filters.limit) {
    params.set(
      "limit",
      String(filters.limit),
    );
  }

  const query = params.toString();

  const token = getAuthToken();

  return request<GetLeadsResponse>(
    `/leads${query ? `?${query}` : ""}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

/* ============================================================
   ADMIN — UPDATE LEAD STATUS
   ============================================================ */

export interface UpdateLeadStatusResponse {
  success: boolean;
  message: string;
  lead?: Lead;
}

export async function updateLeadStatus(
  leadId: string,
  status: LeadStatus,
): Promise<UpdateLeadStatusResponse> {
  const token = getAuthToken();

  return request<UpdateLeadStatusResponse>(
    `/leads/${leadId}/status`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status,
      }),
    },
  );
}