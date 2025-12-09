export type CellValue = string | number | boolean | null;
export type CSVRow = CellValue[];
export type CSVData = CSVRow[];

export interface ParseResult {
  data: CSVData;
  errors: any[];
  meta: any;
}

// Global declaration for PapaParse loaded via CDN
declare global {
  interface Window {
    Papa: any;
  }
}