const mongoose = require("mongoose");

const TestAttempt = require("../models/TestAttempt");
const MockTest = require("../models/MockTest");
const Question = require("../models/Question");

/*
|--------------------------------------------------------------------------
| SANITIZE TEST QUESTION
|--------------------------------------------------------------------------
|
| IMPORTANT:
| Never expose correctAnswer while the test is in progress.
|
*/

function sanitizeAttemptQuestion(question) {
  return {
    id: question._id,
    questionText: question.questionText,
    options: question.options,
    explanation: question.explanation || "",
    subject: question.subject || "",
    topic: question.topic || "",
    difficulty: question.difficulty,
    order: question.order,
  };
}

/*
|--------------------------------------------------------------------------
| SANITIZE ATTEMPT
|--------------------------------------------------------------------------
*/

function sanitizeAttempt(attempt) {
  return {
    id: attempt._id,
    user: attempt.user,
    mockTest: attempt.mockTest,
    status: attempt.status,
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt,
    expiresAt: attempt.expiresAt,

    answers: (attempt.answers || []).map(
      (answer) => ({
        question: answer.question,
        selectedAnswer:
          answer.selectedAnswer,
        markedForReview:
          answer.markedForReview,
      }),
    ),

    totalQuestions:
      attempt.totalQuestions,

    attemptedQuestions:
      attempt.attemptedQuestions,

    correctAnswers:
      attempt.correctAnswers,

    incorrectAnswers:
      attempt.incorrectAnswers,

    unansweredQuestions:
      attempt.unansweredQuestions,

    score: attempt.score,

    percentage:
      attempt.percentage,

    createdAt:
      attempt.createdAt,

    updatedAt:
      attempt.updatedAt,
  };
}

/*
|--------------------------------------------------------------------------
| BUILD QUESTION REVIEW
|--------------------------------------------------------------------------
|
| This function is ONLY used after submission/expiration.
|
| It safely combines:
|
| Question
|    +
| Student Answer
|    +
| Correct Answer
|
| into the final review object.
|
*/

function buildQuestionReview(
  questions,
  attempt,
) {
  const answerMap = new Map();

  (attempt.answers || []).forEach(
    (answer) => {
      answerMap.set(
        String(answer.question),
        answer,
      );
    },
  );

  return questions.map((question) => {
    const answer =
      answerMap.get(
        String(question._id),
      );

    const selectedAnswer =
      answer?.selectedAnswer || null;

    let result = "UNANSWERED";

    if (selectedAnswer) {
      result =
        selectedAnswer ===
        question.correctAnswer
          ? "CORRECT"
          : "INCORRECT";
    }

    return {
      question: question._id,

      questionText:
        question.questionText,

      options:
        question.options,

      selectedAnswer,

      correctAnswer:
        question.correctAnswer,

      explanation:
        question.explanation || "",

      subject:
        question.subject || "",

      topic:
        question.topic || "",

      difficulty:
        question.difficulty,

      order:
        question.order,

      markedForReview:
        Boolean(
          answer?.markedForReview,
        ),

      result,
    };
  });
}

/*
|--------------------------------------------------------------------------
| LOAD QUESTION REVIEW FOR ATTEMPT
|--------------------------------------------------------------------------
|
| Used when a student refreshes an already submitted
| or expired result page.
|
*/

async function getQuestionReview(
  attempt,
) {
  if (
    attempt.status !== "SUBMITTED" &&
    attempt.status !== "EXPIRED"
  ) {
    return [];
  }

  const questionIds =
    (attempt.answers || []).map(
      (answer) => answer.question,
    );

  if (!questionIds.length) {
    return [];
  }

  const questions =
    await Question.find({
      _id: {
        $in: questionIds,
      },

      mockTest:
        attempt.mockTest,
    }).sort({
      order: 1,
      createdAt: 1,
    });

  return buildQuestionReview(
    questions,
    attempt,
  );
}

