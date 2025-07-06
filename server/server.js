const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const taskRoutes = require("./routes/taskRoutes");
const userTaskRoutes = require("./routes/userTaskRoutes");
const subTaskRoutes = require("./routes/subTaskRoutes");
const cors = require("cors");
const app = express();
const connectDB = require("./config/db");
require("dotenv").config();
require("./config/passport");
app.use(express.json());
app.use(cookieParser());

// Configure CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL, // Allow requests from frontend
    credentials: true, // Allow cookies and Authorization headers
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/user-tasks", userTaskRoutes);
app.use("/api/subtasks", subTaskRoutes);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(process.env.PORT || 8000, () => {
      console.log("Server is running on port 8000");
    });
  } catch (err) {
    console.log(err);
  }
};

startServer();