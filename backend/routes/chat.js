// const express = require('express');
// const auth = require('../middleware/auth');
// const Document = require('../models/Document');
// const ChatSession = require('../models/ChatSession');
// const { embedText, cosineSim } = require('../utils/embeddings');
// const OpenAI = require("openai");
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// const router = express.Router();

// function topKSimilarities(queryEmbedding, chunks, k = 2) {
//   const scored = chunks.map(c => ({ chunk: c, score: cosineSim(queryEmbedding, c.embedding) }));
//   scored.sort((a,b) => b.score - a.score);
//   return scored.slice(0, k).map(s => s);
// }

// // start -> generate 3 initial questions from JD
// router.post('/start', auth, async (req, res) => {
//   try {
//     // get JD for user
//     const jdDoc = await Document.findOne({ userId: req.user.id, type: 'jd' });
//     if(!jdDoc) return res.status(400).json({ msg: 'Please upload a JD first.' });

//     const prompt = `Generate 3 concise interview questions based on this job description. Number them 1-3.\n\n${jdDoc.chunks.slice(0,6).map(c=>c.text).join('\n\n')}`;
//     const completion = await openai.chat.completions.create({
//       model: process.env.CHAT_MODEL || 'gpt-4o-mini',
//       messages: [{ role:'user', content: prompt }],
//       max_tokens: 300
//     });
//     const text = completion.choices[0].message.content;
//     // create chat session
//     const session = new ChatSession({ userId: req.user.id, messages: [{ role:'system', content: 'Interview session started' }, { role:'assistant', content: text, meta: { type: 'initial_questions' } }] });
//     await session.save();
//     res.json({ questionsRaw: text, sessionId: session._id });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ msg: 'error' });
//   }
// });

// // query -> user answer for a question
// router.post('/query', auth, async (req, res) => {
//   try {
//     const { sessionId, question, answer } = req.body;
//     if (!question || !answer) return res.status(400).json({ msg: 'Missing fields' });

//     // find resume + jd chunks
//     const docs = await Document.find({ userId: req.user.id, type: { $in: ['resume','jd'] } });
//     const allChunks = docs.flatMap(d => d.chunks.map(c => ({ ...c.toObject(), docId: d._id, docType: d.type })));

//     // embed query (the answer can also be used; spec said embed query then search top-2)
//     const qEmbedding = await embedText(answer);

//     const top = topKSimilarities(qEmbedding, allChunks, 2);

//     // build RAG prompt
//     const contextText = top.map((t,idx)=>`Chunk ${idx+1} [${t.chunk.chunkId}] (${t.chunk.docType}):\n${t.chunk.text}`).join('\n\n');

//     const ragPrompt = `You are an interviewer AI. Evaluate the user's answer to the question below using the provided resume/jd context.
// Question: ${question}
// Answer: ${answer}
// Context:\n${contextText}
// Provide:
// 1) A numeric score 1-10 (higher is better).
// 2) A short feedback paragraph (<=100 words).
// 3) For each point in the feedback, cite which chunk helped (e.g., "See Chunk 1").
// Return only JSON like:
// {"score": 8, "feedback": "text..."} `;

//     const completion = await openai.chat.completions.create({
//       model: process.env.CHAT_MODEL || 'gpt-4o-mini',
//       messages: [{ role:'user', content: ragPrompt }],
//       max_tokens: 400
//     });

//     const assistantText = completion.choices[0].message.content;
//     // try parse JSON
//     let parsed;
//     try { parsed = JSON.parse(assistantText); } catch (e) {
//       parsed = { score: null, feedback: assistantText };
//     }

//     // store messages
//     const session = await ChatSession.findById(sessionId) || new ChatSession({ userId: req.user.id, messages: [] });
//     session.messages.push({ role: 'user', content: answer, meta: { question } });
//     session.messages.push({ role: 'assistant', content: parsed.feedback || assistantText, meta: { score: parsed.score, cited: top.map((t,idx)=>({ chunkId: t.chunk.chunkId, docType: t.chunk.docType, score: t.score })) } });
//     await session.save();

//     // return with citations and snippet text
//     const citations = top.map((t, idx) => ({ label: `Chunk ${idx+1}`, chunkId: t.chunk.chunkId, docType: t.chunk.docType, snippet: t.chunk.text.substring(0, 800) }));

//     res.json({ score: parsed.score, feedback: parsed.feedback || assistantText, citations, sessionId: session._id });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ msg: 'error', error: err.message });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Document = require("../models/Document");
const ChatSession = require("../models/ChatSession");
const OpenAI = require("openai"); // Use OpenAI SDK

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


// Start chat
router.post("/start", auth, async (req, res) => {
  try {
    const jdDoc = await Document.findOne({ userId: req.user.id, type: "jd" });
    if (!jdDoc) return res.status(400).json({ message: "Upload JD first" });

    const prompt = `Generate 3 interview questions from this JD: ${jdDoc.chunks.map(c => c.text).join(" ")}`;
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      max_tokens: 150,
    });

    const questions = response.data.choices[0].text.trim().split("\n").filter(Boolean);

    const session = await ChatSession.create({ userId: req.user.id, messages: [] });
    res.json({ sessionId: session._id, questions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Query
router.post("/query", auth, async (req, res) => {
  try {
    const { message, question, sessionId } = req.body;

    const resumeDoc = await Document.findOne({ userId: req.user.id, type: "resume" });
    if (!resumeDoc) return res.status(400).json({ message: "Upload resume first" });

    const topChunks = resumeDoc.chunks.slice(0, 2).map(c => c.text).join("\n");

    const prompt = `Evaluate response: "${message}" for question: "${question}" using resume: "${topChunks}". Give score (1-10) and feedback (max 100 words).`;

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      max_tokens: 200,
    });

    // Save to session
    const session = await ChatSession.findById(sessionId);
    session.messages.push({ role: "user", content: message });
    session.messages.push({ role: "ai", content: response.data.choices[0].text.trim() });
    await session.save();

    res.json({ evaluation: response.data.choices[0].text.trim() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
