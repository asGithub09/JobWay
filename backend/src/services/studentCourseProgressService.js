const mongoose = require("mongoose");

const Course = require("../models/Course");
const StudentCourseProgress = require("../models/StudentCourseProgress");

const {
  studentCanAccessCourse,
} = require("./batchAccessService");

/*
 * ============================================================
 * STUDENT COURSE PROGRESS SERVICE
 * ============================================================
 *
 * Responsibilities:
 *
 * 1. Verify course access through the student's active batch.
 * 2. Read the published course curriculum.
 * 3. Calculate lesson/module progress.
 * 4. Enforce sequential lesson completion.
 * 5. Persist the student's current lesson.
 * 6. Persist completed lessons/modules.
 * 7. Calculate completion percentage.
 *
 * The frontend is never trusted to decide whether a lesson
 * is unlocked. All important progression rules are enforced
 * here on the server.
 */

/**
 * Convert a value to a MongoDB ObjectId.
 */
function toObjectId(value) {
  if (!value) {
    return null;
  }

  if (value instanceof mongoose.Types.ObjectId) {
    return value;
  }

  if (!mongoose.Types.ObjectId.isValid(value)) {
    return null;
  }

  return new mongoose.Types.ObjectId(value);
}

/**
 * Normalize the curriculum modules.
 */
function getModules(course) {
  const modules = course?.curriculum?.modules;

  if (!Array.isArray(modules)) {
    return [];
  }

  return modules.filter(
    (module) =>
      module &&
      Array.isArray(module.lessons) &&
      module.lessons.length > 0,
  );
}

/**
 * Build a flat lesson list.
 *
 * This gives the progression system a single ordered sequence:
 *
 * Module 0 / Lesson 0
 * Module 0 / Lesson 1
 * Module 1 / Lesson 0
 * Module 1 / Lesson 1
 * ...
 */
function getFlatLessons(course) {
  const modules = getModules(course);
  const lessons = [];

  modules.forEach((module, moduleIndex) => {
    module.lessons.forEach((lesson, lessonIndex) => {
      lessons.push({
        moduleIndex,
        lessonIndex,
        lesson,
        flatIndex: lessons.length,
      });
    });
  });

  return lessons;
}

/**
 * Find a lesson in the course curriculum.
 */
function findLesson(course, moduleIndex, lessonIndex) {
  const modules = getModules(course);

  if (
    moduleIndex < 0 ||
    moduleIndex >= modules.length
  ) {
    return null;
  }

  const module = modules[moduleIndex];

  if (
    lessonIndex < 0 ||
    lessonIndex >= module.lessons.length
  ) {
    return null;
  }

  return {
    module,
    lesson: module.lessons[lessonIndex],
    moduleIndex,
    lessonIndex,
  };
}

/**
 * Create a unique key for a lesson.
 */
function lessonKey(moduleIndex, lessonIndex) {
  return `${moduleIndex}:${lessonIndex}`;
}

/**
 * Create a unique key set for completed lessons.
 */
function createCompletedLessonSet(progress) {
  const set = new Set();

  const completedLessons =
    progress?.completedLessons || [];

  completedLessons.forEach((item) => {
    if (
      Number.isInteger(item.moduleIndex) &&
      Number.isInteger(item.lessonIndex)
    ) {
      set.add(
        lessonKey(
          item.moduleIndex,
          item.lessonIndex,
        ),
      );
    }
  });

  return set;
}

/**
 * Determine whether all lessons in a module are completed.
 */
function isModuleComplete(
  course,
  moduleIndex,
  completedLessonSet,
) {
  const modules = getModules(course);
  const module = modules[moduleIndex];

  if (!module || !Array.isArray(module.lessons)) {
    return false;
  }

  if (module.lessons.length === 0) {
    return false;
  }

  return module.lessons.every((_, lessonIndex) =>
    completedLessonSet.has(
      lessonKey(moduleIndex, lessonIndex),
    ),
  );
}

/**
 * Determine which modules are completed.
 */
function getCompletedModuleIndexes(
  course,
  completedLessonSet,
) {
  const modules = getModules(course);

  const completed = [];

  modules.forEach((_, moduleIndex) => {
    if (
      isModuleComplete(
        course,
        moduleIndex,
        completedLessonSet,
      )
    ) {
      completed.push(moduleIndex);
    }
  });

  return completed;
}

/**
 * Find the first incomplete lesson.
 *
 * This is the authoritative next lesson.
 */
function getFirstIncompleteLesson(
  course,
  completedLessonSet,
) {
  const flatLessons = getFlatLessons(course);

  for (const item of flatLessons) {
    if (
      !completedLessonSet.has(
        lessonKey(
          item.moduleIndex,
          item.lessonIndex,
        ),
      )
    ) {
      return item;
    }
  }

  return null;
}

