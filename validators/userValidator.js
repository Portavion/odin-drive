const { body } = require("express-validator");
const prisma = require("../db/prisma");

// error messages
const lengthErr = "must be between 1 and 20 characters.";

const validateNewUser = [
  body("username")
    .trim()
    .toLowerCase()
    .isLength({ min: 1, max: 20 })
    .withMessage(`Username ${lengthErr}`)
    .custom(async (value, { req }) => {
      const usernameMatchCount = await prisma.user.count({
        where: { username: value },
      });

      if (!(usernameMatchCount < 1)) {
        throw new Error("Username already in use ");
      }
      return value;
    }),
  body("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage(`Email is not a valid email`)
    .isLength({ min: 1, max: 20 })
    .withMessage(`Last name ${lengthErr}`)
    .custom(async (value, { req }) => {
      const emailMatchCount = await prisma.user.count({
        where: { email: value },
      });

      if (!(emailMatchCount < 1)) {
        throw new Error("Email already in use");
      }
      return value;
    }),
  body("password")
    .isLength({ min: 5, max: 20 })
    .withMessage("Password should be between 5 and 20 characters"),
  body("confirm-password")
    .custom((value, { req }) => {
      if (!(value === req.body.password)) {
        throw new Error("password confirmation doesn't match desired password");
      }
      return value === req.body.password;
    })
    .withMessage("password confirmation doesn't match desired password"),
];

module.exports = { validateNewUser };
