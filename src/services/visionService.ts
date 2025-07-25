// Demo Screenshot Service - Uses static demo images instead of actual screenshot capturing

export interface ScreenshotOptions {
  element?: HTMLElement | null
  selector?: string
  fullPage?: boolean
  width?: number
  height?: number
  scale?: number
  quality?: number
  format?: 'png' | 'jpeg' | 'webp'
  backgroundColor?: string
  allowTaint?: boolean
  useCORS?: boolean
  scrollX?: number
  scrollY?: number
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
   * Capture screenshot of a specific element (returns demo image)
   */
  static async captureElement(
    _element: HTMLElement, 
    options: Partial<ScreenshotOptions> = {}
  ): Promise<ScreenshotResult> {
    console.log('Using demo screenshot instead of capturing element')
    return this.getDemoScreenshot(options)
  }

  /**
   * Capture screenshot by CSS selector (returns demo image)
   */
  static async captureBySelector(
    selector: string, 
    options: Partial<ScreenshotOptions> = {}
  ): Promise<ScreenshotResult> {
    console.log(`Using demo screenshot instead of capturing selector: ${selector}`)
    return this.getDemoScreenshot(options)
  }

  /**
   * Capture full page screenshot (returns demo image)
   */
  static async captureFullPage(options: Partial<ScreenshotOptions> = {}): Promise<ScreenshotResult> {
    console.log('Using demo screenshot instead of capturing full page')
    return this.getDemoScreenshot(options)
  }

  /**
   * Capture TLDraw canvas specifically (returns demo image)
   */
  static async captureTLDrawCanvas(options: Partial<ScreenshotOptions> = {}): Promise<ScreenshotResult> {
    console.log('Using demo screenshot instead of capturing TLDraw canvas')
    return this.getDemoScreenshot(options)
  }

  /**
   * Capture custom area by coordinates (returns demo image)
   */
  static async captureArea(
    x: number, 
    y: number, 
    width: number, 
    height: number,
    options: Partial<ScreenshotOptions> = {}
  ): Promise<ScreenshotResult> {
    console.log(`Using demo screenshot instead of capturing area: ${x},${y} ${width}x${height}`)
    return this.getDemoScreenshot(options)
  }

  /**
   * Download screenshot as file
   */
  static downloadScreenshot(result: ScreenshotResult, filename?: string): void {
    const defaultFilename = `demo-screenshot-${result.timestamp}.${result.format}`
    const finalFilename = filename || defaultFilename

    const url = URL.createObjectURL(result.blob)
    const link = document.createElement('a')
    link.href = url
    link.download = finalFilename
    link.click()
    URL.revokeObjectURL(url)
  }

  /**
   * Create object URL for preview
   */
  static createPreviewUrl(result: ScreenshotResult): string {
    return URL.createObjectURL(result.blob)
  }

  /**
   * Clean up preview URL
   */
  static revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url)
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

  /**
   * Check if screenshot service is available (always true for demo)
   */
  static async isAvailable(): Promise<boolean> {
    return true
  }

  /**
   * Get screenshot info without capturing
   */
  static getScreenshotInfo(): {
    viewport: { width: number; height: number }
    scroll: { x: number; y: number }
    devicePixelRatio: number
  } {
    return {
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      scroll: {
        x: window.scrollX,
        y: window.scrollY
      },
      devicePixelRatio: window.devicePixelRatio
    }
  }
}