const express = require("express");
const router = express.Router();
const folderRouter = require("../controllers/folderController");

/* GET /folder/create  */
router.get("/create", (req, res, next) => {
  req.action = "create";
  folderRouter.renderForm(req, res, next);
});
router.get("/rename", (req, res, next) => {
  req.action = "rename";
  folderRouter.renderForm(req, res, next);
});

router.get("/delete/:folderId", folderRouter.deleteFolder);

/* POST /file/  */
router.post("/create", folderRouter.createFolder);
router.post("/rename", folderRouter.renameFolder);

module.exports = router;
