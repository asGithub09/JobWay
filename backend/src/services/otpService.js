const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const OTP = require("../models/OTP");

const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES || 10);

function generateOTP() {
  return crypto.randomInt(100000, 1000000).toString();
}

async function createOTP(email, purpose) {
  const normalizedEmail = email.toLowerCase().trim();

  // Remove any previous OTP for the same email and purpose.
  await OTP.deleteMany({
    email: normalizedEmail,
    purpose,
  });

  const otp = generateOTP();
  const otpHash = await bcrypt.hash(otp, 10);

  const expiresAt = new Date(
    Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
  );

  await OTP.create({
    email: normalizedEmail,
    otpHash,
    purpose,
    expiresAt,
  });

  return {
    otp,
    expiresAt,
  };
}

async function verifyOTP(email, otp, purpose) {
  const normalizedEmail = email.toLowerCase().trim();

  const record = await OTP.findOne({
    email: normalizedEmail,
    purpose,
  }).sort({ createdAt: -1 });

  if (!record) {
    return {
      success: false,
      message: "OTP not found or expired",
    };
  }

  if (record.expiresAt.getTime() <= Date.now()) {
    await OTP.deleteOne({ _id: record._id });

    return {
      success: false,
      message: "OTP has expired",
    };
  }

  if (record.attempts >= 5) {
    await OTP.deleteOne({ _id: record._id });

    return {
      success: false,
      message: "Too many incorrect attempts. Please request a new OTP",
    };
  }

  const isValid = await bcrypt.compare(otp, record.otpHash);

  if (!isValid) {
    record.attempts += 1;
    await record.save();

    return {
      success: false,
      message: "Invalid OTP",
    };
  }

  await OTP.deleteOne({ _id: record._id });

  return {
    success: true,
  };
}

module.exports = {
  createOTP,
  verifyOTP,
};
