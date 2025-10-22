const express = require("express");
const router = express.Router();
const multer = require("multer");
const auth = require("../middleware/auth");
const Document = require("../models/Document");
const { chunkPDFBuffer } = require("../utils/pdfChunker");
const { uploadToCloudinary } = require("../utils/cloudinary");

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

// Upload
router.post("/upload", auth, upload.single("file"), async (req, res) => {
  try {
    const { type } = req.body;
    if (!req.file) return res.status(400).json({ message: "File required" });

    const result = await uploadToCloudinary(req.file.buffer, `ai-interview/${req.user.id}`);
    const chunks = await chunkPDFBuffer(req.file.buffer);

    const doc = await Document.create({
      userId: req.user.id,
      type,
      fileUrl: result.secure_url,
      chunks,
    });

    res.json({ document: doc });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// List
router.get("/list", auth, async (req, res) => {
  const docs = await Document.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(docs);
});

// Delete
router.delete("/:id", auth, async (req, res) => {
  try {
    const doc = await Document.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
