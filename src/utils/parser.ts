import type { SASTReport, Vulnerability, StatisticsData, SeverityLevel, RiskLevel } from '../types/sast';

export class SASTReportParser {
  private report: SASTReport | null = null;

  constructor(reportData?: SASTReport) {
    if (reportData) {
      this.report = reportData;
    }
  }

  /**
   * 解析JSON字符串為SAST報告
   */
  parseFromJSON(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (this.validateReportStructure(data)) {
        this.report = data;
        return true;
      }
      return false;
    } catch (error) {
      console.error('JSON解析错误:', error);
      return false;
    }
  }

  /**
   * 從文件解析SAST報告
   */
  async parseFromFile(file: File): Promise<boolean> {
    try {
      const text = await file.text();
      return this.parseFromJSON(text);
    } catch (error) {
      console.error('文件读取错误:', error);
      return false;
    }
  }

  /**
   * 驗證報告結構
   */
  private validateReportStructure(data: unknown): data is SASTReport {
    return (
      data !== null &&
      typeof data === 'object' &&
      data !== null &&
      'results' in data &&
      'version' in data &&
      Array.isArray((data as Record<string, unknown>).results) &&
      typeof (data as Record<string, unknown>).version === 'string'
    );
  }

  /**
   * 獲取原始報告數據
   */
  getReport(): SASTReport | null {
    return this.report;
  }

  /**
   * 獲取漏洞列表
   */
  getVulnerabilities(): Vulnerability[] {
    return this.report?.results || [];
  }

  /**
   * 獲取統計數據
   */
  getStatistics(): StatisticsData {
    const vulnerabilities = this.getVulnerabilities();
    
    const severityStats: Record<SeverityLevel, number> = {
      'ERROR': 0,
      'WARNING': 0,
      'INFO': 0,
      'UNKNOWN': 0
    };

    const categoryStats: Record<string, number> = {};
    const fileStats: Record<string, number> = {};
    const technologyStats: Record<string, number> = {};
    
    let highRisk = 0;
    let mediumRisk = 0;
    let lowRisk = 0;

    vulnerabilities.forEach(vuln => {
      // 嚴重程度統計
      const severity = vuln.extra?.severity || 'UNKNOWN';
      severityStats[severity as SeverityLevel]++;

      // 風險等級統計
      const impact = vuln.extra?.metadata?.impact;
      if (impact === 'HIGH') highRisk++;
      else if (impact === 'MEDIUM') mediumRisk++;
      else if (impact === 'LOW') lowRisk++;

      // 漏洞類別統計
      const vulnClasses = vuln.extra?.metadata?.vulnerability_class || [];
      vulnClasses.forEach(vc => {
        categoryStats[vc] = (categoryStats[vc] || 0) + 1;
      });

      // 文件統計
      const filePath = vuln.path;
      fileStats[filePath] = (fileStats[filePath] || 0) + 1;

      // 技術棧統計
      const technologies = vuln.extra?.metadata?.technology || [];
      technologies.forEach(tech => {
        technologyStats[tech] = (technologyStats[tech] || 0) + 1;
      });
    });

    return {
      totalVulnerabilities: vulnerabilities.length,
      severityStats,
      categoryStats,
      fileStats,
      technologyStats,
      riskDistribution: {
        high: highRisk,
        medium: mediumRisk,
        low: lowRisk
      }
    };
  }

  /**
   * 按嚴重程度排序漏洞
   */
  sortVulnerabilitiesBySeverity(vulnerabilities: Vulnerability[], descending = true): Vulnerability[] {
    const severityOrder: Record<SeverityLevel, number> = {
      'ERROR': 4,
      'WARNING': 3,
      'INFO': 2,
      'UNKNOWN': 1
    };

    return [...vulnerabilities].sort((a, b) => {
      const severityA = a.extra?.severity || 'UNKNOWN';
      const severityB = b.extra?.severity || 'UNKNOWN';
      const orderA = severityOrder[severityA as SeverityLevel];
      const orderB = severityOrder[severityB as SeverityLevel];
      
      return descending ? orderB - orderA : orderA - orderB;
    });
  }

  /**
   * 過濾漏洞
   */
  filterVulnerabilities(
    vulnerabilities: Vulnerability[],
    options: {
      severity?: SeverityLevel[];
      categories?: string[];
      technologies?: string[];
      searchTerm?: string;
      riskLevel?: RiskLevel[];
    }
  ): Vulnerability[] {
    return vulnerabilities.filter(vuln => {
      // 嚴重程度過濾
      if (options.severity && options.severity.length > 0) {
        const severity = vuln.extra?.severity || 'UNKNOWN';
        if (!options.severity.includes(severity as SeverityLevel)) {
          return false;
        }
      }

      // 類別過濾
      if (options.categories && options.categories.length > 0) {
        const vulnClasses = vuln.extra?.metadata?.vulnerability_class || [];
        if (!vulnClasses.some(vc => options.categories!.includes(vc))) {
          return false;
        }
      }

      // 技術棧過濾
      if (options.technologies && options.technologies.length > 0) {
        const technologies = vuln.extra?.metadata?.technology || [];
        if (!technologies.some(tech => options.technologies!.includes(tech))) {
          return false;
        }
      }

      // 風險等級過濾
      if (options.riskLevel && options.riskLevel.length > 0) {
        const impact = vuln.extra?.metadata?.impact || 'UNKNOWN';
        if (!options.riskLevel.includes(impact as RiskLevel)) {
          return false;
        }
      }

      // 搜索詞過濾
      if (options.searchTerm && options.searchTerm.trim()) {
        const searchTerm = options.searchTerm.toLowerCase();
        const searchableText = [
          vuln.path,
          vuln.check_id,
          vuln.extra?.message || '',
          ...(vuln.extra?.metadata?.vulnerability_class || []),
          ...(vuln.extra?.metadata?.cwe || []),
          ...(vuln.extra?.metadata?.owasp || [])
        ].join(' ').toLowerCase();

        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * 獲取唯一的類別列表
   */
  getUniqueCategories(): string[] {
    const categories = new Set<string>();
    this.getVulnerabilities().forEach(vuln => {
      const vulnClasses = vuln.extra?.metadata?.vulnerability_class || [];
      vulnClasses.forEach(vc => categories.add(vc));
    });
    return Array.from(categories).sort();
  }

  /**
   * 獲取唯一的技術棧列表
   */
  getUniqueTechnologies(): string[] {
    const technologies = new Set<string>();
    this.getVulnerabilities().forEach(vuln => {
      const techs = vuln.extra?.metadata?.technology || [];
      techs.forEach(tech => technologies.add(tech));
    });
    return Array.from(technologies).sort();
  }

  /**
   * 獲取報告版本
   */
  getVersion(): string {
    return this.report?.version || 'Unknown';
  }

  /**
   * 檢查是否有有效報告
   */
  hasValidReport(): boolean {
    return this.report !== null && Array.isArray(this.report.results);
  }
}
