import React, { useState, useEffect, useCallback } from 'react';
import { DropZone } from './components/DropZone';
import { Editor } from './components/Editor';
import { Button } from './components/Button';
import { FindReplaceBar } from './components/FindReplaceBar';
import { DiffViewer } from './components/DiffViewer';
import { parseCSV, downloadCSV } from './services/csvService';
import { CSVData } from './types';
import { 
  Download, 
  Plus, 
  ArrowLeft,
  Layout,
  Columns,
  Rows,
  Undo,
  Redo,
  Search,
  CheckCircle2,
  GitCompare
} from 'lucide-react';

interface AppState {
  data: CSVData;
  freezeRow: number | null;
  freezeCol: number | null;
}

const App: React.FC = () => {
  // History State stores full snapshots
  const [history, setHistory] = useState<{past: AppState[], future: AppState[]}>({ past: [], future: [] });
  
  // Current State
  const [data, setData] = useState<CSVData>([]);
  const [freezeRow, setFreezeRow] = useState<number | null>(null);
  const [freezeCol, setFreezeCol] = useState<number | null>(null);
  
  // File & Dirty State
  const [filename, setFilename] = useState<string>('untitled.csv');
  const [initialDataStr, setInitialDataStr] = useState<string>(''); 
  const [isDirty, setIsDirty] = useState(false);

  // Search & Diff State
  const [isDiffOpen, setIsDiffOpen] = useState(false);

  // Search & Replace State
  const [showFind, setShowFind] = useState(false);
  const [findTerm, setFindTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [useRegex, setUseRegex] = useState(false);
  const [matches, setMatches] = useState<{r: number, c: number}[]>([]);
  const [currentMatchIdx, setCurrentMatchIdx] = useState(0);

  // --- Dirty Check Logic ---
  useEffect(() => {
    if (!initialDataStr) {
      setIsDirty(false);
      return;
    }

    // Debounce the heavy stringify operation
    const timer = setTimeout(() => {
      const currentStr = JSON.stringify(data);
      setIsDirty(currentStr !== initialDataStr);
    }, 500);

    return () => clearTimeout(timer);
  }, [data, initialDataStr]);

  // --- Undo / Redo / State Management ---

  // Unified handler for ANY state change that should be undoable
  const handleStateChange = useCallback((
    updates: Partial<AppState>, 
    saveToHistory = true
  ) => {
    if (saveToHistory) {
      setHistory(prev => {
        // Create snapshot of CURRENT state before update
        const currentState: AppState = {
          data: data.map(row => [...row]), // Deep copy data
          freezeRow,
          freezeCol
        };
        
        const newPast = [...prev.past, currentState];
        if (newPast.length > 50) newPast.shift(); // Limit history
        
        return {
          past: newPast,
          future: []
        };
      });
    }

    // Apply updates
    if (updates.data !== undefined) setData(updates.data);
    if (updates.freezeRow !== undefined) setFreezeRow(updates.freezeRow);
    if (updates.freezeCol !== undefined) setFreezeCol(updates.freezeCol);

  }, [data, freezeRow, freezeCol]);

  const handleUndo = useCallback(() => {
    if (history.past.length === 0) return;

    const previous = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, -1);
    
    // Push current to future
    const currentState: AppState = {
      data: data.map(row => [...row]),
      freezeRow,
      freezeCol
    };
    
    setHistory({
      past: newPast,
      future: [currentState, ...history.future]
    });
    
    // Restore previous
    setData(previous.data);
    setFreezeRow(previous.freezeRow);
    setFreezeCol(previous.freezeCol);
  }, [history, data, freezeRow, freezeCol]);

  const handleRedo = useCallback(() => {
    if (history.future.length === 0) return;

    const next = history.future[0];
    const newFuture = history.future.slice(1);

    // Push current to past
    const currentState: AppState = {
      data: data.map(row => [...row]),
      freezeRow,
      freezeCol
    };

    setHistory({
      past: [...history.past, currentState],
      future: newFuture
    });

    // Restore next
    setData(next.data);
    setFreezeRow(next.freezeRow);
    setFreezeCol(next.freezeCol);
  }, [history, data, freezeRow, freezeCol]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo/Redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }

      // Find
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        setShowFind(true);
      }

      // Close Find
      if (e.key === 'Escape' && showFind) {
        setShowFind(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, showFind]);

  // --- Search Logic ---

  useEffect(() => {
    if (!findTerm || data.length === 0) {
      setMatches([]);
      setCurrentMatchIdx(0);
      return;
    }

    const newMatches: {r: number, c: number}[] = [];
    let regex: RegExp | null = null;

    if (useRegex) {
      try {
        regex = new RegExp(findTerm, 'i');
      } catch (e) {
        setMatches([]); 
        return;
      }
    }

    const lowerTerm = findTerm.toLowerCase();

    data.forEach((row, r) => {
      row.forEach((cell, c) => {
        const val = String(cell ?? '');
        let isMatch = false;

        if (useRegex && regex) {
          isMatch = regex.test(val);
        } else {
          isMatch = val.toLowerCase().includes(lowerTerm);
        }

        if (isMatch) {
          newMatches.push({ r, c });
        }
      });
    });

    setMatches(newMatches);
    setCurrentMatchIdx(0);

  }, [data, findTerm, useRegex]);

  const handleNextMatch = () => {
    if (matches.length === 0) return;
    setCurrentMatchIdx((prev) => (prev + 1) % matches.length);
  };

  const handlePrevMatch = () => {
    if (matches.length === 0) return;
    setCurrentMatchIdx((prev) => (prev - 1 + matches.length) % matches.length);
  };

  const performReplace = (val: string): string => {
    const strVal = String(val ?? '');
    if (useRegex) {
      try {
        const regex = new RegExp(findTerm, 'g'); 
        return strVal.replace(regex, replaceTerm);
      } catch {
        return strVal;
      }
    } else {
      return strVal.split(findTerm).join(replaceTerm);
    }
  };

  const handleReplace = () => {
    if (matches.length === 0) return;
    
    const { r, c } = matches[currentMatchIdx];
    const newData = [...data];
    const newRow = [...newData[r]];
    
    newRow[c] = performReplace(String(newRow[c]));
    newData[r] = newRow;

    handleStateChange({ data: newData });
  };

  const handleReplaceAll = () => {
    if (matches.length === 0) return;
    let regex: RegExp | null = null;
    if (useRegex) {
      try { regex = new RegExp(findTerm, 'g'); } catch { return; }
    }
    const lowerTerm = findTerm.toLowerCase();

    const newData = data.map(row => 
       row.map(cell => {
          const val = String(cell ?? '');
          let shouldReplace = false;
          if (useRegex && regex) {
             shouldReplace = new RegExp(findTerm, 'i').test(val);
          } else {
             shouldReplace = val.toLowerCase().includes(lowerTerm);
          }

          if (shouldReplace) {
            return performReplace(val);
          }
          return cell;
       })
    );

    handleStateChange({ data: newData });
  };

  // --- File Handlers ---

  const handleFileLoad = async (file: File) => {
    try {
      const result = await parseCSV(file);
      setData(result.data);
      setFreezeRow(null);
      setFreezeCol(null);
      setHistory({ past: [], future: [] }); 
      setFilename(file.name);
      
      // Set original state for comparison
      setInitialDataStr(JSON.stringify(result.data));
      setIsDirty(false);

    } catch (error) {
      console.error("Failed to parse CSV", error);
      alert("Error parsing CSV file. Please check the console.");
    }
  };

  const handleDownload = () => {
    downloadCSV(data, filename);
  };

  const appendRow = () => {
    if (data.length === 0) return;
    const newRow = new Array(data[0].length).fill('');
    handleStateChange({ data: [...data, newRow] });
  };

  const appendColumn = () => {
    if (data.length === 0) return;
    const newData = data.map(row => [...row, '']);
    handleStateChange({ data: newData });
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#f5f5f7] text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-gradient-to-br from-gray-800 to-black rounded-lg flex items-center justify-center text-white shadow-md">
            <Layout size={18} />
          </div>
          <div className="flex flex-col">
             <div className="flex items-center gap-2">
               <h1 className="font-semibold text-gray-800 text-sm">{filename}</h1>
               {data.length > 0 && (
                  isDirty ? (
                    <span className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Edited
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                      <CheckCircle2 size={10} />
                      Original
                    </span>
                  )
               )}
             </div>
             <p className="text-xs text-gray-500">MacCSV Editor</p>
          </div>
        </div>

        {data.length > 0 && (
          <div className="flex items-center gap-2">
             <div className="flex bg-gray-100 rounded-lg p-0.5 mr-2">
                <button 
                  onClick={handleUndo} 
                  disabled={history.past.length === 0}
                  className="p-1.5 rounded hover:bg-white text-gray-600 disabled:text-gray-300 disabled:hover:bg-transparent transition-all shadow-sm disabled:shadow-none"
                  title="Undo (Cmd+Z)"
                >
                  <Undo size={14} />
                </button>
                <button 
                  onClick={handleRedo} 
                  disabled={history.future.length === 0}
                  className="p-1.5 rounded hover:bg-white text-gray-600 disabled:text-gray-300 disabled:hover:bg-transparent transition-all shadow-sm disabled:shadow-none"
                  title="Redo (Cmd+Y)"
                >
                  <Redo size={14} />
                </button>
             </div>

             <Button onClick={() => setShowFind(true)} variant="ghost" icon={<Search size={14} />}>Find</Button>
             
             <div className="h-6 w-px bg-gray-200 mx-1"></div>
             
             <Button onClick={appendRow} variant="ghost" icon={<Rows size={14} />}>Add Row</Button>
             <Button onClick={appendColumn} variant="ghost" icon={<Columns size={14} />}>Add Col</Button>
             
             <div className="h-6 w-px bg-gray-200 mx-2"></div>
             
             {/* Diff Button */}
             <Button 
               onClick={() => setIsDiffOpen(true)}
               variant="secondary"
               icon={<GitCompare size={16} />}
             >
               Diff
             </Button>

             <Button onClick={handleDownload} variant="primary" icon={<Download size={16} />}>Export</Button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden p-6 relative">
        
        <FindReplaceBar 
          isOpen={showFind}
          onClose={() => setShowFind(false)}
          findTerm={findTerm}
          onFindChange={setFindTerm}
          replaceTerm={replaceTerm}
          onReplaceChange={setReplaceTerm}
          useRegex={useRegex}
          onToggleRegex={() => setUseRegex(!useRegex)}
          onNext={handleNextMatch}
          onPrev={handlePrevMatch}
          onReplace={handleReplace}
          onReplaceAll={handleReplaceAll}
          matchCount={matches.length}
          currentMatchIndex={currentMatchIdx}
        />

        {data.length === 0 ? (
          <div className="max-w-2xl mx-auto mt-20">
            <DropZone onFileLoaded={handleFileLoad} />
          </div>
        ) : (
          <div className="h-full max-w-7xl mx-auto flex flex-col gap-4">
             <div className="flex items-center justify-between">
                <button 
                  onClick={() => setData([])} 
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft size={16} /> Back to Upload
                </button>
                <div className="text-xs text-gray-400 italic">
                  Tip: Drag headers/rows to reorder • Right-click to freeze
                </div>
             </div>
             <div className="flex-1 min-h-0">
               <Editor 
                 data={data} 
                 freezeRow={freezeRow}
                 freezeCol={freezeCol}
                 onChange={(newData) => handleStateChange({ data: newData })}
                 onFreezeChange={(r, c) => handleStateChange({ freezeRow: r, freezeCol: c })}
                 searchResults={matches}
                 focusResult={matches.length > 0 ? matches[currentMatchIdx] : null}
               />
             </div>
          </div>
        )}

        <DiffViewer 
          isOpen={isDiffOpen}
          onClose={() => setIsDiffOpen(false)}
          currentData={data}
          originalData={initialDataStr ? JSON.parse(initialDataStr) : []}
          filename={filename}
        />

      </main>
    </div>
  );
};

export default App;