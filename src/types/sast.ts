// SAST 報告相關類型定義

export interface SASTReport {
  version: string;
  results: Vulnerability[];
  errors?: string[];
  paths?: Record<string, unknown>;
  engine_requested?: string;
  skipped_rules?: string[];
}

export interface Vulnerability {
  check_id: string;
  path: string;
  start: Position;
  end: Position;
  extra: VulnerabilityExtra;
}

export interface Position {
  line: number;
  col: number;
  offset: number;
}

export interface VulnerabilityExtra {
  message: string;
  metadata: VulnerabilityMetadata;
  severity: SeverityLevel;
  fingerprint?: string;
  lines?: string;
  validation_state?: string;
  engine_kind?: string;
}

export interface VulnerabilityMetadata {
  likelihood: RiskLevel;
  impact: RiskLevel;
  confidence: RiskLevel;
  category: string;
  cwe?: string[];
  cwe2021_top25?: boolean;
  cwe2022_top25?: boolean;
  owasp?: string[];
  references?: string[];
  subcategory?: string[];
  technology?: string[];
  license?: string;
  vulnerability_class?: string[];
  source?: string;
  shortlink?: string;
}

export type SeverityLevel = 'ERROR' | 'WARNING' | 'INFO' | 'UNKNOWN';
export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

// 統計數據接口
export interface StatisticsData {
  totalVulnerabilities: number;
  severityStats: Record<SeverityLevel, number>;
  categoryStats: Record<string, number>;
  fileStats: Record<string, number>;
  technologyStats: Record<string, number>;
  riskDistribution: {
    high: number;
    medium: number;
    low: number;
  };
}

// 過濾器接口
export interface FilterOptions {
  severity: SeverityLevel[];
  categories: string[];
  technologies: string[];
  searchTerm: string;
  riskLevel: RiskLevel[];
}

// 排序選項
export type SortOption = 'severity' | 'file' | 'category' | 'line';
export type SortDirection = 'asc' | 'desc';

// UI 狀態接口
export interface UIState {
  isLoading: boolean;
  error: string | null;
  selectedVulnerability: Vulnerability | null;
  filter: FilterOptions;
  sort: {
    field: SortOption;
    direction: SortDirection;
  };
  view: 'list' | 'grid' | 'summary';
}
