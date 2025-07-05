const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/User");

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/api/auth/google/callback`,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({
          $or: [{ googleId: profile.id }, { email: profile.emails[0].value }],
        });

        if (user) {
          // If user exists but doesn't have googleId, update it
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
          return done(null, user);
        }

        // Create new user
        user = new User({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          avatar: profile.photos[0].value,
        });

        await user.save();
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// GitHub OAuth Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL:`${process.env.BASE_URL}/api/auth/github/callback`,
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Get email from GitHub profile
        const email = profile.emails && profile.emails[0].value;

        if (!email) {
          return done(new Error("GitHub email not available"), null);
        }

        // Check if user already exists
        let user = await User.findOne({
          $or: [{ githubId: profile.id }, { email }],
        });

        if (user) {
          // If user exists but doesn't have githubId, update it
          if (!user.githubId) {
            user.githubId = profile.id;
            await user.save();
          }
          return done(null, user);
        }

        // Create new user
        user = new User({
          githubId: profile.id,
          email,
          name: profile.displayName || profile.username,
          avatar: profile.photos[0].value,
        });

        await user.save();
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Facebook OAuth Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: `${process.env.BASE_URL}/api/auth/facebook/callback`,
      profileFields: ["id", "displayName", "photos", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Get email from Facebook profile
        const email = profile.emails && profile.emails[0].value;

        if (!email) {
          return done(new Error("Facebook email not available"), null);
        }

        // Check if user already exists
        let user = await User.findOne({
          $or: [{ facebookId: profile.id }, { email }],
        });

        if (user) {
          // If user exists but doesn't have facebookId, update it
          if (!user.facebookId) {
            user.facebookId = profile.id;
            await user.save();
          }
          return done(null, user);
        }

        // Create new user
        user = new User({
          facebookId: profile.id,
          email,
          name: profile.displayName,
          avatar: profile.photos[0].value,
        });

        await user.save();
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);
