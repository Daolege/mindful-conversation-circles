
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

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
        <p className="text-xl text-gray-600 mb-4">页面未找到</p>
        <p className="mb-6 text-gray-500">
          您尝试访问的页面不存在或已被移除。
        </p>
        <a 
          href="/" 
          className="inline-block px-6 py-3 bg-knowledge-primary text-white rounded-lg font-medium hover:bg-knowledge-secondary transition-colors"
        >
          返回主页
        </a>
      </div>
    </div>
  );
};

export default NotFound;
