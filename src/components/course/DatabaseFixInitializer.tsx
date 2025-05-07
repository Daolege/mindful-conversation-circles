
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// 此组件用于确保作业相关表和约束配置正确
export const DatabaseFixInitializer: React.FC = () => {
  const [initialized, setInitialized] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [fixLogs, setFixLogs] = useState<string[]>([]);

  useEffect(() => {
    const fixDatabaseConstraints = async () => {
      try {
        console.log('[DatabaseFixInitializer] Running database constraint fixes...');
        
        // 收集日志
        const logs: string[] = [];
        logs.push('开始执行数据库修复流程');
        
        // 修复作业表约束 - 增加错误处理和重试机制
        try {
          logs.push('尝试修复作业表约束');
          const { error: constraintError } = await supabase.rpc('fix_homework_constraints');
          
          if (constraintError) {
            console.warn('[DatabaseFixInitializer] Error fixing homework constraints:', constraintError);
            logs.push(`约束修复错误: ${constraintError.message}`);
            // 记录错误但继续执行
          } else {
            logs.push('作业表约束修复成功');
          }
        } catch (constraintError) {
          console.warn('[DatabaseFixInitializer] Exception fixing constraints:', constraintError);
          logs.push(`约束修复异常: ${(constraintError as Error).message}`);
          // 继续执行
        }
        
        // 修复作业表中可能存在的position字段问题 - 增加错误处理和重试机制
        try {
          logs.push('尝试修复作业排序');
          // 直接尝试调用fix_homework_order函数
          const { error: orderError } = await supabase.rpc('fix_homework_order');
          
          if (orderError) {
            console.warn('[DatabaseFixInitializer] Error fixing homework order:', orderError);
            logs.push(`排序修复错误: ${orderError.message}`);
            
            // 尝试客户端修复机制 - 记录尝试但不影响流程
            logs.push('尝试使用客户端修复机制');
            try {
              // 获取所有没有正确position的作业
              const { data: homeworks, error: fetchError } = await supabase
                .from('homework')
                .select('id, lecture_id, created_at')
                .or('position.is.null,position.eq.0');
              
              if (!fetchError && homeworks && homeworks.length > 0) {
                logs.push(`发现 ${homeworks.length} 个需要修复的作业项`);
                
                // 按讲座ID分组
                const lectureGroups = homeworks.reduce((groups: Record<string, any[]>, hw) => {
                  if (!groups[hw.lecture_id]) {
                    groups[hw.lecture_id] = [];
                  }
                  groups[hw.lecture_id].push(hw);
                  return groups;
                }, {});
                
                // 更新每个分组的position
                for (const lectureId in lectureGroups) {
                  const items = lectureGroups[lectureId].sort((a, b) => {
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                  });
                  
                  for (let i = 0; i < items.length; i++) {
                    // 更新position
                    await supabase
                      .from('homework')
                      .update({ position: i + 1 })
                      .eq('id', items[i].id);
                  }
                }
                
                logs.push('客户端position修复完成');
              } else if (fetchError) {
                logs.push(`获取需修复作业失败: ${fetchError.message}`);
              } else {
                logs.push('未发现需要修复的作业');
              }
            } catch (clientFixError) {
              logs.push(`客户端修复异常: ${(clientFixError as Error).message}`);
            }
          } else {
            logs.push('作业排序修复成功');
          }
        } catch (orderError) {
          console.warn('[DatabaseFixInitializer] Error calling fix_homework_order:', orderError);
          logs.push(`排序修复异常: ${(orderError as Error).message}`);
          // 继续执行，不要中断流程
        }
        
        // 保存日志记录
        setFixLogs(logs);
        console.log('[DatabaseFixInitializer] Database fixes completed with logs:', logs);
        setInitialized(true);
      } catch (error) {
        console.warn('[DatabaseFixInitializer] Error fixing database constraints:', error);
        
        // 如果是第一次尝试失败，再尝试一次
        if (attempt === 0) {
          console.log('[DatabaseFixInitializer] Retrying database fixes...');
          setAttempt(1);
          return;
        }
        
        // 第二次尝试也失败，标记为已初始化，避免无限重试
        setInitialized(true);
      }
    };

    if (!initialized) {
      fixDatabaseConstraints();
    }

    return () => {
      console.log('[DatabaseFixInitializer] Cleanup on unmount');
      // 清理任何可能存在的toast通知
      try {
        toast.dismiss();
      } catch (e) {
        // 忽略可能的错误
      }
    };
  }, [initialized, attempt]);

  // 无需渲染任何UI
  return null;
};
