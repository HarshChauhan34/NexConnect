import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const originalName = (file.originalname || "chat-file").trim();
    const originalParts = originalName.split(".");
    const hasExtension = originalParts.length > 1;
    const extension = hasExtension
      ? originalParts.pop()?.toLowerCase().replace(/[^a-z0-9]/g, "")
      : "";
    const baseName = hasExtension ? originalParts.join(".") : originalName;
    const sanitizedBaseName =
      baseName
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") || "chat-file";

    const isImage = file.mimetype?.startsWith("image/");
    const publicIdBase = `${Date.now()}-${sanitizedBaseName}`;
    const publicId =
      !isImage && extension ? `${publicIdBase}.${extension}` : publicIdBase;

    return {
      folder: "realtime-chat-app",
      resource_type: isImage ? "image" : "raw",
      type: "upload",
      access_mode: "public",
      public_id: publicId,
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
