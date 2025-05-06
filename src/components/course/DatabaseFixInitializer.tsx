
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// 此组件用于确保作业相关表和约束配置正确
export const DatabaseFixInitializer: React.FC = () => {
  const [initialized, setInitialized] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const fixDatabaseConstraints = async () => {
      try {
        console.log('[DatabaseFixInitializer] Running database constraint fixes...');
        
        // 修复作业表约束
        const { error: constraintError } = await supabase.rpc('fix_homework_constraints');
        
        if (constraintError) {
          console.warn('[DatabaseFixInitializer] Error fixing homework constraints:', constraintError);
          // 记录错误但继续执行
        }
        
        // 修复作业表中可能存在的position字段问题
        try {
          // 直接尝试调用fix_homework_order函数
          const { error: orderError } = await supabase.rpc('fix_homework_order');
          
          if (orderError) {
            console.warn('[DatabaseFixInitializer] Error fixing homework order:', orderError);
            // 记录错误但不中断流程
          } else {
            console.log('[DatabaseFixInitializer] Homework order fixed successfully');
          }
        } catch (orderError) {
          console.warn('[DatabaseFixInitializer] Error calling fix_homework_order:', orderError);
          // 继续执行，不要中断流程
        }
        
        console.log('[DatabaseFixInitializer] Database fixes completed');
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
