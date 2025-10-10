const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "testimonials",
    resource_type: "auto", // supports image + video
    public_id: file.originalname.split(".")[0],
  }),
});

const upload = multer({ storage });

// ✅ Export multer fields + cloudinary instance
module.exports = {
  uploadFields: upload.fields([
    { name: "media", maxCount: 1 },
    { name: "profilePicture", maxCount: 1 },
  ]),
  cloudinary,
};
