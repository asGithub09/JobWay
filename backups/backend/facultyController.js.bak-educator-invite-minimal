const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const FacultyInvitation = require("../models/FacultyInvitation");
const { sendFacultyInvitation } = require("../services/emailService");

const INVITATION_EXPIRY_HOURS = 72;

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function hashInvitationToken(token) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

function getFrontendUrl() {
  return (
    process.env.FRONTEND_URL ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");
}

function serializeInvitation(invitation) {
  return {
    id: invitation._id.toString(),
    email: invitation.email,
    name: invitation.name,
    status: invitation.status,
    expiresAt: invitation.expiresAt,
    invitedBy: invitation.invitedBy
      ? invitation.invitedBy.toString()
      : null,
    acceptedBy: invitation.acceptedBy
      ? invitation.acceptedBy.toString()
      : null,
    acceptedAt: invitation.acceptedAt,
    revokedAt: invitation.revokedAt,
    createdAt: invitation.createdAt,
    updatedAt: invitation.updatedAt,
  };
}

async function createFacultyInvitation(req, res) {
  try {
    const email = normalizeEmail(req.body.email);
    const name = String(req.body.name || "").trim();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Faculty email is required",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    if (name.length > 120) {
      return res.status(400).json({
        success: false,
        message: "Faculty name must be 120 characters or less",
      });
    }

    const existingUser = await User.findOne({ email }).select(
      "+password",
    );

    if (existingUser) {
      if (existingUser.role === "educator") {
        return res.status(409).json({
          success: false,
          message: "An educator account already exists for this email",
        });
      }

      return res.status(409).json({
        success: false,
        message:
          "A JobWay account already exists for this email",
      });
    }

    const existingPendingInvitation =
      await FacultyInvitation.findOne({
        email,
        status: "pending",
      });

    if (existingPendingInvitation) {
      if (existingPendingInvitation.expiresAt > new Date()) {
        return res.status(409).json({
          success: false,
          message:
            "A pending invitation already exists for this email",
          invitation: serializeInvitation(
            existingPendingInvitation,
          ),
        });
      }

      existingPendingInvitation.status = "expired";
      await existingPendingInvitation.save();
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashInvitationToken(rawToken);

    const expiresAt = new Date(
      Date.now() +
        INVITATION_EXPIRY_HOURS * 60 * 60 * 1000,
    );

    const invitation = await FacultyInvitation.create({
      email,
      name,
      tokenHash,
      expiresAt,
      status: "pending",
      invitedBy: req.user.userId,
    });

    const invitationUrl =
      `${getFrontendUrl()}/educator/invite/${rawToken}`;

    try {
      await sendFacultyInvitation({
        email,
        name,
        invitationUrl,
        expiresAt,
      });
    } catch (emailError) {
      await FacultyInvitation.findByIdAndDelete(
        invitation._id,
      );

      console.error(
        "Faculty invitation email failed:",
        emailError,
      );

      return res.status(500).json({
        success: false,
        message:
          "Invitation could not be sent. Please check the email configuration and try again.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Faculty invitation sent successfully",
      invitation: serializeInvitation(invitation),
    });
  } catch (error) {
    console.error(
      "Create faculty invitation error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create faculty invitation",
    });
  }
}

async function validateFacultyInvitation(req, res) {
  try {
    const token = String(req.params.token || "").trim();

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Invitation token is required",
      });
    }

    const tokenHash = hashInvitationToken(token);

    const invitation =
      await FacultyInvitation.findOne({ tokenHash });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found or invalid",
      });
    }

    if (invitation.status !== "pending") {
      return res.status(410).json({
        success: false,
        message: `This invitation is ${invitation.status}`,
      });
    }

    if (invitation.expiresAt <= new Date()) {
      invitation.status = "expired";
      await invitation.save();

      return res.status(410).json({
        success: false,
        message: "This invitation has expired",
      });
    }

    return res.status(200).json({
      success: true,
      invitation: {
        id: invitation._id.toString(),
        email: invitation.email,
        name: invitation.name,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    console.error(
      "Validate faculty invitation error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to validate invitation",
    });
  }
}

async function acceptFacultyInvitation(req, res) {
  try {
    const token = String(req.params.token || "").trim();
    const name = String(req.body.name || "").trim();
    const phone = String(req.body.phone || "").trim();
    const password = String(req.body.password || "");

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Invitation token is required",
      });
    }

    if (name.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters",
      });
    }

    if (name.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name must be 100 characters or less",
      });
    }

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const tokenHash = hashInvitationToken(token);

    const invitation =
      await FacultyInvitation.findOne({ tokenHash });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found or invalid",
      });
    }

    if (invitation.status !== "pending") {
      return res.status(410).json({
        success: false,
        message: `This invitation is ${invitation.status}`,
      });
    }

    if (invitation.expiresAt <= new Date()) {
      invitation.status = "expired";
      await invitation.save();

      return res.status(410).json({
        success: false,
        message: "This invitation has expired",
      });
    }

    const existingUser = await User.findOne({
      email: invitation.email,
    }).select("+password");

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account already exists for this invitation email",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      12,
    );

    const educator = await User.create({
      name,
      email: invitation.email,
      phone,
      password: hashedPassword,
      isEmailVerified: true,
      isActive: true,
      role: "educator",
    });

    invitation.status = "accepted";
    invitation.acceptedBy = educator._id;
    invitation.acceptedAt = new Date();

    await invitation.save();

    return res.status(201).json({
      success: true,
      message:
        "Educator account created successfully. You can now log in.",
      user: {
        id: educator._id.toString(),
        name: educator.name,
        email: educator.email,
        phone: educator.phone,
        isEmailVerified: educator.isEmailVerified,
        role: educator.role,
      },
    });
  } catch (error) {
    console.error(
      "Accept faculty invitation error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create educator account",
    });
  }
}

async function revokeFacultyInvitation(req, res) {
  try {
    const invitation =
      await FacultyInvitation.findById(req.params.id);

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found",
      });
    }

    if (invitation.status !== "pending") {
      return res.status(400).json({
        success: false,
        message:
          "Only pending invitations can be revoked",
      });
    }

    invitation.status = "revoked";
    invitation.revokedAt = new Date();

    await invitation.save();

    return res.status(200).json({
      success: true,
      message: "Invitation revoked successfully",
      invitation: serializeInvitation(invitation),
    });
  } catch (error) {
    console.error(
      "Revoke faculty invitation error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to revoke invitation",
    });
  }
}

async function listFacultyInvitations(req, res) {
  try {
    const invitations =
      await FacultyInvitation.find()
        .sort({ createdAt: -1 })
        .lean();

    const result = invitations.map((invitation) => ({
      id: invitation._id.toString(),
      email: invitation.email,
      name: invitation.name,
      status:
        invitation.status === "pending" &&
        new Date(invitation.expiresAt) <= new Date()
          ? "expired"
          : invitation.status,
      expiresAt: invitation.expiresAt,
      invitedBy: invitation.invitedBy
        ? invitation.invitedBy.toString()
        : null,
      acceptedBy: invitation.acceptedBy
        ? invitation.acceptedBy.toString()
        : null,
      acceptedAt: invitation.acceptedAt,
      revokedAt: invitation.revokedAt,
      createdAt: invitation.createdAt,
      updatedAt: invitation.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      invitations: result,
    });
  } catch (error) {
    console.error(
      "List faculty invitations error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load faculty invitations",
    });
  }
}

module.exports = {
  createFacultyInvitation,
  validateFacultyInvitation,
  acceptFacultyInvitation,
  revokeFacultyInvitation,
  listFacultyInvitations,
};
