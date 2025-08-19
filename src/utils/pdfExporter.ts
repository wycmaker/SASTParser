import jsPDF from "jspdf";
import "jspdf-font";
import type { SASTReport, Vulnerability, StatisticsData } from "../types/sast";
import { FontLoader } from "./fontLoader";

export class PDFExporter {
  private doc: jsPDF;
  private currentY: number = 20;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;
  private vulnerabilities: Vulnerability[] = [];
  private pageNumbers: Map<string, number> = new Map();
  private vulnAnchors: Map<string, number> = new Map(); // 記錄每個漏洞的頁碼

  constructor() {
    // 創建支持中文的PDF文檔
    this.doc = new jsPDF("p", "mm", "a4");
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();

    // 字型設定會在 exportReport 時進行
  }

  /**
   * 設置中文字體支持
   */
  private async setupChineseFont(): Promise<void> {
    try {
      // 直接使用 TaipeiSansTCBeta-Regular.ttf 字型
      await this.addTaipeiSansFont();

      // 設定字型
      this.doc.setFont("TaipeiSansTC");
      this.doc.setFontSize(12);
      console.log("台北黑體字型設定成功");
    } catch (error) {
      console.warn("台北黑體字型設定失敗，使用預設字型:", error);
      this.doc.setFont("helvetica");
      this.doc.setFontSize(12);
    }
  }

  /**
   * 添加台北黑體字型
   */
  private async addTaipeiSansFont(): Promise<void> {
    try {
      // 字型檔案的 base64 編碼
      const fontData = await this.getTaipeiSansFontData();

      if (fontData) {
        this.doc.addFont(fontData, "TaipeiSansTC", "normal");
        console.log("台北黑體字型添加成功");
      } else {
        throw new Error("無法獲取台北黑體字型資料");
      }
    } catch (error) {
      console.warn("無法添加台北黑體字型:", error);
      throw error;
    }
  }

  /**
   * 獲取台北黑體字型資料
   */
  private async getTaipeiSansFontData(): Promise<string | null> {
    try {
      // 使用 FontLoader 載入字型檔案
      const fontPath = "/fonts/TaipeiSansTCBeta-Regular.ttf";
      const fontData = await FontLoader.loadTTFFont(fontPath);
      return fontData;
    } catch (error) {
      console.warn("載入台北黑體字型失敗:", error);
      return null;
    }
  }

  /**
   * 匯出完整的SAST報告
   */
  async exportReport(
    report: SASTReport,
    statistics: StatisticsData
  ): Promise<void> {
    this.vulnerabilities = report.results;

    // 設定中文字型
    await this.setupChineseFont();

    // 生成封面頁面（第1頁）
    this.generateCoverPage();

    // 先產生詳細頁面並記錄每個漏洞的頁碼（改以 CWE 分組）
    this.generateVulnerabilityDetailsByCWE();

    // 計算目錄需要的頁數
    const tocPageCount = this.calculateTOCPageCount();

    // 在第2頁開始插入目錄頁面
    for (let i = 0; i < tocPageCount; i++) {
      this.doc.insertPage(2 + i);
    }

    // 調整所有錨點頁碼（因為插入了多頁目錄）
    this.adjustAnchorsForInsertedTOC(2, tocPageCount);

    // 生成目錄內容（可能跨多頁）
    this.generateTableOfContentsMultiPage();

    // 在目錄後面插入概覽分析頁面
    this.doc.insertPage(2 + tocPageCount);
    this.adjustAnchorsForInsertedTOC(2 + tocPageCount, 1);
    
    // 設定到概覽頁面並生成內容
    this.doc.setPage(2 + tocPageCount);
    this.currentY = 20;
    this.generateOverviewPage(statistics);

    // 保存PDF
    this.doc.save(
      `SAST-安全報告-${new Date().toISOString().split("T")[0]}.pdf`
    );
  }

