import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, Download, BarChart3 } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import { SASTReportParser } from '../utils/parser';

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // 處理文件上傳
  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const parser = new SASTReportParser();
      const success = await parser.parseFromFile(file);
      
      if (success) {
        const vulnerabilities = parser.getVulnerabilities();
        const statistics = parser.getStatistics();
        
        // 將數據儲存到localStorage或狀態管理中
        localStorage.setItem('sastReport', JSON.stringify({
          parser: {
            report: parser['report'],
            version: parser.getVersion()
          },
          vulnerabilities,
          statistics
        }));
        
        // 導航到報告頁面
        navigate('/report');
      } else {
        setError('檔案格式不正確或不是有效的SAST報告');
      }
    } catch (err) {
      setError('檔案處理失敗: ' + (err instanceof Error ? err.message : '未知錯誤'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 頭部 */}
        <header className="text-center mb-16 pt-8">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Shield className="h-10 w-10 text-blue-600" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">SAST 報告解讀器</h1>
            </div>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            專業的安全報告分析工具，幫助您快速理解和處理SAST掃描結果
          </p>
        </header>

        {/* 文件上傳 */}
        <div className="max-w-4xl mx-auto">
          <FileUpload
            onFileUpload={handleFileUpload}
            isLoading={isLoading}
            error={error}
          />
        </div>

        {/* 功能介紹 */}
        <div className="max-w-6xl mx-auto mt-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center group hover:scale-105">
              <div className="bg-blue-100 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                <BarChart3 className="h-10 w-10 text-blue-600" />
              </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">智慧分析</h3>
                <p className="text-gray-600 leading-relaxed">
                  自動解析SAST報告，生成詳細的統計圖表和風險評估，快速掌握安全狀況
                </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center group hover:scale-105">
              <div className="bg-amber-100 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-amber-200 transition-colors">
                <AlertTriangle className="h-10 w-10 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">風險識別</h3>
              <p className="text-gray-600 leading-relaxed">
                按嚴重程度和影響範圍分類顯示安全漏洞，快速識別並優先處理關鍵風險
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center group hover:scale-105">
              <div className="bg-green-100 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                <Download className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">報告匯出</h3>
              <p className="text-gray-600 leading-relaxed">
                支援PDF匯出分析結果，便於團隊協作、文件歸檔和後續追蹤
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