/*
|--------------------------------------------------------------------------
| GET USER ID
|--------------------------------------------------------------------------
*/

function getUserId(req) {
  return req.user?.userId;
}

/*
|--------------------------------------------------------------------------
| OBJECT ID VALIDATION
|--------------------------------------------------------------------------
*/

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(
    value,
  );
}

/*
|--------------------------------------------------------------------------
| GET OWNED ATTEMPT
|--------------------------------------------------------------------------
|
| Prevents one student from accessing another student's attempt.
|
*/

async function getOwnedAttempt(
  attemptId,
  userId,
) {
  if (!isValidObjectId(attemptId)) {
    return null;
  }

  return TestAttempt.findOne({
    _id: attemptId,
    user: userId,
  });
}

/*
|--------------------------------------------------------------------------
| START ATTEMPT
|--------------------------------------------------------------------------
*/

async function startAttempt(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const {
      mockTestId,
    } = req.body;

    if (!mockTestId) {
      return res.status(400).json({
        success: false,
        message:
          "Mock test ID is required",
      });
    }

    if (!isValidObjectId(mockTestId)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid mock test ID",
      });
    }

    /*
     * -------------------------------------------------------
     * LOAD PUBLISHED MOCK TEST
     * -------------------------------------------------------
     */

    const mockTest =
      await MockTest.findOne({
        _id: mockTestId,
        isPublished: true,
      });

    if (!mockTest) {
      return res.status(404).json({
        success: false,
        message:
          "Published mock test not found",
      });
    }

    /*
     * -------------------------------------------------------
     * LOAD QUESTIONS
     * -------------------------------------------------------
     */

    const questions =
      await Question.find({
        mockTest: mockTest._id,
      }).sort({
        order: 1,
        createdAt: 1,
      });

    if (!questions.length) {
      return res.status(400).json({
        success: false,
        message:
          "This mock test does not have any questions yet",
      });
    }

    /*
     * -------------------------------------------------------
     * ATTEMPT LIMIT
     * -------------------------------------------------------
     *
     * attemptLimit = 0 means unlimited attempts.
     *
     */

    if (mockTest.attemptLimit > 0) {
      const completedAttempts =
        await TestAttempt.countDocuments({
          user: userId,
          mockTest: mockTest._id,
          status: {
            $in: [
              "SUBMITTED",
              "EXPIRED",
            ],
          },
        });

      if (
        completedAttempts >=
        mockTest.attemptLimit
      ) {
        return res.status(403).json({
          success: false,
          message: `You have reached the maximum attempt limit of ${mockTest.attemptLimit}`,
        });
      }
    }

    /*
     * -------------------------------------------------------
     * RESUME EXISTING ACTIVE ATTEMPT
     * -------------------------------------------------------
     */

    const existingAttempt =
      await TestAttempt.findOne({
        user: userId,
        mockTest: mockTest._id,
        status: "IN_PROGRESS",
      }).sort({
        createdAt: -1,
      });

    if (existingAttempt) {
      /*
       * If the existing attempt has expired,
       * mark it expired and allow a new attempt.
       */

      if (
        new Date(
          existingAttempt.expiresAt,
        ).getTime() <= Date.now()
      ) {
        existingAttempt.status =
          "EXPIRED";

        existingAttempt.submittedAt =
          new Date();

        await existingAttempt.save();
      } else {
        /*
         * Otherwise resume it.
         */

        return res.status(200).json({
          success: true,

          message:
            "Existing test attempt resumed",

          resumed: true,

          attempt:
            sanitizeAttempt(
              existingAttempt,
            ),

          mockTest: {
            id: mockTest._id,
            title: mockTest.title,
            slug: mockTest.slug,

            durationMinutes:
              mockTest.durationMinutes,

            totalQuestions:
              questions.length,

            marksPerQuestion:
              mockTest.marksPerQuestion,

            negativeMarking:
              mockTest.negativeMarking,
          },

          questions:
            questions.map(
              sanitizeAttemptQuestion,
            ),
        });
      }
    }

    /*
     * -------------------------------------------------------
     * CREATE NEW ATTEMPT
     * -------------------------------------------------------
     */

    const startedAt =
      new Date();

    const expiresAt =
      new Date(
        startedAt.getTime() +
          Number(
            mockTest.durationMinutes,
          ) *
            60 *
            1000,
      );

    /*
     * Create an answer slot for every question.
     */

    const answers =
      questions.map(
        (question) => ({
          question:
            question._id,

          selectedAnswer:
            null,

          markedForReview:
            false,
        }),
      );

    const attempt =
      await TestAttempt.create({
        user: userId,

        mockTest:
          mockTest._id,

        status:
          "IN_PROGRESS",

        startedAt,

        expiresAt,

        answers,

        totalQuestions:
          questions.length,

        attemptedQuestions:
          0,

        correctAnswers:
          0,

        incorrectAnswers:
          0,

        unansweredQuestions:
          questions.length,

        score: 0,

        percentage: 0,
      });

    /*
     * -------------------------------------------------------
     * RESPONSE
     * -------------------------------------------------------
     */

    return res.status(201).json({
      success: true,

      message:
        "Test attempt started successfully",

      resumed: false,

      attempt:
        sanitizeAttempt(attempt),

      mockTest: {
        id: mockTest._id,
        title: mockTest.title,
        slug: mockTest.slug,

        durationMinutes:
          mockTest.durationMinutes,

        totalQuestions:
          questions.length,

        marksPerQuestion:
          mockTest.marksPerQuestion,

        negativeMarking:
          mockTest.negativeMarking,
      },

      questions:
        questions.map(
          sanitizeAttemptQuestion,
        ),
    });
  } catch (error) {
    console.error(
      "Start attempt error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Could not start the mock test",
    });
  }
}

