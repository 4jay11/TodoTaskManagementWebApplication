const validator = require("validator");

// Middleware for registration validation
exports.registerValidation = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || validator.isEmpty(name.trim())) {
    errors.push("Name is required.");
  }

  if (!email || !validator.isEmail(email)) {
    errors.push("A valid email is required.");
  }

  if (!password || !validator.isLength(password, { min: 6 })) {
    errors.push("Password must be at least 6 characters long.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

// Middleware for login validation
exports.loginValidation = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !validator.isEmail(email)) {
    errors.push("A valid email is required.");
  }

  if (!password || validator.isEmpty(password)) {
    errors.push("Password is required.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};
