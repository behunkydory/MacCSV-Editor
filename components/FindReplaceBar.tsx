import React, { useEffect, useRef } from 'react';
import { X, ChevronUp, ChevronDown, Regex, Search, Replace } from 'lucide-react';

interface FindReplaceBarProps {
  isOpen: boolean;
  onClose: () => void;
  findTerm: string;
  onFindChange: (val: string) => void;
  replaceTerm: string;
  onReplaceChange: (val: string) => void;
  useRegex: boolean;
  onToggleRegex: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReplace: () => void;
  onReplaceAll: () => void;
  matchCount: number;
  currentMatchIndex: number;
}

export const FindReplaceBar: React.FC<FindReplaceBarProps> = ({
  isOpen,
  onClose,
  findTerm,
  onFindChange,
  replaceTerm,
  onReplaceChange,
  useRegex,
  onToggleRegex,
  onNext,
  onPrev,
  onReplace,
  onReplaceAll,
  matchCount,
  currentMatchIndex,
}) => {
  const findInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && findInputRef.current) {
      findInputRef.current.select();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="absolute top-4 right-6 z-40 flex flex-col gap-2 bg-gray-900/95 backdrop-blur-md shadow-2xl border border-gray-700 rounded-xl p-3 w-80 animate-in fade-in slide-in-from-top-4 duration-200">
      
      {/* Header / Close */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Find & Replace</span>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
          <X size={14} />
        </button>
      </div>

      {/* Find Row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={14} />
          </div>
          <input 
            ref={findInputRef}
            type="text" 
            value={findTerm}
            onChange={(e) => onFindChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (e.shiftKey) onPrev();
                else onNext();
              }
            }}
            placeholder="Find..."
            className="w-full pl-8 pr-8 py-1.5 text-sm bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
          <button 
            onClick={onToggleRegex}
            className={`absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded transition-colors hover:bg-gray-700 ${useRegex ? 'text-blue-400' : 'text-gray-500'}`}
            title="Use Regular Expression"
          >
            <Regex size={14} />
          </button>
        </div>
        
        <div className="flex items-center text-gray-400 text-xs whitespace-nowrap min-w-[3rem] justify-center">
            {matchCount > 0 ? `${currentMatchIndex + 1}/${matchCount}` : '0/0'}
        </div>
        
        <div className="flex border border-gray-700 rounded overflow-hidden bg-gray-800">
          <button onClick={onPrev} className="p-1.5 hover:bg-gray-700 border-r border-gray-700 text-gray-400 hover:text-white transition-colors"><ChevronUp size={14}/></button>
          <button onClick={onNext} className="p-1.5 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"><ChevronDown size={14}/></button>
        </div>
      </div>

      {/* Replace Row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
           <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
            <Replace size={14} />
          </div>
          <input 
            type="text" 
            value={replaceTerm}
            onChange={(e) => onReplaceChange(e.target.value)}
            placeholder="Replace with..."
            className="w-full pl-8 py-1.5 text-sm bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            onKeyDown={(e) => {
                if(e.key === 'Enter') onReplace();
            }}
          />
        </div>
        <div className="flex gap-1">
          <button 
            onClick={onReplace} 
            disabled={matchCount === 0}
            className="px-2 py-1.5 text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded border border-gray-700 disabled:opacity-50 transition-colors"
          >
            Replace
          </button>
          <button 
            onClick={onReplaceAll} 
            disabled={matchCount === 0}
            className="px-2 py-1.5 text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded border border-gray-700 disabled:opacity-50 transition-colors"
          >
            All
          </button>
        </div>
      </div>

    </div>
  );
};