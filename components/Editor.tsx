import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { CSVData } from '../types';
import { 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  MoreHorizontal,
  GripVertical,
  ArrowUpAZ,
  ArrowDownZA,
  Pin,
  PinOff,
  ListFilter,
  Search,
  Check
} from 'lucide-react';

interface EditorProps {
  data: CSVData;
  onChange: (newData: CSVData) => void;
  freezeRow: number | null;
  freezeCol: number | null;
  onFreezeChange: (row: number | null, col: number | null) => void;
  searchResults?: { r: number, c: number }[];
  focusResult?: { r: number, c: number } | null;
}

const ROWS_PER_PAGE = 1000;
const CELL_WIDTH = 160; // w-40
const ROW_HEADER_WIDTH = 48; // w-12
const HEADER_HEIGHT = 40; // h-10
const ROW_HEIGHT = 36; // h-9

interface ContextMenuState {
  type: 'row' | 'col';
  index: number; // For rows, this is the ORIGINAL index in 'data'. For cols, just col index.
  x: number;
  y: number;
}

interface FilterMenuState {
  colIndex: number;
  x: number;
  y: number;
}

interface Coordinate {
  r: number;
  c: number;
}

export const Editor: React.FC<EditorProps> = ({ 
  data, 
  onChange,
  freezeRow,
  freezeCol,
  onFreezeChange,
  searchResults = [],
  focusResult = null
}) => {
  const [page, setPage] = useState(0);
  
  // Selection State
  const [selectionStart, setSelectionStart] = useState<Coordinate | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<Coordinate | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [editingCell, setEditingCell] = useState<Coordinate | null>(null); // r is original index

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [filterMenu, setFilterMenu] = useState<FilterMenuState | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter State: Map of colIndex -> Set of allowed values (stringified)
  const [activeFilters, setActiveFilters] = useState<Record<number, Set<string>>>({});
  const [filterSearch, setFilterSearch] = useState('');

  // Drag and Drop State
  const [draggedRowIndex, setDraggedRowIndex] = useState<number | null>(null); // original index
  const [draggedColIndex, setDraggedColIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // --- Computed Data (Filtering) ---

  const filteredRows = useMemo(() => {
    return data.map((row, index) => ({ row, originalIndex: index }))
      .filter(item => {
        return Object.entries(activeFilters).every(([colIdx, allowedSet]) => {
          const val = String(item.row[Number(colIdx)] ?? '');
          return (allowedSet as Set<string>).has(val);
        });
      });
  }, [data, activeFilters]);

  // --- View Rows Construction (Freezing + Pagination) ---

  const viewRows = useMemo(() => {
    // 1. Identify Frozen Rows (indices 0 to freezeRow)
    let frozenItems: typeof filteredRows = [];
    if (freezeRow !== null) {
      frozenItems = filteredRows.filter(item => item.originalIndex <= freezeRow);
    }

    // Get current page items
    const start = page * ROWS_PER_PAGE;
    const end = start + ROWS_PER_PAGE;
    const pageItems = filteredRows.slice(start, end);

    // Merge: Frozen items at top, then page items. Remove duplicates.
    const combined = [...frozenItems];
    const frozenIds = new Set(frozenItems.map(i => i.originalIndex));
    
    pageItems.forEach(item => {
      if (!frozenIds.has(item.originalIndex)) {
        combined.push(item);
      }
    });

    return combined;

  }, [filteredRows, freezeRow, page]);


  // --- Auto-scroll to search result ---
  useEffect(() => {
    if (focusResult) {
      const viewIndex = filteredRows.findIndex(item => item.originalIndex === focusResult.r);
      if (viewIndex !== -1) {
        const targetPage = Math.floor(viewIndex / ROWS_PER_PAGE);
        if (targetPage !== page) {
          setPage(targetPage);
        }
        // Also select the found result
        setSelectionStart(focusResult);
        setSelectionEnd(focusResult);
      }
    }
  }, [focusResult, page, filteredRows]);

  // --- Global Event Listeners (Mouse Up & Keys) ---
  useEffect(() => {
    const handleWindowMouseUp = () => {
      setIsSelecting(false);
    };

    const handleClickOutside = () => {
      setContextMenu(null);
      setFilterMenu(null);
    };

    window.addEventListener('mouseup', handleWindowMouseUp);
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('mouseup', handleWindowMouseUp);
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // --- Clipboard Events (Copy/Paste) ---
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      // If editing a cell, allow native copy
      if (editingCell) return;
      // If no selection, do nothing
      if (!selectionStart || !selectionEnd) return;

      e.preventDefault(); // Prevent default copy

      const minR = Math.min(selectionStart.r, selectionEnd.r);
      const maxR = Math.max(selectionStart.r, selectionEnd.r);
      const minC = Math.min(selectionStart.c, selectionEnd.c);
      const maxC = Math.max(selectionStart.c, selectionEnd.c);

      const rowsToCopy = [];
      for (let r = minR; r <= maxR; r++) {
        const rowData = [];
        for (let c = minC; c <= maxC; c++) {
          const val = data[r]?.[c] ?? '';
          rowData.push(String(val).replace(/\t/g, ' '));
        }
        rowsToCopy.push(rowData.join('\t'));
      }
      const text = rowsToCopy.join('\n');
      
      if (e.clipboardData) {
        e.clipboardData.setData('text/plain', text);
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      if (editingCell) return;
      if (!selectionStart || !selectionEnd) return;

      e.preventDefault();

      const text = e.clipboardData?.getData('text');
      if (!text) return;

      const rows = text.split(/\r\n|\n|\r/).filter(r => r !== '');
      if (rows.length === 0) return;

      const minR = Math.min(selectionStart.r, selectionEnd.r);
      const minC = Math.min(selectionStart.c, selectionEnd.c);

      const newData = [...data];
      
      rows.forEach((rowStr, rOffset) => {
        const targetR = minR + rOffset;
        if (targetR >= newData.length) return; 

        const cells = rowStr.split('\t');
        const newRow = [...newData[targetR]];
        
        cells.forEach((cellVal, cOffset) => {
          const targetC = minC + cOffset;
          if (targetC < newRow.length) {
            const numVal = Number(cellVal);
            newRow[targetC] = (!isNaN(numVal) && cellVal.trim() !== '') ? numVal : cellVal;
          }
        });
        newData[targetR] = newRow;
      });
      onChange(newData);
    };

    window.addEventListener('copy', handleCopy);
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('copy', handleCopy);
      window.removeEventListener('paste', handlePaste);
    };
  }, [selectionStart, selectionEnd, editingCell, data, onChange]);


  // --- Keyboard Shortcuts (Delete/Navigation) ---
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // If we are currently editing a cell, do not intercept these keys
      if (editingCell) {
        return;
      }

      if (!selectionStart || !selectionEnd) return;

      const minR = Math.min(selectionStart.r, selectionEnd.r);
      const maxR = Math.max(selectionStart.r, selectionEnd.r);
      const minC = Math.min(selectionStart.c, selectionEnd.c);
      const maxC = Math.max(selectionStart.c, selectionEnd.c);

      // 1. DELETE / BACKSPACE
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const newData = [...data];
        for (let r = minR; r <= maxR; r++) {
          if (newData[r]) {
            const newRow = [...newData[r]];
            for (let c = minC; c <= maxC; c++) {
              newRow[c] = '';
            }
            newData[r] = newRow;
          }
        }
        onChange(newData);
      }

      // 2. ENTER (Start Editing)
      if (e.key === 'Enter') {
        e.preventDefault();
        setEditingCell({ r: minR, c: minC });
      }

      // 3. ARROW KEYS (Move Selection)
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        let newR = selectionStart.r;
        let newC = selectionStart.c;

        if (e.key === 'ArrowUp') newR = Math.max(0, newR - 1);
        if (e.key === 'ArrowDown') newR = Math.min(data.length - 1, newR + 1);
        if (e.key === 'ArrowLeft') newC = Math.max(0, newC - 1);
        if (e.key === 'ArrowRight') newC = Math.min((data[0]?.length || 1) - 1, newC + 1);

        // Check Pagination for Arrow Keys
        const newPage = Math.floor(newR / ROWS_PER_PAGE);
        if (newPage !== page) {
          setPage(newPage);
        }

        setSelectionStart({ r: newR, c: newC });
        // If Shift is held, we expand selectionEnd, else we move both
        if (e.shiftKey) {
            setSelectionEnd({ r: newR, c: newC }); 
        } else {
            setSelectionStart({ r: newR, c: newC });
            setSelectionEnd({ r: newR, c: newC });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectionStart, selectionEnd, editingCell, data, onChange, page]);

  // Focus Input on Edit
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);

  const handleCellChange = (rowIndex: number, colIndex: number, val: string) => {
    const newData = [...data];
    const row = [...newData[rowIndex]];
    const numVal = Number(val);
    row[colIndex] = (val !== '' && !isNaN(numVal)) ? numVal : val;
    newData[rowIndex] = row;
    onChange(newData);
  };

  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Stop global handlers
    if (e.key === 'Enter') {
      // Explicitly save on Enter before closing
      handleCellChange(editingCell!.r, editingCell!.c, e.currentTarget.value);
      setEditingCell(null);
    }
  };

  // --- Sorting & Filtering ---
  const handleSort = (colIndex: number, direction: 'asc' | 'desc') => {
    const newData = [...data];
    newData.sort((a, b) => {
      const valA = a[colIndex];
      const valB = b[colIndex];
      if (valA === valB) return 0;
      if (valA == null || valA === '') return 1;
      if (valB == null || valB === '') return -1;
      const numA = Number(valA);
      const numB = Number(valB);
      if (!isNaN(numA) && !isNaN(numB)) return direction === 'asc' ? numA - numB : numB - numA;
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      if (strA < strB) return direction === 'asc' ? -1 : 1;
      if (strA > strB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    onChange(newData);
  };

  const getUniqueValues = (colIndex: number) => {
    const counts = new Map<string, number>();
    data.forEach(row => {
      const val = String(row[colIndex] ?? '');
      counts.set(val, (counts.get(val) || 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  };

  const toggleFilter = (colIndex: number, val: string) => {
    setActiveFilters(prev => {
      const currentSet = new Set(prev[colIndex] || getUniqueValues(colIndex).map(v => v[0]));
      if (currentSet.has(val)) currentSet.delete(val);
      else currentSet.add(val);
      return { ...prev, [colIndex]: currentSet };
    });
  };

  const setAllFilter = (colIndex: number, select: boolean) => {
    setActiveFilters(prev => {
      const next = { ...prev };
      if (select) delete next[colIndex];
      else next[colIndex] = new Set();
      return next;
    });
  };

  // --- Context Menu ---
  const handleContextMenu = (e: React.MouseEvent, type: 'row' | 'col', index: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    setContextMenu({ type, index, x: e.clientX, y: e.clientY });
    setFilterMenu(null);
  };

  const insertRow = (targetIndex: number, position: 'before' | 'after') => {
    const colCount = data[0]?.length || 0;
    const newRow = new Array(colCount).fill('');
    const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
    const newData = [...data];
    newData.splice(insertIndex, 0, newRow);
    setActiveFilters({}); // Clear filters to make sure new row is visible
    onChange(newData);
  };

  const deleteRow = (targetIndex: number) => {
    const newData = data.filter((_, i) => i !== targetIndex);
    onChange(newData);
  };

  const insertColumn = (targetIndex: number, position: 'before' | 'after') => {
    const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
    const newData = data.map(row => {
      const newRow = [...row];
      newRow.splice(insertIndex, 0, '');
      return newRow;
    });
    setActiveFilters({}); // Clear filters since column structure changed
    onChange(newData);
  };

  const deleteColumn = (targetIndex: number) => {
    const newData = data.map(row => row.filter((_, i) => i !== targetIndex));
    onChange(newData);
    setActiveFilters(prev => {
      const next = { ...prev };
      delete next[targetIndex];
      return next;
    });
  };

  // --- Drag & Drop ---
  const handleRowDragStart = (e: React.DragEvent, originalIndex: number) => {
    setDraggedRowIndex(originalIndex);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleRowDrop = (e: React.DragEvent, dropIndexOriginal: number) => {
    e.preventDefault();
    if (draggedRowIndex === null || draggedRowIndex === dropIndexOriginal) {
      setDraggedRowIndex(null); setDragOverIndex(null); return;
    }
    const newData = [...data];
    const [movedRow] = newData.splice(draggedRowIndex, 1);
    let target = dropIndexOriginal;
    if (dropIndexOriginal > draggedRowIndex) target = dropIndexOriginal; 
    newData.splice(target, 0, movedRow);
    onChange(newData);
    setDraggedRowIndex(null); setDragOverIndex(null);
  };

  const handleColDragStart = (e: React.DragEvent, index: number) => {
    setDraggedColIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleColDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedColIndex === null || draggedColIndex === dropIndex) {
      setDraggedColIndex(null); setDragOverIndex(null); return;
    }
    const newData = data.map(row => {
      const newRow = [...row];
      const [movedCell] = newRow.splice(draggedColIndex, 1);
      newRow.splice(dropIndex, 0, movedCell);
      return newRow;
    });
    setActiveFilters({});
    onChange(newData);
    setDraggedColIndex(null); setDragOverIndex(null);
  };

  // --- Helpers ---
  const totalPages = Math.ceil(filteredRows.length / ROWS_PER_PAGE);
  const startRowDisplay = page * ROWS_PER_PAGE + 1;
  const endRowDisplay = Math.min((page + 1) * ROWS_PER_PAGE, filteredRows.length);

  // Selection Helper
  const isCellSelected = (r: number, c: number) => {
    if (!selectionStart || !selectionEnd) return false;
    const minR = Math.min(selectionStart.r, selectionEnd.r);
    const maxR = Math.max(selectionStart.r, selectionEnd.r);
    const minC = Math.min(selectionStart.c, selectionEnd.c);
    const maxC = Math.max(selectionStart.c, selectionEnd.c);
    return r >= minR && r <= maxR && c >= minC && c <= maxC;
  };

  // --- Mouse Handlers for Selection ---
  const handleCellMouseDown = (e: React.MouseEvent, r: number, c: number) => {
    // Left click only
    if (e.button !== 0) return;
    
    // If clicking inside the currently edited cell's input, allow default behavior (text selection)
    if (editingCell?.r === r && editingCell?.c === c) {
      return; 
    }

    // CRITICAL FIX: If we are clicking away from an active editor, the preventDefault() below 
    // will stop the 'blur' event from firing on the input, preventing the save.
    // We must manually blur the active element if it's an input.
    if (document.activeElement instanceof HTMLInputElement) {
        document.activeElement.blur();
    }

    // Prevent default to disable native text selection/drag on the grid structure
    e.preventDefault(); 
    
    setIsSelecting(true);
    setSelectionStart({ r, c });
    setSelectionEnd({ r, c });
    setEditingCell(null); // Close any active editor
  };

  const handleCellMouseEnter = (r: number, c: number) => {
    if (isSelecting && selectionStart) {
      setSelectionEnd({ r, c });
    }
  };

  if (data.length === 0) return <div className="flex items-center justify-center h-64 text-gray-400">No data</div>;

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative select-none"
         onContextMenu={(e) => {
           // Only prevent default if NOT clicking on the custom context menu itself
           if (!e.target.closest('.context-menu-container')) {
             e.preventDefault();
           }
         }}
    >
      <div 
        className="flex-1 overflow-auto custom-scrollbar relative"
        onContextMenu={(e) => e.preventDefault()}
      >
        <table className="border-collapse text-sm text-left table-fixed w-max">
          <thead className="bg-gray-50 sticky top-0 z-50 shadow-sm h-10">
            <tr>
              <th className="w-12 border-b border-r border-gray-200 bg-gray-50 sticky left-0 z-[60]"></th>
              {data[0].map((_, colIndex) => {
                const isFrozen = freezeCol !== null && colIndex <= freezeCol;
                const hasActiveFilter = !!activeFilters[colIndex];
                const style = isFrozen ? { position: 'sticky' as const, left: ROW_HEADER_WIDTH + (colIndex * CELL_WIDTH), zIndex: 50 } : {};
                
                return (
                  <th 
                    key={colIndex} 
                    draggable
                    onDragStart={(e) => handleColDragStart(e, colIndex)}
                    onDragOver={(e) => { e.preventDefault(); setDragOverIndex(colIndex); }}
                    onDrop={(e) => handleColDrop(e, colIndex)}
                    className={`
                      px-2 border-b border-r border-gray-200 font-semibold text-gray-700 w-40 h-10
                      cursor-move transition-colors relative group
                      ${draggedColIndex === colIndex ? 'opacity-50 bg-gray-200' : 'bg-gray-50 hover:bg-gray-100'}
                      ${dragOverIndex === colIndex && draggedColIndex !== null ? 'border-l-2 border-l-blue-500' : ''}
                      ${isFrozen ? 'shadow-[1px_0_0_0_rgba(0,0,0,0.1)]' : ''}
                    `}
                    style={style}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleContextMenu(e, 'col', colIndex);
                    }}
                  >
                    <div className="flex justify-between items-center px-1 h-full">
                      <div className="flex items-center gap-1 min-w-0 overflow-hidden">
                        <GripVertical size={12} className="opacity-0 group-hover:opacity-50 flex-shrink-0" />
                        <span className="truncate">Col {colIndex + 1}</span>
                        {isFrozen && <Pin size={10} className="text-blue-500 fill-blue-500 flex-shrink-0 ml-1"/>}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setFilterMenu({ colIndex, x: e.clientX, y: e.clientY }); }}
                          className={`p-1 rounded hover:bg-gray-200 ${hasActiveFilter ? 'text-blue-600 bg-blue-50' : 'text-gray-400 opacity-0 group-hover:opacity-100'}`}
                        >
                           <ListFilter size={14} />
                        </button>
                        <MoreHorizontal size={14} className="text-gray-300 cursor-context-menu" />
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {viewRows.map((item) => {
              const { row, originalIndex } = item;
              const isFrozenRow = freezeRow !== null && originalIndex <= freezeRow;
              
              const rowStyle = isFrozenRow ? { 
                position: 'sticky' as const, 
                top: HEADER_HEIGHT + (originalIndex * ROW_HEIGHT), 
                zIndex: 40,
                boxShadow: '0 1px 0 0 rgba(0,0,0,0.1)'
              } : {};

              return (
                <tr 
                  key={originalIndex} 
                  className={`
                    transition-colors group h-9
                    ${draggedRowIndex === originalIndex ? 'opacity-50 bg-gray-100' : ''}
                    ${dragOverIndex === originalIndex && draggedRowIndex !== null ? 'border-t-2 border-t-blue-500' : ''}
                  `}
                  style={rowStyle}
                >
                  <td 
                    draggable
                    onDragStart={(e) => handleRowDragStart(e, originalIndex)}
                    onDragOver={(e) => { e.preventDefault(); setDragOverIndex(originalIndex); }}
                    onDrop={(e) => handleRowDrop(e, originalIndex)}
                    className={`
                      p-2 border-b border-r border-gray-100 text-center text-xs text-gray-400 select-none 
                      bg-gray-50 cursor-move hover:bg-gray-200 hover:text-gray-600 transition-colors
                      sticky left-0 z-40 w-12
                      ${isFrozenRow ? '!z-[55]' : ''} 
                    `}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleContextMenu(e, 'row', originalIndex);
                    }}
                  >
                    <div className="flex items-center justify-center gap-0.5 group-hover:gap-1 relative h-full">
                       <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute left-0">
                         <GripVertical size={10} />
                       </span>
                       {originalIndex + 1}
                       {isFrozenRow && <Pin size={8} className="text-blue-500 fill-blue-500 absolute right-1 top-1" />}
                    </div>
                  </td>

                  {row.map((cell, colIndex) => {
                    const match = searchResults.some(m => m.r === originalIndex && m.c === colIndex);
                    const focused = focusResult?.r === originalIndex && focusResult?.c === colIndex;
                    const isFrozenCol = freezeCol !== null && colIndex <= freezeCol;
                    const selected = isCellSelected(originalIndex, colIndex);
                    const isEditing = editingCell?.r === originalIndex && editingCell?.c === colIndex;

                    // Intersection of Frozen Row + Frozen Col needs highest Z-Index for data cells
                    const cellZ = isFrozenCol && isFrozenRow ? 50 : isFrozenCol ? 20 : 0;
                    
                    const cellStyle = isFrozenCol ? {
                      position: 'sticky' as const,
                      left: ROW_HEADER_WIDTH + (colIndex * CELL_WIDTH),
                      zIndex: cellZ,
                      boxShadow: '1px 0 0 0 rgba(0,0,0,0.05)'
                    } : {};

                    return (
                      <td 
                        key={`${originalIndex}-${colIndex}`} 
                        className={`
                          border-b border-r border-gray-100 w-40 relative p-0
                          ${match && !focused ? 'bg-amber-100' : ''}
                          ${focused ? 'bg-amber-200' : ''}
                          ${selected && !isEditing ? 'bg-blue-100/50' : (isFrozenRow || isFrozenCol ? 'bg-gray-50 font-medium' : 'bg-white')} 
                          ${selected && !isEditing ? 'ring-1 ring-inset ring-blue-400' : ''}
                        `}
                        style={cellStyle}
                        onMouseDown={(e) => handleCellMouseDown(e, originalIndex, colIndex)}
                        onMouseEnter={() => handleCellMouseEnter(originalIndex, colIndex)}
                        onDoubleClick={() => setEditingCell({ r: originalIndex, c: colIndex })}
                        onContextMenu={(e) => e.preventDefault()}
                      >
                        {isEditing ? (
                          <input
                            ref={inputRef}
                            type="text"
                            className="w-full h-full p-2 outline-none bg-white text-gray-900 absolute inset-0 z-[60] ring-2 ring-inset ring-blue-500 shadow-lg"
                            defaultValue={cell === null ? '' : String(cell)}
                            onBlur={(e) => {
                              handleCellChange(originalIndex, colIndex, e.target.value);
                              setEditingCell(null);
                            }}
                            onKeyDown={(e) => handleKeyDownInput(e)}
                            onMouseDown={(e) => e.stopPropagation()} // Allow text selection inside input
                            onDoubleClick={(e) => e.stopPropagation()} // Prevent re-triggering parent double click
                            onContextMenu={(e) => e.stopPropagation()} // Allow context menu in input
                          />
                        ) : (
                          <div className="p-2 truncate cursor-default h-full w-full text-gray-700 pointer-events-none">
                            {cell === null ? <span className="text-gray-300 italic">null</span> : String(cell)}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="h-12 border-t border-gray-200 bg-gray-50 flex items-center justify-between px-4 text-xs text-gray-500 shrink-0 z-[70] relative">
        <div className="flex gap-2 items-center">
            <span>Showing {startRowDisplay}-{endRowDisplay} of {filteredRows.length} rows</span>
            {filteredRows.length !== data.length && (
                <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">Filtered</span>
            )}
        </div>
        <div className="flex gap-2">
          <button 
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
            className="px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-30"
          >
            Previous
          </button>
          <span>Page {filteredRows.length > 0 ? page + 1 : 0} of {totalPages || 1}</span>
          <button 
             disabled={page >= totalPages - 1}
             onClick={() => setPage(p => p + 1)}
             className="px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-30"
          >
            Next
          </button>
        </div>
      </div>

      {contextMenu && (
        <div 
          className="context-menu-container fixed bg-white/90 backdrop-blur-xl border border-gray-200 rounded-lg shadow-xl py-1 z-[100] w-56 text-sm"
          style={{ top: Math.min(contextMenu.y, window.innerHeight - 300), left: Math.min(contextMenu.x, window.innerWidth - 220) }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.type === 'row' ? (
            <>
              <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase">Row {contextMenu.index + 1}</div>
              <button onClick={() => { insertRow(contextMenu.index, 'before'); setContextMenu(null); }} className="w-full text-left px-3 py-2 hover:bg-blue-600 hover:text-white flex items-center gap-2">
                <ArrowUp size={14} /> Insert Above
              </button>
              <button onClick={() => { insertRow(contextMenu.index, 'after'); setContextMenu(null); }} className="w-full text-left px-3 py-2 hover:bg-blue-600 hover:text-white flex items-center gap-2">
                <ArrowDown size={14} /> Insert Below
              </button>
              <div className="h-px bg-gray-200 my-1"></div>
              
              {freezeRow === contextMenu.index ? (
                <button onClick={() => { onFreezeChange(null, freezeCol); setContextMenu(null); }} className="w-full text-left px-3 py-2 hover:bg-blue-600 hover:text-white flex items-center gap-2">
                   <PinOff size={14} /> Unfreeze Rows
                </button>
              ) : (
                <button onClick={() => { onFreezeChange(contextMenu.index, freezeCol); setContextMenu(null); }} className="w-full text-left px-3 py-2 hover:bg-blue-600 hover:text-white flex items-center gap-2">
                   <Pin size={14} /> Freeze up to Row {contextMenu.index + 1}
                </button>
              )}
              
              <div className="h-px bg-gray-200 my-1"></div>
              <button onClick={() => { deleteRow(contextMenu.index); setContextMenu(null); }} className="w-full text-left px-3 py-2 hover:bg-red-600 hover:text-white text-red-600 flex items-center gap-2">
                <Trash2 size={14} /> Delete Row
              </button>
            </>
          ) : (
            <>
              <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase">Column {contextMenu.index + 1}</div>
              <button onClick={() => { handleSort(contextMenu.index, 'asc'); setContextMenu(null); }} className="w-full text-left px-3 py-2 hover:bg-blue-600 hover:text-white flex items-center gap-2">
                <ArrowUpAZ size={14} /> Sort Ascending
              </button>
              <button onClick={() => { handleSort(contextMenu.index, 'desc'); setContextMenu(null); }} className="w-full text-left px-3 py-2 hover:bg-blue-600 hover:text-white flex items-center gap-2">
                <ArrowDownZA size={14} /> Sort Descending
              </button>
              <div className="h-px bg-gray-200 my-1"></div>
              <button onClick={() => { insertColumn(contextMenu.index, 'before'); setContextMenu(null); }} className="w-full text-left px-3 py-2 hover:bg-blue-600 hover:text-white flex items-center gap-2">
                <ArrowLeft size={14} /> Insert Left
              </button>
              <button onClick={() => { insertColumn(contextMenu.index, 'after'); setContextMenu(null); }} className="w-full text-left px-3 py-2 hover:bg-blue-600 hover:text-white flex items-center gap-2">
                <ArrowRight size={14} /> Insert Right
              </button>
              <div className="h-px bg-gray-200 my-1"></div>
              
              {freezeCol === contextMenu.index ? (
                <button onClick={() => { onFreezeChange(freezeRow, null); setContextMenu(null); }} className="w-full text-left px-3 py-2 hover:bg-blue-600 hover:text-white flex items-center gap-2">
                   <PinOff size={14} /> Unfreeze Columns
                </button>
              ) : (
                <button onClick={() => { onFreezeChange(freezeRow, contextMenu.index); setContextMenu(null); }} className="w-full text-left px-3 py-2 hover:bg-blue-600 hover:text-white flex items-center gap-2">
                   <Pin size={14} /> Freeze up to Col {contextMenu.index + 1}
                </button>
              )}

              <div className="h-px bg-gray-200 my-1"></div>
              <button onClick={() => { deleteColumn(contextMenu.index); setContextMenu(null); }} className="w-full text-left px-3 py-2 hover:bg-red-600 hover:text-white text-red-600 flex items-center gap-2">
                <Trash2 size={14} /> Delete Column
              </button>
            </>
          )}
        </div>
      )}

      {filterMenu && (
        <div 
           className="fixed bg-white border border-gray-200 rounded-lg shadow-2xl z-[100] w-64 flex flex-col text-sm"
           style={{ top: Math.min(filterMenu.y + 10, window.innerHeight - 400), left: Math.min(filterMenu.x - 200, window.innerWidth - 270) }}
           onClick={(e) => e.stopPropagation()}
        >
          <div className="p-3 border-b border-gray-100 flex items-center gap-2">
             <Search size={14} className="text-gray-400" />
             <input autoFocus type="text" placeholder="Search values..." className="flex-1 outline-none text-gray-700 bg-transparent" value={filterSearch} onChange={(e) => setFilterSearch(e.target.value)} />
          </div>
          <div className="p-2 border-b border-gray-100 flex gap-2">
             <button className="flex-1 text-xs py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded" onClick={() => setAllFilter(filterMenu.colIndex, true)}>Select All</button>
             <button className="flex-1 text-xs py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded" onClick={() => setAllFilter(filterMenu.colIndex, false)}>Clear</button>
          </div>
          <div className="max-h-64 overflow-y-auto custom-scrollbar p-1">
             {getUniqueValues(filterMenu.colIndex)
                .filter(([val]) => val.toLowerCase().includes(filterSearch.toLowerCase()))
                .map(([val, count]) => {
                   const isSelected = !activeFilters[filterMenu.colIndex] || activeFilters[filterMenu.colIndex].has(val);
                   return (
                     <div key={val} className="flex items-center gap-2 px-2 py-1.5 hover:bg-blue-50 cursor-pointer rounded select-none group" onClick={() => toggleFilter(filterMenu.colIndex, val)}>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 bg-white'}`}>
                           {isSelected && <Check size={10} strokeWidth={3} />}
                        </div>
                        <span className="flex-1 truncate text-gray-700">{val === '' ? <span className="text-gray-400 italic">(Empty)</span> : val}</span>
                        <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded-full">{count}</span>
                     </div>
                   );
                })
             }
          </div>
        </div>
      )}
    </div>
  );
};
