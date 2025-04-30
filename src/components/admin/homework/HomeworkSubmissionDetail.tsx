
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getHomeworkSubmissionDetail, updateHomeworkFeedback } from '@/lib/services/homeworkSubmissionService';
import { Loader2, FileText, Download, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface HomeworkSubmissionDetailProps {
  submissionId: string;
  open: boolean;
  onClose: () => void;
}

export function HomeworkSubmissionDetail({
  submissionId,
  open,
  onClose
}: HomeworkSubmissionDetailProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submission, setSubmission] = useState<any | null>(null);
  const [score, setScore] = useState<number | undefined>(undefined);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<string>('pending');
  const [activeTab, setActiveTab] = useState('submission');
  
  // 获取作业提交详情
  useEffect(() => {
    const loadSubmissionDetail = async () => {
      if (!submissionId || !open) return;
      
      setLoading(true);
      try {
        const { data, error } = await getHomeworkSubmissionDetail(submissionId);
        if (error) {
          toast.error("获取作业详情失败");
          return;
        }
        
        if (data) {
          setSubmission(data);
          setScore(data.score);
          setComment(data.teacher_comment || '');
          setStatus(data.status || 'pending');
        }
      } catch (err) {
        console.error("加载作业详情出错:", err);
        toast.error("加载作业详情出错");
      } finally {
        setLoading(false);
      }
    };
    
    loadSubmissionDetail();
  }, [submissionId, open]);
  
  // 保存反馈信息
  const handleSaveFeedback = async () => {
    if (!submissionId) return;
    
    setSaving(true);
    try {
      const feedback = {
        score,
        comment,
        status: status as 'pending' | 'reviewed' | 'excellent' | 'needs_improvement'
      };
      
      const { data, error } = await updateHomeworkFeedback(submissionId, feedback);
      if (error) {
        toast.error("保存反馈失败");
        return;
      }
      
      toast.success("反馈已保存");
      if (data) {
        setSubmission({
          ...submission,
          ...data[0]
        });
      }
    } catch (err) {
      console.error("保存反馈出错:", err);
      toast.error("保存反馈出错");
    } finally {
      setSaving(false);
    }
  };
  
  // 格式化提交日期
  const formatSubmissionDate = (dateString?: string) => {
    if (!dateString) return '未知日期';
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss');
    } catch (err) {
      return '日期格式错误';
    }
  };
  
  // 渲染作业回答内容
  const renderAnswer = () => {
    if (!submission) return null;
    
    // 根据作业类型渲染不同的答案内容
    const answerContent = () => {
      const type = submission.homework?.type;
      
      if (submission.file_url) {
        return (
          <div className="mt-4">
            <div className="flex items-center gap-2 p-3 bg-gray-50 border rounded-md">
              <FileText className="h-5 w-5 text-gray-600" />
              <div className="flex-1 truncate">附件</div>
              <Button size="sm" variant="outline" className="ml-auto" asChild>
                <a href={submission.file_url} target="_blank" rel="noopener noreferrer" download>
                  <Download className="h-4 w-4 mr-1" /> 下载
                </a>
              </Button>
            </div>
          </div>
        );
      }
      
      if (!submission.answer) {
        return <div className="text-gray-500 italic mt-2">（未提供答案）</div>;
      }
      
      switch (type) {
        case 'single_choice':
        case 'multiple_choice':
          try {
            // 尝试解析为JSON格式的选项数组
            const jsonAnswer = JSON.parse(submission.answer);
            if (Array.isArray(jsonAnswer)) {
              return (
                <div className="mt-2 space-y-1">
                  {jsonAnswer.map((option, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{option}</span>
                    </div>
                  ))}
                </div>
              );
            }
          } catch (e) {
            // 如果解析失败，直接显示原始文本
          }
          return <div className="mt-2">{submission.answer}</div>;
          
        case 'fill_blank':
        default:
          return <div className="mt-2 whitespace-pre-wrap">{submission.answer}</div>;
      }
    };
    
    return (
      <div className="space-y-4">
        <div>
          <h3 className="font-medium">作业题目</h3>
          <p className="text-gray-700 mt-1">{submission.homework?.title}</p>
        </div>
        
        <div>
          <h3 className="font-medium">作业说明</h3>
          <p className="text-gray-700 mt-1 whitespace-pre-wrap">
            {submission.homework?.description || '（无作业说明）'}
          </p>
        </div>
        
        <div>
          <h3 className="font-medium">学员回答</h3>
          {answerContent()}
        </div>
        
        <div>
          <h3 className="font-medium">提交信息</h3>
          <div className="grid grid-cols-2 gap-2 mt-1 text-sm">
            <div className="text-gray-500">提交时间:</div>
            <div>{formatSubmissionDate(submission.submitted_at)}</div>
            <div className="text-gray-500">提交状态:</div>
            <div className="flex items-center gap-1">
              {!submission.status || submission.status === 'pending' ? (
                <>
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>待批阅</span>
                </>
              ) : submission.status === 'excellent' ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>优秀</span>
                </>
              ) : submission.status === 'needs_improvement' ? (
                <>
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span>需改进</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span>已批阅</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // 渲染反馈表单
  const renderFeedbackForm = () => {
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="score">评分</Label>
          <Input 
            id="score"
            type="number"
            min="0"
            max="100"
            placeholder="输入分数"
            value={score?.toString() || ''}
            onChange={(e) => setScore(
              e.target.value ? parseInt(e.target.value) : undefined
            )}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="status">状态</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="选择状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">待批阅</SelectItem>
              <SelectItem value="reviewed">已批阅</SelectItem>
              <SelectItem value="excellent">优秀</SelectItem>
              <SelectItem value="needs_improvement">需改进</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="comment">教师评语</Label>
          <Textarea
            id="comment"
            placeholder="输入对此作业的评价和反馈..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={6}
            className="mt-1"
          />
        </div>
      </div>
    );
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>作业提交详情</DialogTitle>
          {submission && (
            <DialogDescription>
              由 <strong>{submission.profiles?.full_name || '未知学员'}</strong> ({submission.profiles?.email}) 提交
            </DialogDescription>
          )}
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>加载作业详情...</span>
          </div>
        ) : submission ? (
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4 grid w-full grid-cols-2">
                <TabsTrigger value="submission">作业内容</TabsTrigger>
                <TabsTrigger value="feedback">评分与反馈</TabsTrigger>
              </TabsList>
              
              <TabsContent value="submission" className="space-y-4">
                {renderAnswer()}
              </TabsContent>
              
              <TabsContent value="feedback" className="space-y-4">
                {renderFeedbackForm()}
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-red-500">无法加载作业详情</p>
          </div>
        )}
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            关闭
          </Button>
          {activeTab === 'feedback' && (
            <Button 
              onClick={handleSaveFeedback} 
              disabled={saving}
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              保存反馈
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
