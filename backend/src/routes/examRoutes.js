const express = require("express");

const {
  authenticateToken,
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
| ADMIN â€” EXAMS
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
| ADMIN â€” TEST SERIES
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
| ADMIN â€” MOCK TESTS
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
| ADMIN â€” QUESTIONS
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
| STUDENT â€” MOCK TEST ATTEMPTS
|--------------------------------------------------------------------------
|
| All attempt routes require an authenticated user.
|
| POST  /api/exams/attempts/start
| PATCH /api/exams/attempts/:id/answer
| POST  /api/exams/attempts/:id/submit
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
| PUBLIC â€” TEST SERIES
|--------------------------------------------------------------------------
*/

router.get(
  "/test-series/exam/:examId",
  getPublishedTestSeries,
);

/*
|--------------------------------------------------------------------------
| PUBLIC â€” MOCK TESTS
|--------------------------------------------------------------------------
*/

router.get(
  "/mock-tests/series/:testSeriesId",
  getPublishedMockTests,
);

router.get(
  "/mock-tests/:slug",
  getPublishedMockTest,
);

/*
|--------------------------------------------------------------------------
| PUBLIC â€” EXAMS
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


