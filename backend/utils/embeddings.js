// const OpenAI = require("openai");
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// async function embedText(text, model = process.env.EMBED_MODEL || 'text-embedding-3-small') {
//   const resp = await openai.embeddings.create({
//     model,
//     input: text
//   });
//   return resp.data[0].embedding;
// }

// function cosineSim(a, b) {
//   let dot = 0, na = 0, nb = 0;
//   for (let i = 0; i < a.length; i++) {
//     dot += a[i] * b[i];
//     na += a[i] * a[i];
//     nb += b[i] * b[i];
//   }
//   return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-10);
// }

// module.exports = { embedText, cosineSim };


// Placeholder for future embedding generation (e.g., OpenAI)
const getEmbedding = async (text) => {
  return []; // return embedding array
};

module.exports = { getEmbedding };
