const prisma = require("../db/prisma");

exports.renderIndex = async (req, res) => {
  const user = req.user;
  if (!user) {
    res.render("index");
    return;
  }
  const currentFolderId = req.query.id === undefined ? 0 : Number(req.query.id);

  const folderList = await prisma.folder.findMany({
    where: { userId: user.id, parentFolderId: currentFolderId },
    orderBy: { folderName: "asc" },
  });

  const fileList = await prisma.file.findMany({
    where: {
      userId: user.id,
      folderId: currentFolderId == 0 ? null : currentFolderId,
    },
    orderBy: { filename: "asc" },
  });

  let currentFolder =
    currentFolderId == 0
      ? { folderName: "root" }
      : await prisma.folder.findUnique({
          where: {
            id: currentFolderId,
          },
        });

  res.render("index", {
    user: req.user,
    currentFolder: currentFolder,
    currentFolderId: currentFolderId,
    folderList: folderList,
    fileList: fileList,
  });
};
