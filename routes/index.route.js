const express = require("express");
const routes = express.Router();
const upload = require("../config/multer.config");
const fileModel = require("../model/files.models");
const authMiddlewares = require("../middlewares/auth");
const fireBase = require("../config/firebase.config");

routes.get("/home", authMiddlewares, async (req, res) => {
  const userFile = await fileModel.find({
    user: req.user.userId,
  });
  res.render("home", {
    files: userFile,
  });
});

routes.post(
  "/upload",
  authMiddlewares,
  upload.single("file"),
  async (req, res) => {
    const newFile = await fileModel.create({
      path: req.file.path,
      originalname: req.file.originalname,
      user: req.user.userId,
    });
    res.send(newFile);
  }
);

// routes.get("/download/:path", authMiddlewares, async (req, res) => {
//   const loginUser = req.user.userId;
//   const path = req.params.path;

//   const file = await fileModel.findOne({
//     user: loginUser,
//     path: path,
//   });
//   if (!file) {
//     res.status(404).json({ message: "UnAuthorized" });
//   }
//   const singedURL = await fireBase
//     .storage()
//     .bucket()
//     .file(path)
//     .getSignedUrl({
//       action: "read",
//       expires: Date.now() + 60 * 1000,
//     });
//   res.redirect(singedURL[0]);
// });

routes.get("/download/:path", authMiddlewares, async (req, res) => {
  const loginUser = req.user.userId;
  const path = req.params.path;

  const file = await fileModel.findOne({ user: loginUser, path });
  if (!file) return res.status(404).json({ message: "Unauthorized" });

  const bucket = fireBase.storage().bucket();
  const remoteFile = bucket.file(path);

  // Stream the file directly from Firebase to the response
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${file.originalname}"`);

  remoteFile.createReadStream()
    .on('error', (err) => {
      console.error("Firebase file stream error:", err);
      res.status(500).json({ message: "Error downloading file." });
    })
    .pipe(res);
});
module.exports = routes;
