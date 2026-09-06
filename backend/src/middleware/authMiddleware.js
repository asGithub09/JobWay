const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authHeader.substring(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing",
      });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("JWT_SECRET is not configured");

      return res.status(500).json({
        success: false,
        message: "Server authentication configuration is missing",
      });
    }

    const decoded = jwt.verify(token, secret);

    req.user = decoded;

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
}

/*
 * Optional authentication middleware.
 *
 * Used by public routes that need to support both:
 * - unauthenticated visitors for FREE content
 * - authenticated students for PREMIUM/batch-protected content
 *
 * Invalid or missing tokens do not block the public route.
 * The controller can check req.user when authentication is required.
 */
function optionalAuthenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.substring(7).trim();

    if (!token) {
      return next();
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error(
        "JWT_SECRET is not configured for optional authentication",
      );

      return next();
    }

    try {
      const decoded = jwt.verify(token, secret);

      req.user = decoded;
    } catch (error) {
      /*
       * This is intentionally not returned as a 401.
       *
       * These routes remain public because FREE exams,
       * test series, and mock tests must continue to work
       * without authentication.
       *
       * The protected controller logic will reject PREMIUM
       * content when req.user is not a valid student.
       */
      console.error(
        "Optional authentication error:",
        error.message,
      );
    }

    return next();
  } catch (error) {
    console.error(
      "Optional authentication middleware error:",
      error.message,
    );

    return next();
  }
}

function authorizeAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
}

module.exports = {
  authenticateToken,
  optionalAuthenticateToken,
  authorizeAdmin,
};