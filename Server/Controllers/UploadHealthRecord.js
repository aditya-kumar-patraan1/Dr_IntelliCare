const fs = require("fs");
const myModel = require("../Models/Schema");
const cloudinary = require("cloudinary").v2;
require("dotenv").config(); // Make sure this is present

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// const uploadHealthRecord = async (req, res) => {
//     const userId = req.body.userId;
//     console.log("Uploaded File: ", req.file);
//     try {

//         if (!req.file) {
//             return res.status(400).json({ error: "No file received" });
//         }

//         const result = await cloudinary.uploader.upload(req.file.path, {
//             folder: "health-records",
//             use_filename: true,
//             unique_filename: false,
//             resource_type: "raw", // important for PDF files
//         });

//         console.log("Upload Success:", result.secure_url);

//         fs.unlinkSync(req.file.path);

//         const targetedUser = await myModel.findById(userId);

// //         if (!targetedUser) {
// //   return res.status(404).json({ error: "User not found" });
// // }

//         if()

//         targetedUser.allDocuments.push({ title: "my-file-1", fileLink: result.secure_url });

//         await targetedUser.save();

//         res.json({ url: result.secure_url });
//     } catch (e) {
//         console.error("Cloudinary upload error:", e);
//         res.status(500).json({ error: "Upload failed", details: e.message });
//     }
// };

// const uploadHealthRecord = async (req, res) => {
//     const userId = req.body.userId;
//     const {cloudinaryUrl,fileName} = req.body;
//     console.log("Uploaded File: ", fileName);
//     console.log("CloudinaryUrl : ",cloudinaryUrl);

//     // try {
//     //     if (!req.file) {
//     //         return res.status(400).json({ error: "No file received" });
//     //     }

//     //     const result = await cloudinary.uploader.upload(req.file.path, {
//     //         folder: "health-records",
//     //         use_filename: true,
//     //         unique_filename: false,
//     //         resource_type: "raw", // important for PDF, docx, etc.
//     //     });

//     //     // console.log("Upload Success:", result.secure_url);

//     //     fs.unlinkSync(req.file.path);

//     //     const targetedUser = await myModel.findById(userId);

//     //     if (!targetedUser) {
//     //         return res.status(404).json({ error: "User not found" });
//     //     }

        
//     //     targetedUser.allDocuments.push({
//     //         title: req.file.originalname, 
//     //         fileLink: result.secure_url,
//     //         uploadedAt: new Date(),
//     //     });
        
//     //     await targetedUser.save();
        
//     //     console.log(targetedUser);
//     //     res.json({ success: true, url: result.secure_url });
//     // } catch (e) {
//     //     res.status(500).json({ error: "Upload failed", details: e.message });
//     // }
// };


const uploadHealthRecord = async (req, res) => {
  const { userId, cloudinaryUrl, fileName } = req.body;

//   console.log("Uploaded File: ", fileName);
//   console.log("Cloudinary URL: ", cloudinaryUrl);

  try {
    if (!userId || !cloudinaryUrl || !fileName) {
      return res.status(400).json({ error: "Missing fields in request body" });
    }

    const targetedUser = await myModel.findById(userId);

    if (!targetedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    targetedUser.allDocuments.push({
      title: fileName,
      fileLink: cloudinaryUrl,
      uploadedAt: new Date(),
    });

    await targetedUser.save();

    res.json({ success: true, url: cloudinaryUrl });
  } catch (e) {
    res.status(500).json({ error: "Upload failed", details: e.message });
  }
};


const getRecords = async (req, res) => {
    const userId = req.body.userId;

    // console.log("heehehe");
    // console.log(userId);

    try {

        const targetedUser = await myModel.findById(userId);

        // console.log(targetedUser.allDocuments);
        return res.json({
            success: true,
            myData: targetedUser.allDocuments
        });
    } catch (e) {
        return res.json({
            success: false,
            myData: null
        });
    }

}

module.exports = { uploadHealthRecord, getRecords };