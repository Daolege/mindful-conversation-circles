
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
}