/*
|--------------------------------------------------------------------------
| SAVE ANSWER
|--------------------------------------------------------------------------
*/

async function saveAnswer(req, res) {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const { id } =
      req.params;

    const {
      questionId,
      selectedAnswer,
      markedForReview,
    } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid attempt ID",
      });
    }

    if (
      !isValidObjectId(
        questionId,
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid question ID",
      });
    }

    /*
     * -------------------------------------------------------
     * LOAD OWNED ATTEMPT
     * -------------------------------------------------------
     */

    const attempt =
      await getOwnedAttempt(
        id,
        userId,
      );

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message:
          "Test attempt not found",
      });
    }

    /*
     * -------------------------------------------------------
     * ATTEMPT MUST BE ACTIVE
     * -------------------------------------------------------
     */

    if (
      attempt.status !==
      "IN_PROGRESS"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This test attempt is no longer active",
        attempt:
          sanitizeAttempt(attempt),
      });
    }

    /*
     * -------------------------------------------------------
     * CHECK SERVER TIMER
     * -------------------------------------------------------
     */

    if (
      new Date(
        attempt.expiresAt,
      ).getTime() <= Date.now()
    ) {
      attempt.status =
        "EXPIRED";

      attempt.submittedAt =
        new Date();

      await attempt.save();

      return res.status(410).json({
        success: false,
        message:
          "Test time has expired",

        expired: true,

        attempt:
          sanitizeAttempt(attempt),
      });
    }

    /*
     * -------------------------------------------------------
     * VERIFY QUESTION
     * -------------------------------------------------------
     */

    const question =
      await Question.findOne({
        _id: questionId,
        mockTest:
          attempt.mockTest,
      });

    if (!question) {
      return res.status(404).json({
        success: false,
        message:
          "Question does not belong to this mock test",
      });
    }

    /*
     * -------------------------------------------------------
     * VALIDATE ANSWER
     * -------------------------------------------------------
     */

    const allowedAnswers = [
      "A",
      "B",
      "C",
      "D",
    ];

    let normalizedAnswer =
      null;

    if (
      selectedAnswer !==
        null &&
      selectedAnswer !==
        undefined &&
      String(
        selectedAnswer,
      ).trim() !== ""
    ) {
      normalizedAnswer =
        String(
          selectedAnswer,
        )
          .trim()
          .toUpperCase();

      if (
        !allowedAnswers.includes(
          normalizedAnswer,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Selected answer must be A, B, C or D",
        });
      }
    }

    /*
     * -------------------------------------------------------
     * FIND ANSWER SLOT
     * -------------------------------------------------------
     */

    const answerIndex =
      attempt.answers.findIndex(
        (answer) =>
          String(
            answer.question,
          ) ===
          String(questionId),
      );

    if (
      answerIndex === -1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Question is not part of this attempt",
      });
    }

    /*
     * -------------------------------------------------------
     * UPDATE ANSWER
     * -------------------------------------------------------
     */

    attempt.answers[
      answerIndex
    ].selectedAnswer =
      normalizedAnswer;

    attempt.answers[
      answerIndex
    ].markedForReview =
      Boolean(
        markedForReview,
      );

    /*
     * -------------------------------------------------------
     * UPDATE COUNTS
     * -------------------------------------------------------
     */

    attempt.attemptedQuestions =
      attempt.answers.filter(
        (answer) =>
          answer.selectedAnswer !==
            null &&
          answer.selectedAnswer !==
            "",
      ).length;

    attempt.unansweredQuestions =
      attempt.totalQuestions -
      attempt.attemptedQuestions;

    await attempt.save();

    /*
     * -------------------------------------------------------
     * RESPONSE
     * -------------------------------------------------------
     */

    return res.status(200).json({
      success: true,

      message:
        "Answer saved",

      answer: {
        question:
          question._id,

        selectedAnswer:
          normalizedAnswer,

        markedForReview:
          attempt.answers[
            answerIndex
          ].markedForReview,
      },

      attemptedQuestions:
        attempt.attemptedQuestions,

      unansweredQuestions:
        attempt.unansweredQuestions,

      expiresAt:
        attempt.expiresAt,
    });
  } catch (error) {
    console.error(
      "Save answer error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Could not save answer",
    });
  }
}