  /**
   * 插入目錄頁後，將所有已記錄的頁碼（漏洞錨點與分類頁碼）向後平移
   */
  private adjustAnchorsForInsertedTOC(
    insertedAtPage: number,
    pageCount: number = 1
  ): void {
    // 調整漏洞錨點頁碼
    const updatedVulnAnchors = new Map<string, number>();
    this.vulnAnchors.forEach((page, key) => {
      const newPage = page >= insertedAtPage ? page + pageCount : page;
      updatedVulnAnchors.set(key, newPage);
    });
    this.vulnAnchors = updatedVulnAnchors;

    // 若有分類頁碼記錄，一併調整
    const updatedPageNumbers = new Map<string, number>();
    this.pageNumbers.forEach((page, key) => {
      const newPage = page >= insertedAtPage ? page + pageCount : page;
      updatedPageNumbers.set(key, newPage);
    });
    this.pageNumbers = updatedPageNumbers;
  }

  /**
   * 計算目錄需要的頁數
   */
  private calculateTOCPageCount(): number {
    const groupedVulns = this.groupVulnerabilitiesByCWE();
    const cweCount = Object.keys(groupedVulns).length;

    // 概覽標題與小節固定行數 + CWE 條目數，估算每頁可容納的項目數量
    const itemsPerPage = 25; // 每頁約25個項目
    const estimatedPages = Math.ceil((5 + cweCount) / itemsPerPage);

    return Math.max(1, estimatedPages); // 至少1頁
  }

  /**
   * 生成多頁目錄內容
   */
  private generateTableOfContentsMultiPage(): void {
    const currentPage = 2;
    let currentY = 20;

    // 第1頁目錄
    this.doc.setPage(currentPage);
    this.doc.setFontSize(20);
    this.doc.setTextColor(44, 62, 80);
    this.doc.text("目錄", this.pageWidth / 2, currentY, { align: "center" });

    currentY += 20;

    // 概覽分析部分
    this.doc.setFontSize(14);
    this.doc.setTextColor(52, 73, 94);
    this.doc.text("1. 概覽分析", this.margin, currentY);
    currentY += 8;

    this.doc.setFontSize(12);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text("  1.1 總體統計", this.margin + 10, currentY);
    currentY += 6;
    this.doc.text("  1.2 嚴重程度分佈", this.margin + 10, currentY);
    currentY += 6;
    this.doc.text("  1.3 風險等級分佈", this.margin + 10, currentY);
    currentY += 6;
    this.doc.text("  1.4 漏洞類別分佈", this.margin + 10, currentY);
    currentY += 6;
    this.doc.text("  1.5 安全建議", this.margin + 10, currentY);

    currentY += 15;

    // 詳細漏洞資訊部分
    this.doc.setFontSize(14);
    this.doc.setTextColor(52, 73, 94);
    this.doc.text("2. 詳細漏洞資訊", this.margin, currentY);
    currentY += 8;

    this.doc.setFontSize(12);
    this.doc.setTextColor(100, 100, 100);

    // 以 CWE 分組
    const groupedVulns = this.groupVulnerabilitiesByCWE();

    Object.entries(groupedVulns).forEach(
      ([category]: [string, Vulnerability[]]) => {
        // 目錄僅列出 CWE，點擊跳到對應 CWE 詳細頁第一頁
        const cwe = category;
        const linkText = `  ${cwe}`;
        this.doc.setTextColor(52, 152, 219);
        this.doc.setFontSize(10);
        const x = this.margin + 10;
        const maxWidth = this.pageWidth - this.margin - x;
        const targetPage = this.pageNumbers.get(`cwe_${cwe}`);
        currentY = this.drawWrappedLink(
          linkText,
          x,
          currentY,
          maxWidth,
          targetPage ? { pageNumber: targetPage } : {}
        );
        currentY += 5;
      }
    );
  }

