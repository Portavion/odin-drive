const express = require("express");
const router = express.Router();
const folderController = require("../controllers/folderController");

/* GET /folder/create  */
router.get("/create", (req, res, next) => {
  req.action = "create";
  req.type = "folder";
  folderController.renderForm(req, res, next);
});
router.get("/rename", (req, res, next) => {
  req.action = "rename";
  req.type = "folder";
  folderController.renderForm(req, res, next);
});

router.get("/delete/:folderId", folderController.deleteFolder);

/* POST /file/  */
router.post("/create", folderController.createFolder);
router.post("/rename", folderController.renameFolder);

module.exports = router;
