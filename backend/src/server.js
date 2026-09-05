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
const courseFactoryRoutes = require("./routes/courseFactoryRoutes");
const courseCategoryRoutes = require("./routes/courseCategoryRoutes");
const examRoutes = require("./routes/examRoutes");

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
    type: [
      "application/json",
      "application/*+json",
    ],
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
    type: "application/x-www-form-urlencoded",
  }),
);

app.use(cookieParser());

/* =========================================================
   STATIC UPLOADED FILES
   ========================================================= */

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
  "/api/course-materials",
  courseMaterialRoutes,
);

app.use(
  "/api/course-factory",
  courseFactoryRoutes,
);

app.use(
  "/api/course-categories",
  courseCategoryRoutes,
);
app.use(
  "/api/exams",
  examRoutes,
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

    /* -----------------------------------------------------
       MULTER FILE SIZE ERROR
       ----------------------------------------------------- */

    if (
      error.code ===
      "LIMIT_FILE_SIZE"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "File is too large. Maximum allowed size is 25 MB.",
      });
    }

    /* -----------------------------------------------------
       COURSE MATERIAL FILE TYPE ERROR
       ----------------------------------------------------- */

    if (
      error.message ===
        "Only PDF and DOCX files are allowed." ||
      error.message ===
        "Only PDF and DOCX files are supported."
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    /* -----------------------------------------------------
       GENERIC SERVER ERROR
       ----------------------------------------------------- */

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
          "Course material API enabled",
        );

        console.log(
          "Course material upload, access, download and delete routes enabled",
        );

        console.log(
          "Course Factory API enabled",
        );

        console.log(
          "Course Category API enabled",
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