import React, { useState, useEffect } from 'react';
import FileDrop from '../components/FileDrop';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Upload(){
  const [list, setList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [type, setType] = useState('resume');

  useEffect(()=>{ fetchList(); }, []);

  async function fetchList(){
    try {
      const { data } = await api.get('/api/documents/list');
      setList(data.docs);
    } catch (e) { 
      console.error('Fetch uploads failed', e); 
      toast.error('Failed to fetch uploads');
    }
  }

  async function handleFile(file){
    if(!file) return;
    if (file.size > (2 * 1024 * 1024)) { toast.error('File too big (max 2MB)'); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('type', type);
    try {
      await api.post('/api/documents/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Uploaded');
      fetchList();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Upload error');
    } finally { setUploading(false); }
  }

  async function handleDelete(id){
    try {
      await api.delete(`/api/documents/${id}`);
      toast.success('Deleted');
      fetchList();
    } catch (e) { toast.error('Delete failed'); }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Upload</h3>
        <div className="flex gap-3 items-center mb-3">
          <label className="flex items-center gap-2">
            <input type="radio" checked={type==='resume'} onChange={()=>setType('resume')} /> Resume
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={type==='jd'} onChange={()=>setType('jd')} /> Job Description
          </label>
        </div>
        <FileDrop onFile={handleFile} />
        {uploading && <div className="mt-2">Uploading…</div>}
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Recent uploads</h3>
        {list.length === 0 && <div className="text-sm text-gray-500">No uploads yet</div>}
        <ul className="space-y-2">
          {list.map(d => (
            <li key={d._id} className="flex justify-between items-center">
              <div>
                <div className="font-medium">{d.filename}</div>
                <div className="text-sm text-gray-500">{d.type} • {new Date(d.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex gap-2">
                <a href={d.fileUrl} target="_blank" rel="noreferrer" className="px-2 py-1 border rounded">Open</a>
                <button onClick={()=>handleDelete(d._id)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
