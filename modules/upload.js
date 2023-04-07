const multer = require("multer");
const { v4 } = require("uuid");

const extMap = {
  "image/gif": ".gif",
  "image/png": ".png",
  "image/jpeg": ".jpg",
};

const fileFilter = (req, file, cb) => {
  cb(null, !!extMap[file.mimetype]);
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __dirname + "/../public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, v4() + extMap[file.mimetype]);
  },
});

module.exports = multer({ fileFilter, storage });
