
import { useState, useEffect } from 'react';

interface ChatRecord {
  id: string;
  message: string;
  timestamp: number;
}

const MAX_CHAT_RECORDS = 100;
const STORAGE_KEY = 'chatHistory';

export const useChatHistory = () => {
  const [chatHistory, setChatHistory] = useState<ChatRecord[]>(() => {
    // 初始化时从 localStorage 读取
    try {
      const storedHistory = localStorage.getItem(STORAGE_KEY);
      return storedHistory ? JSON.parse(storedHistory) : [];
    } catch (error) {
      console.error('Failed to parse chat history from localStorage:', error);
      return [];
    }
  });

  // 添加新的聊天记录
  const addChatRecord = (message: string) => {
    const newRecord: ChatRecord = {
      id: Date.now().toString(),
      message,
      timestamp: Date.now()
    };

    setChatHistory(prevHistory => {
      // 如果超过最大记录数，删除最旧的记录
      const updatedHistory = [
        ...prevHistory, 
        newRecord
      ].slice(-MAX_CHAT_RECORDS);

      // 将更新后的记录保存到 localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      } catch (error) {
        console.error('Failed to save chat history to localStorage:', error);
      }

      return updatedHistory;
    });
  };

  // 清除所有聊天记录
  const clearChatHistory = () => {
    setChatHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear chat history from localStorage:', error);
    }
  };

  return {
    chatHistory,
    addChatRecord,
    clearChatHistory
  };
};
