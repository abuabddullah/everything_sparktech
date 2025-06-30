const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const logger = require("../helpers/logger");
const { getUserById } = require("../modules/User/user.service");
const { getUserByGoogleId, getUserByFacebookId, addUser } = require("../modules/Auth/auth.service");
require("dotenv").config();

const googleAppId = process.env.GOOGLE_CLIENT_ID;
const googleAppSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL;

const facebookAppId = process.env.FACEBOOK_CLIENT_ID;
const facebookAppSecret = process.env.FACEBOOK_CLIENT_SECRET;
const facebookCallbackUrl = process.env.FACEBOOK_CALLBACK_URL;

passport.serializeUser((user, done) => {
  try {
    console.log("---------------- inside serializeUser ----------------");
    done(null, user._id); // save the user id to the session
  }
  catch (error) {
    logger.error(error, "Error in Serialize User");
    done(error, null);
  }
});

passport.deserializeUser(async (id, done) => {
  try {
    console.log("----------------inside deserializeUser----------------, id: ", id, "----------------");
    const user = await getUserById(id);
    if (!user) {
      return done(null, false);
    }
    done(null, user); // save the user to req.user
  } catch (error) {
    logger.error(error, "Error in De-serialize User");
    return done(error);
  }
});

passport.use(new GoogleStrategy({
  clientID: googleAppId,
  clientSecret: googleAppSecret,
  callbackURL: googleCallbackUrl
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await getUserByGoogleId(profile.id);
    let isNewUser = false;

    if (!user) {
      const newUser = {
        googleId: profile?.id,
        fullName: profile?.displayName,
        provider: "google",
        email: profile?.emails && profile?.emails[0]?.value,
        image: profile?.photos && profile?.photos[0]?.value
      };

      user = await addUser(newUser);
      isNewUser = true;
    }

    // Add the isNewUser flag to the user object
    const userWithIsNewUser = { ...user.toObject(), isNewUser };

    return done(null, userWithIsNewUser);
  } catch (error) {
    logger.error(error, "Error in Google Strategy");
    done(error, null);
  }
}));

passport.use(new FacebookStrategy({
  clientID: facebookAppId,
  clientSecret: facebookAppSecret,
  callbackURL: facebookCallbackUrl,
  profileFields: ['id', 'displayName', 'photos', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await getUserByFacebookId(profile.id);
    let isNewUser = false;

    if (!user) {
      const newUser = {
        facebookId: profile?.id,
        fullName: profile?.displayName,
        provider: "facebook",
        email: profile?.emails && profile?.emails[0]?.value,
        image: profile?.photos && profile?.photos[0]?.value
      };

      user = await addUser(newUser);
      isNewUser = true;
    }

    // Add the isNewUser flag to the user object
    const userWithIsNewUser = { ...user.toObject(), isNewUser };

    return done(null, userWithIsNewUser);
  } catch (error) {
    logger.error(error, "Error in Facebook Strategy");
    done(error, null);
  }
}));

module.exports = passport;