/**
 * Determine whether a lesson is unlocked.
 *
 * Sequential rule:
 *
 * - First lesson is unlocked.
 * - Every other lesson requires the immediately
 *   preceding lesson to be completed.
 */
function isLessonUnlocked(
  course,
  moduleIndex,
  lessonIndex,
  completedLessonSet,
) {
  const current = findLesson(
    course,
    moduleIndex,
    lessonIndex,
  );

  if (!current) {
    return false;
  }

  const flatLessons = getFlatLessons(course);

  const currentItem = flatLessons.find(
    (item) =>
      item.moduleIndex === moduleIndex &&
      item.lessonIndex === lessonIndex,
  );

  if (!currentItem) {
    return false;
  }

  if (currentItem.flatIndex === 0) {
    return true;
  }

  const previousLesson =
    flatLessons[currentItem.flatIndex - 1];

  return completedLessonSet.has(
    lessonKey(
      previousLesson.moduleIndex,
      previousLesson.lessonIndex,
    ),
  );
}

/**
 * Get course and verify access.
 */
async function getAccessibleCourse(
  studentId,
  courseId,
) {
  const studentObjectId = toObjectId(studentId);
  const courseObjectId = toObjectId(courseId);

  if (!studentObjectId || !courseObjectId) {
    const error = new Error(
      "Invalid student or course ID",
    );

    error.statusCode = 400;
    error.code = "INVALID_ID";

    throw error;
  }

  const course = await Course.findOne({
    _id: courseObjectId,
    isPublished: true,
  }).lean();

  if (!course) {
    const error = new Error(
      "Course not found",
    );

    error.statusCode = 404;
    error.code = "COURSE_NOT_FOUND";

    throw error;
  }

  const access = await studentCanAccessCourse(
    studentObjectId,
    courseObjectId,
  );

  if (!access.allowed) {
    const error = new Error(
      "You do not have access to this course",
    );

    error.statusCode = 403;
    error.code = access.reason;

    throw error;
  }

  return {
    studentId: studentObjectId,
    courseId: courseObjectId,
    course,
    access,
  };
}

/**
 * Create or retrieve the progress document.
 */
async function getOrCreateProgress(
  studentId,
  courseId,
) {
  let progress =
    await StudentCourseProgress.findOne({
      student: studentId,
      course: courseId,
    });

  if (progress) {
    return progress;
  }

  progress =
    await StudentCourseProgress.create({
      student: studentId,
      course: courseId,
      completedLessons: [],
      completedModules: [],
      currentModuleIndex: 0,
      currentLessonIndex: 0,
      lastAccessedAt: new Date(),
      completedAt: null,
    });

  return progress;
}

/**
 * Recalculate module completion records.
 */
function synchronizeCompletedModules(
  course,
  progress,
) {
  const completedLessonSet =
    createCompletedLessonSet(progress);

  const completedModuleIndexes =
    getCompletedModuleIndexes(
      course,
      completedLessonSet,
    );

  const existingCompletedModules =
    new Map(
      (progress.completedModules || []).map(
        (item) => [
          item.moduleIndex,
          item.completedAt,
        ],
      ),
    );

  progress.completedModules =
    completedModuleIndexes.map(
      (moduleIndex) => ({
        moduleIndex,
        completedAt:
          existingCompletedModules.get(
            moduleIndex,
          ) || new Date(),
      }),
    );
}

/**
 * Calculate progress information.
 */
function calculateProgress(
  course,
  progress,
) {
  const flatLessons = getFlatLessons(course);
  const totalLessons = flatLessons.length;

  const completedLessonSet =
    createCompletedLessonSet(progress);

  const completedLessons =
    flatLessons.filter((item) =>
      completedLessonSet.has(
        lessonKey(
          item.moduleIndex,
          item.lessonIndex,
        ),
      ),
    ).length;

  const completedModuleIndexes =
    getCompletedModuleIndexes(
      course,
      completedLessonSet,
    );

  const completedModules =
    completedModuleIndexes.length;

  const totalModules =
    getModules(course).length;

  const isCompleted =
    totalLessons > 0 &&
    completedLessons === totalLessons;

  let percentage = 0;

  if (totalLessons > 0) {
    percentage = Math.round(
      (completedLessons / totalLessons) *
        100,
    );
  }

  const nextLesson =
    getFirstIncompleteLesson(
      course,
      completedLessonSet,
    );

  return {
    totalLessons,
    completedLessons,
    totalModules,
    completedModules,
completedModuleIndexes,
    percentage,
    isCompleted,
    nextLesson: nextLesson
      ? {
          moduleIndex:
            nextLesson.moduleIndex,
          lessonIndex:
            nextLesson.lessonIndex,
        }
      : null,
  };
}