/*
|--------------------------------------------------------------------------
| CALCULATE RESULT
|--------------------------------------------------------------------------
*/

async function calculateAttemptResult(
  attempt,
) {
  const mockTest =
    await MockTest.findById(
      attempt.mockTest,
    );

  if (!mockTest) {
    throw new Error(
      "Mock test not found",
    );
  }

  /*
   * -------------------------------------------------------
   * LOAD QUESTIONS
   * -------------------------------------------------------
   */

  const questionIds =
    attempt.answers.map(
      (answer) =>
        answer.question,
    );

  const questions =
    await Question.find({
      _id: {
        $in: questionIds,
      },

      mockTest:
        attempt.mockTest,
    }).sort({
      order: 1,
      createdAt: 1,
    });

  /*
   * -------------------------------------------------------
   * MAP STUDENT ANSWERS
   * -------------------------------------------------------
   */

  const answerMap =
    new Map();

  attempt.answers.forEach(
    (answer) => {
      answerMap.set(
        String(answer.question),
        answer,
      );
    },
  );

  /*
   * -------------------------------------------------------
   * CALCULATE COUNTS
   * -------------------------------------------------------
   */

  let attemptedQuestions =
    0;

  let correctAnswers =
    0;

  let incorrectAnswers =
    0;

  let unansweredQuestions =
    0;

  questions.forEach(
    (question) => {
      const answer =
        answerMap.get(
          String(question._id),
        );

      const selectedAnswer =
        answer?.selectedAnswer ||
        null;

      /*
       * Unanswered
       */

      if (!selectedAnswer) {
        unansweredQuestions += 1;
        return;
      }

      /*
       * Attempted
       */

      attemptedQuestions += 1;

      /*
       * Correct
       */

      if (
        selectedAnswer ===
        question.correctAnswer
      ) {
        correctAnswers += 1;
      } else {
        incorrectAnswers += 1;
      }
    },
  );

  /*
   * -------------------------------------------------------
   * SCORE
   * -------------------------------------------------------
   */

  const totalQuestions =
    questions.length;

  const marksPerQuestion =
    Number(
      mockTest.marksPerQuestion,
    ) || 0;

  const negativeMarking =
    Number(
      mockTest.negativeMarking,
    ) || 0;

  const positiveScore =
    correctAnswers *
    marksPerQuestion;

  const negativeScore =
    incorrectAnswers *
    negativeMarking;

  const score =
    positiveScore -
    negativeScore;

  /*
   * -------------------------------------------------------
   * PERCENTAGE
   * -------------------------------------------------------
   */

  const maximumScore =
    totalQuestions *
    marksPerQuestion;

  const percentage =
    maximumScore > 0
      ? (score /
          maximumScore) *
        100
      : 0;

  /*
   * -------------------------------------------------------
   * UPDATE ATTEMPT
   * -------------------------------------------------------
   */

  attempt.totalQuestions =
    totalQuestions;

  attempt.attemptedQuestions =
    attemptedQuestions;

  attempt.correctAnswers =
    correctAnswers;

  attempt.incorrectAnswers =
    incorrectAnswers;

  attempt.unansweredQuestions =
    unansweredQuestions;

  attempt.score =
    Number(
      score.toFixed(2),
    );

  attempt.percentage =
    Number(
      Math.max(
        0,
        percentage,
      ).toFixed(2),
    );

  /*
   * -------------------------------------------------------
   * RETURN BOTH ATTEMPT AND QUESTIONS
   * -------------------------------------------------------
   *
   * The questions are needed to create the
   * post-submission question review.
   *
   */

  return {
    attempt,
    questions,
  };
}

