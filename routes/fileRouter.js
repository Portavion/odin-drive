const express = require("express");
const router = express.Router();
const fileController = require("../controllers/fileController");
const folderController = require("../controllers/folderController");

/* GET /file/  */
router.get("/upload", fileController.renderUpload);
router.get("/rename", (req, res, next) => {
  req.action = "rename";
  req.type = "file";
  folderController.renderForm(req, res, next);
});
router.get("/delete/:fileId", fileController.deleteFile);
router.get("/details/:fileId", fileController.renderDetails);

/* POST /file/  */
router.post("/upload", fileController.uploadFile);
router.post("/rename", fileController.renameFile);

module.exports = router;