  /**
   * 生成封面頁面
   */
  private generateCoverPage(): void {
    // 頂部裝飾線
    this.doc.setDrawColor(52, 152, 219);
    this.doc.setLineWidth(3);
    this.doc.line(
      this.margin,
      30,
      this.pageWidth - this.margin,
      30
    );

    // 頁面標題
    this.currentY = 80;
    this.doc.setFontSize(32);
    this.doc.setTextColor(44, 62, 80);
    this.doc.text("SAST 安全掃描報告", this.pageWidth / 2, this.currentY, {
      align: "center",
    });

    this.currentY += 20;

    // 副標題
    this.doc.setFontSize(18);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text(
      "靜態應用程式安全測試報告",
      this.pageWidth / 2,
      this.currentY,
      { align: "center" }
    );

    this.currentY += 20;

    // 報告資訊區塊
    const infoBoxWidth = 120;
    const infoBoxHeight = 80;
    const infoBoxX = (this.pageWidth - infoBoxWidth) / 2;
    const infoBoxY = this.currentY;

    // 資訊區塊背景
    this.doc.setFillColor(248, 249, 250);
    this.doc.setDrawColor(52, 152, 219);
    this.doc.setLineWidth(1);
    this.doc.roundedRect(infoBoxX, infoBoxY, infoBoxWidth, infoBoxHeight, 3, 3, 'FD');

    // 資訊區塊標題
    this.doc.setFontSize(14);
    this.doc.setTextColor(52, 73, 94);
    this.doc.text("報告摘要", infoBoxX + infoBoxWidth / 2, infoBoxY + 15, { align: "center" });

    // 漏洞數量
    this.doc.setFontSize(12);
    this.doc.setTextColor(231, 76, 60);
    this.doc.text(
      `總漏洞數量: ${this.vulnerabilities.length}`,
      infoBoxX + 10,
      infoBoxY + 35
    );

    // 生成時間
    this.doc.setTextColor(100, 100, 100);
    this.doc.text(
      `生成時間: ${new Date().toLocaleString("zh-TW")}`,
      infoBoxX + 10,
      infoBoxY + 50
    );

    // 報告類型
    this.doc.setTextColor(100, 100, 100);
    this.doc.text(
      `報告類型: 安全掃描`,
      infoBoxX + 10,
      infoBoxY + 65
    );

    this.currentY = infoBoxY + infoBoxHeight + 40;

    // 右側裝飾元素
    this.doc.setFillColor(52, 152, 219);
    this.doc.circle(this.pageWidth - 40, 40, 15, 'F');
  }

