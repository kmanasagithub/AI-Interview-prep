const mongoose = require('mongoose');

const ChunkSchema = new mongoose.Schema({
  text: String,
  embedding: { type: [Number], index: '2dsphere', sparse: true }, // numeric array
  chunkId: String
});

const DocumentSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId,ref:"User", required: true, index: true },
  type: { type: String, enum: ['resume','jd'], required: true },
  fileUrl: String,
  filename: String,
  chunks: [ChunkSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', DocumentSchema);
