const User = require("../models/User");
const { generateToken } = require("../utils/token");
const passport = require("passport");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });

    // If user exists but doesn't have a password, allow setting it
    if (user) {
      if (!user.password) {
        user.name = name;
        user.password = password;
        await user.save();

        const authResponse = generateAuthResponse(user);
        return res.status(200).json({
          success: true,
          message: "User registered successfully with email and password",
          ...authResponse,
        });
      }

      // User already has a password, so deny registration
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // If user doesn't exist, create new one
    user = new User({
      name,
      email,
      password,
    });

    await user.save();


    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if password is correct
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Set token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use HTTPS in production
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send user info
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        skills: user.skills,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @route GET /api/auth/google
exports.  googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

// @route GET /api/auth/google/callback
exports.googleCallback = (req, res, next) => {
  passport.authenticate("google", { session: false }, (err, user) => {
    if (err) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_error`);
    }

    if (!user) {
      return res.redirect(
        `${process.env.CLIENT_URL}/login?error=user_not_found`
      );
    }

    // Generate JWT token
    const token = generateToken(user);

    // Set the token in a secure HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to frontend without token in URL
    res.redirect(`${process.env.CLIENT_URL}/oauth-success`);
  })(req, res, next);
};

// @route GET /api/auth/github
exports.githubAuth = passport.authenticate("github", {
  scope: ["user:email"],
});

// @route GET /api/auth/github/callback
exports.githubCallback = (req, res, next) => {
  passport.authenticate("github", { session: false }, (err, user) => {
    if (err) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_error`);
    }

    if (!user) {
      return res.redirect(
        `${process.env.CLIENT_URL}/login?error=user_not_found`
      );
    }

    // Generate JWT token
    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to client with token
    res.redirect(
      `${process.env.CLIENT_URL}/oauth-success`
    );
  })(req, res, next);
};

// @route GET /api/auth/facebook
exports.facebookAuth = passport.authenticate("facebook", {
  scope: ["email"],
});

// @route GET /api/auth/facebook/callback
exports.facebookCallback = (req, res, next) => {
  passport.authenticate("facebook", { session: false }, (err, user) => {
    if (err) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_error`);
    }

    if (!user) {
      return res.redirect(
        `${process.env.CLIENT_URL}/login?error=user_not_found`
      );
    }

    // Generate JWT token
    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to client with token
    res.redirect(
      `${process.env.CLIENT_URL}/oauth-success`
    );
  })(req, res, next);
};
