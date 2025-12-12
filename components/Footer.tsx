import React from 'react';
import { Github, Heart, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8 mt-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            <p className="flex items-center gap-1 justify-center md:justify-start">
              Made with <Heart size={14} className="text-red-500 fill-red-500" /> by Jaehyeok Yu
            </p>
            <p className="text-xs text-gray-400 mt-1 text-center md:text-left">
              © 2024 Mac CSV Editor. Open Source & Free Forever.
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <a 
              href="https://github.com/behunkydory/MacCSV-Editor" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Github size={18} />
              <span>GitHub</span>
            </a>
            <a 
              href="mailto:jaehyeok.yu@voithru.com?subject=Mac CSV Editor - Issue Report"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Mail size={18} />
              <span>Contact</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
