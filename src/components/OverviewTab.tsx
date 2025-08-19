import React from 'react';
import StatisticsCard from './StatisticsCard';
import PDFExportButton from './PDFExportButton';
import type { StatisticsData, SASTReport } from '../types/sast';

interface OverviewTabProps {
  statistics: StatisticsData;
  report: SASTReport;
  onViewDetailList: () => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ 
  statistics, 
  report,
  onViewDetailList
}) => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* 統計卡片 */}
      <StatisticsCard statistics={statistics} />
      
      {/* 快速操作和總結 */}
      <div className="bg-white rounded-xl shadow-lg border border-indigo-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-indigo-50 to-purple-100 text-center">
        <div className="mb-6">
          <div className="inline-flex p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-4">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">下一步操作</h3>
          <p className="text-indigo-700">選擇您想要進行的操作</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
          <button
            onClick={onViewDetailList}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-3"
          >
            <span className="text-xl">🔍</span>
            <span>查看詳細漏洞列表</span>
          </button>
          
          <PDFExportButton
            report={report}
            statistics={statistics}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 focus:ring-blue-500 shadow-lg hover:shadow-xl transform hover:scale-105 py-4 px-8 text-lg font-bold rounded-xl"
          />
        </div>
        
        <div className="bg-white/60 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span className="text-xl">⚠️</span>
            <span className="font-semibold text-orange-800">安全提示</span>
          </div>
          <p className="text-sm text-orange-700">
            建議優先處理 <span className="font-bold text-red-600">ERROR</span> 級別的安全問題，它們可能對系統安全造成嚴重威脅
          </p>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
