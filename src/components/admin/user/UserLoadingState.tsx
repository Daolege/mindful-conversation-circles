
import React from "react";

export const UserLoadingState: React.FC = () => {
  return (
    <div className="flex justify-center py-16">
      <div className="flex flex-col items-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
        <p className="text-gray-500">加载用户数据中...</p>
      </div>
    </div>
  );
};
