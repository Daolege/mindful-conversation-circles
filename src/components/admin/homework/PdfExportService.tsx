
import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Loader2, Download } from 'lucide-react';
import { HomeworkSubmission } from '@/lib/types/homework';
import { useTranslation } from 'react-i18next';

// 引入通用字体 - 这是Base64编码的思源黑体精简版
// 注意：实际项目中可能需要根据具体情况调整字体大小和支持的字符集
import { SourceHanSansFont } from './fonts/SourceHanSansFont';

interface PdfExportConfig {
  includeHomeworkQuestion: boolean;
  includeStudentInfo: boolean;
  includeScore: boolean;
  includeFeedback: boolean;
  fileName: string;
}

interface PdfExportServiceProps {
  submissions: HomeworkSubmission[];
  studentName?: string;
  courseTitle?: string;
  onExportStart?: () => void;
  onExportComplete?: () => void;
}

export const PdfExportService: React.FC<PdfExportServiceProps> = ({
  submissions,
  studentName = '未知学生',
  courseTitle = '未知课程',
  onExportStart,
  onExportComplete
}) => {
  const [config, setConfig] = useState<PdfExportConfig>({
    includeHomeworkQuestion: true,
    includeStudentInfo: true,
    includeScore: true,
    includeFeedback: true,
    fileName: `${studentName}-作业汇总`
  });
  const [isExporting, setIsExporting] = useState(false);
  const { i18n } = useTranslation();
  
  // 检测当前语言是否是RTL语言
  const isRTL = React.useMemo(() => {
    return ['ar'].includes(i18n.language);
  }, [i18n.language]);

  const handleExport = async () => {
    if (submissions.length === 0) {
      toast.error('没有可导出的作业内容');
      return;
    }

    try {
      setIsExporting(true);
      onExportStart?.();

      // 创建PDF文档 - 设置适用于多语言的配置
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        compress: true
      });
      
      // 添加思源黑体字体支持 - 这是一个支持多语言的字体
      doc.addFileToVFS('SourceHanSans-Regular.ttf', SourceHanSansFont);
      doc.addFont('SourceHanSans-Regular.ttf', 'SourceHanSans', 'normal');
      
      // 设置默认字体
      doc.setFont('SourceHanSans');
      
      // 如果是RTL语言，调整文本方向
      if (isRTL) {
        // jsPDF 不完全支持RTL，但我们可以通过这种方式部分支持
        doc.setR2L(true);
      }
      
      let yOffset = 20;
      
      // 添加标题
      doc.setFontSize(18);
      doc.text(`${studentName} - 作业汇总`, 105, yOffset, { align: 'center' });
      yOffset += 10;
      
      doc.setFontSize(12);
      doc.text(`课程: ${courseTitle}`, 105, yOffset, { align: 'center' });
      yOffset += 10;
      
      doc.setFontSize(10);
      doc.text(`导出日期: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, 105, yOffset, { align: 'center' });
      yOffset += 15;

      // 根据配置添加学生信息
      if (config.includeStudentInfo) {
        const submission = submissions[0];
        if (submission) {
          doc.setFontSize(12);
          doc.text('学生信息:', 20, yOffset);
          yOffset += 7;
          
          doc.setFontSize(10);
          doc.text(`姓名: ${submission.user_name || '未知'}`, 25, yOffset);
          yOffset += 5;
          
          doc.text(`邮箱: ${submission.user_email || '未知'}`, 25, yOffset);
          yOffset += 10;
        }
      }

      // 遍历每个作业提交
      for (let i = 0; i < submissions.length; i++) {
        const submission = submissions[i];
        
        // 检查是否需要添加新页面
        if (yOffset > 250) {
          doc.addPage();
          yOffset = 20;
        }
        
        // 添加分隔线
        doc.setDrawColor(200, 200, 200);
        doc.line(20, yOffset, 190, yOffset);
        yOffset += 10;
        
        // 作业标题 - 每次文本操作前重新设置字体以确保正确渲染
        doc.setFont('SourceHanSans');
        doc.setFontSize(14);
        doc.text(`作业 ${i+1}: ${submission.homework?.title || '未知作业'}`, 20, yOffset);
        yOffset += 7;
        
        // 提交日期
        doc.setFont('SourceHanSans');
        doc.setFontSize(10);
        doc.text(`提交日期: ${format(new Date(submission.submitted_at || submission.created_at), 'yyyy-MM-dd HH:mm')}`, 20, yOffset);
        yOffset += 7;
        
        // 状态
        doc.setFont('SourceHanSans');
        const statusText = submission.status === 'reviewed' 
          ? '已通过' 
          : submission.status === 'rejected' 
            ? '未通过' 
            : '待审核';
        doc.text(`状态: ${statusText}`, 20, yOffset);
        yOffset += 10;
        
        // 添加作业问题（如果配置中启用）
        if (config.includeHomeworkQuestion && submission.homework) {
          doc.setFont('SourceHanSans');
          doc.setFontSize(12);
          doc.text('题目:', 20, yOffset);
          yOffset += 7;
          
          doc.setFont('SourceHanSans');
          doc.setFontSize(10);
          const homeworkDescription = submission.homework?.description || '';
          if (homeworkDescription) {
            // 如果描述太长，拆分成多行
            const descriptionLines = doc.splitTextToSize(homeworkDescription, 150);
            doc.text(descriptionLines, 25, yOffset);
            yOffset += descriptionLines.length * 5 + 5;
          } else {
            doc.text('无详细描述', 25, yOffset);
            yOffset += 7;
          }
        }
        
        // 添加作业内容
        doc.setFont('SourceHanSans');
        doc.setFontSize(12);
        doc.text('学生答案:', 20, yOffset);
        yOffset += 7;
        
        doc.setFont('SourceHanSans');
        doc.setFontSize(10);
        // 使用 answer 字段，不再使用已弃用的 content 字段
        const content = submission.answer || '无内容';
        // 如果内容太长，拆分成多行
        const contentLines = doc.splitTextToSize(content, 150);
        doc.text(contentLines, 25, yOffset);
        yOffset += contentLines.length * 5 + 5;
        
        // 添加评分（如果配置中启用）
        if (config.includeScore && submission.score !== undefined) {
          doc.setFont('SourceHanSans');
          doc.setFontSize(12);
          doc.text(`评分: ${submission.score} / 100`, 20, yOffset);
          yOffset += 10;
        }
        
        // 添加反馈（如果配置中启用）
        if (config.includeFeedback && submission.feedback) {
          doc.setFont('SourceHanSans');
          doc.setFontSize(12);
          doc.text('教师反馈:', 20, yOffset);
          yOffset += 7;
          
          doc.setFont('SourceHanSans');
          doc.setFontSize(10);
          const feedbackLines = doc.splitTextToSize(submission.feedback, 150);
          doc.text(feedbackLines, 25, yOffset);
          yOffset += feedbackLines.length * 5 + 10;
        }
      }
      
      // 保存PDF
      doc.save(`${config.fileName}.pdf`);
      
      toast.success('PDF导出成功!');
      onExportComplete?.();
    } catch (error) {
      console.error('PDF导出错误:', error);
      toast.error('PDF导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  const updateConfig = (key: keyof PdfExportConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>导出PDF配置</CardTitle>
        <CardDescription>
          自定义PDF导出内容和格式
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fileName">文件名称</Label>
            <Input 
              id="fileName" 
              value={config.fileName} 
              onChange={(e) => updateConfig('fileName', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>包含内容</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-question" 
                  checked={config.includeHomeworkQuestion}
                  onCheckedChange={(checked) => updateConfig('includeHomeworkQuestion', !!checked)}
                />
                <Label htmlFor="include-question">包含作业题目</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-student" 
                  checked={config.includeStudentInfo}
                  onCheckedChange={(checked) => updateConfig('includeStudentInfo', !!checked)}
                />
                <Label htmlFor="include-student">包含学生信息</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-score" 
                  checked={config.includeScore}
                  onCheckedChange={(checked) => updateConfig('includeScore', !!checked)}
                />
                <Label htmlFor="include-score">包含评分</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-feedback" 
                  checked={config.includeFeedback}
                  onCheckedChange={(checked) => updateConfig('includeFeedback', !!checked)}
                />
                <Label htmlFor="include-feedback">包含教师反馈</Label>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            className="w-full"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                导出中...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                导出PDF
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PdfExportService;
