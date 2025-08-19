import React from 'react';
import { 
  Search, 
  Filter, 
  X, 
  AlertTriangle,
  AlertCircle,
  Info,
  Shield
} from 'lucide-react';
import type { FilterOptions, SeverityLevel, RiskLevel } from '../types/sast';
import { cn } from '../utils/helpers';

interface FilterPanelProps {
  filter: FilterOptions;
  onFilterChange: (filter: FilterOptions) => void;
  availableCategories: string[];
  availableTechnologies: string[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filter,
  onFilterChange,
  availableCategories,
  availableTechnologies,
}) => {
  const handleSeverityToggle = (severity: SeverityLevel) => {
    const newSeverities = filter.severity.includes(severity)
      ? filter.severity.filter(s => s !== severity)
      : [...filter.severity, severity];
    
    onFilterChange({
      ...filter,
      severity: newSeverities
    });
  };

  const handleRiskLevelToggle = (riskLevel: RiskLevel) => {
    const newRiskLevels = filter.riskLevel.includes(riskLevel)
      ? filter.riskLevel.filter(r => r !== riskLevel)
      : [...filter.riskLevel, riskLevel];
    
    onFilterChange({
      ...filter,
      riskLevel: newRiskLevels
    });
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = filter.categories.includes(category)
      ? filter.categories.filter(c => c !== category)
      : [...filter.categories, category];
    
    onFilterChange({
      ...filter,
      categories: newCategories
    });
  };

  const handleTechnologyToggle = (technology: string) => {
    const newTechnologies = filter.technologies.includes(technology)
      ? filter.technologies.filter(t => t !== technology)
      : [...filter.technologies, technology];
    
    onFilterChange({
      ...filter,
      technologies: newTechnologies
    });
  };

  const clearAllFilters = () => {
    onFilterChange({
      severity: [],
      categories: [],
      technologies: [],
      searchTerm: '',
      riskLevel: []
    });
  };

  const hasActiveFilters = 
    filter.severity.length > 0 || 
    filter.categories.length > 0 || 
    filter.technologies.length > 0 || 
    filter.riskLevel.length > 0 ||
    filter.searchTerm.trim() !== '';

  const getSeverityIcon = (severity: SeverityLevel) => {
    switch (severity) {
      case 'ERROR':
        return <AlertTriangle className="h-4 w-4" />;
      case 'WARNING':
        return <AlertCircle className="h-4 w-4" />;
      case 'INFO':
        return <Info className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: SeverityLevel) => {
    switch (severity) {
      case 'ERROR':
        return 'text-danger-600 bg-danger-50 border-danger-200';
      case 'WARNING':
        return 'text-warning-600 bg-warning-50 border-warning-200';
      case 'INFO':
        return 'text-primary-600 bg-primary-50 border-primary-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* 頭部 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">篩選器</h3>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-4 w-4" />
            <span>清除所有</span>
          </button>
        )}
      </div>

      {/* 搜索框 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          搜尋
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={filter.searchTerm}
            onChange={(e) => onFilterChange({ ...filter, searchTerm: e.target.value })}
            placeholder="搜尋檔案名、規則ID、描述..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
          />
        </div>
      </div>

      {/* 嚴重程度篩選 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          嚴重程度
        </label>
        <div className="space-y-2">
          {(['ERROR', 'WARNING', 'INFO'] as SeverityLevel[]).map(severity => (
            <label key={severity} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filter.severity.includes(severity)}
                onChange={() => handleSeverityToggle(severity)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <div className={cn(
                'flex items-center space-x-2 px-3 py-1 rounded-full border',
                getSeverityColor(severity)
              )}>
                {getSeverityIcon(severity)}
                <span className="text-sm font-medium">{severity}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* 風險等級篩選 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          風險等級
        </label>
        <div className="space-y-2">
          {(['HIGH', 'MEDIUM', 'LOW'] as RiskLevel[]).map(riskLevel => (
            <label key={riskLevel} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filter.riskLevel.includes(riskLevel)}
                onChange={() => handleRiskLevelToggle(riskLevel)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className={cn(
                'px-3 py-1 rounded text-sm font-medium',
                riskLevel === 'HIGH' ? 'bg-danger-100 text-danger-700' :
                riskLevel === 'MEDIUM' ? 'bg-warning-100 text-warning-700' :
                'bg-success-100 text-success-700'
              )}>
                {riskLevel}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* 漏洞類別篩選 */}
      {availableCategories.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            漏洞類別
          </label>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {availableCategories.slice(0, 10).map(category => (
              <label key={category} className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filter.categories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-0.5"
                />
                <span className="text-sm text-gray-700 leading-relaxed">
                  {category}
                </span>
              </label>
            ))}
            {availableCategories.length > 10 && (
              <div className="text-xs text-gray-500 italic">
                還有 {availableCategories.length - 10} 個類別...
              </div>
            )}
          </div>
        </div>
      )}

      {/* 技術棧篩選 */}
      {availableTechnologies.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            技術棧
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTechnologies.map(technology => (
              <label
                key={technology}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filter.technologies.includes(technology)}
                  onChange={() => handleTechnologyToggle(technology)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className={cn(
                  'px-2 py-1 rounded text-xs font-medium border transition-colors',
                  filter.technologies.includes(technology)
                    ? 'bg-primary-100 text-primary-700 border-primary-200'
                    : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                )}>
                  {technology.toUpperCase()}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
