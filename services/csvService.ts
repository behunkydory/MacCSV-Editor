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

export const downloadCSV = (data: CSVData, filename: string) => {
  if (!window.Papa) return;

  const csv = window.Papa.unparse(data);
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
