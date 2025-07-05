const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      minlength: 6,
    },
    avatar: {
      type: String,
      default:
        "https://img1.pnghut.com/21/23/15/vVJVENtiMw/logo-user-profile-emoticon-hamburger-button-avatar.jpg",
    },
    googleId: {
      type: String,
      sparse: true,
    },
    githubId: {
      type: String,
      sparse: true,
    },
    facebookId: {
      type: String,
      sparse: true,
    },
    skills: [String],
  },
  {
    timestamps: true,
  }
);

// Create index for social IDs
UserSchema.index({ googleId: 1 }, { sparse: true });
UserSchema.index({ githubId: 1 }, { sparse: true });
UserSchema.index({ facebookId: 1 }, { sparse: true });

// Hash password before saving
UserSchema.pre("save", async function (next) {
  const user = this;

  // Only hash the password if it has been modified or is new
  if (!user.isModified("password") || !user.password) return next();

  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    // Hash password
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    // If user doesn't have a password (social login only), return false
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Method to check if user has a social login
UserSchema.methods.hasSocialLogin = function () {
  return !!(this.googleId || this.githubId || this.facebookId);
};

module.exports = mongoose.model("User", UserSchema);
