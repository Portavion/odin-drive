const { body } = require("express-validator");

const validateFile = [
  body("file").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("A file is required");
    }
    return true;
  }),
];

module.exports = { validateFile };
