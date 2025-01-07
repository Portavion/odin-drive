const express = require("express");
const router = express.Router();
const renderController = require("../controllers/renderController");

/* GET home page. */
router.get("/", renderController.renderIndex);

module.exports = router;
