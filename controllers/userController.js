const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const prisma = require("../db/prisma");
const validators = require("../validators");
const passport = require("../auth.js"); // Import from your auth module

exports.renderSignup = (req, res) => {
  res.render("signup");
};

exports.renderLogin = (req, res) => {
  res.render("login");
};

exports.loginUser = (req, res, next) => {
  passport.authenticate("local", (error, user, info) => {
    if (error) {
      return next(error);
    }
    if (!user) {
      const errors = [{ msg: info.message }];
      return res.render("login", { errors });
    }
    req.logIn(user, (error) => {
      if (error) {
        return next(error);
      }
      return res.redirect("/");
    });
  })(req, res, next);
};

exports.logoutUser = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};

exports.registerUser = [
  validators.validateNewUser,
  async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).render("signup", { errors: errors.array() });
    }

    bcrypt.hash(password, 10, async (error, hashedPassword) => {
      if (error) {
        return next(error);
      } else {
        try {
          await prisma.user.create({
            data: {
              username: username,
              email: email,
              password: hashedPassword,
            },
          });
          res.redirect("/");
        } catch (error) {
          return next(error);
        }
      }
    });
  },
];
