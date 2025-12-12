import React from 'react';
import { Github, Heart, Code } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="mb-16">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
          Why I Built This
        </h2>
        
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 space-y-4 text-gray-700 leading-relaxed">
          <p>
            As a prompt engineer working on a Mac, I constantly dealt with CSV files for data analysis and processing. 
            The workflow was frustrating: Numbers required manual exports every time, Excel on Mac had encoding issues 
            that corrupted Korean characters, and most online tools were either too complex or lacked basic editing features.
          </p>
          
          <p>
            I needed something simple—a tool that could both view and edit CSV files directly in the browser, 
            without the overhead of desktop applications or the limitations of existing online editors. 
            So I built this.
          </p>
          
          <p>
            Mac CSV Editor is designed to be lightweight, fast, and straightforward. No installation, no sign-up, 
            no server uploads. Just drag your file, edit it, and download. All processing happens locally in your browser, 
            which means your data stays completely private.
          </p>
          
          <p>
            This project is open source, and I welcome contributions from the community. 
            If you find it useful or have suggestions for improvements, feel free to check out the code on GitHub 
            or reach out to me directly.
          </p>
          
          <div className="pt-6 border-t border-gray-100 mt-6">
            <p className="text-sm text-gray-600 text-center mb-4">
              Built by <span className="font-semibold text-gray-900">Jaehyeok Yu</span>, 
              Prompt Engineer at <span className="font-semibold text-gray-900">Voithru</span> (South Korea)
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a 
                href="https://github.com/behunkydory/MacCSV-Editor" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors shadow-sm"
              >
                <Github size={20} />
                View on GitHub
              </a>
              <a 
                href="mailto:jaehyeok.yu@voithru.com?subject=Mac CSV Editor Feedback"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg font-medium transition-colors"
              >
                Send Feedback
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
