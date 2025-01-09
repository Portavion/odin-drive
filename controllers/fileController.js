const { validationResult } = require("express-validator");
const prisma = require("../db/prisma");
const validators = require("../validators");
const multer = require("multer");
const supabase = require("./db/supabase");

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "uploads/");
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

exports.renderUpload = async (req, res) => {
  const currentFolderId = Number(req.query.currentFolderId);

  if (!currentFolderId || currentFolderId == 0) {
    const folderName = "root";
    res.render("upload", {
      currentFolderName: "root",
      currentFolderId: 0,
      user: req.user,
    });
    return;
  }

  const currentFolder = await prisma.folder.findUnique({
    where: { id: currentFolderId },
  });

  res.render("upload", {
    currentFolderName: currentFolder.folderName,
    currentFolderId: currentFolderId,
    user: req.user,
  });
};

exports.uploadFile = [
  upload.single("file"),

  validators.validateFile,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).render("upload", { errors: errors.array() });
    }

    const userId = Number(req.user.id);
    const fileUrl = req.file.path;
    const filename = req.file.filename;
    const size = req.file.size;
    const currentFolderId = Number(req.query.currentFolderId);

    if (currentFolderId == 0) {
      await prisma.file.create({
        data: { url: fileUrl, userId: userId, filename: filename, size: size },
      });
    } else {
      await prisma.file.create({
        data: {
          filename: filename,
          url: fileUrl,
          folderId: currentFolderId,
          userId: userId,
        },
      });
    }
    res.redirect(`/?id=${currentFolderId}`);
  },
];

exports.renameFile = [
  validators.validateFolder,
  async (req, res) => {
    const errors = validationResult(req);
    const fileId = Number(req.query.fileId);
    const filename = req.body.name;

    if (!errors.isEmpty()) {
      return res.status(400).render("upload", { errors: errors.array() });
    }

    const renamedFile = await prisma.file.update({
      where: { id: fileId },
      data: {
        filename: filename,
      },
    });

    res.redirect(`/?id=${renamedFile.folderId}`);
  },
];

exports.deleteFile = async (req, res) => {
  const fileId = Number(req.params.fileId);
  const deletedFile = await prisma.file.delete({
    where: { id: fileId },
  });
  const folderRedirect =
    deletedFile.folderId == null ? 0 : deletedFile.folderId;
  res.redirect(`/?id=${folderRedirect}`);
};

exports.renderDetails = async (req, res) => {
  const fileId = Number(req.params.fileId);
  const file = await prisma.file.findUnique({
    where: { id: fileId },
  });
  const filename = file.filename.split("/")[-1];
  res.render("filedetails", {
    name: file.filename,
    fileUrl: file.url,
    size: file.size,
    uploadDate: file.uploadDate,
    folderId: file.folderId == null ? 0 : file.folderId,
  });
};