/**
 * Serialize progress for the API.
 */
function serializeProgress(
  course,
  progress,
) {
  const calculated =
    calculateProgress(
      course,
      progress,
    );

  const completedLessonSet =
    createCompletedLessonSet(progress);

  const modules = getModules(course);

  return {
    id: progress._id,

    student: progress.student,

    course: progress.course,

    completedLessons:
      (progress.completedLessons || []).map(
        (item) => ({
          moduleIndex:
            item.moduleIndex,
          lessonIndex:
            item.lessonIndex,
          completedAt:
            item.completedAt,
        }),
      ),

    completedModules:
      (progress.completedModules || []).map(
        (item) => ({
          moduleIndex:
            item.moduleIndex,
          completedAt:
            item.completedAt,
        }),
      ),

    currentModuleIndex:
      progress.currentModuleIndex,

    currentLessonIndex:
      progress.currentLessonIndex,

    lastAccessedAt:
      progress.lastAccessedAt,

    completedAt:
      progress.completedAt,

    percentage:
      calculated.percentage,

    totalLessons:
      calculated.totalLessons,

    completedLessonCount:
      calculated.completedLessons,

    totalModules:
      calculated.totalModules,

    completedModuleCount:
      calculated.completedModules,

    isCompleted:
      calculated.isCompleted,

    nextLesson:
      calculated.nextLesson,

    modules: modules.map(
      (module, moduleIndex) => ({
        moduleIndex,

        completed:
          calculated.completedModuleIndexes?.includes(
            moduleIndex,
          ) ||
          isModuleComplete(
            course,
            moduleIndex,
            completedLessonSet,
          ),

        lessons:
          module.lessons.map(
            (_, lessonIndex) => ({
              lessonIndex,

              completed:
                completedLessonSet.has(
                  lessonKey(
                    moduleIndex,
                    lessonIndex,
                  ),
                ),

              unlocked:
                isLessonUnlocked(
                  course,
                  moduleIndex,
                  lessonIndex,
                  completedLessonSet,
                ),
            }),
          ),
      }),
    ),
  };
}

/**
 * Get the student's current course progress.
 */
async function getCourseProgress(
  studentId,
  courseId,
) {
  const {
    course,
    studentId: studentObjectId,
    courseId: courseObjectId,
    access,
  } = await getAccessibleCourse(
    studentId,
    courseId,
  );

  const progress =
    await getOrCreateProgress(
      studentObjectId,
      courseObjectId,
    );

  synchronizeCompletedModules(
    course,
    progress,
  );

  const calculated =
    calculateProgress(
      course,
      progress,
    );

  /*
   * If the stored current lesson is invalid
   * or already completed, move it to the
   * first incomplete lesson.
   */
  const current = findLesson(
    course,
    progress.currentModuleIndex,
    progress.currentLessonIndex,
  );

  const completedLessonSet =
    createCompletedLessonSet(progress);

  const currentCompleted =
    current &&
    completedLessonSet.has(
      lessonKey(
        progress.currentModuleIndex,
        progress.currentLessonIndex,
      ),
    );

  if (
    !current ||
    currentCompleted
  ) {
    if (calculated.nextLesson) {
      progress.currentModuleIndex =
        calculated.nextLesson.moduleIndex;

      progress.currentLessonIndex =
        calculated.nextLesson.lessonIndex;
    }
  }

  progress.lastAccessedAt =
    new Date();

  await progress.save();

  return {
    progress: serializeProgress(
      course,
      progress,
    ),

    batch: access.batch
      ? {
          _id: access.batch._id,
          name: access.batch.name,
          code: access.batch.code || "",
          status: access.batch.status,
        }
      : null,
  };
}

/**
 * Update the student's current lesson.
 *
 * A student can only move to a lesson that is
 * currently unlocked.
 */
