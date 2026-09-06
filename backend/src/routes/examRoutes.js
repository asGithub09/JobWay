const express = require("express");

const {
  authenticateToken,
  optionalAuthenticateToken,
  authorizeAdmin,
} = require("../middleware/authMiddleware");

const {
  getPublishedExams,
  getPublishedExam,

  getAdminExams,
  createExam,
  updateExam,
  deleteExam,

  getPublishedTestSeries,
  getAdminTestSeries,
  createTestSeries,
  updateTestSeries,
  deleteTestSeries,

  getPublishedMockTests,
  getPublishedMockTest,
  getAdminMockTests,
  createMockTest,
  updateMockTest,
  deleteMockTest,

  createQuestion,
  getAdminQuestions,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/examController");

const {
  startAttempt,
  saveAnswer,
  submitAttempt,
  getAttempt,
  getMyAttempts,
} = require("../controllers/attemptController");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| ADMIN — EXAMS
|--------------------------------------------------------------------------
*/

router.get(
  "/admin/all",
  authenticateToken,
  authorizeAdmin,
  getAdminExams,
);

router.post(
  "/admin",
  authenticateToken,
  authorizeAdmin,
  createExam,
);

router.patch(
  "/admin/:id",
  authenticateToken,
  authorizeAdmin,
  updateExam,
);

router.delete(
  "/admin/:id",
  authenticateToken,
  authorizeAdmin,
  deleteExam,
);

/*
|--------------------------------------------------------------------------
| ADMIN — TEST SERIES
|--------------------------------------------------------------------------
*/

router.get(
  "/admin/test-series/all",
  authenticateToken,
  authorizeAdmin,
  getAdminTestSeries,
);

router.post(
  "/admin/test-series",
  authenticateToken,
  authorizeAdmin,
  createTestSeries,
);

router.patch(
  "/admin/test-series/:id",
  authenticateToken,
  authorizeAdmin,
  updateTestSeries,
);

router.delete(
  "/admin/test-series/:id",
  authenticateToken,
  authorizeAdmin,
  deleteTestSeries,
);

/*
|--------------------------------------------------------------------------
| ADMIN — MOCK TESTS
|--------------------------------------------------------------------------
*/

router.get(
  "/admin/mock-tests/all",
  authenticateToken,
  authorizeAdmin,
  getAdminMockTests,
);

router.post(
  "/admin/mock-tests",
  authenticateToken,
  authorizeAdmin,
  createMockTest,
);

router.patch(
  "/admin/mock-tests/:id",
  authenticateToken,
  authorizeAdmin,
  updateMockTest,
);

router.delete(
  "/admin/mock-tests/:id",
  authenticateToken,
  authorizeAdmin,
  deleteMockTest,
);

/*
|--------------------------------------------------------------------------
| ADMIN — QUESTIONS
|--------------------------------------------------------------------------
*/

router.post(
  "/admin/questions",
  authenticateToken,
  authorizeAdmin,
  createQuestion,
);

router.get(
  "/admin/questions/mock-test/:mockTestId",
  authenticateToken,
  authorizeAdmin,
  getAdminQuestions,
);

router.patch(
  "/admin/questions/:id",
  authenticateToken,
  authorizeAdmin,
  updateQuestion,
);

router.delete(
  "/admin/questions/:id",
  authenticateToken,
  authorizeAdmin,
  deleteQuestion,
);

/*
|--------------------------------------------------------------------------
| STUDENT — MOCK TEST ATTEMPTS
|--------------------------------------------------------------------------
|
| All attempt routes require an authenticated user.
|
| POST  /api/exams/attempts/start
| PATCH /api/exams/attempts/:id/answer
| POST  /api/exams/attempts/:id/submit
| GET   /api/exams/attempts/my
| GET   /api/exams/attempts/:id
|
|--------------------------------------------------------------------------
*/

/*
 * START / RESUME ATTEMPT
 */
router.post(
  "/attempts/start",
  authenticateToken,
  startAttempt,
);

/*
 * SAVE / UPDATE ANSWER
 */
router.patch(
  "/attempts/:id/answer",
  authenticateToken,
  saveAnswer,
);

/*
 * SUBMIT ATTEMPT
 */
router.post(
  "/attempts/:id/submit",
  authenticateToken,
  submitAttempt,
);

/*
 * GET MY ATTEMPTS
 */
router.get(
  "/attempts/my",
  authenticateToken,
  getMyAttempts,
);

/*
 * GET ATTEMPT
 */
router.get(
  "/attempts/:id",
  authenticateToken,
  getAttempt,
);

/*
|--------------------------------------------------------------------------
| PUBLIC — TEST SERIES
|--------------------------------------------------------------------------
|
| Optional authentication is intentional.
|
| FREE test series remain publicly accessible.
| PREMIUM test series can be filtered by the controller
| using the authenticated student's active batch.
|
|--------------------------------------------------------------------------
*/

router.get(
  "/test-series/exam/:examId",
  optionalAuthenticateToken,
  getPublishedTestSeries,
);

/*
|--------------------------------------------------------------------------
| PUBLIC — MOCK TESTS
|--------------------------------------------------------------------------
|
| Optional authentication is intentional.
|
| FREE mock tests remain publicly accessible.
| PREMIUM mock tests can be protected by batch access
| inside the controller.
|
|--------------------------------------------------------------------------
*/

router.get(
  "/mock-tests/series/:testSeriesId",
  optionalAuthenticateToken,
  getPublishedMockTests,
);

router.get(
  "/mock-tests/:slug",
  optionalAuthenticateToken,
  getPublishedMockTest,
);

/*
|--------------------------------------------------------------------------
| PUBLIC — EXAMS
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  getPublishedExams,
);

/*
 * IMPORTANT:
 * Keep this route LAST because "/:slug" can otherwise
 * capture routes such as /admin/... .
 */
router.get(
  "/:slug",
  getPublishedExam,
);

module.exports = router;