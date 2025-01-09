const { validationResult } = require("express-validator");
const prisma = require("../db/prisma");
const validators = require("../validators");
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");
// Create Supabase client
const supabase = createClient(
  `${process.env.SUPABASE_URL}`,
  `${process.env.SUPABASE_ANON_KEY}`,
);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

async function uploadFile(file, id) {
  const { data, error } = await supabase.storage
    .from("drive")
    // .upload(`public/${id}_${file.filename}`, file);
    .upload(`public/${id}_${file.originalname}`, file.buffer, {
      contentType: "text/plain", // Adjust content type if necessary
    });
  if (error) {
  } else {
    return data;
  }
}

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
    const file = req.file;
    // const fileUrl = req.file.originalName;
    const fileUrl = "notyet";
    const filename = req.file.originalname;
    const size = req.file.size;
    const currentFolderId = Number(req.query.currentFolderId);
    let newFile;

    if (currentFolderId == 0) {
      newFile = await prisma.file.create({
        data: { url: fileUrl, userId: userId, filename: filename, size: size },
      });
    } else {
      newFile = await prisma.file.create({
        data: {
          filename: filename,
          url: fileUrl,
          folderId: currentFolderId,
          userId: userId,
          size: size,
        },
      });
    }

    const supabaseFile = await uploadFile(file, newFile.id);

    await prisma.file.update({
      where: { id: Number(newFile.id) },
      data: { url: supabaseFile.fullPath },
    });
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

    const oldFile = await prisma.file.findUnique({
      where: { id: fileId },
    });

    const olfFileName = oldFile.filename;
    const { data, error } = await supabase.storage
      .from("drive")
      .move(`public/${fileId}_${olfFileName}`, `public/${fileId}_${filename}`);

    const renamedFile = await prisma.file.update({
      where: { id: fileId },
      data: {
        filename: filename,
      },
    });
    console.log(renamedFile);
    const redirectId = renamedFile.folderId ? Number(renamedFile.folderId) : 0;
    res.redirect(`/?id=${redirectId}`);
  },
];

exports.deleteFile = async (req, res) => {
  const fileId = Number(req.params.fileId);

  const deletedFile = await prisma.file.delete({
    where: { id: fileId },
  });
  const filename = deletedFile.filename;

  const { data, error } = await supabase.storage
    .from("drive")
    .remove([`public/${fileId}_${filename}`]);

  const folderRedirect =
    deletedFile.folderId == null ? 0 : deletedFile.folderId;
  res.redirect(`/?id=${folderRedirect}`);
};

exports.fileDownload = async (req, res) => {
  const filename = req.params.filename;
  try {
    // Download the file from Supabase Storage
    const { data, error } = await supabase.storage
      .from("drive")
      .download(`public/${filename}`);

    if (error) {
      return res.status(500).json({ error: "Failed to download file" });
    }

    const buffer = Buffer.from(await data.arrayBuffer());
    const dlFileName = filename.split("_")[1];

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${dlFileName}"`,
    );
    res.setHeader("Content-Type", "text/plain"); // Adjust if needed

    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.renderDetails = async (req, res) => {
  const fileId = Number(req.params.fileId);
  const file = await prisma.file.findUnique({
    where: { id: fileId },
  });

  res.render("filedetails", {
    name: file.filename,
    fileId: fileId,
    size: file.size,
    uploadDate: file.uploadDate,
    folderId: file.folderId == null ? 0 : file.folderId,
  });
};
