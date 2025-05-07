
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Loader2 } from 'lucide-react';
import { HomeworkStats } from '@/lib/services/homeworkSubmissionService';

interface HomeworkStatsDashboardProps {
  stats?: HomeworkStats;
  isLoading: boolean;
  courseTitle: string;
  lectureMap: Record<string, string>;
}

export const HomeworkStatsDashboard: React.FC<HomeworkStatsDashboardProps> = ({
  stats,
  isLoading,
  courseTitle,
  lectureMap
}) => {
  const [activeTab, setActiveTab] = React.useState('overview');

  // Format lecture stats for the chart
  const lectureChartData = React.useMemo(() => {
    if (!stats) return [];
    
    return stats.lectureStats.map(stat => ({
      name: lectureMap[stat.lecture_id] || stat.lecture_title || '未知课时',
      total: stat.total,
      reviewed: stat.reviewed,
      pending: stat.pending,
      rejected: stat.rejected,
      completionRate: parseFloat(stat.completion_rate)
    }));
  }, [stats, lectureMap]);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>作业统计</CardTitle>
          <CardDescription>{courseTitle} 的作业提交统计</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>作业统计</CardTitle>
          <CardDescription>{courseTitle} 的作业提交统计</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="text-center text-gray-500">没有作业提交数据</div>
        </CardContent>
      </Card>
    );
  }

  const { overallStats } = stats;
  
  const completionRate = parseFloat(overallStats.completionRate);
  const barColors = {
    reviewed: '#10b981', // green
    pending: '#f59e0b', // amber
    rejected: '#ef4444', // red
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>作业统计</CardTitle>
        <CardDescription>{courseTitle} 的作业提交统计</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">总览</TabsTrigger>
            <TabsTrigger value="lectures">课时详情</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="py-4">
                  <CardDescription>学生人数</CardDescription>
                  <CardTitle className="text-3xl">{overallStats.totalStudents}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="py-4">
                  <CardDescription>作业提交数</CardDescription>
                  <CardTitle className="text-3xl">{overallStats.totalSubmissions}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="py-4">
                  <CardDescription>已审核作业</CardDescription>
                  <CardTitle className="text-3xl">{overallStats.reviewedSubmissions}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="py-4">
                  <CardDescription>作业完成率</CardDescription>
                  <CardTitle className="text-3xl">{overallStats.completionRate}%</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>作业完成状态</CardTitle>
                <CardDescription>全部作业的完成状态分布</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        <span>已通过</span>
                      </div>
                      <span>{overallStats.reviewedSubmissions} ({overallStats.totalSubmissions > 0 ? 
                        (overallStats.reviewedSubmissions / overallStats.totalSubmissions * 100).toFixed(1) : 0}%)</span>
                    </div>
                    <Progress value={overallStats.totalSubmissions > 0 ? 
                      (overallStats.reviewedSubmissions / overallStats.totalSubmissions * 100) : 0} 
                      className="h-2 bg-gray-100" 
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                        <span>待审核</span>
                      </div>
                      <span>{overallStats.pendingSubmissions} ({overallStats.totalSubmissions > 0 ? 
                        (overallStats.pendingSubmissions / overallStats.totalSubmissions * 100).toFixed(1) : 0}%)</span>
                    </div>
                    <Progress value={overallStats.totalSubmissions > 0 ? 
                      (overallStats.pendingSubmissions / overallStats.totalSubmissions * 100) : 0} 
                      className="h-2 bg-gray-100" 
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-500"></div>
                        <span>未通过</span>
                      </div>
                      <span>{overallStats.rejectedSubmissions} ({overallStats.totalSubmissions > 0 ? 
                        (overallStats.rejectedSubmissions / overallStats.totalSubmissions * 100).toFixed(1) : 0}%)</span>
                    </div>
                    <Progress value={overallStats.totalSubmissions > 0 ? 
                      (overallStats.rejectedSubmissions / overallStats.totalSubmissions * 100) : 0} 
                      className="h-2 bg-gray-100" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="lectures">
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>课时作业提交情况</CardTitle>
                  <CardDescription>按课时查看作业提交与审核状态</CardDescription>
                </CardHeader>
                <CardContent className="h-[500px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={lectureChartData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 100,
                      }}
                      barSize={20}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end"
                        tick={{ fontSize: 12 }}
                        height={80}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="reviewed" name="已通过" stackId="a">
                        {lectureChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={barColors.reviewed} />
                        ))}
                      </Bar>
                      <Bar dataKey="pending" name="待审核" stackId="a">
                        {lectureChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={barColors.pending} />
                        ))}
                      </Bar>
                      <Bar dataKey="rejected" name="未通过" stackId="a">
                        {lectureChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={barColors.rejected} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {stats.lectureStats.map((lectureStat) => (
                  <Card key={lectureStat.lecture_id}>
                    <CardHeader className="py-4">
                      <CardTitle>{lectureMap[lectureStat.lecture_id] || lectureStat.lecture_title}</CardTitle>
                      <CardDescription>
                        来自 {lectureStat.section_title} 单元 - 完成率: {lectureStat.completion_rate}%
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span>总提交:</span>
                          <span className="font-medium">{lectureStat.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>已通过:</span>
                          <span className="font-medium text-green-600">{lectureStat.reviewed}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>待审核:</span>
                          <span className="font-medium text-amber-600">{lectureStat.pending}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>未通过:</span>
                          <span className="font-medium text-red-600">{lectureStat.rejected}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default HomeworkStatsDashboard;
