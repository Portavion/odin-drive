// validators/index.js
const userValidator = require("./userValidator.js");
const fileValidator = require("./fileValidator.js");
const folderValidator = require("./folderValidator.js");

module.exports = {
  ...userValidator,
  ...fileValidator,
  ...folderValidator,
  // ... add more validators as needed
};
