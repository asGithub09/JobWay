require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const leadRoutes = require("./routes/leadRoutes");

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

app.use(helmet());

app.use(
  express.json({
    limit: "1mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  }),
);

app.use(cookieParser());

/* =========================================================
   HEALTH CHECK
   ========================================================= */

app.get(
  "/api/health",
  (req, res) => {
    res.status(200).json({
      success: true,
      message:
        "JobWay backend is running",
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