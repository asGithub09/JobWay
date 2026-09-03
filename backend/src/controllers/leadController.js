const Lead = require("../models/Lead");

const ALLOWED_GOALS = ["government", "private"];

const ALLOWED_INTERESTS = [
  "free-courses",
  "job-ready-courses",
  "mock-tests",
  "job-updates",
];

const ALLOWED_STATUSES = [
  "new",
  "contacted",
  "interested",
  "converted",
  "not-interested",
];

function normalizePhone(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function normalizeInterests(interests) {
  if (!Array.isArray(interests)) {
    return [];
  }

  return [
    ...new Set(
      interests
        .map((interest) => String(interest).trim())
        .filter(Boolean)
    ),
  ];
}

async function createLead(req, res) {
  try {
    const {
      name,
      phone,
      email,
      goal,
      interests,
      source,
    } = req.body || {};

    const cleanName = String(name || "").trim();
    const cleanPhone = normalizePhone(phone);
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanGoal = String(goal || "").trim();
    const cleanInterests = normalizeInterests(interests);
    const cleanSource =
      String(source || "homepage-exam-selector").trim() ||
      "homepage-exam-selector";

    if (cleanName.length < 2 || cleanName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid name",
      });
    }

    if (!/^\d{10}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit mobile number",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    if (!ALLOWED_GOALS.includes(cleanGoal)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid job goal",
      });
    }

    if (cleanInterests.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one interest",
      });
    }

    const invalidInterest = cleanInterests.find(
      (interest) => !ALLOWED_INTERESTS.includes(interest)
    );

    if (invalidInterest) {
      return res.status(400).json({
        success: false,
        message: "One or more selected interests are invalid",
      });
    }

    const lead = await Lead.create({
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      goal: cleanGoal,
      interests: cleanInterests,
      source: cleanSource,
      status: "new",
    });

    return res.status(201).json({
      success: true,
      message: "Lead captured successfully",
      lead: {
        id: lead._id,
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        goal: lead.goal,
        interests: lead.interests,
        source: lead.source,
        status: lead.status,
        createdAt: lead.createdAt,
      },
    });
  } catch (error) {
    console.error("Create lead error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to capture lead",
    });
  }
}

async function getLeads(req, res) {
  try {
    const {
      search = "",
      goal = "",
      interest = "",
      status = "",
      page = 1,
      limit = 50,
    } = req.query;

    const filters = {};

    if (goal && ALLOWED_GOALS.includes(goal)) {
      filters.goal = goal;
    }

    if (status && ALLOWED_STATUSES.includes(status)) {
      filters.status = status;
    }

    if (interest && ALLOWED_INTERESTS.includes(interest)) {
      filters.interests = interest;
    }

    const cleanSearch = String(search).trim();

    if (cleanSearch) {
      const searchRegex = new RegExp(cleanSearch, "i");

      filters.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(
      Math.max(Number(limit) || 50, 1),
      100
    );

    const skip = (safePage - 1) * safeLimit;

    const [leads, total, stats] = await Promise.all([
      Lead.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),

      Lead.countDocuments(filters),

      Lead.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            government: {
              $sum: {
                $cond: [
                  { $eq: ["$goal", "government"] },
                  1,
                  0,
                ],
              },
            },
            private: {
              $sum: {
                $cond: [
                  { $eq: ["$goal", "private"] },
                  1,
                  0,
                ],
              },
            },
            freeCourses: {
              $sum: {
                $cond: [
                  {
                    $in: [
                      "free-courses",
                      "$interests",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            jobReadyCourses: {
              $sum: {
                $cond: [
                  {
                    $in: [
                      "job-ready-courses",
                      "$interests",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            mockTests: {
              $sum: {
                $cond: [
                  {
                    $in: [
                      "mock-tests",
                      "$interests",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            jobUpdates: {
              $sum: {
                $cond: [
                  {
                    $in: [
                      "job-updates",
                      "$interests",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
    ]);

    const statsResult = stats[0] || {
      total: 0,
      government: 0,
      private: 0,
      freeCourses: 0,
      jobReadyCourses: 0,
      mockTests: 0,
      jobUpdates: 0,
    };

    return res.status(200).json({
      success: true,
      leads,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        pages: Math.ceil(total / safeLimit),
      },
      stats: {
        total: statsResult.total || 0,
        government: statsResult.government || 0,
        private: statsResult.private || 0,
        freeCourses: statsResult.freeCourses || 0,
        jobReadyCourses: statsResult.jobReadyCourses || 0,
        mockTests: statsResult.mockTests || 0,
        jobUpdates: statsResult.jobUpdates || 0,
      },
    });
  } catch (error) {
    console.error("Get leads error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch leads",
    });
  }
}

async function updateLeadStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lead status",
      });
    }

    const lead = await Lead.findByIdAndUpdate(
      id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lead status updated successfully",
      lead,
    });
  } catch (error) {
    console.error("Update lead status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update lead status",
    });
  }
}

module.exports = {
  createLead,
  getLeads,
  updateLeadStatus,
};