const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api";

export async function request<T>(
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
  role: "student" | "admin" | "educator";
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
   FACULTY INVITATION ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â EDUCATOR ONBOARDING
   ============================================================ */

export interface FacultyInvitationValidation {
  id: string;
  email: string;
  name: string;
  status: "pending" | "accepted" | "revoked" | "expired";
  expiresAt: string;
}

export interface ValidateFacultyInvitationResponse {
  success: boolean;
  invitation: FacultyInvitationValidation;
}

export interface AcceptFacultyInvitationPayload {
  name: string;
  phone: string;
  password: string;
}

export interface AcceptFacultyInvitationResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: AuthUser;
}

export async function validateFacultyInvitation(
  token: string,
): Promise<ValidateFacultyInvitationResponse> {
  return request<ValidateFacultyInvitationResponse>(
    `/faculty/invitations/validate/${encodeURIComponent(token)}`,
    {
      method: "GET",
    },
  );
}

export async function acceptFacultyInvitation(
  token: string,
  payload: AcceptFacultyInvitationPayload,
): Promise<AcceptFacultyInvitationResponse> {
  return request<AcceptFacultyInvitationResponse>(
    `/faculty/invitations/accept/${encodeURIComponent(token)}`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}
export interface FacultyInvitation {
  id: string;
  email: string;
  name: string;
  status: "pending" | "accepted" | "revoked" | "expired";
  expiresAt: string;
  invitedBy?: {
    _id?: string;
    name?: string;
    email?: string;
  } | null;
  acceptedBy?: {
    _id?: string;
    name?: string;
    email?: string;
  } | null;
  acceptedAt?: string | null;
  revokedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFacultyInvitationPayload {
  email: string;
  name?: string;
}

export interface CreateFacultyInvitationResponse {
  success: boolean;
  message: string;
  invitation: FacultyInvitation;
}

export interface ListFacultyInvitationsResponse {
  success: boolean;
  invitations: FacultyInvitation[];
}

export interface RevokeFacultyInvitationResponse {
  success: boolean;
  message: string;
  invitation: FacultyInvitation;
}

export async function createFacultyInvitation(
  payload: CreateFacultyInvitationPayload,
): Promise<CreateFacultyInvitationResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  return request<CreateFacultyInvitationResponse>(
    "/faculty/invitations",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );
}

export async function listFacultyInvitations(): Promise<ListFacultyInvitationsResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  return request<ListFacultyInvitationsResponse>(
    "/faculty/invitations",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export async function revokeFacultyInvitation(
  id: string,
): Promise<RevokeFacultyInvitationResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  return request<RevokeFacultyInvitationResponse>(
    `/faculty/invitations/${encodeURIComponent(id)}/revoke`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
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
    isLandingPagePublished: boolean;
    educatorCourse: string | null;
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
export interface CourseCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseCategoriesResponse {
  success: boolean;
  categories: CourseCategory[];
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
   ADMIN ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â GET LEADS
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
   ADMIN ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â UPDATE LEAD STATUS
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
   COURSE CATEGORIES
   ============================================================ */

/**
 * Get all active course categories.
 *
 * Public endpoint used by student/public pages
 * and the Admin Course Manager category selector.
 */
export async function getCourseCategories(): Promise<CourseCategoriesResponse> {
  return request<CourseCategoriesResponse>(
    "/course-categories",
    {
      method: "GET",
    },
  );
}

/**
 * Get all course categories for Admin.
 *
 * Includes inactive categories.
 */
export async function getAdminCourseCategories(): Promise<CourseCategoriesResponse> {
  const token = getAuthToken();

  return request<CourseCategoriesResponse>(
    "/course-categories/admin/all",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

/**
 * Create a course category.
 */
export async function createCourseCategory(
  payload: {
    name: string;
    slug?: string;
    description?: string;
    icon?: string;
    image?: string;
    isActive?: boolean;
    displayOrder?: number;
  },
): Promise<{
  success: boolean;
  message: string;
  category: CourseCategory;
}> {
  const token = getAuthToken();

  return request<{
    success: boolean;
    message: string;
    category: CourseCategory;
  }>(
    "/course-categories/admin",
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
 * Update a course category.
 */
export async function updateCourseCategory(
  categoryId: string,
  payload: {
    name?: string;
    slug?: string;
    description?: string;
    icon?: string;
    image?: string;
    isActive?: boolean;
    displayOrder?: number;
  },
): Promise<{
  success: boolean;
  message: string;
  category: CourseCategory;
}> {
  const token = getAuthToken();

  return request<{
    success: boolean;
    message: string;
    category: CourseCategory;
  }>(
    `/course-categories/admin/${categoryId}`,
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
 * Delete a course category.
 */
export async function deleteCourseCategory(
  categoryId: string,
): Promise<{
  success: boolean;
  message: string;
}> {
  const token = getAuthToken();

  return request<{
    success: boolean;
    message: string;
  }>(
    `/course-categories/admin/${categoryId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

/* ============================================================
   COURSES ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â PUBLIC
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
   COURSES ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ADMIN
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


/**
 * Approve or remove a course from the public landing page.
 *
 * This is separate from batch learning publication.
 */
export async function toggleCourseLandingPage(
  courseId: string,
  published: boolean,
): Promise<CourseMutationResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  return request<CourseMutationResponse>(
    `/courses/admin/${encodeURIComponent(courseId)}/landing-page`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        published,
      }),
    },
  );
}

/* ============================================================
   COURSE FACTORY ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ADMIN
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
export type CourseMaterialCourse = {
  id: string;
  title: string;
  slug?: string;
};

export type CourseMaterial = {
  id: string;
  course: string | CourseMaterialCourse;
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
   COURSE FACTORY ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â APPROVAL & PUBLISHING
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
/* =========================================================
   COURSE MATERIALS / STUDY RESOURCES
   ========================================================= */

export async function getCourseMaterials(): Promise<CourseMaterial[]> {
  const token = getAuthToken();

  return request<CourseMaterial[]>(
    "/course-materials",
    {
      method: "GET",
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    },
  );
}

export async function getAdminCourseMaterials(): Promise<CourseMaterial[]> {
  const token = getAuthToken();

  return request<CourseMaterial[]>(
    "/course-materials/admin/all",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export async function getCourseMaterial(
  materialId: string,
): Promise<CourseMaterial> {
  const token = getAuthToken();

  return request<CourseMaterial>(
    `/course-materials/${materialId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export async function deleteCourseMaterial(
  materialId: string,
): Promise<{
  success: boolean;
  message?: string;
}> {
  const token = getAuthToken();

  return request<{
    success: boolean;
    message?: string;
  }>(
    `/course-materials/${materialId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export async function fetchCourseMaterialFile(
  materialId: string,
  mode: "open" | "download" = "open",
): Promise<Blob> {
  const token = getAuthToken();

  if (!token) {
    throw new Error(
      "You must be logged in to access this study material.",
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/course-materials/${materialId}/${mode}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    },
  );

  if (!response.ok) {
    let message =
      `Unable to ${mode} the study material.`;

    try {
      const data = await response.json();

      if (
        data &&
        typeof data.message === "string"
      ) {
        message = data.message;
      }
    } catch {
      // Ignore JSON parsing errors.
    }

    throw new Error(message);
  }

  return response.blob();
}

export async function openCourseMaterial(
  materialId: string,
): Promise<void> {
  const blob =
    await fetchCourseMaterialFile(
      materialId,
      "open",
    );

  const objectUrl =
    URL.createObjectURL(blob);

  const newWindow =
    window.open(
      objectUrl,
      "_blank",
      "noopener,noreferrer",
    );

  if (!newWindow) {
    URL.revokeObjectURL(objectUrl);

    throw new Error(
      "The browser blocked the resource window. Please allow pop-ups for JobWay.",
    );
  }

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 60_000);
}

export async function downloadCourseMaterial(
  materialId: string,
  fileName: string,
): Promise<void> {
  const blob =
    await fetchCourseMaterialFile(
      materialId,
      "download",
    );

  const objectUrl =
    URL.createObjectURL(blob);

  const anchor =
    document.createElement("a");

  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.style.display = "none";

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 1_000);
}
/* ============================================================
   EXAMS / MOCK TESTS ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ADMIN
   ============================================================ */

export interface Exam {
  id: string;
  name: string;
  slug: string;
  shortName?: string;
  category: string;
  description: string;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TestSeries {
  id: string;
  exam:
    | string
    | {
        _id: string;
        name?: string;
        slug?: string;
      };
  title: string;
  slug: string;
  description: string;
  accessType: "FREE" | "PREMIUM";
  price: number;
  discountPrice: number;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MockTest {
  id: string;
  testSeries:
    | string
    | {
        _id: string;
        title?: string;
        slug?: string;
      };
  title: string;
  slug: string;
  description: string;
  durationMinutes: number;
  totalQuestions: number;
  marksPerQuestion: number;
  negativeMarking: number;
  accessType: "FREE" | "PREMIUM";
  isPublished: boolean;
  instructions: string[];
  attemptLimit: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MockTestOption {
  key: string;
  text: string;
}

export interface MockTestQuestion {
  id: string;
  mockTest: string;
  questionText: string;
  options: MockTestOption[];
  correctAnswer?: string;
  explanation?: string;
  subject: string;
  topic: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  order: number;
}

export interface CreateExamPayload {
  name: string;
  slug?: string;
  shortName?: string;
  category: string;
  description?: string;
  isPublished?: boolean;
  sortOrder?: number;
}

export interface UpdateExamPayload {
  name?: string;
  slug?: string;
  shortName?: string;
  category?: string;
  description?: string;
  isPublished?: boolean;
  sortOrder?: number;
}

export interface CreateTestSeriesPayload {
  exam: string;
  title: string;
  slug?: string;
  description?: string;
  accessType?: "FREE" | "PREMIUM";
  price?: number;
  discountPrice?: number;
  isPublished?: boolean;
  sortOrder?: number;
}

export interface CreateMockTestPayload {
  testSeries: string;
  title: string;
  slug?: string;
  description?: string;
  durationMinutes?: number;
  marksPerQuestion?: number;
  negativeMarking?: number;
  accessType?: "FREE" | "PREMIUM";
  isPublished?: boolean;
  instructions?: string[];
  attemptLimit?: number;
  sortOrder?: number;
}

export interface CreateMockTestQuestionPayload {
  mockTest: string;
  questionText: string;
  options: MockTestOption[];
  correctAnswer: string;
  explanation?: string;
  subject?: string;
  topic?: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  order?: number;
}

/* ============================================================
   EXAMS ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â PUBLIC
   ============================================================ */

export async function getPublishedExams(): Promise<{
  success: boolean;
  exams: Exam[];
}> {
  return request<{
    success: boolean;
    exams: Exam[];
  }>("/exams");
}

export async function getPublishedExam(
  slug: string,
): Promise<{
  success: boolean;
  exam: Exam;
}> {
  return request<{
    success: boolean;
    exam: Exam;
  }>(`/exams/${encodeURIComponent(slug)}`);
}

/* ============================================================
   EXAMS ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ADMIN
   ============================================================ */

export async function getAdminExams(
  token: string,
): Promise<{
  success: boolean;
  exams: Exam[];
}> {
  return request<{
    success: boolean;
    exams: Exam[];
  }>("/exams/admin/all", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function createExam(
  token: string,
  payload: CreateExamPayload,
): Promise<{
  success: boolean;
  message: string;
  exam: Exam;
}> {
  return request<{
    success: boolean;
    message: string;
    exam: Exam;
  }>("/exams/admin", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function updateExam(
  token: string,
  id: string,
  payload: UpdateExamPayload,
): Promise<{
  success: boolean;
  message: string;
  exam: Exam;
}> {
  return request<{
    success: boolean;
    message: string;
    exam: Exam;
  }>(`/exams/admin/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}
export async function deleteExam(
  token: string,
  id: string,
): Promise<{
  success: boolean;
  message: string;
}> {
  return request<{
    success: boolean;
    message: string;
  }>(`/exams/admin/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/* ============================================================
   TEST SERIES ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â PUBLIC
   ============================================================ */

export async function getPublishedTestSeries(
  examId: string,
): Promise<{
  success: boolean;
  testSeries: TestSeries[];
}> {
  return request<{
    success: boolean;
    testSeries: TestSeries[];
  }>(
    `/exams/test-series/exam/${encodeURIComponent(
      examId,
    )}`,
  );
}

/* ============================================================
   TEST SERIES ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ADMIN
   ============================================================ */

export async function getAdminTestSeries(
  token: string,
): Promise<{
  success: boolean;
  testSeries: TestSeries[];
}> {
  return request<{
    success: boolean;
    testSeries: TestSeries[];
  }>("/exams/admin/test-series/all", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function createTestSeries(
  token: string,
  payload: CreateTestSeriesPayload,
): Promise<{
  success: boolean;
  message: string;
  testSeries: TestSeries;
}> {
  return request<{
    success: boolean;
    message: string;
    testSeries: TestSeries;
  }>("/exams/admin/test-series", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}
export async function updateTestSeries(
  token: string,
  id: string,
  payload: Partial<CreateTestSeriesPayload>,
): Promise<{
  success: boolean;
  message: string;
  testSeries: TestSeries;
}> {
  return request<{
    success: boolean;
    message: string;
    testSeries: TestSeries;
  }>(`/exams/admin/test-series/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function deleteTestSeries(
  token: string,
  id: string,
): Promise<{
  success: boolean;
  message: string;
}> {
  return request<{
    success: boolean;
    message: string;
  }>(`/exams/admin/test-series/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/* ============================================================
   MOCK TESTS ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â PUBLIC
   ============================================================ */

export async function getPublishedMockTests(
  testSeriesId: string,
): Promise<{
  success: boolean;
  mockTests: MockTest[];
}> {
  return request<{
    success: boolean;
    mockTests: MockTest[];
  }>(
    `/exams/mock-tests/series/${encodeURIComponent(
      testSeriesId,
    )}`,
  );
}

export async function getPublishedMockTest(
  slug: string,
): Promise<{
  success: boolean;
  mockTest: MockTest;
  questions: MockTestQuestion[];
}> {
  return request<{
    success: boolean;
    mockTest: MockTest;
    questions: MockTestQuestion[];
  }>(
    `/exams/mock-tests/${encodeURIComponent(slug)}`,
  );
}

/* ============================================================
   MOCK TEST ATTEMPTS ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â STUDENT
   ============================================================ */

export interface MockTestAttemptAnswer {
  question: string;
  selectedAnswer: string | null;
  markedForReview: boolean;
}

export interface MockTestAttempt {
  id: string;
  user: string;
  mockTest: string;
  status: "IN_PROGRESS" | "SUBMITTED" | "EXPIRED";
  startedAt: string;
  submittedAt: string | null;
  expiresAt: string;
  answers: MockTestAttemptAnswer[];
  totalQuestions: number;
  attemptedQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  score: number;
  percentage: number;
  questionReview?: MockTestQuestionReview[];
  createdAt: string;
  updatedAt: string;
}

export interface MockTestQuestionReview {
  question: string;
  questionText: string;
  options: MockTestOption[];
  selectedAnswer: "A" | "B" | "C" | "D" | null;
  correctAnswer: "A" | "B" | "C" | "D";
  markedForReview: boolean;
  isCorrect: boolean;
  explanation?: string;
  subject?: string;
  topic?: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  order: number;
}

export interface MockTestAttemptQuestion {
  id: string;
  questionText: string;
  options: MockTestOption[];
  explanation?: string;
  subject?: string;
  topic?: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  order: number;
}

export interface MockTestAttemptInfo {
  id: string;
  title: string;
  slug: string;
  durationMinutes: number;
  totalQuestions: number;
  marksPerQuestion: number;
  negativeMarking: number;
}

export interface StartMockTestAttemptResponse {
  success: boolean;
  message: string;
  resumed: boolean;
  attempt: MockTestAttempt;
  mockTest: MockTestAttemptInfo;
  questions: MockTestAttemptQuestion[];
}

export interface SaveMockTestAnswerPayload {
  questionId: string;
  selectedAnswer: "A" | "B" | "C" | "D" | null;
  markedForReview?: boolean;
}

export interface SaveMockTestAnswerResponse {
  success: boolean;
  message: string;
  answer: {
    question: string;
    selectedAnswer: string | null;
    markedForReview: boolean;
  };
  attemptedQuestions: number;
  unansweredQuestions: number;
  expiresAt: string;
}

export interface SubmitMockTestAttemptResponse {
  success: boolean;
  message: string;
  attempt: MockTestAttempt;
}

export interface GetMockTestAttemptResponse {
  success: boolean;
  attempt: MockTestAttempt;
  mockTest: MockTestAttemptInfo | null;
}

export interface GetMyMockTestAttemptsResponse {
  success: boolean;
  attempts: Array<
    MockTestAttempt & {
      mockTest: {
        id: string;
        title: string;
        slug: string;
        durationMinutes: number;
        totalQuestions: number;
        marksPerQuestion: number;
        negativeMarking: number;
        accessType: "FREE" | "PREMIUM";
      } | null;
    }
  >;
}

export async function startMockTestAttempt(
  mockTestId: string,
): Promise<StartMockTestAttemptResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  return request<StartMockTestAttemptResponse>(
    "/exams/attempts/start",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ mockTestId }),
    },
  );
}

export async function saveMockTestAnswer(
  attemptId: string,
  payload: SaveMockTestAnswerPayload,
): Promise<SaveMockTestAnswerResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  return request<SaveMockTestAnswerResponse>(
    `/exams/attempts/${encodeURIComponent(attemptId)}/answer`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );
}

export async function submitMockTestAttempt(
  attemptId: string,
): Promise<SubmitMockTestAttemptResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  return request<SubmitMockTestAttemptResponse>(
    `/exams/attempts/${encodeURIComponent(attemptId)}/submit`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export async function getMockTestAttempt(
  attemptId: string,
): Promise<GetMockTestAttemptResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  return request<GetMockTestAttemptResponse>(
    `/exams/attempts/${encodeURIComponent(attemptId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export async function getMyMockTestAttempts(): Promise<GetMyMockTestAttemptsResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  return request<GetMyMockTestAttemptsResponse>(
    "/exams/attempts/my",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

/* ============================================================
   MOCK TESTS ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ADMIN
   ============================================================ */

export async function getAdminMockTests(
  token: string,
): Promise<{
  success: boolean;
  mockTests: MockTest[];
}> {
  return request<{
    success: boolean;
    mockTests: MockTest[];
  }>("/exams/admin/mock-tests/all", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function createMockTest(
  token: string,
  payload: CreateMockTestPayload,
): Promise<{
  success: boolean;
  message: string;
  mockTest: MockTest;
}> {
  return request<{
    success: boolean;
    message: string;
    mockTest: MockTest;
  }>("/exams/admin/mock-tests", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function updateMockTest(
  token: string,
  id: string,
  payload: Partial<CreateMockTestPayload>,
): Promise<{
  success: boolean;
  message: string;
  mockTest: MockTest;
}> {
  return request<{
    success: boolean;
    message: string;
    mockTest: MockTest;
  }>(`/exams/admin/mock-tests/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function deleteMockTest(
  token: string,
  id: string,
): Promise<{
  success: boolean;
  message: string;
}> {
  return request<{
    success: boolean;
    message: string;
  }>(`/exams/admin/mock-tests/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/* ============================================================
   QUESTIONS ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ADMIN
   ============================================================ */

export async function createMockTestQuestion(
  token: string,
  payload: CreateMockTestQuestionPayload,
): Promise<{
  success: boolean;
  message: string;
  question: MockTestQuestion;
  totalQuestions: number;
}> {
  return request<{
    success: boolean;
    message: string;
    question: MockTestQuestion;
    totalQuestions: number;
  }>("/exams/admin/questions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function getAdminMockTestQuestions(
  token: string,
  mockTestId: string,
): Promise<{
  success: boolean;
  questions: MockTestQuestion[];
}> {
  return request<{
    success: boolean;
    questions: MockTestQuestion[];
  }>(
    `/exams/admin/questions/mock-test/${encodeURIComponent(
      mockTestId,
    )}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export async function deleteMockTestQuestion(
  token: string,
  questionId: string,
): Promise<{
  success: boolean;
  message: string;
  totalQuestions: number;
}> {
  return request<{
    success: boolean;
    message: string;
    totalQuestions: number;
  }>(
    `/exams/admin/questions/${encodeURIComponent(
      questionId,
    )}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}



/* ============================================================
   MOCK TEST QUESTIONS ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â UPDATE
   ============================================================ */

export async function updateMockTestQuestion(
  token: string,
  questionId: string,
  payload: Partial<CreateMockTestQuestionPayload>,
): Promise<{
  success: boolean;
  message: string;
  question: MockTestQuestion;
}> {
  return request<{
    success: boolean;
    message: string;
    question: MockTestQuestion;
  }>(
    `/exams/admin/questions/${encodeURIComponent(questionId)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );
}


/* ============================================================
   BATCHES ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ADMIN
   ============================================================ */

export type BatchStatus =
  | "active"
  | "inactive"
  | "archived";

export interface BatchCategory {
  _id: string;
  name: string;
  slug: string;
}

export interface Batch {
  _id: string;
  name: string;
  code: string;
  category: BatchCategory | null;
  description: string;
  startDate: string | null;
  endDate: string | null;
  status: BatchStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBatchPayload {
  name: string;
  code?: string;
  category?: string | null;
  description?: string;
  startDate?: string | null;
  endDate?: string | null;
}

export interface UpdateBatchPayload
  extends Partial<CreateBatchPayload> {
  status?: BatchStatus;
}

export interface GetBatchesResponse {
  success: boolean;
  batches: Batch[];
}

export interface BatchMutationResponse {
  success: boolean;
  message: string;
  batch: Batch;
}

export async function getBatches(
  params: {
    search?: string;
    status?: BatchStatus | "";
    category?: string;
  } = {},
): Promise<GetBatchesResponse> {
  const token = getAuthToken();
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  if (params.category) query.set("category", params.category);

  const queryString = query.toString();

  return request<GetBatchesResponse>(
    `/batches${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export async function getBatch(
  batchId: string,
): Promise<BatchMutationResponse> {
  const token = getAuthToken();

  return request<BatchMutationResponse>(
    `/batches/${encodeURIComponent(batchId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export async function createBatch(
  payload: CreateBatchPayload,
): Promise<BatchMutationResponse> {
  const token = getAuthToken();

  return request<BatchMutationResponse>(
    "/batches",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );
}

export async function updateBatch(
  batchId: string,
  payload: UpdateBatchPayload,
): Promise<BatchMutationResponse> {
  const token = getAuthToken();

  return request<BatchMutationResponse>(
    `/batches/${encodeURIComponent(batchId)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );
}

export async function updateBatchStatus(
  batchId: string,
  status: BatchStatus,
): Promise<BatchMutationResponse> {
  const token = getAuthToken();

  return request<BatchMutationResponse>(
    `/batches/${encodeURIComponent(batchId)}/status`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    },
  );
}

/* ============================================================
   BATCH STUDENTS ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ADMIN
   ============================================================ */

export interface BatchStudent {
  membershipId: string;
  student: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    isEmailVerified: boolean;
    isActive: boolean;
    createdAt: string;
  };
  status: "active" | "inactive";
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface BatchStudentSearchResult {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface GetBatchStudentsResponse {
  success: boolean;
  batch: Batch;
  students: BatchStudent[];
  total: number;
}

export interface SearchBatchStudentsResponse {
  success: boolean;
  students: BatchStudentSearchResult[];
}

export interface AddStudentsToBatchResponse {
  success: boolean;
  message: string;
  addedCount: number;
  skippedCount: number;
  students: BatchStudentSearchResult[];
}

export interface RemoveStudentFromBatchResponse {
  success: boolean;
  message: string;
}

export interface BatchStudentCountResponse {
  success: boolean;
  count: number;
}

export async function getBatchStudents(
  batchId: string,
  search = "",
): Promise<GetBatchStudentsResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  const query = new URLSearchParams();

  if (search.trim()) {
    query.set("search", search.trim());
  }

  const queryString = query.toString();

  return request<GetBatchStudentsResponse>(
    `/batch-members/batch/${encodeURIComponent(batchId)}/students${
      queryString ? `?${queryString}` : ""
    }`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export async function searchBatchStudents(
  batchId: string,
  search = "",
): Promise<SearchBatchStudentsResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  const query = new URLSearchParams();

  if (search.trim()) {
    query.set("search", search.trim());
  }

  const queryString = query.toString();

  return request<SearchBatchStudentsResponse>(
    `/batch-members/batch/${encodeURIComponent(batchId)}/available-students${
      queryString ? `?${queryString}` : ""
    }`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export async function addStudentsToBatch(
  batchId: string,
  studentIds: string[],
): Promise<AddStudentsToBatchResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  return request<AddStudentsToBatchResponse>(
    `/batch-members/batch/${encodeURIComponent(batchId)}/students`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ studentIds }),
    },
  );
}

export async function removeStudentFromBatch(
  batchId: string,
  studentId: string,
): Promise<RemoveStudentFromBatchResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  return request<RemoveStudentFromBatchResponse>(
    `/batch-members/batch/${encodeURIComponent(batchId)}/students/${encodeURIComponent(
      studentId,
    )}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export async function getBatchStudentCount(
  batchId: string,
): Promise<BatchStudentCountResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  return request<BatchStudentCountResponse>(
    `/batch-members/batch/${encodeURIComponent(batchId)}/count`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}
/* ============================================================
   STUDENTS ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ADMIN
   ============================================================ */

export interface StudentCurrentBatch {
  _id: string;
  name: string;
  code: string;
  status: BatchStatus;
}

export interface AdminStudent {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  currentBatch: StudentCurrentBatch | null;
  membershipId: string | null;
  joinedAt: string | null;
}

export interface GetStudentsResponse {
  success: boolean;
  students: AdminStudent[];
  total: number;
}

export interface StudentBatchSummary {
  _id: string;
  name: string;
  code: string;
  status: BatchStatus;
  category: BatchCategory | null;
  startDate: string | null;
  endDate: string | null;
  studentCount: number;
}

export interface GetStudentBatchSummaryResponse {
  success: boolean;
  batches: StudentBatchSummary[];
}

export interface AssignStudentBatchResponse {
  success: boolean;
  message: string;
  student: AdminStudent;
  membership: {
    _id: string;
    batch: string;
    student: string;
    status: "active" | "inactive";
    joinedAt: string;
  };
}

export interface UnassignStudentBatchResponse {
  success: boolean;
  message: string;
}

export async function getStudents(
  params: {
    search?: string;
    assignment?: "assigned" | "unassigned" | "";
  } = {},
): Promise<GetStudentsResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  const query = new URLSearchParams();

  if (params.search) {
    query.set("search", params.search);
  }

  if (params.assignment) {
    query.set("assignment", params.assignment);
  }

  const queryString = query.toString();

  return request<GetStudentsResponse>(
    `/students${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export async function getStudentBatchSummary(): Promise<GetStudentBatchSummaryResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  return request<GetStudentBatchSummaryResponse>(
    "/students/batch-summary",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export async function assignStudentToBatch(
  studentId: string,
  batchId: string,
): Promise<AssignStudentBatchResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  return request<AssignStudentBatchResponse>(
    `/students/${encodeURIComponent(studentId)}/batch`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        batchId,
      }),
    },
  );
}

export async function unassignStudentFromBatch(
  studentId: string,
): Promise<UnassignStudentBatchResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  return request<UnassignStudentBatchResponse>(
    `/students/${encodeURIComponent(studentId)}/batch`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}
/* ============================================================
   BATCH COURSES ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ADMIN
   ============================================================ */

export interface BatchCourse {
  membershipId: string;
  status: "active" | "inactive";
  assignedAt: string;
  course: Course;
}

export interface GetBatchCoursesResponse {
  success: boolean;
  batch: Batch;
  courses: BatchCourse[];
  total: number;
}

export interface BatchCourseSearchResult {
  _id: string;
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
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetAvailableBatchCoursesResponse {
  success: boolean;
  courses: BatchCourseSearchResult[];
}

export interface AddCoursesToBatchResponse {
  success: boolean;
  message: string;
  addedCount: number;
  reactivatedCount: number;
  skippedCount: number;
  courses: BatchCourseSearchResult[];
}

export interface RemoveCourseFromBatchResponse {
  success: boolean;
  message: string;
}

export async function getBatchCourses(
  batchId: string,
): Promise<GetBatchCoursesResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  return request<GetBatchCoursesResponse>(
    `/batch-courses/batch/${encodeURIComponent(batchId)}/courses`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export async function searchBatchCourses(
  batchId: string,
  search = "",
): Promise<GetAvailableBatchCoursesResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  const query = new URLSearchParams();

  if (search.trim()) {
    query.set("search", search.trim());
  }

  const queryString = query.toString();

  return request<GetAvailableBatchCoursesResponse>(
    `/batch-courses/batch/${encodeURIComponent(batchId)}/available-courses${
      queryString ? `?${queryString}` : ""
    }`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export async function addCoursesToBatch(
  batchId: string,
  courseIds: string[],
): Promise<AddCoursesToBatchResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  return request<AddCoursesToBatchResponse>(
    `/batch-courses/batch/${encodeURIComponent(batchId)}/courses`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        courseIds,
      }),
    },
  );
}

export async function removeCourseFromBatch(
  batchId: string,
  courseId: string,
): Promise<RemoveCourseFromBatchResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  return request<RemoveCourseFromBatchResponse>(
    `/batch-courses/batch/${encodeURIComponent(batchId)}/courses/${encodeURIComponent(
      courseId,
    )}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}
/* ============================================================
   STUDENT COURSES ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â BATCH ACCESS
   ============================================================ */

export interface StudentCourseBatch {
  _id: string;
  name: string;
  code: string;
  status: "active" | "inactive" | "archived";
}

export interface StudentCourseAccess {
  assignmentId: string;
  assignedAt: string;
  course: Course;
}

export interface GetMyCoursesResponse {
  success: boolean;
  batch: StudentCourseBatch | null;
  courses: StudentCourseAccess[];
  total: number;
}

export interface GetMyCourseResponse {
  success: boolean;
  batch: StudentCourseBatch | null;
  course: Course;
}

/**
 * Get courses assigned to the authenticated student's
 * active batch.
 */
export async function getMyCourses(): Promise<GetMyCoursesResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  return request<GetMyCoursesResponse>(
    "/student/courses",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

/**
 * Get one published course through the authenticated
 * student's batch access.
 */
export async function getMyCourse(
  slug: string,
): Promise<GetMyCourseResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  return request<GetMyCourseResponse>(
    `/student/courses/${encodeURIComponent(slug)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

/* ============================================================
   STUDENT TEST SERIES ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â BATCH ACCESS
   ============================================================ */

export interface StudentTestSeriesBatch {
  _id: string;
  name: string;
  code: string;
  status: "active" | "inactive" | "archived";
}

export interface StudentTestSeriesAccess {
  assignmentId: string;
  assignedAt: string;
  testSeries: TestSeries;
}

export interface GetMyTestSeriesResponse {
  success: boolean;
  batch: StudentTestSeriesBatch | null;
  testSeries: StudentTestSeriesAccess[];
  total: number;
}


export interface GetMyTestSeriesBySlugResponse {
  success: boolean;
  batch: StudentTestSeriesBatch | null;
  testSeries: TestSeries;
}

/**
 * Get all test series assigned to the authenticated
 * student's active batch.
 */
export async function getMyTestSeries(): Promise<GetMyTestSeriesResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  return request<GetMyTestSeriesResponse>(
    "/student/test-series",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

/**
 * Get one published test series through the
 * authenticated student's batch access.
 */
export async function getMyTestSeriesBySlug(
  slug: string,
): Promise<GetMyTestSeriesBySlugResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

return request<GetMyTestSeriesBySlugResponse>(
  `/student/test-series/${encodeURIComponent(slug)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

/* ============================================================
   STUDENT COURSE PROGRESS
   ============================================================ */

export interface StudentCourseCompletedLesson {
  moduleIndex: number;
  lessonIndex: number;
  completedAt: string;
}

export interface StudentCourseCompletedModule {
  moduleIndex: number;
  completedAt: string;
}

export interface StudentCourseProgress {
  _id: string;
  completedLessons: StudentCourseCompletedLesson[];
  completedModules: StudentCourseCompletedModule[];
  currentModuleIndex: number;
  currentLessonIndex: number;
  progressPercent: number;
  lastAccessedAt: string;
  completedAt: string | null;
}

export interface GetStudentCourseProgressResponse {
  success: boolean;
  batch: StudentCourseBatch | null;
  course: {
    _id: string;
    title: string;
    slug: string;
  };
  progress: StudentCourseProgress;
  totalLessons: number;
  completedLessonCount: number;
  progressPercent: number;
}

export interface CompleteStudentCourseLessonPayload {
  moduleIndex: number;
  lessonIndex: number;
}

export interface CompleteStudentCourseLessonResponse {
  success: boolean;
  message: string;
  progress: StudentCourseProgress;
  totalLessons: number;
  completedLessonCount: number;
  progressPercent: number;
  nextLesson: {
    moduleIndex: number;
    lessonIndex: number;
  } | null;
  lessonAlreadyCompleted: boolean;
  moduleCompleted: boolean;
  courseCompleted: boolean;
}

export interface UpdateStudentCourseLessonPayload {
  moduleIndex: number;
  lessonIndex: number;
}

export interface UpdateStudentCourseLessonResponse {
  success: boolean;
  message: string;
  progress: StudentCourseProgress;
}

/**
 * Get persistent progress for the authenticated student's
 * assigned course.
 */
export async function getStudentCourseProgress(
  courseId: string,
): Promise<GetStudentCourseProgressResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  return request<GetStudentCourseProgressResponse>(
    `/student/course-progress/${encodeURIComponent(courseId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

/**
 * Mark one course lesson as completed.
 *
 * The backend validates the student's batch access and
 * calculates the next lesson and overall progress.
 */
export async function completeStudentCourseLesson(
  courseId: string,
  payload: CompleteStudentCourseLessonPayload,
): Promise<CompleteStudentCourseLessonResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  return request<CompleteStudentCourseLessonResponse>(
    `/student/course-progress/${encodeURIComponent(courseId)}/complete`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
}

/**
 * Save the lesson the student is currently viewing.
 */
export async function updateStudentCourseLesson(
  courseId: string,
  payload: UpdateStudentCourseLessonPayload,
): Promise<UpdateStudentCourseLessonResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  return request<UpdateStudentCourseLessonResponse>(
    `/student/course-progress/${encodeURIComponent(courseId)}/current`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
}

/* ============================================================
   STUDENT CERTIFICATES
   ============================================================ */

export interface StudentCertificateCourse {
  _id: string;
  title: string;
  slug: string;
  bannerImage?: string;
  instructor?: string;
}

export interface StudentCertificate {
  _id: string;
  student: string;
  course: StudentCertificateCourse | string;

  certificateNumber: string;
  verificationId: string;

  studentName: string;
  courseTitle: string;

  completionPercentage: number;

  issuedAt: string;
  status?: "issued" | "revoked";

  createdAt?: string;
  updatedAt?: string;
}

export interface StudentCertificatesResponse {
  success: boolean;
  certificates: StudentCertificate[];
  total: number;
}

export interface StudentCertificateResponse {
  success: boolean;
  certificate: StudentCertificate;
  created?: boolean;
  message?: string;
}

/**
 * Get all certificates belonging to the
 * authenticated student.
 */
export async function getStudentCertificates(): Promise<
  StudentCertificatesResponse
> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  return request<StudentCertificatesResponse>(
    "/student/certificates",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

/**
 * Issue a certificate for a completed course.
 *
 * The backend remains authoritative for:
 * - authentication
 * - student status
 * - batch access
 * - course access
 * - course completion
 * - duplicate certificate prevention
 */
export async function issueStudentCertificate(
  courseId: string,
): Promise<StudentCertificateResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  return request<StudentCertificateResponse>(
    `/student/certificates/${encodeURIComponent(courseId)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

/**
 * Get one certificate belonging to the
 * authenticated student.
 */
export async function getStudentCertificate(
  certificateId: string,
): Promise<StudentCertificateResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  return request<StudentCertificateResponse>(
    `/student/certificates/${encodeURIComponent(certificateId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}
/* ============================================================
   BATCH TEST SERIES ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ADMIN
   ============================================================ */

export interface BatchTestSeriesExam {
  _id: string;
  name: string;
  slug: string;
  shortName: string;
}

export interface BatchTestSeriesItem {
  _id: string;
  title: string;
  slug: string;
  description: string;
  accessType: "FREE" | "PREMIUM";
  price: number;
  discountPrice: number;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  exam: BatchTestSeriesExam;
}

export interface BatchTestSeries {
  membershipId: string;
  status: "active" | "inactive";
  assignedAt: string;
  testSeries: BatchTestSeriesItem;
}

export interface GetBatchTestSeriesResponse {
  success: boolean;
  batch: Batch;
  testSeries: BatchTestSeries[];
  total: number;
}

export interface BatchTestSeriesSearchResult extends BatchTestSeriesItem {}

export interface GetAvailableBatchTestSeriesResponse {
  success: boolean;
  testSeries: BatchTestSeriesSearchResult[];
  total: number;
}

export interface AddTestSeriesToBatchResponse {
  success: boolean;
  message: string;
  addedCount: number;
  reactivatedCount: number;
  skippedCount: number;
  testSeries: BatchTestSeriesSearchResult[];
}

export interface RemoveTestSeriesFromBatchResponse {
  success: boolean;
  message: string;
}

export async function getBatchTestSeries(
  batchId: string,
): Promise<GetBatchTestSeriesResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  return request<GetBatchTestSeriesResponse>(
    `/batch-test-series/batch/${encodeURIComponent(batchId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export async function searchBatchTestSeries(
  batchId: string,
  search = "",
): Promise<GetAvailableBatchTestSeriesResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  const query = new URLSearchParams();

  if (search.trim()) {
    query.set("search", search.trim());
  }

  const queryString = query.toString();

  return request<GetAvailableBatchTestSeriesResponse>(
    `/batch-test-series/batch/${encodeURIComponent(batchId)}/available${
      queryString ? `?${queryString}` : ""
    }`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export async function addTestSeriesToBatch(
  batchId: string,
  testSeriesIds: string[],
): Promise<AddTestSeriesToBatchResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  return request<AddTestSeriesToBatchResponse>(
    `/batch-test-series/batch/${encodeURIComponent(batchId)}/test-series`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        testSeriesIds,
      }),
    },
  );
}

export async function removeTestSeriesFromBatch(
  batchId: string,
  testSeriesId: string,
): Promise<RemoveTestSeriesFromBatchResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  return request<RemoveTestSeriesFromBatchResponse>(
    `/batch-test-series/batch/${encodeURIComponent(batchId)}/test-series/${encodeURIComponent(
      testSeriesId,
    )}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}
/* ============================================================
   BATCH EDUCATORS ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ADMIN / EDUCATOR
   ============================================================ */

export interface BatchEducator {
  assignmentId: string;

  educator: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    isEmailVerified?: boolean;
    isActive?: boolean;
    role: "educator";
    createdAt?: string;
  };

  status: "active" | "inactive";
  assignedAt: string;
  assignedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface BatchEducatorSearchResult {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isEmailVerified?: boolean;
  isActive?: boolean;
  role: "educator";
  createdAt?: string;
}

export interface GetBatchEducatorsResponse {
  success: boolean;
  batch: Batch;
  educators: BatchEducator[];
  total: number;
}

export interface SearchBatchEducatorsResponse {
  success: boolean;
  educators: BatchEducatorSearchResult[];
}

export interface AddEducatorsToBatchResponse {
  success: boolean;
  message: string;
  addedCount: number;
  reactivatedCount: number;
  skippedCount: number;
  educators: BatchEducatorSearchResult[];
}

export interface RemoveEducatorFromBatchResponse {
  success: boolean;
  message: string;
}

export interface MyBatchAssignment {
  assignmentId: string;

  batch: Batch;

  status: "active" | "inactive";

  assignedAt: string;
}

export interface GetMyBatchesResponse {
  success: boolean;
  batches: MyBatchAssignment[];
  total: number;
}

/*
 * Get educators currently assigned to a batch.
 *
 * GET
 * /api/batch-educators/batch/:batchId/educators
 */
export async function getBatchEducators(
  batchId: string,
  search = "",
): Promise<GetBatchEducatorsResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error(
      "Authentication required",
    );
  }

  const query = new URLSearchParams();

  if (search.trim()) {
    query.set(
      "search",
      search.trim(),
    );
  }

  const queryString =
    query.toString();

  return request<GetBatchEducatorsResponse>(
    `/batch-educators/batch/${encodeURIComponent(
      batchId,
    )}/educators${
      queryString
        ? `?${queryString}`
        : ""
    }`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

/*
 * Search active educators who are not
 * already assigned to a batch.
 *
 * GET
 * /api/batch-educators/batch/:batchId/available-educators
 */
export async function searchBatchEducators(
  batchId: string,
  search = "",
): Promise<SearchBatchEducatorsResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error(
      "Authentication required",
    );
  }

  const query = new URLSearchParams();

  if (search.trim()) {
    query.set(
      "search",
      search.trim(),
    );
  }

  const queryString =
    query.toString();

  return request<SearchBatchEducatorsResponse>(
    `/batch-educators/batch/${encodeURIComponent(
      batchId,
    )}/available-educators${
      queryString
        ? `?${queryString}`
        : ""
    }`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

/*
 * Assign one or multiple educators to a batch.
 *
 * POST
 * /api/batch-educators/batch/:batchId/educators
 */
export async function addEducatorsToBatch(
  batchId: string,
  educatorIds: string[],
): Promise<AddEducatorsToBatchResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error(
      "Authentication required",
    );
  }

  return request<AddEducatorsToBatchResponse>(
    `/batch-educators/batch/${encodeURIComponent(
      batchId,
    )}/educators`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        educatorIds,
      }),
    },
  );
}

/*
 * Remove an educator from a batch.
 *
 * DELETE
 * /api/batch-educators/batch/:batchId/educators/:educatorId
 */
export async function removeEducatorFromBatch(
  batchId: string,
  educatorId: string,
): Promise<RemoveEducatorFromBatchResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error(
      "Authentication required",
    );
  }

  return request<RemoveEducatorFromBatchResponse>(
    `/batch-educators/batch/${encodeURIComponent(
      batchId,
    )}/educators/${encodeURIComponent(
      educatorId,
    )}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

/*
 * Get batches assigned to the
 * authenticated educator.
 *
 * GET
 * /api/batch-educators/my-batches
 */
export async function getMyBatches(): Promise<GetMyBatchesResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error(
      "Authentication required",
    );
  }

  return request<GetMyBatchesResponse>(
    "/batch-educators/my-batches",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

/* ============================================================
   EDUCATOR EMS ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â STUDENT EXAMS
   ============================================================ */

export interface StudentEducatorExam {
  id: string;
  title: string;
  slug: string;
  shortName: string;
  description: string;
  category: string;
  subject: string;
  topic: string;
  durationMinutes: number;
  totalMarks: number;
  passingPercentage: number;
  questionCount: number;
  accessType: "FREE" | "PREMIUM";
  attemptPolicy:
    | "SINGLE_ATTEMPT"
    | "MULTIPLE_ATTEMPTS";
  maxAttempts: number;
  publishedAt: string | null;
  isFeatured: boolean;
  sortOrder: number;
}

export interface StudentEducatorExamsResponse {
  success: boolean;
  batch: {
    _id: string;
    name: string;
    code: string;
    status: string;
  } | null;
  exams: StudentEducatorExam[];
  total: number;
}

export async function getMyEducatorExams(): Promise<StudentEducatorExamsResponse> {
  const token = getAuthToken();

  if (!token) {
    return {
      success: false,
      batch: null,
      exams: [],
      total: 0,
    };
  }

  return request<StudentEducatorExamsResponse>(
    "/student/educator-exams",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}
export interface EducatorExamAttemptQuestionOption {
  key: string;
  text: string;
}

export interface EducatorExamAttemptQuestion {
  id: string;
  questionText: string;
  questionType: string;
  options: EducatorExamAttemptQuestionOption[];
  subject: string;
  topic: string;
  subtopic: string;
  difficulty: string;
  order: number;
  marks: number;
  negativeMarks: number;
}

export interface EducatorExamAttemptAnswer {
  question: string;
  selectedAnswers: string[];
  markedForReview: boolean;
  answeredAt: string | null;
}

export interface EducatorExamAttempt {
  id: string;
  exam: string;
  status: string;
  reentryLocked: boolean;
  startedAt: string;
  expiresAt: string;
  submittedAt: string | null;
  terminatedAt: string | null;
  totalQuestions: number;
  answers: EducatorExamAttemptAnswer[];
  proctoringEnabled: boolean;
  cameraVerified: boolean;
  microphoneVerified: boolean;
  fullscreenVerified: boolean;
  strikeCount: number;
  violations: unknown[];
  terminationReason: string;
  accessType: "FREE" | "PREMIUM";
  entitlementVerified: boolean;
}

export interface StartEducatorExamResponse {
  success: boolean;
  resumed: boolean;
  message?: string;
  attempt: EducatorExamAttempt;
  exam: {
    id: string;
    title: string;
    shortName: string;
    description: string;
    instructions: string;
    category: string;
    subject: string;
    topic: string;
    durationMinutes: number;
    totalMarks: number;
    passingPercentage: number;
    accessType: "FREE" | "PREMIUM";
    attemptPolicy: "SINGLE_ATTEMPT" | "MULTIPLE_ATTEMPTS";
    proctoring: {
      enabled: boolean;
      requireCamera: boolean;
      requireMicrophone: boolean;
      requireFullscreen: boolean;
      monitorFullscreen: boolean;
      monitorVisibility: boolean;
      monitorBlur: boolean;
      monitorContextMenu: boolean;
      maxStrikes: number;
      terminationCountdownSeconds: number;
    };
  };
  questions: EducatorExamAttemptQuestion[];
}

export interface SaveEducatorExamAnswerPayload {
  questionId: string;
  selectedAnswers: string[];
  markedForReview: boolean;
}

export interface SaveEducatorExamAnswerResponse {
  success: boolean;
  message?: string;
  attempt: EducatorExamAttempt;
}

export interface EducatorExamResult {
  attemptedQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  passed: boolean;
}

export interface SubmitEducatorExamResponse {
  success: boolean;
  message?: string;
  attempt: EducatorExamAttempt;
  result: EducatorExamResult;
}

export async function saveEducatorExamAnswer(
  attemptId: string,
  payload: SaveEducatorExamAnswerPayload,
): Promise<SaveEducatorExamAnswerResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  return request<SaveEducatorExamAnswerResponse>(
    `/educator-exam-attempts/${encodeURIComponent(attemptId)}/answer`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );
}

export async function submitEducatorExam(
  attemptId: string,
): Promise<SubmitEducatorExamResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  return request<SubmitEducatorExamResponse>(
    `/educator-exam-attempts/${encodeURIComponent(attemptId)}/submit`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}
export async function startEducatorExam(
  examId: string,
): Promise<StartEducatorExamResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  return request<StartEducatorExamResponse>(
    `/educator-exam-attempts/${encodeURIComponent(examId)}/start`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export interface EducatorExamResultItem {
  id: string;

  exam: {
    id: string;
    title: string;
    slug: string;
    shortName: string;
    category: string;
    subject: string;
    topic: string;
    durationMinutes: number;
    totalMarks: number;
    passingPercentage: number;
    accessType: "FREE" | "PREMIUM";
  } | null;

  batch: {
    id: string;
    name: string;
    code: string;
    status: string;
  } | null;

  status: "SUBMITTED" | "EXPIRED" | "TERMINATED" | "LOCKED";

  reentryLocked: boolean;

  startedAt: string | null;
  expiresAt: string | null;
  submittedAt: string | null;
  terminatedAt: string | null;

  totalQuestions: number;
  attemptedQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;

  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  passed: boolean;

  accessType: "FREE" | "PREMIUM";
  entitlementVerified: boolean;

  proctoringEnabled: boolean;
  strikeCount: number;
  terminationReason: string;
}

export interface GetMyEducatorExamResultsResponse {
  success: boolean;
  results: EducatorExamResultItem[];
  total: number;
}

export async function getMyEducatorExamResults(): Promise<GetMyEducatorExamResultsResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  return request<GetMyEducatorExamResultsResponse>(
    "/educator-exam-attempts/my-results",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}
export interface EducatorExamReviewOption {
  key: string;
  text: string;
}

export interface EducatorExamWrongAnswer {
  questionId: string;
  questionCode: string;
  questionText: string;
  questionType: string;
  options: EducatorExamReviewOption[];

  selectedAnswers: string[];
  correctAnswers: string[];

  explanation: string;

  subject: string;
  topic: string;
  subtopic: string;
  difficulty: string;

  marks: number;
  negativeMarks: number;
}

export interface EducatorExamReviewAttempt {
  id: string;
  status: string;
  submittedAt: string | null;

  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;

  obtainedMarks: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
}

export interface EducatorExamReviewResponse {
  success: boolean;

  attempt: EducatorExamReviewAttempt;

  exam: {
    id: string;
    title: string;
    shortName: string;
    category: string;
    subject: string;
    topic: string;
  } | null;

  wrongAnswers: EducatorExamWrongAnswer[];
  totalWrong: number;
}

export async function getEducatorExamReview(
  attemptId: string,
): Promise<EducatorExamReviewResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  return request<EducatorExamReviewResponse>(
    `/educator-exam-attempts/${encodeURIComponent(attemptId)}/review`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}
export interface StudentCourseCheckpointQuestion {
  id?: string;
  _id?: string;
  question: string;
  options: string[];
  explanation?: string;
}

export interface StudentCourseCheckpoint {
  _id?: string;
  id?: string;
  title?: string;
  questions: StudentCourseCheckpointQuestion[];
}

export interface StudentCourseCheckpointAttempt {
  _id?: string;
  status?: string;
  answers?: Array<{
    question: string;
    selectedAnswer: string;
  }>;
  totalQuestions?: number;
  attempted?: number;
  correct?: number;
  incorrect?: number;
  unanswered?: number;
  score?: number;
  percentage?: number;
  passed?: boolean;
  submittedAt?: string;
}

export interface GetStudentCourseCheckpointResponse {
  success?: boolean;
  checkpoint?: StudentCourseCheckpoint;
  attempt?: StudentCourseCheckpointAttempt | null;
}

export interface SubmitStudentCourseCheckpointPayload {
  answers: Array<{
    question: string;
    selectedAnswer: string;
  }>;
}

export interface StudentCourseCheckpointResult {
  totalQuestions?: number;
  attempted?: number;
  correct?: number;
  incorrect?: number;
  unanswered?: number;
  score?: number;
  percentage?: number;
  passed?: boolean;
}

export interface SubmitStudentCourseCheckpointResponse {
  success?: boolean;
  message?: string;
  result?: StudentCourseCheckpointResult;
}

export async function getStudentCourseCheckpoint(
  courseId: string,
  learningItemId: string,
): Promise<GetStudentCourseCheckpointResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  return request<GetStudentCourseCheckpointResponse>(
    `/student/course-checkpoints/${encodeURIComponent(courseId)}/${encodeURIComponent(learningItemId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export async function submitStudentCourseCheckpoint(
  courseId: string,
  learningItemId: string,
  payload: SubmitStudentCourseCheckpointPayload,
): Promise<SubmitStudentCourseCheckpointResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  return request<SubmitStudentCourseCheckpointResponse>(
    `/student/course-checkpoints/${encodeURIComponent(courseId)}/${encodeURIComponent(learningItemId)}/submit`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
}

/* ============================================================
 * SKILL ARENA
 * ============================================================ */

export interface SkillArenaCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  logoUrl?: string;
  logoPublicId?: string;
  accent: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SkillArenaCategoriesResponse {
  success: boolean;
  categories: SkillArenaCategory[];
}

export async function getSkillArenaCategories(): Promise<SkillArenaCategoriesResponse> {
  const token = getAuthToken();

  return request<SkillArenaCategoriesResponse>(
    "/admin/skill-arena/categories",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

export async function createSkillArenaCategory(
  payload: {
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    accent?: string;
    displayOrder?: number;
    isActive?: boolean;
  },
): Promise<{
  success: boolean;
  message: string;
  category: SkillArenaCategory;
}> {
  const token = getAuthToken();

  return request<{
    success: boolean;
    message: string;
    category: SkillArenaCategory;
  }>("/admin/skill-arena/categories", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function updateSkillArenaCategory(
  categoryId: string,
  payload: {
    name?: string;
    slug?: string;
    description?: string;
    icon?: string;
    accent?: string;
    displayOrder?: number;
    isActive?: boolean;
  },
): Promise<{
  success: boolean;
  message: string;
  category: SkillArenaCategory;
}> {
  const token = getAuthToken();

  return request<{
    success: boolean;
    message: string;
    category: SkillArenaCategory;
  }>(
    `/admin/skill-arena/categories/${encodeURIComponent(categoryId)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
}

export async function deleteSkillArenaCategory(
  categoryId: string,
): Promise<{
  success: boolean;
  message: string;
}> {
  const token = getAuthToken();

  return request<{
    success: boolean;
    message: string;
  }>(
    `/admin/skill-arena/categories/${encodeURIComponent(categoryId)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}
export async function uploadSkillArenaCategoryLogo(
  categoryId: string,
  file: File,
): Promise<{
  success: boolean;
  message: string;
  logoUrl: string;
  logoPublicId: string;
  category: SkillArenaCategory;
}> {
  const token = getAuthToken();
  const formData = new FormData();

  formData.append("image", file);

  return request<{
    success: boolean;
    message: string;
    logoUrl: string;
    logoPublicId: string;
    category: SkillArenaCategory;
  }>(
    `/admin/skill-arena/categories/${encodeURIComponent(categoryId)}/logo`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    },
  );
}

export async function removeSkillArenaCategoryLogo(
  categoryId: string,
): Promise<{
  success: boolean;
  message: string;
  category: SkillArenaCategory;
}> {
  const token = getAuthToken();

  return request<{
    success: boolean;
    message: string;
    category: SkillArenaCategory;
  }>(
    `/admin/skill-arena/categories/${encodeURIComponent(categoryId)}/logo`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}


