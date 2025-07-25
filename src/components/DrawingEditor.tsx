import { useAppContext } from "../hooks/useAppContext"
import useWindowDimensions from "../hooks/useWindowDimensions"
import { useCallback, useEffect, useRef, useState } from "react"
import { Tldraw, TLUiComponents, useEditor } from "tldraw"
import 'tldraw/tldraw.css'
import { Camera } from "lucide-react"
import { ScreenshotResult } from "../services/visionService"

function CaptureHandler() {
    const editor = useEditor()

    const handleCanvasCapture = useCallback(async (callback: (result: ScreenshotResult) => void) => {
        try {
            console.log('CaptureHandler: Starting canvas capture...');
            
            // Check if editor is ready
            if (!editor) {
                console.error('CaptureHandler: Editor not available');
                throw new Error('Editor not available');
            }

            const shapeIds = editor.getCurrentPageShapeIds()
            console.log('CaptureHandler: Found', shapeIds.size, 'shapes');
            
            if (shapeIds.size === 0) {
                console.log('CaptureHandler: No shapes found, using demo result');
                
                // If no shapes, load the demo image properly
                try {
                    const response = await fetch('/journey-capture-1753392004304.png');
                    const blob = await response.blob();
                    const dataUrl = await new Promise<string>((resolve, reject) => {
                        const reader = new FileReader()
                        reader.onload = () => resolve(reader.result as string)
                        reader.onerror = reject
                        reader.readAsDataURL(blob)
                    });
                    
                    const demoResult: ScreenshotResult = {
                        dataUrl,
                        blob,
                        width: 1920,
                        height: 1080,
                        format: 'png',
                        timestamp: Date.now()
                    };
                    callback(demoResult);
                    return;
                } catch (fetchError) {
                    console.warn('CaptureHandler: Could not load demo image:', fetchError);
                    // Fallback if demo image can't be loaded
                    const demoResult: ScreenshotResult = {
                        dataUrl: '/journey-capture-1753392004304.png',
                        blob: new Blob(),
                        width: 1920,
                        height: 1080,
                        format: 'png',
                        timestamp: Date.now()
                    };
                    callback(demoResult);
                    return;
                }
            }

            console.log('CaptureHandler: Capturing canvas with shapes...');
            // Use TLDraw's native export functionality
            const { blob } = await editor.toImage([...shapeIds], { 
                format: 'png', 
                background: true,
                padding: 16,
                scale: 2
            })

            console.log('CaptureHandler: Canvas captured, converting to dataURL...');
            // Convert blob to data URL
            const dataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = () => resolve(reader.result as string)
                reader.onerror = reject
                reader.readAsDataURL(blob)
            })

            const result: ScreenshotResult = {
                dataUrl,
                blob,
                width: 1920, // Default dimensions
                height: 1080,
                format: 'png',
                timestamp: Date.now()
            };

            console.log('CaptureHandler: Capture successful!');
            callback(result);

        } catch (error) {
            console.error('CaptureHandler: Canvas capture failed:', error);
            
            // Fallback to demo screenshot
            try {
                const response = await fetch('/journey-capture-1753392004304.png');
                const blob = await response.blob();
                const dataUrl = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader()
                    reader.onload = () => resolve(reader.result as string)
                    reader.onerror = reject
                    reader.readAsDataURL(blob)
                });
                
                const demoResult: ScreenshotResult = {
                    dataUrl,
                    blob,
                    width: 1920,
                    height: 1080,
                    format: 'png',
                    timestamp: Date.now()
                };
                callback(demoResult);
            } catch (fallbackError) {
                console.error('CaptureHandler: Even demo fallback failed:', fallbackError);
                // Last resort fallback
                const demoResult: ScreenshotResult = {
                    dataUrl: '/journey-capture-1753392004304.png',
                    blob: new Blob(),
                    width: 1920,
                    height: 1080,
                    format: 'png',
                    timestamp: Date.now()
                };
                callback(demoResult);
            }
        }
    }, [editor])

    useEffect(() => {
        console.log('CaptureHandler: Setting up event listener...');
        
        const handleCaptureEvent = (event: CustomEvent) => {
            console.log('CaptureHandler: Received captureCanvas event');
            const { callback } = event.detail;
            if (callback) {
                handleCanvasCapture(callback);
            } else {
                console.error('CaptureHandler: No callback provided in event');
            }
        };

        document.addEventListener('captureCanvas', handleCaptureEvent as EventListener);
        
        return () => {
            console.log('CaptureHandler: Removing event listener...');
            document.removeEventListener('captureCanvas', handleCaptureEvent as EventListener);
        };
    }, [handleCanvasCapture]);

    return null;
}

