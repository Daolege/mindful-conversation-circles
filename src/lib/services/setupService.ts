
import { supabase } from "@/integrations/supabase/client";

export const setupTables = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('setup_tables', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {},
    });
    
    if (error) {
      console.error("Error setting up tables:", error);
      return { 
        success: false, 
        message: `Error setting up tables: ${error.message}` 
      };
    }
    
    return { 
      success: true, 
      message: data?.message || "Tables set up successfully" 
    };
  } catch (error) {
    console.error("Error setting up tables:", error);
    return { 
      success: false, 
      message: `Error setting up tables: ${(error as Error).message}` 
    };
  }
};

// 添加一个新函数来检查订单是否正确创建
export const verifyOrderCreation = async (orderId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('id, status, currency')
      .eq('id', orderId)
      .single();
    
    if (error || !data) {
      console.error('验证订单创建失败:', error);
      return false;
    }
    
    console.log('订单已成功创建并验证:', data);
    return true;
  } catch (error) {
    console.error('验证订单时出错:', error);
    return false;
  }
};

// 添加模拟作业数据的函数
export const setupHomeworkMockData = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // 导入createMockHomeworkSubmissions函数
    const { createMockHomeworkSubmissions } = await import('@/integrations/supabase/client');
    
    // 创建模拟数据
    const result = await createMockHomeworkSubmissions();
    
    if (!result.success) {
      return {
        success: false,
        message: `创建模拟作业数据失败: ${result.message || '未知错误'}`
      };
    }
    
    return {
      success: true,
      message: result.message || "模拟作业数据创建成功"
    };
  } catch (error) {
    console.error("创建模拟作业数据时出错:", error);
    return { 
      success: false, 
      message: `创建模拟作业数据出错: ${(error as Error).message}` 
    };
  }
};
