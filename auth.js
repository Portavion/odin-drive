// auth.js
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const prisma = require("./db/prisma");

const loginQuery = "SELECT * FROM users WHERE username = ($1)";
const serializeQuery = "SELECT * FROM users WHERE user_id = $1";

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      // const { rows } = await db.query(loginQuery, [username]);
      const userMatch = await prisma.user.findUnique({
        where: {
          username: username,
        },
      });

      if (!userMatch) {
        return done(null, false, { message: "Incorrect username" });
      }

      const match = await bcrypt.compare(password, userMatch.password);
      if (!match) {
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, userMatch);
    } catch (err) {
      return done(err);
    }
  }),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    // const { rows } = await db.query(serializeQuery, [id]);
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport; // Export the configured passport object
