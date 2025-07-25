# Sequence Diagrams

## 1. Complete User Journey Analysis Flow

```mermaid
sequenceDiagram
    participant User
    participant DrawingEditor
    participant AppContext
    participant AIService
    participant OpenAI
    participant Gemini
    participant Claude
    participant AIAnalysisPanel

    User->>DrawingEditor: Draw user journey
    DrawingEditor->>AppContext: Update drawing data
    User->>DrawingEditor: Click "Capture Journey"
    DrawingEditor->>AppContext: Create UserFlow with snapshot

    User->>AIAnalysisPanel: Click "Analyze with AI"
    AIAnalysisPanel->>AIService: analyzeUserJourney(snapshot)

    Note over AIService: Multi-provider fallback strategy

    AIService->>OpenAI: extractUserJourneySteps(data)
    alt OpenAI Success
        OpenAI-->>AIService: Return journey steps
    else OpenAI Failure
        AIService->>Gemini: extractUserJourneySteps(data)
        alt Gemini Success
            Gemini-->>AIService: Return journey steps
        else Gemini Failure
            AIService->>Claude: extractUserJourneySteps(data)
            alt Claude Success
                Claude-->>AIService: Return journey steps
            else All Providers Fail
                AIService->>AIService: fallbackStepExtraction()
            end
        end
    end

    AIService->>OpenAI: generateAnalyticsEvents(steps)
    OpenAI-->>AIService: Return analytics events

    AIService->>OpenAI: generateRecommendations(steps, events)
    OpenAI-->>AIService: Return recommendations

    AIService-->>AIAnalysisPanel: Return complete analysis
    AIAnalysisPanel->>User: Display analysis results
```

## 2. Drawing Capture and State Management

```mermaid
sequenceDiagram
    participant User
    participant DrawingEditor
    participant tldraw
    participant AppContext
    participant DrawingCapture

    User->>DrawingEditor: Start drawing
    DrawingEditor->>tldraw: Initialize canvas

    loop Drawing Session
        User->>tldraw: Draw shapes/text
        tldraw->>DrawingEditor: onChange event
        DrawingEditor->>AppContext: setDrawingData(snapshot)
    end

    User->>DrawingEditor: Click "Capture Journey"
    DrawingEditor->>AppContext: Get current drawingData
    AppContext-->>DrawingEditor: Return snapshot
    DrawingEditor->>DrawingCapture: Create UserFlow with snapshot
    DrawingCapture->>User: Show capture confirmation
```

## 3. AI Configuration and Service Initialization

```mermaid
sequenceDiagram
    participant User
    participant AIConfigPanel
    participant AIConfigContext
    participant AIService
    participant localStorage
    participant OpenAI
    participant Gemini
    participant Claude

    User->>AIConfigPanel: Open AI Configuration
    AIConfigPanel->>AIConfigContext: loadConfig()
    AIConfigContext->>localStorage: getItem('ai-config')
    localStorage-->>AIConfigContext: Return saved config
    AIConfigContext-->>AIConfigPanel: Display current config

    User->>AIConfigPanel: Update API keys
    AIConfigPanel->>AIConfigContext: updateConfig(newConfig)
    AIConfigContext->>AIService: new AIService(config)
    AIService->>AIService: initializeClients()

    User->>AIConfigPanel: Test connection
    AIConfigPanel->>AIService: testConnection('openai')
    AIService->>OpenAI: Test API call
    OpenAI-->>AIService: Success/Failure
    AIService-->>AIConfigPanel: Return test result

    User->>AIConfigPanel: Save configuration
    AIConfigPanel->>AIConfigContext: saveConfig()
    AIConfigContext->>localStorage: setItem('ai-config', config)
```

## 4. Error Handling and Fallback Strategy

```mermaid
sequenceDiagram
    participant AIService
    participant OpenAI
    participant Gemini
    participant Claude
    participant FallbackSystem

    AIService->>OpenAI: API Request

    alt Rate Limited (429)
        OpenAI-->>AIService: Rate limit error
        AIService->>Gemini: Retry with Gemini
        Gemini-->>AIService: Success response
    else Invalid API Key (401)
        OpenAI-->>AIService: Auth error
        Note over AIService: Skip OpenAI, try next provider
        AIService->>Gemini: Try Gemini
        Gemini-->>AIService: Success response
    else Network Error
        OpenAI-->>AIService: Network timeout
        AIService->>Claude: Try Claude
        alt Claude Success
            Claude-->>AIService: Success response
        else All Providers Fail
            AIService->>FallbackSystem: Generate mock analysis
            FallbackSystem-->>AIService: Return fallback data
        end
    else Success
        OpenAI-->>AIService: Success response
    end
```

## 5. Event Generation and Property Inference

