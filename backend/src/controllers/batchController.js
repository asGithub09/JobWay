const Batch = require("../models/Batch");

function cleanText(value) {
  return String(value || "").trim();
}

function parseDate(value) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function isValidObjectId(value) {
  return /^[0-9a-fA-F]{24}$/.test(
    String(value || ""),
  );
}

/* =========================================================
   CREATE BATCH
   ========================================================= */

async function createBatch(req, res) {
  try {
    const {
      name,
      code,
      category,
      description,
      startDate,
      endDate,
    } = req.body || {};

    const cleanName = cleanText(name);
    const cleanCode = cleanText(code);
    const cleanDescription =
      cleanText(description);

    if (
      cleanName.length < 2 ||
      cleanName.length > 150
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Batch name must be between 2 and 150 characters.",
      });
    }

    if (category && !isValidObjectId(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category.",
      });
    }

    const parsedStartDate =
      parseDate(startDate);

    const parsedEndDate =
      parseDate(endDate);

    if (
      startDate &&
      !parsedStartDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid start date.",
      });
    }

    if (
      endDate &&
      !parsedEndDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid end date.",
      });
    }

    if (
      parsedStartDate &&
      parsedEndDate &&
      parsedEndDate < parsedStartDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "End date cannot be before start date.",
      });
    }

    const batch =
      await Batch.create({
        name: cleanName,
        code: cleanCode,
        category:
          category || null,
        description:
          cleanDescription,
        startDate:
          parsedStartDate,
        endDate:
          parsedEndDate,
        status: "active",
      });

    const populatedBatch =
      await Batch.findById(
        batch._id,
      )
        .populate(
          "category",
          "name slug",
        )
        .lean();

    return res.status(201).json({
      success: true,
      message:
        "Batch created successfully.",
      batch: populatedBatch,
    });
  } catch (error) {
    console.error(
      "Create batch error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create batch.",
    });
  }
}

/* =========================================================
   GET BATCHES
   ========================================================= */

async function getBatches(req, res) {
  try {
    const {
      search = "",
      status = "",
      category = "",
    } = req.query || {};

    const filters = {};

    if (
      [
        "active",
        "inactive",
        "archived",
      ].includes(status)
    ) {
      filters.status = status;
    }

    if (category) {
      if (!isValidObjectId(category)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid category.",
        });
      }

      filters.category = category;
    }

    const cleanSearch =
      cleanText(search);

    if (cleanSearch) {
      filters.$or = [
        {
          name: {
            $regex: cleanSearch,
            $options: "i",
          },
        },
        {
          code: {
            $regex: cleanSearch,
            $options: "i",
          },
        },
      ];
    }

    const batches =
      await Batch.find(filters)
        .populate(
          "category",
          "name slug",
        )
        .sort({
          createdAt: -1,
        })
        .lean();

    return res.status(200).json({
      success: true,
      batches,
    });
  } catch (error) {
    console.error(
      "Get batches error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch batches.",
    });
  }
}

/* =========================================================
   GET SINGLE BATCH
   ========================================================= */

async function getBatch(req, res) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch ID.",
      });
    }

    const batch =
      await Batch.findById(id)
        .populate(
          "category",
          "name slug",
        )
        .lean();

    if (!batch) {
      return res.status(404).json({
        success: false,
        message:
          "Batch not found.",
      });
    }

    return res.status(200).json({
      success: true,
      batch,
    });
  } catch (error) {
    console.error(
      "Get batch error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch batch.",
    });
  }
}

/* =========================================================
   UPDATE BATCH
   ========================================================= */

async function updateBatch(req, res) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch ID.",
      });
    }

    const existingBatch =
      await Batch.findById(id);

    if (!existingBatch) {
      return res.status(404).json({
        success: false,
        message:
          "Batch not found.",
      });
    }

    const {
      name,
      code,
      category,
      description,
      startDate,
      endDate,
      status,
    } = req.body || {};

    const updates = {};

    if (name !== undefined) {
      const cleanName =
        cleanText(name);

      if (
        cleanName.length < 2 ||
        cleanName.length > 150
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Batch name must be between 2 and 150 characters.",
        });
      }

      updates.name = cleanName;
    }

    if (code !== undefined) {
      updates.code =
        cleanText(code);
    }

    if (category !== undefined) {
      if (
        category &&
        !isValidObjectId(category)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid category.",
        });
      }

      updates.category =
        category || null;
    }

    if (
      description !== undefined
    ) {
      updates.description =
        cleanText(description);
    }

    if (
      startDate !== undefined
    ) {
      const parsed =
        parseDate(startDate);

      if (
        startDate &&
        !parsed
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid start date.",
        });
      }

      updates.startDate = parsed;
    }

    if (
      endDate !== undefined
    ) {
      const parsed =
        parseDate(endDate);

      if (
        endDate &&
        !parsed
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid end date.",
        });
      }

      updates.endDate = parsed;
    }

    if (status !== undefined) {
      if (
        ![
          "active",
          "inactive",
          "archived",
        ].includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid batch status.",
        });
      }

      updates.status = status;
    }

    const nextStartDate =
      updates.startDate !==
      undefined
        ? updates.startDate
        : existingBatch.startDate;

    const nextEndDate =
      updates.endDate !==
      undefined
        ? updates.endDate
        : existingBatch.endDate;

    if (
      nextStartDate &&
      nextEndDate &&
      nextEndDate < nextStartDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "End date cannot be before start date.",
      });
    }

    const batch =
      await Batch.findByIdAndUpdate(
        id,
        updates,
        {
          new: true,
          runValidators: true,
        },
      )
        .populate(
          "category",
          "name slug",
        )
        .lean();

    return res.status(200).json({
      success: true,
      message:
        "Batch updated successfully.",
      batch,
    });
  } catch (error) {
    console.error(
      "Update batch error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update batch.",
    });
  }
}

/* =========================================================
   UPDATE STATUS
   ========================================================= */

async function updateBatchStatus(
  req,
  res,
) {
  try {
    const { id } = req.params;
    const { status } =
      req.body || {};

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch ID.",
      });
    }

    if (
      ![
        "active",
        "inactive",
        "archived",
      ].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid batch status.",
      });
    }

    const batch =
      await Batch.findByIdAndUpdate(
        id,
        { status },
        {
          new: true,
          runValidators: true,
        },
      )
        .populate(
          "category",
          "name slug",
        )
        .lean();

    if (!batch) {
      return res.status(404).json({
        success: false,
        message:
          "Batch not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Batch status updated successfully.",
      batch,
    });
  } catch (error) {
    console.error(
      "Update batch status error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update batch status.",
    });
  }
}

module.exports = {
  createBatch,
  getBatches,
  getBatch,
  updateBatch,
  updateBatchStatus,
};