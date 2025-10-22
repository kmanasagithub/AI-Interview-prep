import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function Navbar(){
  const { user, logout } = useContext(AuthContext);
  const nav = useNavigate();
  return (
    <nav className="bg-white shadow">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-lg font-semibold">InterviewAI</Link>
        <div className="flex items-center gap-3">
          {user ? <>
            <Link to="/upload" className="px-3 py-2 rounded hover:bg-gray-100">Upload</Link>
            <Link to="/chat" className="px-3 py-2 rounded hover:bg-gray-100">Chat</Link>
            <button onClick={() => { logout(); nav('/'); }} className="px-3 py-2 bg-red-500 text-white rounded">Logout</button>
          </> : <>
            <Link to="/login" className="px-3 py-2">Login</Link>
            <Link to="/signup" className="px-3 py-2 bg-indigo-600 text-white rounded">Get started</Link>
          </>}
        </div>
      </div>
    </nav>
  );
}
