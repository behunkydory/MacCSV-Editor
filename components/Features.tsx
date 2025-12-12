import React from 'react';
import { Search, Undo, GitCompare, MousePointer2, Download, Plus, Lock, Rows } from 'lucide-react';

const features = [
  {
    icon: <MousePointer2 size={24} />,
    title: "Drag & Drop Upload",
    description: "Simply drag your CSV file into the browser. No complex menus or buttons required."
  },
  {
    icon: <Plus size={24} />,
    title: "Add Rows & Columns",
    description: "Easily add new rows and columns with a single click. Build your data structure on the fly."
  },
  {
    icon: <Search size={24} />,
    title: "Find & Replace",
    description: "Search through your data with text or regex patterns. Replace single or all matches instantly."
  },
  {
    icon: <Undo size={24} />,
    title: "Undo/Redo",
    description: "Made a mistake? Use Cmd+Z to undo or Cmd+Y to redo. Full edit history is preserved."
  },
  {
    icon: <Rows size={24} />,
    title: "Freeze Headers & Rows",
    description: "Right-click to freeze headers or specific rows while scrolling through large datasets."
  },
  {
    icon: <MousePointer2 size={24} />,
    title: "Drag to Reorder",
    description: "Rearrange columns and rows by dragging them. No need to cut and paste."
  },
  {
    icon: <GitCompare size={24} />,
    title: "Compare Changes",
    description: "View differences between your original file and current edits with the built-in diff viewer."
  },
  {
    icon: <Lock size={24} />,
    title: "100% Private",
    description: "All processing happens in your browser. Your data never touches our servers."
  },
  {
    icon: <Download size={24} />,
    title: "Export Instantly",
    description: "Download your edited CSV file with one click. No account or sign-up required."
  }
];

export const Features: React.FC = () => {
  return (
    <div className="mb-16">
      <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
        Everything You Need to Edit CSV
      </h2>
      <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
        A complete set of tools designed to make CSV editing fast and painless, 
        whether you're working with small datasets or large files.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white mb-4">
              {feature.icon}
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
