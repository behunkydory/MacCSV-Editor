import { CSVData, ParseResult } from '../types';

export const parseCSV = (file: File): Promise<ParseResult> => {
  return new Promise((resolve, reject) => {
    if (!window.Papa) {
      reject(new Error("PapaParse not loaded"));
      return;
    }

    window.Papa.parse(file, {
      complete: (results: ParseResult) => {
        resolve(results);
      },
      error: (error: any) => {
        reject(error);
      },
      header: false, // We will treat first row as header manually if needed, or just raw grid
      skipEmptyLines: true,
      dynamicTyping: true, // Automatically convert numbers
    });
  });
};

export const downloadCSV = async (data: CSVData, filename: string) => {
  if (!window.Papa) return;

  const csv = window.Papa.unparse(data);

  // Attempt to use the File System Access API to allow the user to pick a path
  if ('showSaveFilePicker' in window) {
    try {
      const options = {
        suggestedName: filename || 'export.csv',
        types: [
          {
            description: 'CSV File',
            accept: {
              'text/csv': ['.csv'],
            },
          },
        ],
      };
      
      // @ts-ignore - The API is not yet in all standard TypeScript lib definitions
      const handle = await window.showSaveFilePicker(options);
      const writable = await handle.createWritable();
      await writable.write(csv);
      await writable.close();
      return;
    } catch (err: any) {
      // Fail silently if the user aborts the save dialog
      if (err.name === 'AbortError') {
        return;
      }
      console.warn('File System Access API failed, falling back to legacy download:', err);
      // Proceed to fallback
    }
  }

  // Legacy Fallback for browsers that don't support File System Access API (e.g., Safari)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  // Create download link
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename || 'export.csv');
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
