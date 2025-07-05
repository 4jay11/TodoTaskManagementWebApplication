const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
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

app.use('/api/auth', authRoutes);

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