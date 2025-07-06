const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
const {
  registerValidation,
  loginValidation,
} = require("../middleware/authValidation");

// @route   POST /api/auth/register
router.post("/register", registerValidation, authController.register);

// @route   POST /api/auth/login
router.post("/login", loginValidation, authController.login);

// @route   GET /api/auth/me
router.get("/me", authenticate, authController.getProfile);

// @route   GET /api/auth/users
router.get("/users", authenticate, authController.getAllUsers);

// @route   GET /api/auth/users/:id
router.get("/users/:id", authenticate, authController.getUserById);

// @route   POST /api/auth/users/search
router.post("/users/search", authenticate, authController.searchUsers);

// @route   GET /api/auth/google
router.get("/google", authController.googleAuth);

// @route   GET /api/auth/google/callback
router.get("/google/callback", authController.googleCallback);

// @route   GET /api/auth/github
router.get("/github", authController.githubAuth);

// @route   GET /api/auth/github/callback
router.get("/github/callback", authController.githubCallback);

// @route   GET /api/auth/facebook
router.get("/facebook", authController.facebookAuth);

// @route   GET /api/auth/facebook/callback
router.get("/facebook/callback", authController.facebookCallback);

module.exports = router;
