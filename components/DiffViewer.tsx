import React, { useState, useMemo, useEffect } from 'react';
import { CSVData } from '../types';
import { parseCSV } from '../services/csvService';
import { X, Upload, ArrowRight, GitCompare, RefreshCw, FileDiff } from 'lucide-react';
import { Button } from './Button';

interface DiffViewerProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: CSVData;
  originalData: CSVData;
  filename: string;
}

type DiffMode = 'session' | 'files';

export const DiffViewer: React.FC<DiffViewerProps> = ({
  isOpen,
  onClose,
  currentData,
  originalData,
  filename
}) => {
  const [mode, setMode] = useState<DiffMode>('session');
  
  // File Upload State for 'files' mode
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [dataA, setDataA] = useState<CSVData>([]);
  const [dataB, setDataB] = useState<CSVData>([]);
  const [loading, setLoading] = useState(false);

  // Initialize Session Data
  useEffect(() => {
    if (isOpen && mode === 'session') {
      setDataA(originalData);
      setDataB(currentData);
    }
  }, [isOpen, mode, currentData, originalData]);

  // Handle File Uploads
  const handleFileChange = async (file: File, slot: 'A' | 'B') => {
    setLoading(true);
    try {
      const result = await parseCSV(file);
      if (slot === 'A') {
        setFileA(file);
        setDataA(result.data);
      } else {
        setFileB(file);
        setDataB(result.data);
      }
    } catch (e) {
      alert("Error parsing CSV");
    } finally {
      setLoading(false);
    }
  };

  // Compute Diff Grid
  // We use a unified grid approach: Iterate max rows/cols.
  const diffGrid = useMemo(() => {
    if (!dataA.length && !dataB.length) return null;

    const rowsA = dataA.length;
    const rowsB = dataB.length;
    const maxRows = Math.max(rowsA, rowsB);
    
    // Determine max cols by checking header (first row) or scanning all (slower)
    // We'll assume header width defines the schema mostly, but handle variable width
    const colsA = dataA[0]?.length || 0;
    const colsB = dataB[0]?.length || 0;
    const maxCols = Math.max(colsA, colsB);

    const grid = [];

    for (let r = 0; r < maxRows; r++) {
      const rowDiff = [];
      const rowA = dataA[r] || [];
      const rowB = dataB[r] || [];
      
      // Row Status
      let rowStatus: 'same' | 'added' | 'removed' | 'modified' = 'same';
      
      if (r >= rowsA) rowStatus = 'added';
      else if (r >= rowsB) rowStatus = 'removed';

      for (let c = 0; c < maxCols; c++) {
        const valA = rowA[c];
        const valB = rowB[c];
        
        let status: 'same' | 'added' | 'removed' | 'changed' = 'same';
        
        // If row is added/removed, all cells inherit that status roughly
        if (rowStatus === 'added') status = 'added';
        else if (rowStatus === 'removed') status = 'removed';
        else {
          // Row exists in both, check cell value
          const strA = String(valA ?? '');
          const strB = String(valB ?? '');
          if (strA !== strB) status = 'changed';
        }

        rowDiff.push({
          status,
          valA,
          valB
        });
      }
      grid.push({ index: r, status: rowStatus, cells: rowDiff });
    }

    return grid;
  }, [dataA, dataB]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-50 z-[100] flex flex-col animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col gap-4 shadow-sm z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <GitCompare size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Diff Checker</h2>
              <p className="text-xs text-gray-500">Compare CSV versions or files</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex bg-gray-100 p-1 rounded-lg">
                <button 
                  onClick={() => setMode('session')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${mode === 'session' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Current Session
                </button>
                <button 
                  onClick={() => setMode('files')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${mode === 'files' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Upload Two Files
                </button>
             </div>
             <div className="h-6 w-px bg-gray-200 mx-2"></div>
             <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
               <X size={20} />
             </button>
          </div>
        </div>

        {/* Configuration Area (only for File Mode) */}
        {mode === 'files' && (
          <div className="grid grid-cols-2 gap-4 mt-2">
             <div className={`border border-dashed rounded-lg p-3 flex items-center justify-between ${fileA ? 'border-indigo-300 bg-indigo-50/30' : 'border-gray-300'}`}>
                <div className="flex items-center gap-2 truncate">
                   <div className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide">Old</div>
                   <span className="text-sm text-gray-700 truncate font-medium">{fileA ? fileA.name : "Select 'Old' File"}</span>
                </div>
                <label className="cursor-pointer bg-white border border-gray-200 text-gray-600 px-3 py-1 text-xs rounded hover:bg-gray-50 shadow-sm transition-colors">
                   Browse
                   <input type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0], 'A')} />
                </label>
             </div>
             <div className={`border border-dashed rounded-lg p-3 flex items-center justify-between ${fileB ? 'border-indigo-300 bg-indigo-50/30' : 'border-gray-300'}`}>
                <div className="flex items-center gap-2 truncate">
                   <div className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide">New</div>
                   <span className="text-sm text-gray-700 truncate font-medium">{fileB ? fileB.name : "Select 'New' File"}</span>
                </div>
                <label className="cursor-pointer bg-white border border-gray-200 text-gray-600 px-3 py-1 text-xs rounded hover:bg-gray-50 shadow-sm transition-colors">
                   Browse
                   <input type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0], 'B')} />
                </label>
             </div>
          </div>
        )}
        
        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
             <span className="w-3 h-3 rounded bg-red-100 border border-red-200"></span>
             <span className="text-gray-600">Removed Row</span>
          </div>
          <div className="flex items-center gap-1.5">
             <span className="w-3 h-3 rounded bg-green-100 border border-green-200"></span>
             <span className="text-gray-600">Added Row</span>
          </div>
          <div className="flex items-center gap-1.5">
             <span className="w-3 h-3 rounded bg-amber-100 border border-amber-200"></span>
             <span className="text-gray-600">Modified Cell</span>
          </div>
          {mode === 'session' && (
             <div className="ml-auto text-gray-400">
               Comparing <span className="font-medium text-gray-600">{filename} (Original)</span> vs <span className="font-medium text-gray-600">Current Edit</span>
             </div>
          )}
        </div>
      </div>

      {/* Main Diff Table */}
      <div className="flex-1 overflow-auto custom-scrollbar bg-gray-50 p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
           {!diffGrid || diffGrid.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-96 text-gray-400 gap-4">
               <FileDiff size={48} className="opacity-20" />
               <p>No data to compare. Please select files or ensure data is loaded.</p>
             </div>
           ) : (
             <table className="w-full border-collapse text-sm table-fixed">
               <thead className="bg-gray-50 text-gray-500 font-medium">
                 <tr>
                    <th className="w-16 p-2 border-b border-r border-gray-200 sticky top-0 bg-gray-50 z-10 text-center">Row</th>
                    {diffGrid[0].cells.map((_, i) => (
                      <th key={i} className="w-48 p-2 border-b border-r border-gray-200 sticky top-0 bg-gray-50 z-10 text-left">Col {i + 1}</th>
                    ))}
                 </tr>
               </thead>
               <tbody>
                  {diffGrid.map((row) => (
                    <tr key={row.index} className="divide-x divide-gray-100 border-b border-gray-100">
                      <td className={`
                        p-2 text-center text-xs font-mono select-none sticky left-0 z-10 border-r border-gray-200
                        ${row.status === 'added' ? 'bg-green-50 text-green-700' : ''}
                        ${row.status === 'removed' ? 'bg-red-50 text-red-700' : ''}
                        ${row.status === 'same' ? 'bg-gray-50 text-gray-400' : ''}
                      `}>
                        {row.index + 1}
                      </td>
                      {row.cells.map((cell, cIndex) => {
                        // Cell Style Logic
                        let cellClass = "p-2 truncate ";
                        let content = null;

                        if (cell.status === 'added') {
                          cellClass += "bg-green-50 text-green-800";
                          content = cell.valB ?? '';
                        } else if (cell.status === 'removed') {
                          cellClass += "bg-red-50 text-red-800 decoration-red-300 line-through opacity-70";
                          content = cell.valA ?? '';
                        } else if (cell.status === 'changed') {
                          cellClass += "bg-amber-50 text-gray-800";
                          content = (
                            <div className="flex flex-col gap-0.5 text-xs">
                              <span className="text-red-500 line-through opacity-60 text-[10px]">{String(cell.valA ?? '')}</span>
                              <span className="text-green-700 font-medium">{String(cell.valB ?? '')}</span>
                            </div>
                          );
                        } else {
                          cellClass += "text-gray-600 bg-white";
                          content = cell.valA ?? '';
                        }

                        return (
                          <td key={cIndex} className={cellClass}>
                            {content}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
               </tbody>
             </table>
           )}
        </div>
      </div>
    </div>
  );
};
