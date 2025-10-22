import React, { useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Signup(){
  const [form, setForm] = useState({ name:'', email:'', password:'' });
  const { login } = useContext(AuthContext);
  const nav = useNavigate();

  async function handleSubmit(e){
    e.preventDefault();
    try {
      const { data } = await api.post('/api/auth/signup', form);
      login(data.user, data.token);
      toast.success('Signed up');
      nav('/upload');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Create account</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input required placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full p-2 border rounded" />
        <input required placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="w-full p-2 border rounded" />
        <input required type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="w-full p-2 border rounded" />
        <button className="w-full bg-indigo-600 text-white p-2 rounded">Sign up</button>
      </form>
    </div>
  );
}
