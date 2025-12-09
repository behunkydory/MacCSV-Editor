import React, { useCallback, useState } from 'react';
import { UploadCloud, FileSpreadsheet } from 'lucide-react';

interface DropZoneProps {
  onFileLoaded: (file: File) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFileLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileLoaded(e.dataTransfer.files[0]);
    }
  }, [onFileLoaded]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileLoaded(e.target.files[0]);
    }
  };

  return (
    <div 
      className={`
        w-full h-96 flex flex-col items-center justify-center 
        border-2 border-dashed rounded-2xl transition-all duration-300
        ${isDragging 
          ? 'border-blue-500 bg-blue-50/50 scale-[1.01]' 
          : 'border-gray-300 bg-white hover:bg-gray-50'
        }
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="bg-blue-100 p-4 rounded-full mb-4 text-blue-600">
        <FileSpreadsheet size={48} />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Open a CSV file
      </h3>
      <p className="text-gray-500 mb-6 text-center max-w-sm">
        Drag and drop your CSV file here, or click to browse your computer.
      </p>
      
      <label className="cursor-pointer">
        <span className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200">
          Browse Files
        </span>
        <input 
          type="file" 
          accept=".csv,.txt" 
          className="hidden" 
          onChange={handleInputChange} 
        />
      </label>
    </div>
  );
};