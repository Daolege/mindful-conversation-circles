
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  FileText,
  BarChart3,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface HomeworkStats {
  total_enrolled: number;
  unique_submitters: number;
  completion_rate: number;
  reviewed_submissions: number;
  pending_submissions: number;
  rejected_submissions: number;
  lecture_stats: {
    lecture_id: string;
    total_homework: number;
    unique_submitters: number;
    completion_rate: number;
  }[];
}

interface HomeworkStatsDashboardProps {
  stats?: HomeworkStats;
  isLoading: boolean;
  courseTitle?: string;
  lectureMap?: Record<string, string>;
}

export const HomeworkStatsDashboard: React.FC<HomeworkStatsDashboardProps> = ({
  stats,
  isLoading,
  courseTitle = '课程',
  lectureMap = {}
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Skeleton className="h-[150px] w-full" />
        <Skeleton className="h-[150px] w-full" />
        <Skeleton className="h-[150px] w-full" />
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium">暂无统计数据</h3>
            <p className="text-muted-foreground">还没有收集到足够的数据生成统计信息</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="mr-2 h-4 w-4" />
              提交率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.completion_rate.toFixed(1)}%
            </div>
            <Progress 
              value={stats.completion_rate} 
              className="h-2 mt-2" 
            />
            <p className="text-xs text-muted-foreground mt-2">
              {stats.unique_submitters} / {stats.total_enrolled} 名学生已提交作业
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              作业状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mt-1">
              <Badge variant="outline" className="flex items-center gap-1 bg-green-50">
                <CheckCircle className="h-3 w-3" />
                已通过: {stats.reviewed_submissions}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1 bg-amber-50">
                <Clock className="h-3 w-3" />
                待审核: {stats.pending_submissions}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1 bg-red-50">
                <XCircle className="h-3 w-3" />
                未通过: {stats.rejected_submissions}
              </Badge>
            </div>
            <div className="flex mt-3">
              <div className="h-2 bg-green-500" style={{ width: `${stats.reviewed_submissions / (stats.reviewed_submissions + stats.pending_submissions + stats.rejected_submissions) * 100}%` }}></div>
              <div className="h-2 bg-amber-500" style={{ width: `${stats.pending_submissions / (stats.reviewed_submissions + stats.pending_submissions + stats.rejected_submissions) * 100}%` }}></div>
              <div className="h-2 bg-red-500" style={{ width: `${stats.rejected_submissions / (stats.reviewed_submissions + stats.pending_submissions + stats.rejected_submissions) * 100}%` }}></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BarChart3 className="mr-2 h-4 w-4" />
              课程概览
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courseTitle}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              总共有 {stats.lecture_stats.length} 个章节包含作业
            </p>
            <div className="text-sm mt-2">
              <span className="font-medium">总作业提交: </span>
              {stats.reviewed_submissions + stats.pending_submissions + stats.rejected_submissions}
            </div>
          </CardContent>
        </Card>
      </div>

      {stats.lecture_stats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>章节作业完成情况</CardTitle>
            <CardDescription>
              按章节查看作业提交情况
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.lecture_stats.map((lectureStat) => (
                <div key={lectureStat.lecture_id} className="flex flex-col">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">
                      {lectureMap[lectureStat.lecture_id] || `讲座 ${lectureStat.lecture_id.substring(0, 6)}...`}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {lectureStat.completion_rate.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={lectureStat.completion_rate} className="h-2" />
                  <span className="text-xs text-muted-foreground mt-1">
                    {lectureStat.unique_submitters} / {stats.total_enrolled} 名学生已提交
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HomeworkStatsDashboard;
