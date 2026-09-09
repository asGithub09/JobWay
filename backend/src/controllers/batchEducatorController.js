const mongoose = require("mongoose");

const Batch = require("../models/Batch");
const BatchEducator = require("../models/BatchEducator");
const User = require("../models/User");

function cleanText(value) {
  return String(value || "").trim();
}

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(
    String(value || ""),
  );
}

/*
 * =========================================================
 * GET BATCH EDUCATORS
 * =========================================================
 *
 * GET /api/batch-educators/batch/:batchId/educators
 *
 * Returns active educators assigned to a batch.
 */
async function getBatchEducators(req, res) {
  try {
    const { batchId } = req.params;
    const search = cleanText(req.query?.search);

    if (!isValidObjectId(batchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch ID.",
      });
    }

    const batch =
      await Batch.findById(batchId).lean();

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found.",
      });
    }

    const educatorFilter = {
      role: "educator",
    };

    if (search) {
      educatorFilter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
        {
          phone: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const assignments =
      await BatchEducator.find({
        batch: batchId,
        status: "active",
      })
        .populate({
          path: "educator",
          match: educatorFilter,
          select:
            "name email phone isEmailVerified isActive role createdAt",
        })
        .sort({
          assignedAt: -1,
        })
        .lean();

    const educators = assignments
      .filter(
        (assignment) =>
          assignment.educator,
      )
      .map((assignment) => ({
        assignmentId: assignment._id,
        educator: assignment.educator,
        status: assignment.status,
        assignedAt: assignment.assignedAt,
        assignedBy: assignment.assignedBy,
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt,
      }));

    return res.status(200).json({
      success: true,
      batch,
      educators,
      total: educators.length,
    });
  } catch (error) {
    console.error(
      "Get batch educators error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch batch educators.",
    });
  }
}

/*
 * =========================================================
 * SEARCH AVAILABLE EDUCATORS
 * =========================================================
 *
 * GET /api/batch-educators/batch/:batchId/available-educators
 *
 * Searches active educator accounts that are not already
 * assigned to this batch.
 */
async function searchEducators(req, res) {
  try {
    const { batchId } = req.params;
    const search = cleanText(req.query?.search);

    if (!isValidObjectId(batchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch ID.",
      });
    }

    const batch =
      await Batch.findById(batchId).lean();

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found.",
      });
    }

    const filter = {
      role: "educator",
      isActive: true,
    };

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
        {
          phone: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const existingAssignments =
      await BatchEducator.find({
        batch: batchId,
      })
        .select("educator")
        .lean();

    const existingEducatorIds =
      existingAssignments.map(
        (assignment) =>
          assignment.educator,
      );

    if (existingEducatorIds.length > 0) {
      filter._id = {
        $nin: existingEducatorIds,
      };
    }

    const educators =
      await User.find(filter)
        .select(
          "name email phone isEmailVerified isActive role createdAt",
        )
        .sort({
          name: 1,
        })
        .limit(50)
        .lean();

    return res.status(200).json({
      success: true,
      educators,
    });
  } catch (error) {
    console.error(
      "Search educators error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to search educators.",
    });
  }
}

/*
 * =========================================================
 * ADD EDUCATORS TO BATCH
 * =========================================================
 *
 * POST /api/batch-educators/batch/:batchId/educators
 *
 * Body:
 * {
 *   "educatorIds": [
 *     "educatorId1",
 *     "educatorId2"
 *   ]
 * }
 */
