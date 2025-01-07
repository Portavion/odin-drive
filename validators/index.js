// validators/index.js
const userValidator = require("./userValidator");

module.exports = {
  ...userValidator,
  // ... add more validators as needed
};
