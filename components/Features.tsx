import React from 'react';
import { Search, Undo, GitCompare, MousePointer2, Download, Plus, Lock, Rows } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const Features: React.FC = () => {
  const { t } = useLanguage();
  
  const icons = [
    <MousePointer2 size={24} />,
    <Plus size={24} />,
    <Search size={24} />,
    <Undo size={24} />,
    <Rows size={24} />,
    <MousePointer2 size={24} />,
    <GitCompare size={24} />,
    <Lock size={24} />,
    <Download size={24} />
  ];

  return (
    <div className="mb-16">
      <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
        {t.features.title}
      </h2>
      <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
        {t.features.subtitle}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {t.features.items.map((feature, index) => (
          <div 
            key={index}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white mb-4">
              {icons[index]}
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
