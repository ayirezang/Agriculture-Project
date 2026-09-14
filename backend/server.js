const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const listingRoutes = require("./routes/listingRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

dotenv.config();

const app = express();

// ===============================
// DATABASE
// ===============================
connectDB();

// ===============================
// MIDDLEWARE
// ===============================
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// ===============================
// ROUTES
// ===============================
app.use("/api/auth", authRoutes);

app.use("/api/listings", listingRoutes);
app.use("/api/dashboard", dashboardRoutes);
// ===============================
// HEALTH CHECK
// ===============================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AgriConnect AI backend is running",
  });
});

// ===============================
// SERVER
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});