/*
|--------------------------------------------------------------------------
| SUBMIT ATTEMPT
|--------------------------------------------------------------------------
*/

async function submitAttempt(
  req,
  res,
) {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const { id } =
      req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid attempt ID",
      });
    }

    /*
     * -------------------------------------------------------
     * LOAD OWNED ATTEMPT
     * -------------------------------------------------------
     */

    const attempt =
      await getOwnedAttempt(
        id,
        userId,
      );

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message:
          "Test attempt not found",
      });
    }

    /*
     * -------------------------------------------------------
     * ALREADY SUBMITTED / EXPIRED
     * -------------------------------------------------------
     *
     * If the student refreshes or submits again,
     * return the existing result and review.
     *
     */

    if (
      attempt.status ===
        "SUBMITTED" ||
      attempt.status ===
        "EXPIRED"
    ) {
      const questionReview =
        await getQuestionReview(
          attempt,
        );

      return res.status(200).json({
        success: true,

        message:
          attempt.status ===
          "EXPIRED"
            ? "Test attempt has expired"
            : "Test attempt was already submitted",

        attempt: {
          ...sanitizeAttempt(attempt),
          questionReview,
        },
      });
    }

    /*
     * -------------------------------------------------------
     * CHECK TIMER
     * -------------------------------------------------------
     */

    const now =
      new Date();

    const hasExpired =
      now.getTime() >=
      new Date(
        attempt.expiresAt,
      ).getTime();

    /*
     * -------------------------------------------------------
     * CALCULATE RESULT
     * -------------------------------------------------------
     */

    const resultData =
      await calculateAttemptResult(
        attempt,
      );

    /*
     * -------------------------------------------------------
     * SET FINAL STATUS
     * -------------------------------------------------------
     */

    attempt.status =
      hasExpired
        ? "EXPIRED"
        : "SUBMITTED";

    attempt.submittedAt =
      now;

    await attempt.save();

    /*
     * -------------------------------------------------------
     * BUILD QUESTION REVIEW
     * -------------------------------------------------------
     */

    const questionReview =
      buildQuestionReview(
        resultData.questions,
        attempt,
      );

    /*
     * -------------------------------------------------------
     * FINAL RESPONSE
     * -------------------------------------------------------
     */

    return res.status(200).json({
      success: true,

      message: hasExpired
        ? "Test time expired and the attempt was submitted"
        : "Test submitted successfully",

      attempt: {
        ...sanitizeAttempt(attempt),
        questionReview,
      },
    });
  } catch (error) {
    console.error(
      "Submit attempt error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Could not submit the test",
    });
  }
}

