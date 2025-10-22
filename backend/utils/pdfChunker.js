// const pdfParse = require('pdf-parse');

// function splitIntoChunks(text, wordsPerChunk = 500) {
//   const words = text.split(/\s+/);
//   const chunks = [];
//   for (let i = 0; i < words.length; i += wordsPerChunk) {
//     const chunkWords = words.slice(i, i + wordsPerChunk);
//     chunks.push(chunkWords.join(' '));
//   }
//   return chunks;
// }

// async function parsePdfBuffer(buffer) {
//   const data = await pdfParse(buffer);
//   const text = (data.text || '').replace(/\s+/g, ' ').trim();
//   const chunks = splitIntoChunks(text, 500);
//   // create chunk objects
//   return chunks.map((c, i) => ({ text: c, chunkId: `chunk-${i + 1}` }));
// }

// module.exports = { parsePdfBuffer, splitIntoChunks };

const pdfParse = require("pdf-parse");

const chunkPDFBuffer = async (fileBuffer, chunkSize = 500) => {
  const pdfData = await pdfParse(fileBuffer);
  const text = pdfData.text;
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push({ text: words.slice(i, i + chunkSize).join(" "), embedding: [] });
  }
  return chunks;
};

module.exports = { chunkPDFBuffer };
