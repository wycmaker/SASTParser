import { useNavigate } from 'react-router-dom';
import { Shield, Home } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
        <div className="mb-8">
          <Shield className="h-24 w-24 text-gray-400 mx-auto mb-6" />
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">頁面未找到</h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto mb-8">
            抱歉，您訪問的頁面不存在。可能是連結錯誤或頁面已被移除。
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="btn-primary text-base px-6 py-3"
          >
            <Home className="h-4 w-4 mr-2" />
            返回首頁
          </button>
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary text-base px-6 py-3"
          >
            返回上一頁
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
