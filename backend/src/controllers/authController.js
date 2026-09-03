const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const OTP = require("../models/OTP");

const {
  createOTP,
  verifyOTP,
} = require("../services/otpService");

const {
  sendVerificationOTP,
  sendPasswordResetOTP,
} = require("../services/emailService");

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function sanitizeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    isEmailVerified: user.isEmailVerified,
    role: user.role,
  };
}

function createToken(user) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
    },
    secret,
    {
      expiresIn: "7d",
    },
  );
}

async function register(req, res) {
  try {
    const {
      name,
      email,
      phone,
      password,
    } = req.body;

    const normalizedName =
      String(name || "").trim();

    const normalizedEmail =
      normalizeEmail(email);

    const normalizedPhone =
      String(phone || "").trim();

    if (
      !normalizedName ||
      !normalizedEmail ||
      !normalizedPhone ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, phone and password are required",
      });
    }

    if (
      normalizedName.length < 2 ||
      normalizedName.length > 100
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name must be between 2 and 100 characters",
      });
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid email address",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters",
      });
    }

    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      }).select("+password");

    if (
      existingUser &&
      existingUser.isEmailVerified
    ) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }

    let user;

    if (existingUser) {
      const passwordHash =
        await bcrypt.hash(password, 12);

      existingUser.name =
        normalizedName;

      existingUser.phone =
        normalizedPhone;

      existingUser.password =
        passwordHash;

      existingUser.isActive = true;

      user = await existingUser.save();
    } else {
      const passwordHash =
        await bcrypt.hash(password, 12);

      user = await User.create({
        name: normalizedName,
        email: normalizedEmail,
        phone: normalizedPhone,
        password: passwordHash,
        isEmailVerified: false,
        isActive: true,
        role: "student",
      });
    }

    const { otp, expiresAt } =
      await createOTP(
        normalizedEmail,
        "email_verification",
      );

    try {
      await sendVerificationOTP({
        email: normalizedEmail,
        name: normalizedName,
        otp,
      });
    } catch (emailError) {
      console.error(
        "Brevo email error:",
        emailError,
      );

      await OTP.deleteMany({
        email: normalizedEmail,
        purpose: "email_verification",
      });

      if (!existingUser) {
        await User.deleteOne({
          _id: user._id,
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Could not send verification email. Please try again",
      });
    }

    return res
      .status(existingUser ? 200 : 201)
      .json({
        success: true,
        message:
          "Verification OTP sent to your email",
        requiresVerification: true,
        email: normalizedEmail,
        expiresAt,
      });
  } catch (error) {
    console.error(
      "Register error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
}

async function verifyEmail(req, res) {
  try {
    const { email, otp } =
      req.body;

    const normalizedEmail =
      normalizeEmail(email);

    const normalizedOTP =
      String(otp || "").trim();

    if (
      !normalizedEmail ||
      !normalizedOTP
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email and OTP are required",
      });
    }

    if (!/^\d{6}$/.test(normalizedOTP)) {
      return res.status(400).json({
        success: false,
        message:
          "OTP must be a 6-digit code",
      });
    }

    const verification =
      await verifyOTP(
        normalizedEmail,
        normalizedOTP,
        "email_verification",
      );

    if (!verification.success) {
      return res.status(400).json({
        success: false,
        message: verification.message,
      });
    }

    const user =
      await User.findOne({
        email: normalizedEmail,
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User account not found",
      });
    }

    user.isEmailVerified = true;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Email verified successfully",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error(
      "Verify email error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Email verification failed",
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } =
      req.body;

    const normalizedEmail =
      normalizeEmail(email);

    if (
      !normalizedEmail ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const user =
      await User.findOne({
        email: normalizedEmail,
      }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is inactive",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message:
          "Please verify your email before logging in",
        requiresVerification: true,
        email: user.email,
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password,
      );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    const token =
      createToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error(
      "Login error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
}

async function forgotPassword(
  req,
  res,
) {
  try {
    const { email } =
      req.body;

    const normalizedEmail =
      normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message:
          "Email address is required",
      });
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid email address",
      });
    }

    const user =
      await User.findOne({
        email: normalizedEmail,
      });

    /*
     * Do not reveal whether an email exists.
     * This prevents account enumeration.
     */
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists for this email, a password reset code has been sent.",
      });
    }

    if (!user.isActive) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists for this email, a password reset code has been sent.",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message:
          "Please verify your email before resetting your password",
        requiresVerification: true,
        email: user.email,
      });
    }

    const {
      otp,
      expiresAt,
    } = await createOTP(
      normalizedEmail,
      "password_reset",
    );

    try {
      await sendPasswordResetOTP({
        email: normalizedEmail,
        name: user.name,
        otp,
      });
    } catch (emailError) {
      console.error(
        "Password reset email error:",
        emailError,
      );

      await OTP.deleteMany({
        email: normalizedEmail,
        purpose: "password_reset",
      });

      return res.status(500).json({
        success: false,
        message:
          "Could not send password reset email. Please try again",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Password reset code sent to your email",
      email: normalizedEmail,
      expiresAt,
    });
  } catch (error) {
    console.error(
      "Forgot password error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Could not process password reset request",
    });
  }
}

async function resetPassword(
  req,
  res,
) {
  try {
    const {
      email,
      otp,
      newPassword,
    } = req.body;

    const normalizedEmail =
      normalizeEmail(email);

    const normalizedOTP =
      String(otp || "").trim();

    if (
      !normalizedEmail ||
      !normalizedOTP ||
      !newPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email, OTP and new password are required",
      });
    }

    if (!/^\d{6}$/.test(normalizedOTP)) {
      return res.status(400).json({
        success: false,
        message:
          "OTP must be a 6-digit code",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 6 characters",
      });
    }

    const verification =
      await verifyOTP(
        normalizedEmail,
        normalizedOTP,
        "password_reset",
      );

    if (!verification.success) {
      return res.status(400).json({
        success: false,
        message: verification.message,
      });
    }

    const user =
      await User.findOne({
        email: normalizedEmail,
      }).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User account not found",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is inactive",
      });
    }

    const passwordHash =
      await bcrypt.hash(
        newPassword,
        12,
      );

    user.password =
      passwordHash;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully",
    });
  } catch (error) {
    console.error(
      "Reset password error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Could not reset password",
    });
  }
}

async function resendVerification(
  req,
  res,
) {
  try {
    const { email } =
      req.body;

    const normalizedEmail =
      normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message:
          "Email address is required",
      });
    }

    const user =
      await User.findOne({
        email: normalizedEmail,
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User account not found",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message:
          "This email is already verified",
      });
    }

    const {
      otp,
      expiresAt,
    } = await createOTP(
      normalizedEmail,
      "email_verification",
    );

    try {
      await sendVerificationOTP({
        email: normalizedEmail,
        name: user.name,
        otp,
      });
    } catch (emailError) {
      console.error(
        "Resend verification email error:",
        emailError,
      );

      await OTP.deleteMany({
        email: normalizedEmail,
        purpose: "email_verification",
      });

      return res.status(500).json({
        success: false,
        message:
          "Could not send verification email. Please try again",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Verification OTP sent to your email",
      email: normalizedEmail,
      expiresAt,
    });
  } catch (error) {
    console.error(
      "Resend verification error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Could not resend verification code",
    });
  }
}

module.exports = {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  resendVerification,
};