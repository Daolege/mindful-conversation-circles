
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export class ExcelExportService {
  /**
   * Export data to Excel file
   * 
   * @param data Array of objects representing rows to export
   * @param fileName Filename without extension
   * @param sheetName Optional sheet name
   */
  static async exportToExcel(data: any[], fileName: string, sheetName: string = 'Sheet1'): Promise<void> {
    try {
      // Create workbook
      const workbook = XLSX.utils.book_new();
      
      // Convert data to worksheet
      const worksheet = XLSX.utils.json_to_sheet(data);
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      
      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      
      // Save file using file-saver
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, `${fileName}.xlsx`);
      
      return Promise.resolve();
    } catch (error) {
      console.error('Excel export error:', error);
      return Promise.reject(error);
    }
  }
  
  /**
   * Export data to CSV file
   * 
   * @param data Array of objects representing rows to export
   * @param fileName Filename without extension
   */
  static async exportToCSV(data: any[], fileName: string): Promise<void> {
    try {
      // Convert data to worksheet
      const worksheet = XLSX.utils.json_to_sheet(data);
      
      // Generate CSV
      const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
      
      // Save file using file-saver
      const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8' });
      saveAs(blob, `${fileName}.csv`);
      
      return Promise.resolve();
    } catch (error) {
      console.error('CSV export error:', error);
      return Promise.reject(error);
    }
  }

  /**
   * Export formatted data to Excel with column width auto-sizing
   *
   * @param data Array of objects representing rows to export
   * @param fileName Filename without extension
   * @param title Optional title to display at the top of the sheet
   * @param sheetName Optional sheet name
   */
  static async exportFormattedExcel(
    data: any[], 
    fileName: string, 
    title?: string,
    sheetName: string = 'Sheet1'
  ): Promise<void> {
    try {
      // Create workbook
      const workbook = XLSX.utils.book_new();
      
      // Convert data to worksheet
      const worksheet = XLSX.utils.json_to_sheet(data);
      
      // Auto-size columns
      const colWidths = [];
      for (let i = 0; i < Object.keys(data[0] || {}).length; i++) {
        colWidths.push({ wch: 15 }); // Default width
      }
      worksheet['!cols'] = colWidths;
      
      // Add title if provided (in cell A1)
      if (title) {
        // First shift all data down by 2 rows
        const range = XLSX.utils.decode_range(worksheet['!ref'] as string);
        for (let R = range.e.r; R >= range.s.r; --R) {
          for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell = worksheet[XLSX.utils.encode_cell({ r: R, c: C })];
            if (!cell) continue;
            worksheet[XLSX.utils.encode_cell({ r: R + 2, c: C })] = cell;
          }
        }
        
        // Add title cell and merge cells for title
        worksheet['A1'] = { t: 's', v: title };
        worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: range.e.c } }];
        
        // Styling is limited in XLSX library, but we can try
      }
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      
      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      
      // Save file using file-saver
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, `${fileName}.xlsx`);
      
      return Promise.resolve();
    } catch (error) {
      console.error('Excel export error:', error);
      return Promise.reject(error);
    }
  }
}

export default ExcelExportService;
