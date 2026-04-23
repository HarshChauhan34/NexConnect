import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const originalName =
      file.originalname
        ?.split(".")
        ?.slice(0, -1)
        ?.join(".")
        ?.replace(/\s+/g, "-") || "chat-file";

    const isImage = file.mimetype?.startsWith("image/");

    return {
      folder: "realtime-chat-app",
      resource_type: isImage ? "image" : "raw",
      public_id: `${Date.now()}-${originalName}`,
    };
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

export default upload;