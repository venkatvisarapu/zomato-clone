require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

console.log("🚀 Server is starting...");

// Graceful shutdown and error handling
process.on("uncaughtException", (err) => {
  console.error("❌ UNCAUGHT EXCEPTION! Shutting down...", err);
  process.exit(1);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ UNHANDLED REJECTION! Shutting down...", reason);
  process.exit(1);
});

const mongoURI = process.env.MONGO_URI;

mongoose
  .connect(mongoURI, {})
  .then(() => console.log("✅ MongoDB Atlas Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`📢 Request: ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
const restaurantRoutes = require("./routes/restaurantRoutes");
const countryRoutes = require("./routes/countryRoutes");
const imageSearchRoutes = require("./routes/imageSearchRoutes");

app.get("/", (req, res) => res.send("Welcome to the Zomato Clone API!"));
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/countries", countryRoutes);
app.use("/api/image", imageSearchRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR HANDLER:", err.stack);
  res.status(500).json({ error: "An internal server error occurred.", details: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));