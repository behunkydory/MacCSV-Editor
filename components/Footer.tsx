import React from 'react';
import { Github, Heart, Mail } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-white border-t border-gray-200 py-8 mt-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            <p className="flex items-center gap-1 justify-center md:justify-start">
              {t.footer.madeWith} <Heart size={14} className="text-red-500 fill-red-500" /> {t.footer.by} Jaehyeok Yu
            </p>
            <p className="text-xs text-gray-400 mt-1 text-center md:text-left">
              {t.footer.copyright}
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
              <span>{t.footer.github}</span>
            </a>
            <a 
              href="mailto:jaehyeok.yu@voithru.com?subject=Mac CSV Editor - Issue Report"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Mail size={18} />
              <span>{t.footer.contact}</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
