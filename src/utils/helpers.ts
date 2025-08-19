import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { SeverityLevel } from '../types/sast';

/**
 * 合併和處理CSS類名
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 獲取嚴重程度的樣式類名
 */
export function getSeverityClassName(severity: SeverityLevel): string {
  const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
  
  switch (severity) {
    case 'ERROR':
      return cn(baseClasses, 'bg-danger-100 text-danger-800 border border-danger-200');
    case 'WARNING':
      return cn(baseClasses, 'bg-warning-100 text-warning-800 border border-warning-200');
    case 'INFO':
      return cn(baseClasses, 'bg-primary-100 text-primary-800 border border-primary-200');
    default:
      return cn(baseClasses, 'bg-gray-100 text-gray-800 border border-gray-200');
  }
}

/**
 * 獲取嚴重程度的顏色
 */
export function getSeverityColor(severity: SeverityLevel): string {
  switch (severity) {
    case 'ERROR':
      return '#dc2626';
    case 'WARNING':
      return '#d97706';
    case 'INFO':
      return '#2563eb';
    default:
      return '#6b7280';
  }
}

/**
 * 格式化文件路徑，顯示相對路徑
 */
export function formatFilePath(path: string, maxLength = 50): string {
  if (path.length <= maxLength) {
    return path;
  }
  
  const parts = path.split('/');
  if (parts.length <= 2) {
    return path;
  }
  
  // 顯示前面一段和後面一段，中間用...表示
  const firstPart = parts[0];
  const lastPart = parts[parts.length - 1];
  const middlePart = parts[parts.length - 2];
  
  return `${firstPart}/.../${middlePart}/${lastPart}`;
}

/**
 * 格式化數字，添加千分位分隔符
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * 截斷文本
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substr(0, maxLength - 3) + '...';
}

/**
 * 獲取文件擴展名
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return '';
  return filename.substring(lastDot + 1).toLowerCase();
}

/**
 * 根據文件擴展名獲取語言類型
 */
export function getLanguageFromExtension(extension: string): string {
  const languageMap: Record<string, string> = {
    'js': 'JavaScript',
    'ts': 'TypeScript',
    'jsx': 'React',
    'tsx': 'React TypeScript',
    'py': 'Python',
    'java': 'Java',
    'cs': 'C#',
    'cpp': 'C++',
    'c': 'C',
    'php': 'PHP',
    'rb': 'Ruby',
    'go': 'Go',
    'rs': 'Rust',
    'kt': 'Kotlin',
    'swift': 'Swift',
    'html': 'HTML',
    'css': 'CSS',
    'scss': 'SCSS',
    'less': 'LESS',
    'xml': 'XML',
    'json': 'JSON',
    'yaml': 'YAML',
    'yml': 'YAML',
    'sql': 'SQL',
    'sh': 'Shell',
    'ps1': 'PowerShell',
    'dockerfile': 'Docker'
  };
  
  return languageMap[extension] || extension.toUpperCase();
}

/**
 * 計算百分比
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}