// routes/upload.js
import express from "express";
import multer from "multer";
import { S3Client, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const upload = multer(); // store files in memory

const router = express.Router();

// Single file upload
router.post("/single", upload.single("file"), async (req, res) => {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `uploads/${Date.now()}-${req.file.originalname}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      //   ACL: "public-read",
    };

    await s3Client.send(new PutObjectCommand(params));

    const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;

    res.json({ success: true, fileUrl });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Gallery photo upload to S3 bucket (unma folder)
router.post("/gallery", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file provided" });
    }

    // Validate file type (images only)
    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        error: "Invalid file type. Only images (JPEG, PNG, GIF, WEBP) are allowed."
      });
    }

    const bucketName = process.env.S3_BUCKET_NAME;
    const folderPrefix = "unma-summit-2025/";
    const params = {
      Bucket: bucketName,
      Key: `${folderPrefix}${Date.now()}-${req.file.originalname}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    await s3Client.send(new PutObjectCommand(params));

    const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;

    res.json({ success: true, fileUrl });
  } catch (error) {
    console.error("Gallery upload error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// List gallery images from S3 bucket (unma folder)
router.get("/gallery", async (req, res) => {
  try {
    const bucketName = process.env.S3_BUCKET_NAME;
    const folderPrefix = "";

    const params = {
      Bucket: bucketName,
      Prefix: folderPrefix,
    };

    const command = new ListObjectsV2Command(params);
    const response = await s3Client.send(command);

    if (!response.Contents || response.Contents.length === 0) {
      return res.json({
        success: true,
        images: [],
        message: "No images found in gallery"
      });
    }

    // Filter only image files and generate URLs
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    const images = response.Contents
      .filter((object) => {
        const key = object.Key.toLowerCase();
        return imageExtensions.some((ext) => key.endsWith(ext));
      })
      .map((object, index) => {
        const fileName = object.Key.split("/").pop();
        const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${object.Key}`;

        // Generate title from filename
        let title = fileName
          .replace(/\.(jpg|jpeg|png|gif|webp)$/i, "")
          .replace(
            /WhatsApp Image \d+-\d+-\d+ at \d+\.\d+\.\d+_[a-f0-9]+/i,
            "UNMA Memory"
          )
          .replace(/IMG_\d+\.JPEG/i, "UNMA Gathering")
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());

        return {
          id: index,
          src: fileUrl,
          title: title || "UNMA Photo",
          description: "",
          fileName: fileName,
          loaded: false,
          lastModified: object.LastModified,
        };
      })
      .sort((a, b) => {
        // Sort by last modified date (newest first)
        return new Date(b.lastModified) - new Date(a.lastModified);
      });

    res.json({
      success: true,
      images,
      count: images.length
    });
  } catch (error) {
    console.error("Gallery list error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
