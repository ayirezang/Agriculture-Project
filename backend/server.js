const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const listingRoutes = require("./routes/listingRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const buyerRequestRoutes = require("./routes/buyerRequestRoutes");

dotenv.config();

const app = express();

// ==========================================
// CONNECT TO DATABASE
// ==========================================
connectDB();

// ==========================================
// CORS
// ==========================================
app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5173",
    credentials: true,
  })
);

// ==========================================
// BODY PARSER
// ==========================================
app.use(express.json());

// ==========================================
// API ROUTES
// ==========================================

// Authentication
app.use("/api/auth", authRoutes);

// Farmer produce listings
app.use("/api/listings", listingRoutes);

// Farmer dashboard
app.use("/api/dashboard", dashboardRoutes);

// Buyer requests
app.use(
  "/api/buyer-requests",
  buyerRequestRoutes
);

// ==========================================
// HEALTH CHECK
// ==========================================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AgriConnect AI backend is running",
  });
});

// ==========================================
// UNKNOWN API ROUTE
// ==========================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================
app.use((error, req, res, next) => {
  console.error("Unhandled server error:", error);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `AgriConnect AI server running on port ${PORT}`
  );
});