
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Search, Download, ChevronUp, ChevronDown, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExcelExportService } from './ExcelExportService';

const UnifiedHomeworkTable = ({ courseId, lectureId, onBack, sectionTitle, lectureTitle }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [submittedData, setSubmittedData] = useState([]);
  const [notSubmittedData, setNotSubmittedData] = useState([]);
  const [filteredSubmitted, setFilteredSubmitted] = useState([]);
  const [filteredNotSubmitted, setFilteredNotSubmitted] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: 'submitted_at',
    direction: 'desc'
  });
  
  // 获取课程作业的所有提交
  const { data: submissions, isLoading: loadingSubmissions } = useQuery({
    queryKey: ['homework-submissions-by-lecture', lectureId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homework_submissions')
        .select(`
          id, 
          user_id, 
          submitted_at,
          created_at
        `)
        .eq('lecture_id', lectureId)
        .eq('course_id', courseId);
        
      if (error) {
        console.error('Error fetching homework submissions:', error);
        return [];
      }
      
      // 确保每个用户只计算一次提交（可能有多个作业）
      const uniqueByUser = {};
      data.forEach(submission => {
        // 如果已经存在此用户，则保留最新提交
        if (!uniqueByUser[submission.user_id] || 
            new Date(submission.submitted_at || submission.created_at) > 
            new Date(uniqueByUser[submission.user_id].submitted_at || uniqueByUser[submission.user_id].created_at)) {
          uniqueByUser[submission.user_id] = submission;
        }
      });
      
      return Object.values(uniqueByUser);
    },
    enabled: !!lectureId && !!courseId,
  });
  
  // 获取所有已报名学生
  const { data: enrollments, isLoading: loadingEnrollments } = useQuery({
    queryKey: ['lecture-enrollments', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`
          user_id,
          enrolled_at
        `)
        .eq('course_id', courseId)
        .eq('status', 'active');
        
      if (error) {
        console.error('Error fetching enrollments:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!courseId,
  });
  
  // 获取所有用户资料信息
  const { data: profiles, isLoading: loadingProfiles } = useQuery({
    queryKey: ['all-user-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email');
        
      if (error) {
        console.error('Error fetching profiles:', error);
        return {};
      }
      
      // 转换为以ID为键的对象，方便查找
      const profileMap = {};
      data.forEach(profile => {
        profileMap[profile.id] = profile;
      });
      
      return profileMap;
    }
  });
  
  // 处理数据并区分已提交和未提交学生
  useEffect(() => {
    if (submissions && enrollments && profiles) {
      // 创建提交者的用户ID集合
      const submittedUserIds = new Set(submissions.map(sub => sub.user_id));
      
      // 构建已提交数据
      const submitted = submissions.map(submission => {
        const profile = profiles[submission.user_id] || { full_name: '未知用户', email: '' };
        const enrollment = enrollments.find(e => e.user_id === submission.user_id);
        
        return {
          id: submission.id,
          user_id: submission.user_id,
          user_name: profile.full_name || '未知用户',
          user_email: profile.email || '',
          submitted_at: submission.submitted_at || submission.created_at,
          enrolled_at: enrollment?.enrolled_at || '',
          display_name: `${profile.full_name || '未知用户'} (${profile.email || '无邮箱'})`
        };
      });
      
      // 构建未提交数据
      const notSubmitted = enrollments
        .filter(enrollment => !submittedUserIds.has(enrollment.user_id))
        .map(enrollment => {
          const profile = profiles[enrollment.user_id] || { full_name: '未知用户', email: '' };
          
          return {
            user_id: enrollment.user_id,
            user_name: profile.full_name || '未知用户',
            user_email: profile.email || '',
            enrolled_at: enrollment.enrolled_at,
            display_name: `${profile.full_name || '未知用户'} (${profile.email || '无邮箱'})`
          };
        });
      
      // 更新状态
      setSubmittedData(submitted);
      setNotSubmittedData(notSubmitted);
      
      // 应用搜索和排序
      applySearchAndSort(submitted, notSubmitted, searchTerm, sortConfig);
    }
  }, [submissions, enrollments, profiles]);
  
  // 查看作业详情
  const handleViewHomework = (userId) => {
    navigate(`/admin/courses-new/${courseId}/homework/student/${userId}?lecture=${lectureId}`);
  };
  
  // 处理排序
  const handleSort = (key, category) => {
    let direction = 'asc';
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    const newSortConfig = { key, direction, category };
    setSortConfig(newSortConfig);
    
    applySearchAndSort(submittedData, notSubmittedData, searchTerm, newSortConfig);
  };
  
  // 应用搜索和排序
  const applySearchAndSort = (submitted, notSubmitted, search, sort) => {
    // 应用搜索
    let filteredSubmittedResults = [...submitted];
    let filteredNotSubmittedResults = [...notSubmitted];
    
    if (search) {
      const lowercasedSearch = search.toLowerCase();
      filteredSubmittedResults = filteredSubmittedResults.filter(item => 
        item.user_name.toLowerCase().includes(lowercasedSearch) || 
        item.user_email.toLowerCase().includes(lowercasedSearch)
      );
      
      filteredNotSubmittedResults = filteredNotSubmittedResults.filter(item => 
        item.user_name.toLowerCase().includes(lowercasedSearch) || 
        item.user_email.toLowerCase().includes(lowercasedSearch)
      );
    }
    
    // 应用排序
    const sortFunction = (a, b) => {
      let keyA, keyB;
      
      if (sort.key === 'display_name') {
        keyA = a.user_name.toLowerCase();
        keyB = b.user_name.toLowerCase();
      } else if (sort.key === 'submitted_at' || sort.key === 'enrolled_at') {
        keyA = new Date(a[sort.key] || 0);
        keyB = new Date(b[sort.key] || 0);
      } else {
        keyA = a[sort.key];
        keyB = b[sort.key];
      }
      
      if (keyA < keyB) return sort.direction === 'asc' ? -1 : 1;
      if (keyA > keyB) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    };
    
    filteredSubmittedResults.sort(sortFunction);
    filteredNotSubmittedResults.sort(sortFunction);
    
    setFilteredSubmitted(filteredSubmittedResults);
    setFilteredNotSubmitted(filteredNotSubmittedResults);
  };
  
  // 处理搜索
  useEffect(() => {
    applySearchAndSort(submittedData, notSubmittedData, searchTerm, sortConfig);
  }, [searchTerm]);
  
  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // 导出数据
  const handleExport = async (type) => {
    try {
      // 获取要导出的数据
      const dataToExport = type === 'submitted' ? filteredSubmitted : filteredNotSubmitted;
      
      // 格式化导出数据
      const exportData = dataToExport.map(item => {
        if (type === 'submitted') {
          return {
            '用户名': item.user_name,
            '邮箱': item.user_email,
            '提交时间': formatDate(item.submitted_at),
            '报名时间': formatDate(item.enrolled_at)
          };
        } else {
          return {
            '用户名': item.user_name,
            '邮箱': item.user_email,
            '报名时间': formatDate(item.enrolled_at)
          };
        }
      });
      
      // 导出文件名
      const fileName = `课程${courseId}_${type === 'submitted' ? '已提交' : '未提交'}作业学生名单`;
      
      // 调用导出服务
      await ExcelExportService.exportToExcel(exportData, fileName);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };
  
  // 渲染排序图标
  const SortIcon = ({ field, category }) => {
    if (sortConfig.key !== field || sortConfig.category !== category) return null;
    
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-3 w-3 ml-1" /> 
      : <ChevronDown className="h-3 w-3 ml-1" />;
  };
  
  // 加载状态判断
  const isLoading = loadingSubmissions || loadingEnrollments || loadingProfiles;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={onBack}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            返回汇总
          </Button>
          {sectionTitle && lectureTitle && (
            <h3 className="text-lg font-medium">
              {sectionTitle} - {lectureTitle}
            </h3>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="搜索用户名或邮箱..."
              className="pl-8 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <div className="relative overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead>
                  <tr className="border-b">
                    <th colSpan="4" className="h-10 px-4 text-center font-medium bg-muted/30">
                      已提交 ({filteredSubmitted.length})
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-7 ml-2"
                        onClick={() => handleExport('submitted')}
                      >
                        <Download className="h-3.5 w-3.5 mr-1" />
                        导出
                      </Button>
                    </th>
                    <th colSpan="2" className="h-10 px-4 text-center font-medium bg-muted/30 border-l">
                      未提交 ({filteredNotSubmitted.length})
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-7 ml-2"
                        onClick={() => handleExport('not-submitted')}
                      >
                        <Download className="h-3.5 w-3.5 mr-1" />
                        导出
                      </Button>
                    </th>
                  </tr>
                  <tr className="border-b bg-muted/50">
                    <th 
                      className="h-10 px-4 text-left align-middle font-medium cursor-pointer hover:bg-muted/70"
                      onClick={() => handleSort('display_name', 'submitted')}
                    >
                      <div className="flex items-center">
                        用户名及邮箱
                        <SortIcon field="display_name" category="submitted" />
                      </div>
                    </th>
                    <th 
                      className="h-10 px-4 text-left align-middle font-medium cursor-pointer hover:bg-muted/70"
                      onClick={() => handleSort('submitted_at', 'submitted')}
                    >
                      <div className="flex items-center">
                        提交时间
                        <SortIcon field="submitted_at" category="submitted" />
                      </div>
                    </th>
                    <th 
                      className="h-10 px-4 text-left align-middle font-medium cursor-pointer hover:bg-muted/70"
                      onClick={() => handleSort('enrolled_at', 'submitted')}
                    >
                      <div className="flex items-center">
                        报名时间
                        <SortIcon field="enrolled_at" category="submitted" />
                      </div>
                    </th>
                    <th className="h-10 px-4 text-left align-middle font-medium">
                      操作
                    </th>
                    
                    {/* 未提交列 */}
                    <th 
                      className="h-10 px-4 text-left align-middle font-medium cursor-pointer hover:bg-muted/70 border-l"
                      onClick={() => handleSort('display_name', 'not-submitted')}
                    >
                      <div className="flex items-center">
                        用户名及邮箱
                        <SortIcon field="display_name" category="not-submitted" />
                      </div>
                    </th>
                    <th 
                      className="h-10 px-4 text-left align-middle font-medium cursor-pointer hover:bg-muted/70"
                      onClick={() => handleSort('enrolled_at', 'not-submitted')}
                    >
                      <div className="flex items-center">
                        报名时间
                        <SortIcon field="enrolled_at" category="not-submitted" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan="6" className="p-4 text-center">加载中...</td>
                    </tr>
                  ) : filteredSubmitted.length === 0 && filteredNotSubmitted.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-4 text-center">未找到学生数据</td>
                    </tr>
                  ) : (
                    // 计算需要显示的最大行数
                    Array.from({ length: Math.max(filteredSubmitted.length, filteredNotSubmitted.length) }).map((_, index) => {
                      const submittedItem = filteredSubmitted[index];
                      const notSubmittedItem = filteredNotSubmitted[index];
                      
                      return (
                        <tr key={`row-${index}`} className="border-t">
                          {/* 已提交学生数据 */}
                          {submittedItem ? (
                            <>
                              <td className="p-4">
                                <div>
                                  <span className="font-medium">{submittedItem.user_name}</span>
                                  <div className="text-sm text-muted-foreground">{submittedItem.user_email}</div>
                                </div>
                              </td>
                              <td className="p-4">{formatDate(submittedItem.submitted_at)}</td>
                              <td className="p-4">{formatDate(submittedItem.enrolled_at)}</td>
                              <td className="p-4">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleViewHomework(submittedItem.user_id)}
                                >
                                  查看作业
                                </Button>
                              </td>
                            </>
                          ) : (
                            <td colSpan="4"></td>
                          )}
                          
                          {/* 未提交学生数据 */}
                          {notSubmittedItem ? (
                            <>
                              <td className="p-4 border-l">
                                <div>
                                  <span className="font-medium">{notSubmittedItem.user_name}</span>
                                  <div className="text-sm text-muted-foreground">{notSubmittedItem.user_email}</div>
                                </div>
                              </td>
                              <td className="p-4">{formatDate(notSubmittedItem.enrolled_at)}</td>
                            </>
                          ) : (
                            <td colSpan="2" className="border-l"></td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedHomeworkTable;
