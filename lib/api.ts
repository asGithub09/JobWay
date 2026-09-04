const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api";

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const isFormData =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers: {
        ...(isFormData
          ? {}
          : {
              "Content-Type": "application/json",
            }),
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

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
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
   CURRENT USER / PROFILE
   ============================================================ */

export async function getMe(): Promise<{
  success: boolean;
  user: AuthUser;
}> {
  const token = getAuthToken();

  return request<{
    success: boolean;
    user: AuthUser;
  }>("/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function updateProfile(
  payload: UpdateProfilePayload,
): Promise<{
  success: boolean;
  message: string;
  user: AuthUser;
}> {
  const token = getAuthToken();

  return request<{
    success: boolean;
    message: string;
    user: AuthUser;
  }>("/auth/profile", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
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
   COURSE TYPES
   ============================================================ */

export interface CourseSyllabusItem {
  title: string;
  description: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  category: string;
  level: string;
  description: string;
  bannerImage: string;
  duration: string;
  language: string;
  price: number;
  discountPrice: number;
  instructor: string;
  features: string[];
  syllabus: CourseSyllabusItem[];
  isFeatured: boolean;
  isPublished: boolean;
  interestedCount: number;
  enrolledCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCoursePayload {
  title: string;
  slug?: string;
  category: string;
  level?: string;
  description: string;
  bannerImage?: string;
  duration?: string;
  language?: string;
  price?: number;
  discountPrice?: number;
  instructor?: string;
  features?: string[];
  syllabus?: CourseSyllabusItem[];
  isFeatured?: boolean;
  isPublished?: boolean;
}

export interface UpdateCoursePayload {
  title?: string;
  slug?: string;
  category?: string;
  level?: string;
  description?: string;
  bannerImage?: string;
  duration?: string;
  language?: string;
  price?: number;
  discountPrice?: number;
  instructor?: string;
  features?: string[];
  syllabus?: CourseSyllabusItem[];
  isFeatured?: boolean;
  isPublished?: boolean;
}

export interface GetCoursesResponse {
  success: boolean;
  courses: Course[];
}

export interface GetCourseResponse {
  success: boolean;
  course: Course;
}

export interface CourseMutationResponse {
  success: boolean;
  message: string;
  course: Course;
}

export interface DeleteCourseResponse {
  success: boolean;
  message: string;
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

/* ============================================================
   COURSES — PUBLIC
   ============================================================ */

/**
 * Get all published courses for the
 * student/public website.
 */
export async function getCourses(): Promise<GetCoursesResponse> {
  return request<GetCoursesResponse>(
    "/courses",
    {
      method: "GET",
    },
  );
}

/**
 * Get one published course by slug.
 */
export async function getCourse(
  slug: string,
): Promise<GetCourseResponse> {
  return request<GetCourseResponse>(
    `/courses/${encodeURIComponent(slug)}`,
    {
      method: "GET",
    },
  );
}

/* ============================================================
   COURSES — ADMIN
   ============================================================ */

/**
 * Get all courses for the Admin Course Manager.
 *
 * Includes unpublished courses.
 */
export async function getAdminCourses(): Promise<GetCoursesResponse> {
  const token = getAuthToken();

  return request<GetCoursesResponse>(
    "/courses/admin/all",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

/**
 * Create a course from the Admin Portal.
 */
export async function createCourse(
  payload: CreateCoursePayload,
): Promise<CourseMutationResponse> {
  const token = getAuthToken();

  return request<CourseMutationResponse>(
    "/courses/admin",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );
}

/**
 * Update an existing course.
 */
export async function updateCourse(
  courseId: string,
  payload: UpdateCoursePayload,
): Promise<CourseMutationResponse> {
  const token = getAuthToken();

  return request<CourseMutationResponse>(
    `/courses/admin/${courseId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );
}

/**
 * Toggle course published/unpublished status.
 */
export async function toggleCoursePublish(
  courseId: string,
): Promise<CourseMutationResponse> {
  const token = getAuthToken();

  return request<CourseMutationResponse>(
    `/courses/admin/${courseId}/publish`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

/**
 * Delete a course.
 */
export async function deleteCourse(
  courseId: string,
): Promise<DeleteCourseResponse> {
  const token = getAuthToken();

  return request<DeleteCourseResponse>(
    `/courses/admin/${courseId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

/* ============================================================
   COURSE FACTORY — ADMIN
   ============================================================ */

export type CourseDraftLesson = {
  title: string;
  description?: string;
  content?: string;
  keyPoints?: string[];
  bullets?: string[];
  sourceSection?: string;
  order?: number;
  [key: string]: unknown;
};

export type CourseDraftModule = {
  title: string;
  description?: string;
  order?: number;
  lessons?: CourseDraftLesson[];
  [key: string]: unknown;
};

export type CourseDraftQuestion = {
  type?: string;
  question?: string;
  options?: string[];
  answer?: string;
  explanation?: string;
  sourceSection?: string;
  order?: number;
  [key: string]: unknown;
};

export type CourseDraftPractice = {
  title: string;
  type: string;
  description?: string;
  questions?: CourseDraftQuestion[];
  order?: number;
  [key: string]: unknown;
};

export type CourseDraftSourceSection = {
  title?: string;
  sourceTitle?: string;
  type?: string;
  confidence?: number;
  isPractice?: boolean;
  isProject?: boolean;
  practiceType?: string;
  text?: string;
  order?: number;
  [key: string]: unknown;
};

export type CourseDraftSummary = {
  unitCount?: number;
  sectionCount?: number;
  questionCount?: number;
  bulletCount?: number;
  mcqCount?: number;
  [key: string]: unknown;
};

export type CourseDraft = {
  _id?: string;
  id?: string;

  course?: string | Course;
  material?: string;

  createdBy?: string;

  title?: string;
  description?: string;

  sourceFileName?: string;

  status?: string;
  generationMode?: string;
  detectionMode?: string;

  summary?: CourseDraftSummary;

  modules?: CourseDraftModule[];

  practice?: CourseDraftPractice[];

  sourceSections?: CourseDraftSourceSection[];

  errorMessage?: string;

  createdAt?: string;
  updatedAt?: string;

  [key: string]: unknown;
};

export type CourseDraftsResponse = {
  success?: boolean;
  drafts?: CourseDraft[];
  message?: string;
};

export type CourseDraftResponse = {
  success?: boolean;
  draft?: CourseDraft;
  message?: string;
};

export type BuildCourseDraftPayload = {
  courseId: string;
  materialId: string;
  regenerate?: boolean;
};

export type BuildCourseDraftResponse = {
  success?: boolean;
  draft?: CourseDraft;
  reused?: boolean;
  regenerated?: boolean;
  message?: string;
};

/**
 * Payload accepted by the Review Studio
 * when saving an edited draft.
 */
export type UpdateCourseDraftPayload = {
  title?: string;
  description?: string;
  modules?: CourseDraftModule[];
  practice?: CourseDraftPractice[];
  sourceSections?: CourseDraftSourceSection[];
};

/**
 * Get all Course Factory drafts.
 *
 * Optional courseId filters drafts
 * belonging to one course.
 */
export async function getCourseDrafts(
  courseId?: string,
): Promise<CourseDraftsResponse> {
  const token = getAuthToken();

  const query = courseId
    ? `?courseId=${encodeURIComponent(courseId)}`
    : "";

  return request<CourseDraftsResponse>(
    `/course-factory/drafts${query}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

/**
 * Get one Course Factory draft.
 */
export async function getCourseDraft(
  draftId: string,
): Promise<CourseDraftResponse> {
  const token = getAuthToken();

  return request<CourseDraftResponse>(
    `/course-factory/drafts/${encodeURIComponent(
      draftId,
    )}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

/**
 * Build a Course Factory draft from
 * uploaded source material.
 */
export async function buildCourseDraft(
  payload: BuildCourseDraftPayload,
): Promise<BuildCourseDraftResponse> {
  const token = getAuthToken();

  return request<BuildCourseDraftResponse>(
    "/course-factory/build",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );
}

/**
 * Save changes made to a Course Factory draft.
 */
export async function updateCourseDraft(
  draftId: string,
  payload: UpdateCourseDraftPayload,
): Promise<CourseDraftResponse> {
  const token = getAuthToken();

  return request<CourseDraftResponse>(
    `/course-factory/drafts/${encodeURIComponent(
      draftId,
    )}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );
}
export type CourseMaterial = {
  id: string;
  course: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  status: string;
  pageCount: number;
  characterCount: number;
  wordCount: number;
  createdAt?: string;
};

export type UploadCourseMaterialResponse = {
  success?: boolean;
  message?: string;
  material?: CourseMaterial;
};

export async function uploadCourseMaterial(
  courseId: string,
  file: File,
): Promise<UploadCourseMaterialResponse> {
  const token = getAuthToken();

  const formData = new FormData();

  formData.append("courseId", courseId);
  formData.append("file", file);

  return request<UploadCourseMaterialResponse>(
    "/course-materials/upload",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    },
  );
}

export type UploadCourseImageResponse = {
  success?: boolean;
  message?: string;
  imageUrl?: string;
  file?: {
    originalName: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
  };
};

export async function uploadCourseImage(
  file: File,
): Promise<UploadCourseImageResponse> {
  const token = getAuthToken();

  const formData = new FormData();

  formData.append("image", file);

  return request<UploadCourseImageResponse>(
    "/course-images/upload",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    },
  );
}
/* ============================================================
   COURSE FACTORY — APPROVAL & PUBLISHING
   ============================================================ */

export type ApproveCourseDraftResponse = {
  success?: boolean;
  draft?: CourseDraft;
  message?: string;
};

/**
 * Approve a Course Factory draft.
 *
 * READY_FOR_REVIEW -> APPROVED
 */
export async function approveCourseDraft(
  draftId: string,
): Promise<ApproveCourseDraftResponse> {
  const token = getAuthToken();

  return request<ApproveCourseDraftResponse>(
    `/course-factory/drafts/${encodeURIComponent(
      draftId,
    )}/approve`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export type PublishCourseDraftResponse = {
  success?: boolean;
  draft?: CourseDraft;
  course?: {
    id?: string;
    title?: string;
    slug?: string;
    isPublished?: boolean;
  };
  message?: string;
};

/**
 * Publish an approved Course Factory draft.
 *
 * APPROVED -> PUBLISHED
 */
export async function publishCourseDraft(
  draftId: string,
): Promise<PublishCourseDraftResponse> {
  const token = getAuthToken();

  return request<PublishCourseDraftResponse>(
    `/course-factory/drafts/${encodeURIComponent(
      draftId,
    )}/publish`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}