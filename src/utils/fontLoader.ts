/**
 * 字型載入器
 * 用於載入和處理 TTF 字型檔案
 */

export class FontLoader {
  /**
   * 載入 TTF 字型檔案
   */
  static async loadTTFFont(fontPath: string): Promise<string> {
    try {
      const response = await fetch(fontPath);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const base64 = this.arrayBufferToBase64(arrayBuffer);
      
      return `data:font/ttf;base64,${base64}`;
    } catch (error) {
      console.error('載入字型檔案失敗:', error);
      throw error;
    }
  }

  /**
   * 將 ArrayBuffer 轉換為 Base64 字串
   */
  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    return btoa(binary);
  }

  /**
   * 檢查字型是否已載入
   */
  static isFontLoaded(fontName: string): boolean {
    try {
      // 創建一個測試 canvas 來檢查字型
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.font = `12px ${fontName}`;
        const metrics = ctx.measureText('測試文字');
        return metrics.width > 0;
      }
      
      return false;
    } catch {
      return false;
    }
  }

  /**
   * 預載入字型
   */
  static async preloadFont(fontPath: string, fontFamily: string): Promise<void> {
    try {
      const fontData = await this.loadTTFFont(fontPath);
      
      // 創建 CSS @font-face 規則
      const style = document.createElement('style');
      style.textContent = `
        @font-face {
          font-family: '${fontFamily}';
          src: url('${fontData}') format('truetype');
          font-weight: normal;
          font-style: normal;
        }
      `;
      
      document.head.appendChild(style);
      
      // 等待字型載入完成
      await this.waitForFontLoad(fontFamily);
      
      console.log(`字型 ${fontFamily} 預載入成功`);
    } catch (error) {
      console.error(`字型 ${fontFamily} 預載入失敗:`, error);
      throw error;
    }
  }

  /**
   * 等待字型載入完成
   */
  private static waitForFontLoad(fontFamily: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const maxWaitTime = 10000; // 10秒超時
      const checkInterval = 100; // 每100ms檢查一次
      let elapsedTime = 0;
      
      const checkFont = () => {
        if (this.isFontLoaded(fontFamily)) {
          resolve();
          return;
        }
        
        elapsedTime += checkInterval;
        if (elapsedTime >= maxWaitTime) {
          reject(new Error(`字型 ${fontFamily} 載入超時`));
          return;
        }
        
        setTimeout(checkFont, checkInterval);
      };
      
      checkFont();
    });
  }
}
