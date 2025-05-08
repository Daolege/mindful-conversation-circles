
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export class PdfExportService {
  /**
   * 将页面区域导出为PDF
   * @param {string} elementId - 要导出的HTML元素ID
   * @param {string} fileName - 导出的文件名（不含扩展名）
   * @returns {Promise<void>}
   */
  static async exportElementToPdf(elementId, fileName = 'document') {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        console.error(`Element with ID ${elementId} not found`);
        return;
      }
      
      // 创建canvas
      const canvas = await html2canvas(element, {
        scale: 2, // 提高清晰度
        useCORS: true, // 允许跨域图片
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });
      
      // 获取canvas宽高，设定PDF尺寸
      const imgWidth = 210; // A4宽度(mm)
      const pageHeight = 297; // A4高度(mm)
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      // 创建PDF文档
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // 分页处理
      let position = 0;
      let heightLeft = imgHeight;
      
      // 添加第一页
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // 如果内容过长，添加更多页面
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // 下载PDF
      pdf.save(`${fileName}.pdf`);
      
    } catch (error) {
      console.error('PDF export error:', error);
      throw error;
    }
  }
  
  /**
   * 将数据导出为PDF表格
   * @param {Array} data - 要导出的数据
   * @param {Array} columns - 列配置 [{title: '列标题', key: '数据键名'}]
   * @param {string} title - PDF标题
   * @param {string} fileName - 导出的文件名（不含扩展名）
   * @returns {Promise<void>}
   */
  static async exportDataTableToPdf(data, columns, title = '导出数据', fileName = 'document') {
    try {
      const pdf = new jsPDF();
      
      // 设置标题
      pdf.setFontSize(18);
      pdf.text(title, 14, 22);
      
      // 设置表格位置
      const startY = 30;
      const margin = 14;
      
      // 设置表格样式
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      
      // 创建表头
      const headers = columns.map(col => col.title);
      
      // 准备表格数据
      const tableData = data.map(item => {
        return columns.map(col => item[col.key] || '');
      });
      
      // 添加表格
      pdf.autoTable({
        head: [headers],
        body: tableData,
        startY: startY,
        margin: { left: margin },
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 3,
          overflow: 'linebreak'
        },
        headStyles: {
          fillColor: [220, 220, 220],
          textColor: [0, 0, 0],
          fontStyle: 'bold'
        }
      });
      
      // 添加页码
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.text(`第 ${i} 页，共 ${pageCount} 页`, pdf.internal.pageSize.getWidth() - 45, pdf.internal.pageSize.getHeight() - 10);
      }
      
      // 下载PDF
      pdf.save(`${fileName}.pdf`);
      
    } catch (error) {
      console.error('PDF export error:', error);
      throw error;
    }
  }
}

export default PdfExportService;
