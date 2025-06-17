const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const userAuth = require("../MiddleWares/userAuth");
const { uploadHealthRecord, getRecords } = require("../Controllers/UploadHealthRecord");

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "health-records",
    resource_type: "raw", // PDF ke liye
    allowedFormats: ["pdf"],
  },
});

const upload = multer({ storage });

router.post("/uploadHealthRecord", userAuth, upload.single("file"), uploadHealthRecord);
router.get("/getRecords", userAuth, getRecords);

module.exports = router;
