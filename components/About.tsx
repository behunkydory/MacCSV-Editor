import React from 'react';
import { Github, Heart, Code } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const About: React.FC = () => {
  const { t, language } = useLanguage();
  
  return (
    <div className="mb-16">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
          {t.about.title}
        </h2>
        
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 space-y-4 text-gray-700 leading-relaxed">
          <p>{t.about.paragraph1}</p>
          <p>{t.about.paragraph2}</p>
          <p>{t.about.paragraph3}</p>
          <p>{t.about.paragraph4}</p>
          
          <div className="pt-6 border-t border-gray-100 mt-6">
            <p className="text-sm text-gray-600 text-center mb-4">
              {t.about.builtBy} <span className="font-semibold text-gray-900">Jaehyeok Yu</span>, 
              {language === 'ko' ? ' ' : ' '}
              {t.about.promptEngineer} <span className="font-semibold text-gray-900">Voithru</span> 
              {language === 'ko' ? '' : ' (South Korea)'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a 
                href="https://github.com/behunkydory/MacCSV-Editor" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors shadow-sm"
              >
                <Github size={20} />
                {t.about.github}
              </a>
              <a 
                href="mailto:jaehyeok.yu@voithru.com?subject=Mac CSV Editor Feedback"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg font-medium transition-colors"
              >
                {t.about.feedback}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
