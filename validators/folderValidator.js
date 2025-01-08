const { body } = require("express-validator");

const validateFolder = [
  body("name")
    .trim()
    .isLength({ Min: 1, Max: 255 })
    .withMessage("Folder name needs to be between 1 and 255 characters"),
];

module.exports = { validateFolder };
