import { Router } from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
import crypto from "node:crypto";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { detectMediaType } from "../../services/imageValidation.js";
import { HttpError } from "../../middleware/errorHandler.js";

const router = Router();

const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many uploads. Please wait a moment and try again." },
});

const uploadsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "uploads");
await mkdir(uploadsDir, { recursive: true });

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 30 * 1024 * 1024; // 30MB
const ALLOWED_MIMETYPES = new Set(["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"]);

const upload = multer({
  storage: multer.memoryStorage(),
  // multer only knows the total size once the whole file is buffered; the
  // per-kind (image vs video) limit is enforced afterwards, once we know
  // from the magic bytes whether this is actually an image or a video.
  limits: { fileSize: MAX_VIDEO_SIZE },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIMETYPES.has(file.mimetype)) {
      return cb(new HttpError(400, "Only JPG, PNG, WEBP images or MP4/WEBM videos are allowed."));
    }
    cb(null, true);
  },
});

router.post("/", uploadLimiter, upload.single("image"), async (req, res) => {
  if (!req.file) throw new HttpError(400, "No file was uploaded (field name must be 'image').");

  const detected = detectMediaType(req.file.buffer);
  if (!detected) {
    throw new HttpError(400, "That file is not a valid JPG, PNG, WEBP image or MP4/WEBM video.");
  }

  const maxSize = detected.kind === "video" ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  if (req.file.buffer.length > maxSize) {
    throw new HttpError(413, `File is too large (max ${detected.kind === "video" ? "30MB" : "5MB"} for ${detected.kind}s).`);
  }

  const filename = `${crypto.randomBytes(16).toString("hex")}.${detected.ext}`;
  await writeFile(path.join(uploadsDir, filename), req.file.buffer);

  res.status(201).json({ path: `/uploads/${filename}`, kind: detected.kind });
});

export default router;