/*
|--------------------------------------------------------------------------
| GET ATTEMPT
|--------------------------------------------------------------------------
|
| Used for:
|
| - Loading an existing attempt
| - Refreshing the test
| - Refreshing a result page
| - Loading question review
|
*/

async function getAttempt(
  req,
  res,
) {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const { id } =
      req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid attempt ID",
      });
    }

    /*
     * -------------------------------------------------------
     * LOAD OWNED ATTEMPT
     * -------------------------------------------------------
     */

    const attempt =
      await getOwnedAttempt(
        id,
        userId,
      );

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message:
          "Test attempt not found",
      });
    }

    /*
     * -------------------------------------------------------
     * LOAD MOCK TEST
     * -------------------------------------------------------
     */

    const mockTest =
      await MockTest.findById(
        attempt.mockTest,
      ).select(
        "title slug durationMinutes marksPerQuestion negativeMarking totalQuestions",
      );

    /*
     * -------------------------------------------------------
     * QUESTION REVIEW
     * -------------------------------------------------------
     *
     * Review is returned only after the test is
     * submitted or expired.
     *
     */

    const questionReview =
      await getQuestionReview(
        attempt,
      );

    /*
     * -------------------------------------------------------
     * RESPONSE
     * -------------------------------------------------------
     */

    return res.status(200).json({
      success: true,

      attempt: {
        ...sanitizeAttempt(attempt),
        questionReview,
      },

      mockTest: mockTest
        ? {
            id: mockTest._id,

            title:
              mockTest.title,

            slug:
              mockTest.slug,

            durationMinutes:
              mockTest.durationMinutes,

            marksPerQuestion:
              mockTest.marksPerQuestion,

            negativeMarking:
              mockTest.negativeMarking,

            totalQuestions:
              mockTest.totalQuestions,
          }
        : null,
    });
  } catch (error) {
    console.error(
      "Get attempt error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Could not load test attempt",
    });
  }
}

/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
*/


async function getMyAttempts(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const attempts = await TestAttempt.find({
      user: userId,
    })
      .sort({
        createdAt: -1,
      })
      .populate({
        path: "mockTest",
        select:
          "title slug durationMinutes totalQuestions marksPerQuestion negativeMarking accessType",
      });

    const formattedAttempts = await Promise.all(
      attempts.map(async (attempt) => {
        const questionReview =
          await getQuestionReview(attempt);

        return {
          ...sanitizeAttempt(attempt),

          mockTest: attempt.mockTest
            ? {
                id: attempt.mockTest._id,
                title: attempt.mockTest.title,
                slug: attempt.mockTest.slug,
                durationMinutes:
                  attempt.mockTest.durationMinutes,
                totalQuestions:
                  attempt.mockTest.totalQuestions,
                marksPerQuestion:
                  attempt.mockTest.marksPerQuestion,
                negativeMarking:
                  attempt.mockTest.negativeMarking,
                accessType:
                  attempt.mockTest.accessType,
              }
            : null,

          questionReview:
            questionReview.length > 0
              ? questionReview
              : undefined,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      attempts: formattedAttempts,
    });
  } catch (error) {
    console.error(
      "Get my attempts error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Could not load your test attempts",
    });
  }
}
module.exports = {
  startAttempt,
  saveAnswer,
  submitAttempt,
  getAttempt,
  getMyAttempts,
};