```mermaid
sequenceDiagram
    participant AIService
    participant StepExtractor
    participant EventGenerator
    participant PropertyInference
    participant TrackingSpecGenerator

    AIService->>StepExtractor: extractUserJourneySteps(drawing)
    StepExtractor-->>AIService: Return journey steps

    AIService->>EventGenerator: generateAnalyticsEvents(steps)

    loop For each step
        EventGenerator->>PropertyInference: inferProperties(element)
        PropertyInference-->>EventGenerator: Return properties with types
    end

    EventGenerator-->>AIService: Return events with properties

    AIService->>TrackingSpecGenerator: generateTrackingSpec(events)
    TrackingSpecGenerator-->>AIService: Return complete specifications

    AIService->>AIService: calculateConfidenceScores()
    AIService-->>AIService: Return complete analysis
```

## 6. Export and Code Generation

```mermaid
sequenceDiagram
    participant User
    participant AIAnalysisPanel
    participant ExportService
    participant CodeGenerator
    participant Browser

    User->>AIAnalysisPanel: Click "Export Analysis"
    AIAnalysisPanel->>ExportService: exportAnalysis(analysis)

    ExportService->>CodeGenerator: generateTrackingCode(events)
    CodeGenerator-->>ExportService: Return implementation code

    ExportService->>ExportService: createExportData(analysis, code)
    ExportService->>Browser: createDownload(blob)
    Browser-->>User: Download JSON file

    User->>AIAnalysisPanel: View implementation code
    AIAnalysisPanel->>CodeGenerator: generateTrackingCode(eventName)
    CodeGenerator-->>AIAnalysisPanel: Return code snippet
    AIAnalysisPanel->>User: Display code
```

## 7. Real-time Drawing Updates

```mermaid
sequenceDiagram
    participant User
    participant tldraw
    participant DrawingEditor
    participant AppContext
    participant DebounceTimer

    User->>tldraw: Draw on canvas
    tldraw->>DrawingEditor: onChange(snapshot)
    DrawingEditor->>DebounceTimer: Trigger debounced update

    Note over DebounceTimer: Wait 300ms for more changes

    alt More changes within 300ms
        User->>tldraw: Continue drawing
        tldraw->>DrawingEditor: onChange(snapshot)
        DrawingEditor->>DebounceTimer: Reset timer
    else No more changes
        DebounceTimer->>AppContext: setDrawingData(snapshot)
        AppContext->>AppContext: Update state
    end
```

## 8. Multi-tab Interface Navigation

```mermaid
sequenceDiagram
    participant User
    participant App
    participant DrawingEditor
    participant DrawingCapture
    participant AIAnalysisPanel
    participant AIConfigPanel

    User->>App: Launch application
    App->>DrawingEditor: Show drawing tab (default)

    User->>DrawingEditor: Create drawing
    User->>App: Click "Capture Journey"
    App->>DrawingCapture: Switch to capture tab
    DrawingCapture->>User: Show captured data

    User->>App: Click "AI Analysis"
    App->>AIAnalysisPanel: Switch to analysis tab

    alt AI not configured
        AIAnalysisPanel->>App: Redirect to AI Config
        App->>AIConfigPanel: Show config tab
        User->>AIConfigPanel: Configure AI settings
        User->>App: Return to analysis
        App->>AIAnalysisPanel: Switch to analysis tab
    else AI configured
        AIAnalysisPanel->>AIAnalysisPanel: Start analysis
    end
```

## 9. Data Persistence and Recovery

```mermaid
sequenceDiagram
    participant User
    participant App
    participant localStorage
    participant SessionStorage
    participant AIConfigContext
    participant AppContext

    User->>App: Open application
    App->>AIConfigContext: Initialize
    AIConfigContext->>localStorage: Load AI config
    localStorage-->>AIConfigContext: Return saved config

    App->>AppContext: Initialize
    AppContext->>SessionStorage: Check for drawing data
    SessionStorage-->>AppContext: Return drawing session

    User->>App: Work on drawings
    App->>SessionStorage: Auto-save drawing state

    alt Browser crash/reload
        User->>App: Reopen application
        App->>SessionStorage: Restore drawing state
        SessionStorage-->>App: Return last drawing
        App->>User: Restore previous work
    else Normal close
        App->>SessionStorage: Clear session data
    end
```

## 10. Performance Optimization Flow

```mermaid
sequenceDiagram
    participant User
    participant App
    participant PerformanceMonitor
    participant MemoryManager
    participant AIService
    participant Cache

    User->>App: Heavy drawing activity
    App->>PerformanceMonitor: Monitor performance

    alt High memory usage detected
        PerformanceMonitor->>MemoryManager: Trigger cleanup
        MemoryManager->>Cache: Clear old snapshots
        MemoryManager->>App: Garbage collect
    end

    User->>App: Request AI analysis
    App->>Cache: Check for cached analysis

    alt Cache hit
        Cache-->>App: Return cached results
    else Cache miss
        App->>AIService: Perform analysis
        AIService-->>App: Return new results
        App->>Cache: Store results
    end

    App->>User: Display results
```
