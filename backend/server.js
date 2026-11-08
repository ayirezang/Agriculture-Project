const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const listingRoutes = require("./routes/listingRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const buyerRequestRoutes = require("./routes/buyerRequestRoutes");
const agentRoutes = require("./routes/agentRoutes");
const outreachRoutes = require("./routes/outreachRoutes");

dotenv.config();

const app = express();

// ==========================================
// CORS CONFIGURATION
// ==========================================
const allowedOrigins = [
  "https://agriculture-project-pz8n.vercel.app",
  "http://localhost:5173",
];

if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ==========================================
// MIDDLEWARE
// ==========================================
app.use(express.json());

// ==========================================
// DATABASE
// ==========================================
connectDB();

// ==========================================
// ROUTES
// ==========================================
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/buyer-requests", buyerRequestRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/outreach", outreachRoutes);

// ==========================================
// HEALTH CHECK
// ==========================================
app.get("/", (req, res) => {
  res.json({
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
// SERVER
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`AgriConnect AI server running on port ${PORT}`);
});
