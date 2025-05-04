
import React from "react";
import { useTranslations } from '@/hooks/useTranslations';

export const UserLoadingState: React.FC = () => {
  const { t } = useTranslations();
  
  return (
    <div className="flex justify-center py-16">
      <div className="flex flex-col items-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
        <p className="text-gray-500">{t('common:loadingUserData')}...</p>
      </div>
    </div>
  );
};