  /**
   * 生成概覽頁面
   */
  private generateOverviewPage(statistics: StatisticsData): void {
    // 頁面標題
    this.doc.setFontSize(24);
    this.doc.setTextColor(44, 62, 80);
    this.doc.text("SAST 安全掃描報告", this.pageWidth / 2, this.currentY, {
      align: "center",
    });

    this.currentY += 15;

    // 總體統計
    this.doc.setFontSize(18);
    this.doc.setTextColor(44, 62, 80);
    this.doc.text("總體統計", this.margin, this.currentY);
    this.currentY += 10;

    // 漏洞總數
    this.doc.setFontSize(14);
    this.doc.setTextColor(231, 76, 60);
    this.doc.text(
      `總漏洞數量: ${statistics.totalVulnerabilities}`,
      this.margin,
      this.currentY
    );
    this.currentY += 8;

    // 嚴重程度分佈表格
    this.doc.setFontSize(12);
    this.doc.setTextColor(52, 73, 94);
    this.doc.text("嚴重程度分佈:", this.margin, this.currentY);
    this.currentY += 8;

    // 定義所有可能的嚴重程度類別
    const allSeverities = ["ERROR", "WARNING", "INFO", "UNKNOWN"];
    const severityColors = {
      ERROR: [231, 76, 60],
      WARNING: [243, 156, 18],
      INFO: [52, 152, 219],
      UNKNOWN: [149, 165, 166],
    };

    // 表格設定
    const tableStartX = this.margin + 10;
    const colWidth = 30;
    const rowHeight = 8;

    // 表頭
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(
      tableStartX,
      this.currentY,
      colWidth * allSeverities.length,
      rowHeight,
      "F"
    );
    this.doc.setFillColor(250, 250, 250);
    this.doc.rect(
      tableStartX,
      this.currentY + rowHeight,
      colWidth * allSeverities.length,
      rowHeight,
      "F"
    );
    allSeverities.forEach((severity, idx) => {
      const color = severityColors[severity as keyof typeof severityColors] || [
        100, 100, 100,
      ];
      this.doc.setTextColor(color[0], color[1], color[2]);
      this.doc.setFontSize(10);
      this.doc.text(
        severity,
        tableStartX + 6 + idx * colWidth,
        this.currentY + 5
      );

      const count =
        statistics.severityStats[
          severity as keyof typeof statistics.severityStats
        ] || 0;
      this.doc.setTextColor(color[0], color[1], color[2]);
      this.doc.setFontSize(10);
      this.doc.text(
        count.toString(),
        tableStartX + 10 + idx * colWidth,
        this.currentY + 13
      );
    });

    this.currentY += rowHeight * 2;

    this.currentY += 10;

    // 風險等級分佈表格
    this.doc.setFontSize(12);
    this.doc.setTextColor(52, 73, 94);
    this.doc.text("風險等級分佈:", this.margin, this.currentY);
    this.currentY += 8;

    // 定義所有可能的風險等級類別
    const allRiskLevels = ["高風險", "中風險", "低風險"];
    const riskColors = {
      高風險: [231, 76, 60],
      中風險: [243, 156, 18],
      低風險: [52, 152, 219],
    };

    // 表格設定
    const riskTableStartX = this.margin + 10;
    const riskColWidth = 30;
    const riskRowHeight = 8;

    // 表頭
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(
      riskTableStartX,
      this.currentY,
      riskColWidth * allRiskLevels.length,
      riskRowHeight,
      "F"
    );
    this.doc.setFillColor(250, 250, 250);
    this.doc.rect(
      riskTableStartX,
      this.currentY + riskRowHeight,
      riskColWidth * allRiskLevels.length,
      riskRowHeight,
      "F"
    );
    allRiskLevels.forEach((riskLevel, idx) => {
      const color = riskColors[riskLevel as keyof typeof riskColors] || [
        100, 100, 100,
      ];
      this.doc.setTextColor(color[0], color[1], color[2]);
      this.doc.setFontSize(10);
      this.doc.text(
        riskLevel,
        riskTableStartX + 6 + idx * riskColWidth,
        this.currentY + 5
      );

      const count = statistics.riskDistribution[
        riskLevel === "高風險"
          ? "high"
          : riskLevel === "中風險"
          ? "medium"
          : "low"
      ];
      this.doc.setTextColor(color[0], color[1], color[2]);
      this.doc.setFontSize(10);
      this.doc.text(
        count.toString(),
        riskTableStartX + 10 + idx * riskColWidth,
        this.currentY + 13
      );
    });

    this.currentY += riskRowHeight * 2;

    this.currentY += 10;

    // 類別統計
    this.doc.setTextColor(52, 73, 94);
    this.doc.text("漏洞類別分佈:", this.margin, this.currentY);
    this.currentY += 8;

    this.doc.setFontSize(10);
    Object.entries(statistics.categoryStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .forEach(([category, count]) => {
        this.doc.setTextColor(100, 100, 100);
        this.doc.text(
          `  ${category}: ${count}`,
          this.margin + 10,
          this.currentY
        );
        this.currentY += 5;
      });

    this.currentY += 10;

    // 安全建議
    this.doc.setFontSize(14);
    this.doc.setTextColor(44, 62, 80);
    this.doc.text("安全建議", this.margin, this.currentY);
    this.currentY += 8;

    this.doc.setFontSize(10);
    this.doc.setTextColor(100, 100, 100);
    const recommendations = [
      "1. 優先處理 ERROR 級別的安全漏洞",
      "2. 重點關注高風險漏洞的修復",
      "3. 建立程式碼審查流程防止類似問題",
      "4. 定期進行安全掃描和評估",
      "5. 對開發團隊進行安全培訓",
    ];

    recommendations.forEach((rec) => {
      this.doc.text(rec, this.margin, this.currentY);
      this.currentY += 5;
    });
  }

  /**
   * 按類別生成詳細漏洞頁面
   */
  private generateVulnerabilityDetailsByCWE(): void {
    const groupedVulns = this.groupVulnerabilitiesByCWE();

    Object.entries(groupedVulns).forEach(
      ([cwe, vulns]: [string, Vulnerability[]]) => {
        this.doc.addPage();
        const currentPage = this.doc.getCurrentPageInfo().pageNumber;

        // 記錄 CWE 首頁頁面編號，用於目錄連結
        this.pageNumbers.set(`cwe_${cwe}`, currentPage);

        this.currentY = 20;

        // 頁面標題（支援自動換行）
        this.doc.setFontSize(18);
        this.doc.setTextColor(44, 62, 80);
        const titleText = `${cwe} 的漏洞詳情`;
        const titleMaxWidth = this.pageWidth - 2 * this.margin;
        const wrappedTitle = this.wrapText(titleText, titleMaxWidth);

        // 計算標題總高度
        const titleHeight = wrappedTitle.length * 8;
        const titleY = this.currentY;

        wrappedTitle.forEach((line, index) => {
          const lineY = titleY + index * 8;
          this.doc.text(line, this.pageWidth / 2, lineY, { align: "center" });
        });

        this.currentY += titleHeight + 10;

        vulns.forEach((vuln: Vulnerability, index: number) => {
          // 每個漏洞都從新頁面開始（除了第一個）
          if (index > 0) {
            this.doc.addPage();
            this.currentY = 20;
          }

          // 記錄此漏洞的頁碼，供目錄連結使用
          this.vulnAnchors.set(
            vuln.check_id,
            this.doc.getCurrentPageInfo().pageNumber
          );

          // 漏洞資訊表格
          this.drawVulnerabilityTable(vuln);
        });
      }
    );
  }

  /**
   * 繪製漏洞資訊表格
   */
  private drawVulnerabilityTable(vuln: Vulnerability): void {
    const metadata = vuln.extra?.metadata;
    const cweList = Array.isArray(metadata?.cwe)
      ? metadata.cwe
      : metadata?.cwe
      ? [String(metadata.cwe)]
      : [];
    const owaspList = Array.isArray(metadata?.owasp)
      ? metadata.owasp
      : metadata?.owasp
      ? [String(metadata.owasp)]
      : [];

    const tableData = [
      ["檔案路徑", vuln.path],
      ["行號", `${vuln.start?.line || "N/A"}`],
      ["列號", `${vuln.start?.col || "N/A"}-${vuln.end?.col || "N/A"}`],
      ["嚴重程度", vuln.extra?.severity || "UNKNOWN"],
      ["風險等級", metadata?.impact || "UNKNOWN"],
      ["置信度", metadata?.confidence || "UNKNOWN"],
      ["類別", metadata?.category || "N/A"],
      ["CWE", cweList.length ? cweList.join(", ") : "N/A"],
      ["OWASP", owaspList.length ? owaspList.join(", ") : "N/A"],
    ];

    // 優化 A4 版面配置
    const labelWidth = 35; // 標籤列寬度
    const valueWidth = this.pageWidth - 2 * this.margin - labelWidth; // 值列寬度
    const rowHeight = 10; // 增加行高

    tableData.forEach(([label, value]) => {
      // 標籤列
      this.doc.setFillColor(240, 240, 240);
      this.doc.rect(this.margin, this.currentY, labelWidth, rowHeight, "F");
      this.doc.setTextColor(52, 73, 94);
      this.doc.setFontSize(9);
      this.doc.text(label, this.margin + 2, this.currentY + 6);

      // 值列 - 自動換行處理
      this.doc.setFillColor(255, 255, 255);
      this.doc.rect(
        this.margin + labelWidth,
        this.currentY,
        valueWidth,
        rowHeight,
        "F"
      );
      this.doc.setTextColor(100, 100, 100);
      this.doc.setFontSize(9);

      // 處理長文字自動換行
      const wrappedValue = this.wrapText(value || "N/A", valueWidth - 4);
      if (wrappedValue.length > 1) {
        // 如果有多行，調整行高
        const newRowHeight = Math.max(rowHeight, wrappedValue.length * 4);
        this.doc.rect(
          this.margin + labelWidth,
          this.currentY,
          valueWidth,
          newRowHeight,
          "F"
        );
        this.doc.text(
          wrappedValue[0],
          this.margin + labelWidth + 2,
          this.currentY + 6
        );
        this.currentY += newRowHeight;
      } else {
        this.doc.text(
          wrappedValue[0],
          this.margin + labelWidth + 2,
          this.currentY + 6
        );
        this.currentY += rowHeight;
      }
    });

    // 漏洞描述
    this.currentY += 5;
    this.doc.setFontSize(12);
    this.doc.setTextColor(52, 73, 94);
    this.doc.text("漏洞描述:", this.margin, this.currentY);
    this.currentY += 8;

    this.doc.setFontSize(10);
    this.doc.setTextColor(100, 100, 100);
    const message = vuln.extra?.message || "無描述資訊";
    const wrappedText = this.wrapText(
      message,
      this.pageWidth - 2 * this.margin - 10
    );
    this.doc.text(wrappedText, this.margin + 10, this.currentY);
    this.currentY += wrappedText.length * 5; // 增加行間距

    // 修復建議
    if (
      vuln.extra?.metadata?.references &&
      vuln.extra.metadata.references.length > 0
    ) {
      this.currentY += 5;
      this.doc.setFontSize(12);
      this.doc.setTextColor(52, 73, 94);
      this.doc.text("參考連結:", this.margin, this.currentY);
      this.currentY += 8;

      this.doc.setFontSize(10);
      this.doc.setTextColor(52, 152, 219);
      vuln.extra.metadata.references.forEach((ref) => {
        const x = this.margin + 10;
        const maxWidth = this.pageWidth - this.margin - x;
        this.currentY = this.drawWrappedLink(
          `• ${ref}`,
          x,
          this.currentY,
          maxWidth,
          ref.startsWith("http") ? { url: ref } : {}
        );
      });
    }
  }

  /**
   * 多行超連結繪製：依據行寬拆分並建立對應的可點擊區域，避免超出 A4 寬度
   */
  private drawWrappedLink(
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    options: { url?: string; pageNumber?: number }
  ): number {
    const lines = this.wrapText(text, maxWidth);
    const lineHeight = 5;
    lines.forEach((line) => {
      // 頁尾保護
      if (y > this.pageHeight - this.margin) {
        this.doc.addPage();
        y = this.margin;
      }
      // 文字
      this.doc.text(line, x, y);
      // 設置點擊區域
      const w = Math.min(this.doc.getTextWidth(line), maxWidth);
      if (options.url) {
        this.doc.link(x, y - 3, w, lineHeight, { url: options.url });
      } else if (options.pageNumber) {
        this.doc.link(x, y - 3, w, lineHeight, {
          pageNumber: options.pageNumber,
        });
      }
      y += lineHeight;
    });
    return y;
  }

  /**
   * 以 CWE 分組漏洞（可為多個 CWE，將各漏洞分配至所有對應的 CWE 群組）
   */
  private groupVulnerabilitiesByCWE(): Record<string, Vulnerability[]> {
    const grouped: Record<string, Vulnerability[]> = {};

    this.vulnerabilities.forEach((vuln) => {
      const cweRaw = vuln.extra?.metadata?.cwe;
      const cweList: string[] = Array.isArray(cweRaw)
        ? cweRaw.map(String)
        : cweRaw
        ? [String(cweRaw)]
        : ["未標註CWE"];

      cweList.forEach((cwe) => {
        if (!grouped[cwe]) grouped[cwe] = [];
        grouped[cwe].push(vuln);
      });
    });

    return Object.fromEntries(
      Object.entries(grouped).sort(([, a], [, b]) => b.length - a.length)
    );
  }

  /**
   * 文本換行處理 - 優化 A4 版面
   */
  private wrapText(text: string, maxWidth: number): string[] {
    if (!text || text.length === 0) {
      return [""];
    }

    // 如果文字長度小於最大寬度，直接返回
    const textWidth = this.doc.getTextWidth(text);
    if (textWidth <= maxWidth) {
      return [text];
    }

    const lines: string[] = [];
    let currentLine = "";
    let currentWidth = 0;

    // 按字符分割，支援中文
    const chars = text.split("");

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      const charWidth = this.doc.getTextWidth(char);

      if (currentWidth + charWidth <= maxWidth) {
        currentLine += char;
        currentWidth += charWidth;
      } else {
        if (currentLine.length > 0) {
          lines.push(currentLine);
          currentLine = char;
          currentWidth = charWidth;
        } else {
          // 單個字符就超出寬度，強制換行
          lines.push(char);
          currentLine = "";
          currentWidth = 0;
        }
      }
    }

    // 添加最後一行
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    return lines.length > 0 ? lines : [text];
  }
}

/**
 * 匯出PDF報告的便捷函數
 */
export const exportSASTReport = async (
  report: SASTReport,
  statistics: StatisticsData
): Promise<void> => {
  const exporter = new PDFExporter();
  await exporter.exportReport(report, statistics);
};
