# SAST 報告解讀器

一个基于React + TypeScript + Vite構建的現代化SAST（靜態應用安全測試）報告解讀器，提供直觀的可視化界面和深度分析功能。

## ✨ 功能特點

- 🚀 **現代化技術棧**: React 18 + TypeScript + Vite + Tailwind CSS
- 📊 **可視化分析**: 丰富的圖表和統計信息
- 🔍 **智能篩選**: 多維度篩選和搜索功能
- 📱 **響應式設計**: 支持桌面和移動設備
- 💾 **報告導出**: 支持多种格式導出分析结果
- 🎨 **現代UI**: 美觀的用戶界面設計
- ⚡ **高性能**: 快速的文件處理和渲染

## 🎯 主要功能

### 智能分析
- 自動解析SAST JSON報告
- 生成詳細的統計圖表和風險評估
- 按嚴重程度、影響范圍、技術棧分類

### 風險識別
- 可視化顯示安全漏洞分布
- 快速識別高風險和觀鍵安全問題
- CWE和OWASP標準分類支持

### 交互式界面
- 拖拽上傳文件
- 實時篩選和搜索
- 詳細的漏洞信息展示
- 可展開的詳情面板

### 報告功能
- 文本格式報告導出
- 完整的統計信息
- 便于團隊協作和文檔歸檔

## 🚀 快速開始

### 環境要求
- Node.js 16.0 或更高版本
- npm 或 yarn 包管理器

### 安装和運行

1. **克隆項目**
```bash
git clone <repository-url>
cd sast-report-viewer
```

2. **安装依賴**
```bash
npm install
```

3. **啟動開發服務器**
```bash
npm run dev
```

4. **打開瀏覽器**
訪問 `http://localhost:5173`

### 構建生產版本

```bash
# 構建項目
npm run build

# 預覽生產版本
npm run preview
```

## 📖 使用指南

### 上傳報告
1. 在首頁點擊上傳區域或拖拽文件
2. 選擇SAST生成的JSON報告文件
3. 等待系统自動解析和處理

### 查看分析結果
- **概覽視圖**: 查看整體統計信息和圖表
- **詳細列表**: 瀏覽所有安全問題的詳細信息

### 使用篩選功能
- **按嚴重程度篩選**: ERROR、WARNING、INFO
- **按風險等级篩選**: HIGH、MEDIUM、LOW
- **按漏洞類别篩選**: 各种安全漏洞類型
- **按技術棧篩選**: .NET、JavaScript、Python等
- **搜索功能**: 支持文件名、規則ID、描述搜索

### 導出報告
點擊"導出報告"按钮，下載包含完整分析结果的文本報告。

## 🛠️ 技術架構

### 核心技術
- **React 18**: 現代化UI框架
- **TypeScript**: 類型安全的JavaScript
- **Vite**: 快速的構建工具
- **Tailwind CSS**: 實用優先的CSS框架

### 數據流
1. 用戶上傳JSON文件
2. SASTReportParser解析文件結構
3. 提取并統計漏洞信息
4. 渲染可視化界面
5. 支持實時篩選和搜索

## 📋 支持的報告格式

### SAST報告
- 版本：SAST 1.x
- 格式：JSON
- 必需字段：
  - `version`: 報告版本
  - `results`: 漏洞數組
  - 每个漏洞包含：路徑、位置、嚴重程度、元數據等

## 🔧 自定義配置

### Tailwind配置
項目使用自定義的Tailwind配置，包含：
- 自定義顏色主題
- 動畫效果
- 響應式斷點

### Vite配置
- TypeScript支持
- 熱更新
- 優化的構建配置

## 🤝 貢獻指南

1. Fork項目
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 創建Pull Request

## 📄 許可證

本項目采用MIT許可證 - 查看 [LICENSE](LICENSE) 文件了解詳情。

## 🆘 常見問題

### Q: 上傳文件後顯示"文件格式不正確"
A: 請確保：
- 文件是有效的JSON格式
- 文件包含SAST的標準字段結構
- 文件大小在合理范圍內

### Q: 為什麼某些漏洞沒有顯示？
A: 檢查篩選条件，確保沒有意外的篩選限制。

### Q: 如何獲取SAST報告？
A: 在GitLab CI/CD pipeline 中運行SAST掃描，下載生成的JSON報告文件。

## 📞 聯繫方式

如有問題或建議，請提交Issue或聯繫項目維護者。
