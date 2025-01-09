const { validationResult } = require("express-validator");
const prisma = require("../db/prisma");
const validators = require("../validators");
const { createClient } = require("@supabase/supabase-js");
// Create Supabase client
const supabase = createClient(
  `${process.env.SUPABASE_URL}`,
  `${process.env.SUPABASE_ANON_KEY}`,
);

exports.renderForm = async (req, res, next) => {
  const id = Number(req.query.id);
  const queryString = req.type === "file" ? "fileId" : "parentFolderId";
  let newFolder;

  if (!id || id == 0) {
    const folderName = "root";
    res.render("folderForm", {
      name: folderName,
      id: 0,
      action: req.action,
      type: req.type,
      queryString: queryString,
    });
    return;
  }
  if (req.type === "folder") {
    try {
      newFolder = await prisma.folder.findUnique({
        where: { id: id },
      });
    } catch (errors) {
      return next(errors);
    }
    const folderName = newFolder.folderName;
    res.render("folderForm", {
      name: folderName,
      id: id,
      action: req.action,
      type: req.type,
      queryString: queryString,
    });
  } else if (req.type === "file") {
    try {
      file = await prisma.file.findUnique({
        where: { id: id },
      });
    } catch (errors) {
      return next(errors);
    }
    const filename = file.filename;
    res.render("folderForm", {
      name: filename,
      id: id,
      action: req.action,
      type: req.type,
      queryString: queryString,
    });
  }
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

    res.redirect(`/?id=${parentFolderId}`);
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

    res.redirect(`/?id=${renamedFolder.parentFolderId}`);
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

  const deleteFolderFiles = await prisma.file.findMany({
    where: { folderId: folderId },
  });

  for (const file of deleteFolderFiles) {
    const deletedFile = await prisma.file.delete({
      where: { id: file.id },
    });

    const filename = deletedFile.filename;
    const fileId = deletedFile.id;

    const { data, error } = await supabase.storage
      .from("drive")
      .remove([`public/${fileId}_${filename}`]);
  }

  await prisma.folder.delete({
    where: { id: folderId },
  });
}