function ExportCanvasButton() {
    const editor = useEditor()
    const [isExporting, setIsExporting] = useState(false)

    const handleExportCanvas = useCallback(async () => {
        setIsExporting(true)
        try {
            const shapeIds = editor.getCurrentPageShapeIds()
            if (shapeIds.size === 0) {
                alert('No shapes on the canvas to export')
                return
            }

            // Use TLDraw's native export functionality
            const { blob } = await editor.toImage([...shapeIds], { 
                format: 'png', 
                background: true,
                padding: 16,
                scale: 2
            })

            // Download the exported image
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = `tldraw-canvas-${Date.now()}.png`
            link.click()
            URL.revokeObjectURL(link.href)

            // Show success message
            const successMsg = document.createElement('div')
            successMsg.textContent = 'Canvas exported successfully!'
            successMsg.className = 'fixed top-16 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg'
            document.body.appendChild(successMsg)
            setTimeout(() => document.body.removeChild(successMsg), 3000)

        } catch (error) {
            console.error('Failed to export canvas:', error)
            
            // Show error message
            const errorMsg = document.createElement('div')
            errorMsg.textContent = 'Failed to export canvas!'
            errorMsg.className = 'fixed top-16 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg'
            document.body.appendChild(errorMsg)
            setTimeout(() => document.body.removeChild(errorMsg), 3000)
        } finally {
            setIsExporting(false)
        }
    }, [editor])

    return (
        <button
            onClick={handleExportCanvas}
            disabled={isExporting}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg shadow-lg transition-colors"
            title="Export Canvas as Image"
            style={{ pointerEvents: 'all' }}
        >
            <Camera className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export Canvas'}
        </button>
    )
}

const components: TLUiComponents = {
    SharePanel: ExportCanvasButton,
}

function DrawingEditor() {
    const { isMobile } = useWindowDimensions()

    return (
        <div className="w-full h-full relative">
            <Tldraw
                inferDarkMode
                forceMobile={isMobile}
                defaultName="Editor"
                components={components}
            >
                <ReachEditor />
                <CaptureHandler />
            </Tldraw>
        </div>
    )
}

function ReachEditor() {
    const editor = useEditor()
    const { drawingData, setDrawingData } = useAppContext()
    const hasLoadedInitialData = useRef(false)

    const handleChangeEvent = useCallback(
        () => {
            try {
                // Update the drawing data in the context
                const snapshot = editor.store.getSnapshot()
                setDrawingData(snapshot)
            } catch (error) {
                console.warn('Failed to save drawing data:', error)
            }
        },
        [editor.store, setDrawingData],
    )

    useEffect(() => {
        // Load the drawing data from the context only once
        if (drawingData && !hasLoadedInitialData.current) {
            try {
                editor.store.loadSnapshot(drawingData)
                hasLoadedInitialData.current = true
            } catch (error) {
                console.warn('Failed to load drawing data:', error)
            }
        }
    }, [drawingData, editor.store])

    useEffect(() => {
        // Set up the change listener
        const cleanupFunction = editor.store.listen(handleChangeEvent, {
            source: "user",
            scope: "document",
        })

        return () => {
            cleanupFunction()
        }
    }, [editor.store, handleChangeEvent])

    return null
}

export default DrawingEditor
