import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Chat(){
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  async function start() {
    try {
      const { data } = await api.post('/api/chat/start');
      setSessionId(data.sessionId);
      // parse numbered questions
      const qs = data.questionsRaw.split(/\n/).filter(Boolean).map(l => l.replace(/^\d+\.\s*/, '').trim());
      setQuestions(qs);
      setCurrentQuestion(qs[0] || '');
      setMessages([{role:'assistant', content: qs.join('\n\n')}]);
    } catch (e) {
      toast.error(e.response?.data?.msg || 'Failed to start. Upload JD & Resume first.');
    }
  }

  useEffect(()=>{ start(); }, []);

  async function sendAnswer(){
    if(!input.trim()) return;
    const text = input;
    setMessages(m=>[...m, {role:'user', content:text}]);
    setInput('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/chat/query', { sessionId, question: currentQuestion, answer: text });
      setMessages(m=>[...m, {role:'assistant', content: `Score: ${data.score}\n\n${data.feedback}`, meta: { citations: data.citations }}]);
    } catch (err) {
      toast.error('Chat error');
    } finally { setLoading(false); }
  }

  return (
    <div className="flex flex-col h-[70vh]">
      <div className="bg-white p-3 rounded shadow mb-3 flex-1 overflow-auto">
        {messages.map((m, i) => (
          <div key={i} className={`mb-3 ${m.role==='user' ? 'text-right' : ''}`}>
            <div className={`inline-block p-3 rounded ${m.role==='user' ? 'bg-indigo-100' : 'bg-gray-100'}`}>
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>
            {m.meta?.citations && (
              <div className="text-xs text-gray-500 mt-1">
                Citations: {m.meta.citations.map(c=>c.chunkId).join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white p-3 rounded shadow mt-2">
        <div className="mb-2 text-sm text-gray-600">Question: <strong>{currentQuestion}</strong></div>
        <textarea value={input} onChange={e=>setInput(e.target.value)} rows={4} className="w-full p-2 border rounded mb-2" placeholder="Type your answer..."></textarea>
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">Responses are evaluated against your resume/JD</div>
          <button onClick={sendAnswer} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">{loading ? 'Analyzing...' : 'Send'}</button>
        </div>
      </div>
    </div>
  );
}
