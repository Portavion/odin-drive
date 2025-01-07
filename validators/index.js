// validators/index.js
const userValidator = require("./userValidator");
const fileValidator = require("./fileValidator.js");

module.exports = {
  ...userValidator,
  ...fileValidator,
  // ... add more validators as needed
};
