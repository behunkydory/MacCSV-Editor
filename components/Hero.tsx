import React from 'react';
import { Zap, Apple, Shield } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <div className="text-center space-y-6 mb-12">
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600 mb-4">
        <Zap size={16} className="text-blue-500" />
        <span>Fast, Simple, Secure CSV Editing</span>
      </div>
      
      <h1 className="text-5xl font-bold text-gray-900 leading-tight">
        Edit CSV Files Online
        <br />
        <span className="text-gray-600">Without the Hassle</span>
      </h1>
      
      <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
        Tired of Numbers corrupting your CSV files or Excel being too heavy? 
        Edit CSV files directly in your browser with a clean, fast, and lightweight editor.
      </p>

      <div className="flex items-center justify-center gap-8 pt-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Apple size={18} />
          <span>Mac & Windows</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Shield size={18} />
          <span>100% Client-Side</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Zap size={18} />
          <span>No Installation</span>
        </div>
      </div>
    </div>
  );
};
