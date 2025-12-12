import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: "How do I upload a CSV file?",
    answer: "Simply drag and drop your CSV file into the upload area, or click to browse and select your file. The editor will automatically parse and display your data."
  },
  {
    question: "Is my data safe? Does it get uploaded to a server?",
    answer: "Absolutely safe! All processing happens locally in your browser using JavaScript. Your CSV data never leaves your computer and is not sent to any server. This means your sensitive data stays completely private."
  },
  {
    question: "What file formats are supported?",
    answer: "Currently, the editor supports standard CSV (Comma-Separated Values) files. This includes files exported from Numbers, Excel, Google Sheets, and most database applications."
  },
  {
    question: "Is this tool free to use?",
    answer: "Yes! Mac CSV Editor is completely free to use with no limitations. There are no premium features, no account required, and no hidden costs."
  },
  {
    question: "Can I use this on mobile or tablet?",
    answer: "While the editor works on mobile browsers, it's optimized for desktop use. For the best experience with large files and complex editing, we recommend using a laptop or desktop computer."
  }
];

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mb-16">
      <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
        Frequently Asked Questions
      </h2>
      <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
        Have questions? We've got answers. If you need more help, feel free to reach out.
      </p>
      
      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <div 
            key={index}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-semibold text-gray-900">{faq.question}</span>
              <ChevronDown 
                size={20} 
                className={`text-gray-500 transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
              />
            </button>
            {openIndex === index && (
              <div className="px-6 pb-4 text-gray-600 leading-relaxed">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
