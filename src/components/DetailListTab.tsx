import React from 'react';
import VulnerabilityList from './VulnerabilityList';
import FilterPanel from './FilterPanel';
import type { Vulnerability, FilterOptions, StatisticsData } from '../types/sast';

interface DetailListTabProps {
  vulnerabilities: Vulnerability[];
  filteredVulnerabilities: Vulnerability[];
  sortedVulnerabilities: Vulnerability[];
  selectedVulnerability: Vulnerability | null;
  onVulnerabilitySelect: (vulnerability: Vulnerability) => void;
  filter: FilterOptions;
  onFilterChange: (filter: FilterOptions) => void;
  availableCategories: string[];
  availableTechnologies: string[];
  statistics: StatisticsData;
}

const DetailListTab: React.FC<DetailListTabProps> = ({
  vulnerabilities,
  filteredVulnerabilities,
  sortedVulnerabilities,
  selectedVulnerability,
  onVulnerabilitySelect,
  filter,
  onFilterChange,
  availableCategories,
  availableTechnologies,
  statistics
}) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 w-full max-w-full animate-fade-in">
      {/* 左側篩選面板 */}
      <div className="xl:col-span-1 w-full max-w-full">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
          <FilterPanel
            filter={filter}
            onFilterChange={onFilterChange}
            availableCategories={availableCategories}
            availableTechnologies={availableTechnologies}
          />
        </div>
      </div>
      
      {/* 右側漏洞列表 */}
      <div className="xl:col-span-3 w-full max-w-full min-w-0">
        <div className="space-y-6">
          {/* 列表頭部信息 */}
          <div className="bg-gradient-to-r from-slate-50 to-gray-100 rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-gray-800 bg-clip-text text-transparent">
                  安全問題詳情
                </h2>
                <p className="text-sm text-slate-600 mt-2 flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <span className="text-xs">📊</span>
                    <span>顯示 <span className="font-bold text-blue-600">{filteredVulnerabilities.length}</span> / {vulnerabilities.length} 個問題</span>
                  </span>
                  {filteredVulnerabilities.length !== vulnerabilities.length && (
                    <span className="flex items-center space-x-1">
                      <span className="text-xs">🔍</span>
                      <span className="text-blue-600 font-medium">(已篩選)</span>
                    </span>
                  )}
                </p>
              </div>
              
              <div className="flex flex-col space-y-2">
                {statistics.severityStats.ERROR > 0 && (
                  <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg shadow-md">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🚨</span>
                      <span className="font-bold">{statistics.severityStats.ERROR} 個嚴重問題</span>
                    </div>
                  </div>
                )}
                {statistics.severityStats.WARNING > 0 && (
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg shadow-md">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">⚠️</span>
                      <span className="font-bold">{statistics.severityStats.WARNING} 個警告</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* 漏洞列表 */}
          <VulnerabilityList
            vulnerabilities={sortedVulnerabilities}
            onVulnerabilitySelect={onVulnerabilitySelect}
            selectedVulnerability={selectedVulnerability}
          />
        </div>
      </div>
    </div>
  );
};

export default DetailListTab;
