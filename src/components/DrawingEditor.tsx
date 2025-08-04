import { useAppContext } from "../hooks/useAppContext"
import useWindowDimensions from "../hooks/useWindowDimensions"
import { useCallback, useEffect, useRef } from "react"
import { Tldraw, useEditor, TLUiOverrides } from "tldraw"
import 'tldraw/tldraw.css'
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

function DrawingEditor() {
    const { isMobile } = useWindowDimensions()

    // Override UI to remove export functionality
    const uiOverrides: TLUiOverrides = {
        actions(editor, actions) {
            // Remove export actions
            delete actions['export-as-svg']
            delete actions['export-as-png']
            delete actions['copy-as-svg']
            delete actions['copy-as-png']
            return actions
        },
        tools(editor, tools) {
            return tools
        }
    }

    return (
        <div className="w-full h-full relative">
            <Tldraw
                inferDarkMode
                forceMobile={isMobile}
                defaultName="Editor"
                overrides={uiOverrides}
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
