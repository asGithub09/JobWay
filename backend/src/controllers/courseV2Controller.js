const fs = require("fs/promises");
const os = require("os");
const path = require("path");

const {
  createCourseV2,
  listCourseV2,
  getCourseV2,
  updateCourseV2,
  deleteCourseV2,
  publishCourseV2,
} = require("../services/courseV2Service");

const {
  parseCourseDocument,
} = require("../services/ai/courseParser");


const {
  extractPdfImages,
} = require("../services/pdfImageService");

const {
  uploadCourseBanner,
} = require("../services/cloudinaryService");

function getUserId(req) {
  return req.user?._id || req.user?.id || req.user?.userId;
}

function handleError(res, error) {
  console.error("CourseV2 controller error:", error);

  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Course operation failed.",
  });
}

async function create(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user could not be identified.",
      });
    }

    const course = await createCourseV2({
      createdBy: userId,
      data: req.body || {},
    });

    return res.status(201).json({
      success: true,
      course,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function list(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const courses = await listCourseV2(userId);

    return res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    return handleError(res, error);
  }
}
async function getOne(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user could not be identified.",
      });
    }

    const course = await getCourseV2(req.params.id, userId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    return res.json({
      success: true,
      course,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function update(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user could not be identified.",
      });
    }

    const course = await updateCourseV2(
      req.params.id,
      userId,
      req.body || {}
    );

    return res.json({
      success: true,
      course,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function remove(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user could not be identified.",
      });
    }

    await deleteCourseV2(req.params.id, userId);

    return res.json({
      success: true,
      message: "Course deleted successfully.",
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function publish(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const result = await publishCourseV2(
      req.params.id,
      userId
    );

    return res.json({
      success: true,
      message:
        "Course published successfully and made available to your assigned batches.",
      course: result.course,
      studentCourse: result.studentCourse,
      assignedBatchCount: result.assignedBatchCount,
    });
  } catch (error) {
    return handleError(res, error);
  }
}
async function importDocument(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user could not be identified.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF, DOCX, or XLSX file.",
      });
    }

    const allowedMimeTypes = new Set([
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/msword",
      "application/vnd.ms-excel",
    ]);

    if (!allowedMimeTypes.has(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Only PDF, DOCX, and XLSX files are supported.",
      });
    }

    let extractedCourse = await parseCourseDocument({
      fileBytes: req.file.buffer,
      mimeType: req.file.mimetype,
      fileName: req.file.originalname,
    });

    if (req.file.mimetype === "application/pdf") {
      const tempDirectory = await fs.mkdtemp(
        path.join(os.tmpdir(), "jobway-course-import-"),
      );

      const pdfPath = path.join(
        tempDirectory,
        "source.pdf",
      );

      try {
        await fs.writeFile(
          pdfPath,
          req.file.buffer,
        );

        const extractedImages =
          await extractPdfImages(pdfPath);

        if (extractedImages.length > 0) {
          const uploadedImages = [];

          for (const image of extractedImages) {
            const imagePath = path.join(
              tempDirectory,
              `page-${image.pageNumber}-${image.hash}.png`,
            );

            await fs.writeFile(
              imagePath,
              image.buffer,
            );

            try {
              const uploaded =
                await uploadCourseBanner(
                  imagePath,
                  {
                    folder:
                      "jobway/course-images",
                  },
                );

              uploadedImages.push({
                ...uploaded,
                pageNumber: image.pageNumber,
                hash: image.hash,
              });
            } finally {
              await fs.rm(imagePath, {
                force: true,
              });
            }
          }

          const modules =
            Array.isArray(extractedCourse.modules)
              ? extractedCourse.modules
              : [];

          for (const uploadedImage of uploadedImages) {
            let targetModuleIndex = -1;

            for (
              let index = 0;
              index < modules.length;
              index += 1
            ) {
              const modulePage = Number(
                modules[index]?.sourcePage || 0,
              );

              if (
                modulePage > 0 &&
                modulePage <= uploadedImage.pageNumber
              ) {
                targetModuleIndex = index;
              }
            }

            if (targetModuleIndex === -1 && modules.length > 0) {
              targetModuleIndex = 0;
            }

            if (targetModuleIndex === -1) {
              continue;
            }

            const targetModule =
              modules[targetModuleIndex];

            if (!Array.isArray(targetModule.items)) {
              targetModule.items = [];
            }

            targetModule.items.push({
              type: "IMAGE",
              title:
                `Image from page ${uploadedImage.pageNumber}`,
              sourcePage:
                uploadedImage.pageNumber,
              content: "",
              url:
                uploadedImage.secureUrl || "",
              resourceUrl: "",
              media: {
                url:
                  uploadedImage.secureUrl || "",
                publicId:
                  uploadedImage.publicId || "",
                resourceType: "image",
                fileName:
                  `page-${uploadedImage.pageNumber}-${uploadedImage.hash}.png`,
                mimeType: "image/png",
                size:
                  Number(uploadedImage.bytes || 0),
              },
              questions: [],
            });
          }
        }
      } finally {
        await fs.rm(tempDirectory, {
          recursive: true,
          force: true,
        });
      }
    }

    const course = await createCourseV2({
      createdBy: userId,
      data: {
        ...extractedCourse,
        source: {
          type: "AI",
          fileName: req.file.originalname,
          mimeType: req.file.mimetype,
          aiProvider: "gemini",
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Course draft created from document.",
      course,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = {
  create,
  list,
  getOne,
  update,
  remove,
  publish,
  importDocument,
};





