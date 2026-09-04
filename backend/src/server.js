require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const leadRoutes = require("./routes/leadRoutes");
const courseRoutes = require("./routes/courseRoutes");
const courseMaterialRoutes = require("./routes/courseMaterialRoutes");
const courseImageRoutes = require("./routes/courseImageRoutes");
const courseFactoryRoutes = require("./routes/courseFactoryRoutes");

const app = express();

const PORT = Number(
  process.env.PORT || 5001,
);

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  "http://localhost:3000";

/* =========================================================
   MIDDLEWARE
   ========================================================= */

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  }),
);

/*
 * Helmet security headers.
 *
 * IMPORTANT:
 * Course banner images are served from this backend
 * while the Next.js frontend runs on another origin/port.
 *
 * Example:
 * Frontend: http://localhost:3000
 * Backend:  http://localhost:5001
 *
 * Therefore the Cross-Origin-Resource-Policy must allow
 * cross-origin resources.
 */
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  }),
);

app.use(
  express.json({
    limit: "1mb",
    type: ["application/json", "application/*+json"],
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
    type: "application/x-www-form-urlencoded",
  }),
);

/*
 * Static uploaded files.
 *
 * Course images are stored in:
 * backend/uploads/course-banners/
 *
 * and are available at:
 * http://localhost:5001/uploads/course-banners/<filename>
 */
app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "../uploads"),
  ),
);

/* =========================================================
   HEALTH CHECK
   ========================================================= */

app.get(
  "/api/health",
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "JobWay backend is running",
      environment:
        process.env.NODE_ENV ||
        "development",
    });
  },
);

/* =========================================================
   API ROUTES
   ========================================================= */

app.use(
  "/api/auth",
  authRoutes,
);

app.use(
  "/api/leads",
  leadRoutes,
);

app.use(
  "/api/courses",
  courseRoutes,
);

app.use(
  "/api/course-images",
  courseImageRoutes,
);

app.use(
  "/api/course-factory",
  courseFactoryRoutes,
);

/* =========================================================
   404 HANDLER
   ========================================================= */

app.use(
  (req, res) => {
    res.status(404).json({
      success: false,
      message: "Route not found",
    });
  },
);

/* =========================================================
   ERROR HANDLER
   ========================================================= */

app.use(
  (error, req, res, next) => {
    console.error(
      "Unhandled server error:",
      error,
    );

    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message:
          "File is too large. Maximum allowed size is 25 MB.",
      });
    }

    if (
      error.message ===
      "Only PDF and DOCX files are supported."
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Internal server error",
    });
  },
);

/* =========================================================
   SERVER START
   ========================================================= */

async function startServer() {
  try {
    await connectDB();

    app.listen(
      PORT,
      "0.0.0.0",
      () => {
        console.log(
          `JobWay backend running on port ${PORT}`,
        );

        console.log(
          `Frontend allowed: ${FRONTEND_URL}`,
        );

        console.log(
          "Course material upload API enabled",
        );

        console.log(
          "Course Factory API enabled",
        );

        console.log(
          "Cross-origin course image serving enabled",
        );
      },
    );
  } catch (error) {
    console.error(
      "Failed to start JobWay backend:",
    );

    console.error(
      error.message,
    );

    process.exit(1);
  }
}

startServer();