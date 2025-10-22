import React, { useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Login(){
  const [form, setForm] = useState({ email:'', password:'' });
  const { login } = useContext(AuthContext);
  const nav = useNavigate();
  const loc = useLocation();
  const redirect = loc.state?.from?.pathname || '/upload';

  async function handleSubmit(e){
    e.preventDefault();
    try {
      const { data } = await api.post('/api/auth/login', form);
      login(data.user, data.token);
      toast.success('Logged in');
      nav(redirect);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Login failed');
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input required placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="w-full p-2 border rounded" />
        <input required type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="w-full p-2 border rounded" />
        <button className="w-full bg-indigo-600 text-white p-2 rounded">Login</button>
      </form>
    </div>
  );
}
