// src/pages/Landing.jsx
import React from "react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-indigo-200 flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl md:text-6xl font-bold text-center mb-6">
        AI-Powered Interview Prep
      </h1>
      <p className="text-center text-lg md:text-xl mb-8 max-w-xl">
        Sign up, upload your resume and job description, and chat with our AI
        interviewer to practice for your dream job. Get instant feedback and
        improve your answers.
      </p>
      <div className="flex space-x-4">
        <Link
          to="/signup"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Get Started
        </Link>
        <Link
          to="/login"
          className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-100 transition"
        >
          Login
        </Link>
      </div>
      <div className="mt-12 text-center text-gray-700">
        <p>Built with React, Tailwind CSS, Node, MongoDB, and OpenAI API</p>
      </div>
    </div>
  );
};

export default Landing;
