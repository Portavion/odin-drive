const express = require("express");
const router = express.Router();
const fileController = require("../controllers/fileController");

/* GET /file/  */
router.get("/upload", fileController.renderUpload);

/* POST /file/  */
router.post("/upload", fileController.uploadFile);

module.exports = router;