async function addEducatorsToBatch(
  req,
  res,
) {
  try {
    const { batchId } = req.params;
    const educatorIds =
      req.body?.educatorIds;

    if (!isValidObjectId(batchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch ID.",
      });
    }

    if (
      !Array.isArray(educatorIds) ||
      educatorIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide at least one educator.",
      });
    }

    if (educatorIds.length > 50) {
      return res.status(400).json({
        success: false,
        message:
          "You can add a maximum of 50 educators at once.",
      });
    }

    const uniqueEducatorIds = [
      ...new Set(
        educatorIds.map((id) =>
          String(id),
        ),
      ),
    ];

    const invalidEducatorId =
      uniqueEducatorIds.find(
        (id) =>
          !isValidObjectId(id),
      );

    if (invalidEducatorId) {
      return res.status(400).json({
        success: false,
        message:
          "One or more educator IDs are invalid.",
      });
    }

    const batch =
      await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found.",
      });
    }

    if (batch.status === "archived") {
      return res.status(400).json({
        success: false,
        message:
          "Educators cannot be assigned to an archived batch.",
      });
    }

    /*
     * Only actual active educator accounts
     * can be assigned.
     */
    const educators =
      await User.find({
        _id: {
          $in: uniqueEducatorIds,
        },
        role: "educator",
        isActive: true,
      })
        .select(
          "_id name email phone isActive role",
        )
        .lean();

    const foundEducatorIds =
      new Set(
        educators.map((educator) =>
          String(educator._id),
        ),
      );

    const invalidEducatorIds =
      uniqueEducatorIds.filter(
        (id) =>
          !foundEducatorIds.has(id),
      );

    if (
      invalidEducatorIds.length > 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "One or more selected users are not active educator accounts.",
      });
    }

    /*
     * Check existing assignments.
     */
    const existingAssignments =
      await BatchEducator.find({
        batch: batchId,
        educator: {
          $in: uniqueEducatorIds,
        },
      })
        .select("educator status")
        .lean();

    const existingIds =
      new Set(
        existingAssignments.map(
          (assignment) =>
            String(
              assignment.educator,
            ),
        ),
      );

    /*
     * Reactivate inactive assignments.
     */
    const inactiveAssignments =
      existingAssignments.filter(
        (assignment) =>
          assignment.status ===
          "inactive",
      );

    if (
      inactiveAssignments.length > 0
    ) {
      await BatchEducator.updateMany(
        {
          batch: batchId,
          educator: {
            $in: inactiveAssignments.map(
              (assignment) =>
                assignment.educator,
            ),
          },
        },
        {
          $set: {
            status: "active",
            assignedAt: new Date(),
            assignedBy:
              req.user?._id ||
              req.user?.id ||
              null,
          },
        },
      );
    }

    const newEducatorIds =
      uniqueEducatorIds.filter(
        (id) =>
          !existingIds.has(id),
      );

    let addedEducators = [];

    if (newEducatorIds.length > 0) {
      const now = new Date();

      const documents =
        newEducatorIds.map(
          (educatorId) => ({
            batch: batchId,
            educator: educatorId,
            status: "active",
            assignedAt: now,
            assignedBy:
              req.user?._id ||
              req.user?.id ||
              null,
          }),
        );

      await BatchEducator.insertMany(
        documents,
        {
          ordered: false,
        },
      );

      addedEducators =
        educators.filter(
          (educator) =>
            newEducatorIds.includes(
              String(educator._id),
            ),
        );
    }

    const reactivatedCount =
      inactiveAssignments.length;

    return res.status(201).json({
      success: true,
      message:
        `${addedEducators.length + reactivatedCount} educator${
          addedEducators.length +
            reactivatedCount ===
          1
            ? ""
            : "s"
        } assigned to the batch successfully.`,
      addedCount:
        addedEducators.length,
      reactivatedCount,
      skippedCount:
        existingAssignments.length -
        inactiveAssignments.length,
      educators: [
        ...addedEducators,
      ],
    });
  } catch (error) {
    console.error(
      "Add educators to batch error:",
      error,
    );

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "One or more educators are already assigned to this batch.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to assign educators to batch.",
    });
  }
}

/*
 * =========================================================
 * REMOVE EDUCATOR FROM BATCH
 * =========================================================
 *
 * DELETE
 * /api/batch-educators/batch/:batchId/educators/:educatorId
 */
async function removeEducatorFromBatch(
  req,
  res,
) {
  try {
    const {
      batchId,
      educatorId,
    } = req.params;

    if (!isValidObjectId(batchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch ID.",
      });
    }

    if (!isValidObjectId(educatorId)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid educator ID.",
      });
    }

    const assignment =
      await BatchEducator.findOne({
        batch: batchId,
        educator: educatorId,
      });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message:
          "Educator is not assigned to this batch.",
      });
    }

    await BatchEducator.findByIdAndDelete(
      assignment._id,
    );

    return res.status(200).json({
      success: true,
      message:
        "Educator removed from batch successfully.",
    });
  } catch (error) {
    console.error(
      "Remove educator from batch error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to remove educator from batch.",
    });
  }
}

/*
 * =========================================================
 * GET EDUCATORS ASSIGNED BATCHES
 * =========================================================
 *
 * GET /api/batch-educators/my-batches
 *
 * This endpoint will be used by the Educator workspace.
 */
async function getMyBatches(req, res) {
  try {
    const educatorId =
      req.user?.userId ||
      req.user?._id ||
      req.user?.id;

    if (!isValidObjectId(educatorId)) {
      return res.status(401).json({
        success: false,
        message:
          "Unable to identify educator.",
      });
    }

    const assignments =
      await BatchEducator.find({
        educator: educatorId,
        status: "active",
      })
        .populate({
          path: "batch",
          select:
            "name code category description startDate endDate status createdAt",
        })
        .sort({
          assignedAt: -1,
        })
        .lean();

    const batches = assignments
      .filter(
        (assignment) =>
          assignment.batch &&
          assignment.batch.status !==
            "archived",
      )
      .map((assignment) => ({
        assignmentId:
          assignment._id,
        batch: assignment.batch,
        status: assignment.status,
        assignedAt:
          assignment.assignedAt,
      }));

    return res.status(200).json({
      success: true,
      batches,
      total: batches.length,
    });
  } catch (error) {
    console.error(
      "Get educator batches error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch assigned batches.",
    });
  }
}

module.exports = {
  getBatchEducators,
  searchEducators,
  addEducatorsToBatch,
  removeEducatorFromBatch,
  getMyBatches,
};