async function updateCurrentLesson(
  studentId,
  courseId,
  moduleIndex,
  lessonIndex,
) {
  const {
    course,
    studentId: studentObjectId,
    courseId: courseObjectId,
  } = await getAccessibleCourse(
    studentId,
    courseId,
  );

  const normalizedModuleIndex =
    Number(moduleIndex);

  const normalizedLessonIndex =
    Number(lessonIndex);

  if (
    !Number.isInteger(
      normalizedModuleIndex,
    ) ||
    !Number.isInteger(
      normalizedLessonIndex,
    ) ||
    normalizedModuleIndex < 0 ||
    normalizedLessonIndex < 0
  ) {
    const error = new Error(
      "Invalid lesson position",
    );

    error.statusCode = 400;
    error.code = "INVALID_LESSON_POSITION";

    throw error;
  }

  const lesson = findLesson(
    course,
    normalizedModuleIndex,
    normalizedLessonIndex,
  );

  if (!lesson) {
    const error = new Error(
      "Lesson not found",
    );

    error.statusCode = 404;
    error.code = "LESSON_NOT_FOUND";

    throw error;
  }

  const progress =
    await getOrCreateProgress(
      studentObjectId,
      courseObjectId,
    );

  const completedLessonSet =
    createCompletedLessonSet(progress);

  const unlocked =
    isLessonUnlocked(
      course,
      normalizedModuleIndex,
      normalizedLessonIndex,
      completedLessonSet,
    );

  if (!unlocked) {
    const error = new Error(
      "This lesson is locked. Complete the previous lesson first.",
    );

    error.statusCode = 403;
    error.code = "LESSON_LOCKED";

    throw error;
  }

  progress.currentModuleIndex =
    normalizedModuleIndex;

  progress.currentLessonIndex =
    normalizedLessonIndex;

  progress.lastAccessedAt =
    new Date();

  await progress.save();

  return {
    progress: serializeProgress(
      course,
      progress,
    ),
  };
}

/**
 * Complete a lesson.
 *
 * Completion is idempotent:
 * completing an already completed lesson
 * does not create duplicates.
 */
async function completeLesson(
  studentId,
  courseId,
  moduleIndex,
  lessonIndex,
) {
  const {
    course,
    studentId: studentObjectId,
    courseId: courseObjectId,
  } = await getAccessibleCourse(
    studentId,
    courseId,
  );

  const normalizedModuleIndex =
    Number(moduleIndex);

  const normalizedLessonIndex =
    Number(lessonIndex);

  if (
    !Number.isInteger(
      normalizedModuleIndex,
    ) ||
    !Number.isInteger(
      normalizedLessonIndex,
    ) ||
    normalizedModuleIndex < 0 ||
    normalizedLessonIndex < 0
  ) {
    const error = new Error(
      "Invalid lesson position",
    );

    error.statusCode = 400;
    error.code = "INVALID_LESSON_POSITION";

    throw error;
  }

  const lesson = findLesson(
    course,
    normalizedModuleIndex,
    normalizedLessonIndex,
  );

  if (!lesson) {
    const error = new Error(
      "Lesson not found",
    );

    error.statusCode = 404;
    error.code = "LESSON_NOT_FOUND";

    throw error;
  }

  const progress =
    await getOrCreateProgress(
      studentObjectId,
      courseObjectId,
    );

  const completedLessonSet =
    createCompletedLessonSet(progress);

  const key = lessonKey(
    normalizedModuleIndex,
    normalizedLessonIndex,
  );

  const alreadyCompleted =
    completedLessonSet.has(key);

  /*
   * Do not allow completion of a locked lesson.
   *
   * An already completed lesson is allowed
   * again because completion is idempotent.
   */
  if (
    !alreadyCompleted &&
    !isLessonUnlocked(
      course,
      normalizedModuleIndex,
      normalizedLessonIndex,
      completedLessonSet,
    )
  ) {
    const error = new Error(
      "This lesson is locked. Complete the previous lesson first.",
    );

    error.statusCode = 403;
    error.code = "LESSON_LOCKED";

    throw error;
  }

  if (!alreadyCompleted) {
    progress.completedLessons.push({
      moduleIndex:
        normalizedModuleIndex,

      lessonIndex:
        normalizedLessonIndex,

      completedAt:
        new Date(),
    });
  }

  synchronizeCompletedModules(
    course,
    progress,
  );

  const calculatedBeforeCurrent =
    calculateProgress(
      course,
      progress,
    );

  if (calculatedBeforeCurrent.isCompleted) {
    progress.completedAt =
      progress.completedAt ||
      new Date();
  } else {
    progress.completedAt = null;
  }

  /*
   * Automatically advance to the next lesson.
   */
  const completedAfter =
    createCompletedLessonSet(
      progress,
    );

  const nextLesson =
    getFirstIncompleteLesson(
      course,
      completedAfter,
    );

  if (nextLesson) {
    progress.currentModuleIndex =
      nextLesson.moduleIndex;

    progress.currentLessonIndex =
      nextLesson.lessonIndex;
  }

  progress.lastAccessedAt =
    new Date();

  await progress.save();

  return {
    progress: serializeProgress(
      course,
      progress,
    ),

    completed: true,

    alreadyCompleted,
  };
}

module.exports = {
  getCourseProgress,
  updateCurrentLesson,
  completeLesson,

  /*
   * Exported for testing and future controllers.
   */
  getModules,
  getFlatLessons,
  findLesson,
  isLessonUnlocked,
  calculateProgress,
};