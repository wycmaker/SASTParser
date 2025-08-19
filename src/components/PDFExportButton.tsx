import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { exportSASTReport } from '../utils/pdfExporter';
import type { SASTReport, StatisticsData } from '../types/sast';

interface PDFExportButtonProps {
  report: SASTReport;
  statistics: StatisticsData;
  className?: string;
}

const PDFExportButton: React.FC<PDFExportButtonProps> = ({ 
  report, 
  statistics, 
  className = '' 
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    
    try {
      await exportSASTReport(report, statistics);
    } catch (error) {
      console.error('PDF導出失敗:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getButtonContent = () => {
    if (isExporting) {
      return (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>正在生成PDF...</span>
        </>
      );
    }
    
    return (
      <>
        <FileText className="h-4 w-4" />
        <span>匯出報告</span>
      </>
    );
  };

  const getButtonClassName = () => {
    const baseClasses = 'inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    if (isExporting) {
      return `${baseClasses} bg-emerald-500 text-white cursor-not-allowed`;
    }
    
    return `${baseClasses} ${className}`;
  };

  return (
    <div className="relative">
      <button
        onClick={handleExport}
        disabled={isExporting}
        className={getButtonClassName()}
        title="導出完整的PDF安全報告"
      >
        {getButtonContent()}
      </button>
    </div>
  );
};

export default PDFExportButton;