import React from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Shield, 
  FileText, 
  Code,
  TrendingUp 
} from 'lucide-react';
import type { StatisticsData } from '../types/sast';
import { cn, formatNumber, calculatePercentage } from '../utils/helpers';

interface StatisticsCardProps {
  statistics: StatisticsData;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({ statistics }) => {
  const {
    totalVulnerabilities,
    severityStats,
    categoryStats,
    fileStats,
    technologyStats,
    riskDistribution
  } = statistics;

  // 獲取前5個最常見的類別
  const topCategories = Object.entries(categoryStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // 獲取前5個受影響最多的文件
  const topFiles = Object.entries(fileStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // 獲取技術棧統計
  const topTechnologies = Object.entries(technologyStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* 總體概覽 */}
      <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-blue-50 to-indigo-100 hover:from-blue-100 hover:to-indigo-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-blue-900">總體概覽</h3>
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              {formatNumber(totalVulnerabilities)}
            </div>
            <div className="text-sm font-medium text-blue-700">發現的安全問題</div>
          </div>
          
          <div className="space-y-3 bg-white/60 rounded-lg p-4">
            <div className="flex justify-between items-center p-2 bg-red-50 rounded-lg border-red-500">
              <span className="text-sm font-medium text-red-800">🔴 高風險</span>
              <span className="text-lg font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full">
                {formatNumber(riskDistribution.high)}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-amber-50 rounded-lg border-amber-500">
              <span className="text-sm font-medium text-amber-800">🟡 中風險</span>
              <span className="text-lg font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
                {formatNumber(riskDistribution.medium)}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg border-green-500">
              <span className="text-sm font-medium text-green-800">🟢 低風險</span>
              <span className="text-lg font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                {formatNumber(riskDistribution.low)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 嚴重程度分佈 */}
      <div className="bg-white rounded-xl shadow-lg border border-amber-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-amber-50 to-orange-100 hover:from-amber-100 hover:to-orange-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-amber-900">嚴重程度分佈</h3>
          <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="space-y-3">
          {Object.entries(severityStats).map(([severity, count]) => {
            if (count === 0) return null;
            
            const percentage = calculatePercentage(count, totalVulnerabilities);
            const getIcon = () => {
              switch (severity) {
                case 'ERROR': return <AlertTriangle className="h-4 w-4 text-danger-600" />;
                case 'WARNING': return <AlertCircle className="h-4 w-4 text-warning-600" />;
                case 'INFO': return <Info className="h-4 w-4 text-primary-600" />;
                default: return <Shield className="h-4 w-4 text-gray-600" />;
              }
            };

            const getBarColor = () => {
              switch (severity) {
                case 'ERROR': return 'bg-gradient-to-r from-red-500 to-red-600';
                case 'WARNING': return 'bg-gradient-to-r from-amber-500 to-orange-500';
                case 'INFO': return 'bg-gradient-to-r from-blue-500 to-indigo-500';
                default: return 'bg-gradient-to-r from-gray-400 to-gray-500';
              }
            };

            const getBgColor = () => {
              switch (severity) {
                case 'ERROR': return 'bg-red-50 border-red-200';
                case 'WARNING': return 'bg-amber-50 border-amber-200';
                case 'INFO': return 'bg-blue-50 border-blue-200';
                default: return 'bg-gray-50 border-gray-200';
              }
            };

            return (
              <div key={severity} className={cn("p-3 rounded-lg border-2 space-y-2", getBgColor())}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getIcon()}
                    <span className="text-sm font-bold text-gray-800">
                      {severity}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{formatNumber(count)}</div>
                    <div className="text-xs text-gray-600">{percentage}%</div>
                  </div>
                </div>
                <div className="progress-bar bg-white/50">
                  <div
                    className={cn('progress-fill shadow-sm', getBarColor())}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 漏洞類別 Top 5 */}
      <div className="bg-white rounded-xl shadow-lg border p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-red-50 to-pink-100 border-red-200 hover:from-red-100 hover:to-pink-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-red-900">主要漏洞類別</h3>
          <div className="p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-lg">
            <AlertCircle className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="space-y-3">
          {topCategories.length > 0 ? (
            topCategories.map(([category, count], index) => {
              const getBgColor = () => {
                switch (index) {
                  case 0: return 'bg-gradient-to-r from-red-100 to-red-200 border-red-300';
                  case 1: return 'bg-gradient-to-r from-orange-100 to-orange-200 border-orange-300';
                  case 2: return 'bg-gradient-to-r from-amber-100 to-amber-200 border-amber-300';
                  case 3: return 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-300';
                  default: return 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300';
                }
              };

              const getIconColor = () => {
                switch (index) {
                  case 0: return 'bg-red-500';
                  case 1: return 'bg-orange-500';
                  case 2: return 'bg-amber-500';
                  case 3: return 'bg-yellow-500';
                  default: return 'bg-gray-400';
                }
              };

              return (
                <div key={category} className={cn("p-3 rounded-lg border-2 hover:shadow-md transition-all", getBgColor())}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm', getIconColor())}>
                        {index + 1}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-800 block" title={category}>
                          {category.length > 20 ? `${category.slice(0, 20)}...` : category}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900 bg-white/80 px-2 py-1 rounded-full">
                        {formatNumber(count)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-sm text-gray-500 text-center py-4">
              暫無資料
            </div>
          )}
        </div>
      </div>

      {/* 受影響文件 Top 5 */}
      <div className="bg-white rounded-xl shadow-lg border p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200 hover:from-purple-100 hover:to-indigo-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-purple-900">受影響檔案</h3>
          <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="space-y-3">
          {topFiles.length > 0 ? (
            topFiles.map(([filePath, count]) => (
              <div key={filePath} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 truncate flex-1 mr-2" title={filePath}>
                    {filePath.split('/').pop() || filePath}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatNumber(count)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 truncate" title={filePath}>
                  {filePath}
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500 text-center py-4">
              暫無資料
            </div>
          )}
        </div>
      </div>

      {/* 技術棧分布 */}
      <div className="bg-white rounded-xl shadow-lg border p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:from-green-100 hover:to-emerald-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-green-900">技術棧分佈</h3>
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
            <Code className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="space-y-3">
          {topTechnologies.length > 0 ? (
            topTechnologies.map(([technology, count]) => {
              const percentage = calculatePercentage(count, totalVulnerabilities);
              return (
                <div key={technology} className="p-3 bg-white/60 rounded-lg border border-green-200 hover:bg-white/80 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                      <span className="text-sm font-bold text-green-800">
                        {technology.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-700">{formatNumber(count)}</div>
                      <div className="text-xs text-green-600">{percentage}%</div>
                    </div>
                  </div>
                  <div className="progress-bar bg-green-100">
                    <div
                      className="progress-fill bg-gradient-to-r from-green-500 to-emerald-500 shadow-sm"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-sm text-gray-500 text-center py-4">
              暫無資料
            </div>
          )}
        </div>
      </div>

      {/* 掃描覆蓋度 */}
      <div className="bg-white rounded-xl shadow-lg border p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-slate-50 to-gray-100 border-slate-200 hover:from-slate-100 hover:to-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-slate-900">掃描覆蓋度</h3>
          <div className="p-3 bg-gradient-to-br from-slate-500 to-gray-600 rounded-xl shadow-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="text-center p-4 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg border border-blue-200">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {formatNumber(Object.keys(fileStats).length)}
            </div>
            <div className="text-sm font-medium text-blue-700">📁 掃描檔案數</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border border-purple-200">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {formatNumber(Object.keys(categoryStats).length)}
            </div>
            <div className="text-sm font-medium text-purple-700">🏷️ 發現漏洞類型</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border border-green-200">
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {formatNumber(Object.keys(technologyStats).length)}
            </div>
            <div className="text-sm font-medium text-green-700">⚙️ 涉及技術棧</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsCard;
