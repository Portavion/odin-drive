const { validationResult } = require("express-validator");
const validators = require("../validators");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "uploads/");
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

exports.renderUpload = (req, res) => {
  res.render("upload");
};

exports.uploadFile = [
  upload.single("file"),
  validators.validateFile,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("upload", { errors: errors.array() });
    }

    res.redirect("/");
  },
];
