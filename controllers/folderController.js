const { validationResult } = require("express-validator");
const prisma = require("../db/prisma");
const validators = require("../validators");

exports.renderForm = async (req, res, next) => {
  const folderId = Number(req.query.parentFolderId)
    ? Number(req.query.parentFolderId)
    : Number(req.query.folderId);
  let newFolder;

  if (!folderId || folderId == 0) {
    const folderName = "root";
    res.render("folderForm", {
      parentFolderName: folderName,
      parentFolderId: 0,
      action: req.action,
    });
    return;
  }

  try {
    newFolder = await prisma.folder.findUnique({
      where: { id: folderId },
    });
  } catch (errors) {
    return next(errors);
  }

  const folderName = newFolder.folderName;
  res.render("folderForm", {
    parentFolderName: folderName,
    parentFolderId: folderId,
    action: req.action,
  });
};

exports.createFolder = [
  validators.validateFolder,
  async (req, res) => {
    const errors = validationResult(req);
    const parentFolderId = Number(req.query.parentFolderId);
    const folderName = req.body.name;

    if (!errors.isEmpty()) {
      return res.status(400).render("upload", { errors: errors.array() });
    }

    await prisma.folder.create({
      data: {
        userId: req.user.id,
        folderName: folderName,
        parentFolderId: parentFolderId,
      },
    });

    res.redirect(`/?currentFolderId=${parentFolderId}`);
  },
];

exports.renameFolder = [
  validators.validateFolder,
  async (req, res) => {
    const errors = validationResult(req);
    const parentFolderId = Number(req.query.parentFolderId);
    const folderName = req.body.name;

    if (!errors.isEmpty()) {
      return res.status(400).render("upload", { errors: errors.array() });
    }

    const renamedFolder = await prisma.folder.update({
      where: { id: parentFolderId },
      data: {
        folderName: folderName,
      },
    });

    res.redirect(`/?currentFolderId=${renamedFolder.parentFolderId}`);
  },
];

exports.deleteFolder = async (req, res) => {
  const folderId = Number(req.params.folderId);
  const deletedFolder = await prisma.folder.findUnique({
    where: { id: folderId },
  });

  await deleteFolder(folderId);

  res.redirect(`/?currentFolderId=${deletedFolder.parentFolderId}`);
};

async function deleteFolder(folderId) {
  const deletedFolderChildren = await prisma.folder.findMany({
    where: { parentFolderId: folderId },
  });

  if (deletedFolderChildren.length > 0) {
    for (const childFolder of deletedFolderChildren) {
      await deleteFolder(childFolder.id);
    }
  }
  await prisma.folder.delete({
    where: { id: folderId },
  });
}
