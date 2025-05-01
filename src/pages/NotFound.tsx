
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslations } from "@/hooks/useTranslations";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslations();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
      "Full location object:",
      location
    );
  }, [location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">404</h1>
        <p className="text-xl text-gray-600 mb-4">{t('errors:pageNotFound')}</p>
        <p className="mb-6 text-gray-500">
          {t('errors:pageDoesNotExistOrWasRemoved')}
        </p>
        <a 
          href="/" 
          className="inline-block px-6 py-3 bg-knowledge-primary text-white rounded-lg font-medium hover:bg-knowledge-secondary transition-colors"
        >
          {t('common:backToHome')}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
