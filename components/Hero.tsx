import React from 'react';
import { Zap, Apple, Shield } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const Hero: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div className="text-center space-y-6 mb-12">
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600 mb-4">
        <Zap size={16} className="text-blue-500" />
        <span>{t.hero.badge}</span>
      </div>
      
      <h1 className="text-5xl font-bold text-gray-900 leading-tight">
        {t.hero.title}
        <br />
        <span className="text-gray-600">{t.hero.subtitle}</span>
      </h1>
      
      <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
        {t.hero.description}
      </p>

      <div className="flex items-center justify-center gap-8 pt-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Apple size={18} />
          <span>{t.hero.macWindows}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Shield size={18} />
          <span>{t.hero.clientSide}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Zap size={18} />
          <span>{t.hero.noInstall}</span>
        </div>
      </div>
    </div>
  );
};
