// Demo Screenshot Service - Uses static demo images instead of actual screenshot capturing

export interface ScreenshotOptions {
  format?: 'png' | 'jpeg' | 'webp'
}

export interface ScreenshotResult {
  dataUrl: string
  blob: Blob
  width: number
  height: number
  format: string
  timestamp: number
}

export class ScreenshotService {
  private static DEMO_IMAGE_PATH = '/journey-capture-1753392004304.png'
  private static DEMO_WIDTH = 1920
  private static DEMO_HEIGHT = 1080

  /**
   * Get demo screenshot result
   */
  private static async getDemoScreenshot(options: Partial<ScreenshotOptions> = {}): Promise<ScreenshotResult> {
    try {
      // Fetch the demo image
      const response = await fetch(this.DEMO_IMAGE_PATH)
      if (!response.ok) {
        throw new Error('Demo screenshot not found')
      }
      
      const blob = await response.blob()
      const dataUrl = await this.blobToDataUrl(blob)

      return {
        dataUrl,
        blob,
        width: this.DEMO_WIDTH,
        height: this.DEMO_HEIGHT,
        format: options.format || 'png',
        timestamp: Date.now()
      }
    } catch (error) {
      console.error('Demo screenshot failed:', error)
      throw new Error('Failed to load demo screenshot')
    }
  }

  /**
   * Convert blob to data URL
   */
  private static async blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }
}