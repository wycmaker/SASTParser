import React from 'react';
import { BarChart3, List, Home } from 'lucide-react';
import { cn } from '../utils/helpers';
import PDFExportButton from './PDFExportButton';
import type { SASTReport, StatisticsData } from '../types/sast';

interface TabNavigationProps {
  activeTab: 'overview' | 'detail';
  onTabChange: (tab: 'overview' | 'detail') => void;
  onGoHome: () => void;
  totalIssues: number;
  version: string;
  report: SASTReport;
  statistics: StatisticsData;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  onGoHome,
  totalIssues,
  version,
  report,
  statistics
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white shadow-2xl fixed top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          {/* 左側品牌和信息 */}
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">SAST 報告解讀器</h1>
              <div className="flex items-center space-x-4 text-blue-100">
                <span className="flex items-center space-x-1">
                  <span className="text-xs">📋</span>
                  <span className="text-sm">版本 {version}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="text-xs">🔍</span>
                  <span className="text-sm">共發現 <span className="font-bold text-yellow-300">{totalIssues}</span> 個安全問題</span>
                </span>
              </div>
            </div>
          </div>
          
          {/* 右側操作區 */}
          <div className="flex items-center space-x-4">
            {/* Tab 切換器 */}
            <div className="flex bg-white/10 rounded-xl p-1 backdrop-blur-sm border border-white/20">
              <button
                onClick={() => onTabChange('overview')}
                className={cn(
                  'px-6 py-3 text-sm font-medium rounded-lg transition-all duration-300 flex items-center space-x-2',
                  activeTab === 'overview'
                    ? 'bg-white text-blue-600 shadow-lg transform scale-105'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                )}
              >
                <BarChart3 className="h-4 w-4" />
                <span>概覽分析</span>
                {activeTab === 'overview' && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full ml-1"></div>
                )}
              </button>
              
              <button
                onClick={() => onTabChange('detail')}
                className={cn(
                  'px-6 py-3 text-sm font-medium rounded-lg transition-all duration-300 flex items-center space-x-2',
                  activeTab === 'detail'
                    ? 'bg-white text-blue-600 shadow-lg transform scale-105'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                )}
              >
                <List className="h-4 w-4" />
                <span>詳細列表</span>
                {activeTab === 'detail' && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full ml-1"></div>
                )}
              </button>
            </div>
            
            {/* 操作按鈕 */}
            <div className="flex items-center space-x-3">
              <PDFExportButton 
                report={report} 
                statistics={statistics}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              />
              
              <button
                onClick={onGoHome}
                className="bg-white/20 hover:bg-white/30 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/40 flex items-center space-x-2"
              >
                <Home className="h-4 w-4" />
                <span>重新上傳</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;
