import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OverviewTab from '../components/OverviewTab';
import DetailListTab from '../components/DetailListTab';
import TabNavigation from '../components/TabNavigation';
import { SASTReportParser } from '../utils/parser';
import type { Vulnerability, FilterOptions, StatisticsData } from '../types/sast';

const ReportPage = () => {
  const navigate = useNavigate();
  
  const [parser, setParser] = useState<SASTReportParser | null>(null);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [selectedVulnerability, setSelectedVulnerability] = useState<Vulnerability | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'detail'>('overview');
  
  // 篩選狀態
  const [filter, setFilter] = useState<FilterOptions>({
    severity: [],
    categories: [],
    technologies: [],
    searchTerm: '',
    riskLevel: []
  });

  // 從localStorage加載數據
  useEffect(() => {
    const savedData = localStorage.getItem('sastReport');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        
        // 重建parser實例
        const newParser = new SASTReportParser(data.parser.report);
        setParser(newParser);
        setVulnerabilities(data.vulnerabilities);
        setStatistics(data.statistics);
      } catch (error) {
        console.error('Failed to load saved report:', error);
        navigate('/');
      }
    } else {
      // 沒有數據，返回首頁
      navigate('/');
    }
  }, [navigate]);

  // 獲取可用的篩選選項
  const availableCategories = useMemo(() => {
    return parser?.getUniqueCategories() || [];
  }, [parser]);

  const availableTechnologies = useMemo(() => {
    return parser?.getUniqueTechnologies() || [];
  }, [parser]);

  // 篩選後的漏洞列表
  const filteredVulnerabilities = useMemo(() => {
    if (!parser) return [];
    
    return parser.filterVulnerabilities(vulnerabilities, {
      severity: filter.severity,
      categories: filter.categories,
      technologies: filter.technologies,
      searchTerm: filter.searchTerm,
      riskLevel: filter.riskLevel
    });
  }, [parser, vulnerabilities, filter]);

  // 排序後的漏洞列表
  const sortedVulnerabilities = useMemo(() => {
    if (!parser) return [];
    
    return parser.sortVulnerabilitiesBySeverity(filteredVulnerabilities);
  }, [parser, filteredVulnerabilities]);

  // 如果數據還在加載中
  if (!parser || !statistics) {
    return (
      <div className="main-content">
        <div className="container py-8">
          <div className="text-center">
            <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
            <p className="text-gray-600">正在載入報告資料...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onGoHome={() => navigate('/')}
        totalIssues={statistics?.totalVulnerabilities || 0}
        version={parser?.getVersion() || 'Unknown'}
        report={parser.getReport()!}
        statistics={statistics}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-[90px]">
        {activeTab === 'overview' ? (
          <OverviewTab
            statistics={statistics}
            report={parser.getReport()!}
            onViewDetailList={() => setActiveTab('detail')}
          />
        ) : (
          <DetailListTab
            vulnerabilities={vulnerabilities}
            filteredVulnerabilities={filteredVulnerabilities}
            sortedVulnerabilities={sortedVulnerabilities}
            selectedVulnerability={selectedVulnerability}
            onVulnerabilitySelect={setSelectedVulnerability}
            filter={filter}
            onFilterChange={setFilter}
            availableCategories={availableCategories}
            availableTechnologies={availableTechnologies}
            statistics={statistics}
          />
        )}
      </div>
    </div>
  );
};

export default ReportPage;
