# Low-Level Design (LLD)

## Component Architecture

### 1. Application Structure

```typescript
App.tsx (Root Component)
├── AppProvider (Context)
│   └── AIConfigProvider (Context)
│       └── AppContent
│           ├── DrawingEditor
│           ├── DrawingCapture
│           ├── AIAnalysisPanel
│           ├── EventPropertiesPanel
│           └── AIConfigPanel
```

### 2. Data Models

#### 2.1 Core Interfaces

```typescript
interface UserFlow {
  id: string;
  name: string;
  steps: UserJourneyStep[];
  drawingSnapshot: StoreSnapshot<TLRecord> | null;
  events: AnalyticsEvent[];
  aiAnalysis?: AIAnalysis;
}

interface UserJourneyStep {
  id: string;
  name: string;
  description: string;
  elements: DrawingElement[];
  events: AnalyticsEvent[];
  connections: Connection[];
}

interface AnalyticsEvent {
  id: string;
  name: string;
  elementId: string;
  properties: EventProperty[];
  triggers: string[];
  sources: string[];
  confidence: number;
  category: "user_action" | "screen_view" | "system_event";
}

interface EventProperty {
  name: string;
  type: "string" | "number" | "boolean" | "object";
  source: "on-screen" | "carried-forward" | "global";
  required: boolean;
  example: string | number | boolean;
  confidence: number;
  description?: string;
}
```

#### 2.2 AI Configuration

```typescript
interface AIConfig {
  apiKeys: {
    openai: string;
    gemini: string;
    claude: string;
  };
  models: {
    textExtraction: string;
    uiAnalysis: string;
    eventGeneration: string;
  };
  settings: {
    confidenceThreshold: number;
    maxProperties: number;
    autoDetectEvents: boolean;
    enablePropertyInference: boolean;
  };
}
```

### 3. Component Specifications

#### 3.1 DrawingEditor Component

**Purpose**: Main drawing interface using tldraw

```typescript
interface DrawingEditorProps {
  onDrawingUpdate: (snapshot: StoreSnapshot<TLRecord>) => void;
}

// Key Methods:
- handleDrawingChange(): Captures drawing state changes
- exportSnapshot(): Creates snapshot for AI analysis
- resetCanvas(): Clears the drawing canvas
```

**State Management**:

- Uses tldraw's internal state
- Propagates changes to AppContext
- Maintains drawing persistence

#### 3.2 AIService Class

**Purpose**: Orchestrates AI analysis across multiple providers

```typescript
class AIService {
  private openai: OpenAI | null;
  private gemini: GoogleGenerativeAI | null;
  private claude: Anthropic | null;
  private config: AIConfig;

  // Core Methods:
  async analyzeUserJourney(
    drawingSnapshot: StoreSnapshot<TLRecord>
  ): Promise<AIAnalysis>;
  private async extractUserJourneySteps(
    drawingSnapshot: StoreSnapshot<TLRecord>
  ): Promise<UserJourneyStep[]>;
  private async generateAnalyticsEvents(
    steps: UserJourneyStep[]
  ): Promise<AnalyticsEvent[]>;
  private async generateRecommendations(
    steps: UserJourneyStep[],
    events: AnalyticsEvent[]
  ): Promise<string[]>;
}
```

**AI Processing Pipeline**:

1. **Data Preparation**: Convert tldraw snapshot to AI-friendly format
2. **Step Extraction**: Identify user journey steps from drawing
3. **Event Generation**: Create analytics events from steps
4. **Property Inference**: Generate event properties with types
5. **Recommendation Engine**: Provide tracking improvements

#### 3.3 State Management Details

**AppContext**:

```typescript
interface AppContextType {
  drawingData: StoreSnapshot<TLRecord> | null;
  setDrawingData: (data: StoreSnapshot<TLRecord>) => void;
}
```

**AIConfigContext**:

```typescript
interface AIConfigContextType {
  config: AIConfig;
  updateConfig: (newConfig: Partial<AIConfig>) => void;
  aiService: AIService | null;
  testConnection: (
    provider: "openai" | "gemini" | "claude"
  ) => Promise<boolean>;
  saveConfig: () => void;
  loadConfig: () => void;
}
```

### 4. Algorithm Details

#### 4.1 AI Analysis Algorithm

```typescript
async analyzeUserJourney(drawingSnapshot: StoreSnapshot<TLRecord>): Promise<AIAnalysis> {
  // Step 1: Extract journey steps
  const steps = await this.extractUserJourneySteps(drawingSnapshot);

  // Step 2: Generate events from steps
  const events = await this.generateAnalyticsEvents(steps);

  // Step 3: Generate global properties
  const globalProperties = this.generateGlobalProperties();

  // Step 4: Generate carried properties
  const carriedProperties = this.generateCarriedProperties(steps);

  // Step 5: Generate recommendations
  const recommendations = await this.generateRecommendations(steps, events);

  // Step 6: Extract data types
  const dataTypes = this.extractDataTypes(events);

  // Step 7: Generate tracking specifications
  const trackingSpec = this.generateTrackingSpecFromEvents(events);

  return {
    events,
    globalProperties,
    carriedProperties,
    recommendations,
    dataTypes,
    trackingSpec,
    confidence: 0.85 // Calculated based on AI responses
  };
}
```

#### 4.2 Fallback Strategy

```typescript
// Multi-provider fallback strategy
private async extractUserJourneySteps(drawingSnapshot: StoreSnapshot<TLRecord>): Promise<UserJourneyStep[]> {
  try {
    // Try OpenAI first
    if (this.openai && this.config.models.uiAnalysis.includes('gpt')) {
      return await this.analyzeWithOpenAI(drawingSnapshot);
    }

    // Try Gemini if OpenAI fails
    if (this.gemini && this.config.models.uiAnalysis.includes('gemini')) {
      return await this.analyzeWithGemini(drawingSnapshot);
    }

    // Try Claude as last resort
    if (this.claude && this.config.models.uiAnalysis.includes('claude')) {
      return await this.analyzeWithClaude(drawingSnapshot);
    }

    throw new Error('No AI service available');
  } catch (error) {
    console.error('All AI providers failed, using fallback');
    return this.fallbackStepExtraction();
  }
}
```

### 5. Data Processing Flows

#### 5.1 Drawing to Analysis Flow

```
1. User draws on canvas (tldraw)
   ↓
2. Canvas state captured (StoreSnapshot<TLRecord>)
   ↓
3. Data prepared for AI (JSON serialization)
   ↓
4. AI analysis request (multiple providers)
   ↓
5. Response parsing and validation
   ↓
6. UI update with analysis results
```

#### 5.2 Event Generation Flow

```
1. Journey steps extracted from drawing
   ↓
2. Interactive elements identified
   ↓
3. Event names generated (business logic)
   ↓
4. Properties inferred (types, sources, requirements)
   ↓
5. Confidence scores calculated
   ↓
6. Tracking specifications compiled
```

### 6. Performance Optimizations

#### 6.1 Drawing Performance

- **Debounced Updates**: Drawing changes debounced to prevent excessive state updates
- **Snapshot Optimization**: Only capture snapshots when needed
- **Memory Management**: Clean up unused drawing data

#### 6.2 AI Processing

- **Token Management**: Limit drawing data size to prevent token overflow
- **Async Processing**: Non-blocking AI requests with loading states
- **Caching**: Cache AI responses to avoid redundant calls

#### 6.3 UI Responsiveness

- **Lazy Loading**: Components loaded on demand
- **Virtual Scrolling**: For large event lists
- **Progressive Enhancement**: Basic functionality works without AI

### 7. Error Handling Implementation

#### 7.1 AI API Error Handling

```typescript
try {
  const response = await this.openai.chat.completions.create({...});
  return this.parseJSONResponse(response.choices[0].message.content);
} catch (error) {
  if (error.status === 429) {
    // Rate limit - try different provider
    return await this.fallbackToGemini();
  } else if (error.status === 401) {
    // Invalid API key
    throw new Error('Invalid API key');
  } else {
    // Generic error - use fallback
    return this.fallbackStepExtraction();
  }
}
```

#### 7.2 Drawing Canvas Error Handling

```typescript
// Auto-recovery for drawing canvas
useEffect(() => {
  const handleError = (error: Error) => {
    console.error("Drawing canvas error:", error);
    // Attempt to restore from last known good state
    if (lastGoodSnapshot.current) {
      setDrawingData(lastGoodSnapshot.current);
    }
  };

  window.addEventListener("error", handleError);
  return () => window.removeEventListener("error", handleError);
}, []);
```

### 8. Security Implementation

#### 8.1 API Key Management

```typescript
// Secure storage and handling
const saveConfig = () => {
  const configToSave = {
    ...config,
    apiKeys: {
      // Never log API keys
      openai: config.apiKeys.openai ? "***" : "",
      gemini: config.apiKeys.gemini ? "***" : "",
      claude: config.apiKeys.claude ? "***" : "",
    },
  };
  localStorage.setItem("ai-config", JSON.stringify(configToSave));
};
```

#### 8.2 Data Sanitization

```typescript
// Sanitize drawing data before AI processing
private prepareDrawingDataForAI(drawingSnapshot: StoreSnapshot<TLRecord>): Array<Record<string, unknown>> {
  return Object.values(drawingSnapshot.store).map(record => {
    // Remove sensitive fields, sanitize content
    const sanitized = { ...record };
    delete sanitized.meta; // Remove metadata
    delete sanitized.parentId; // Remove relationships
    return sanitized;
  });
}
```

### 9. Testing Strategy

#### 9.1 Unit Tests

- Component rendering tests
- AI service method tests
- Context provider tests
- Utility function tests

#### 9.2 Integration Tests

- End-to-end drawing to analysis flow
- AI provider fallback testing
- Configuration management tests

#### 9.3 Performance Tests

- Drawing canvas performance under load
- AI response time measurements
- Memory usage monitoring

### 10. Deployment Configuration

#### 10.1 Build Optimization

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ai: ["openai", "@google/generative-ai", "@anthropic-ai/sdk"],
          drawing: ["tldraw"],
        },
      },
    },
  },
});
```

#### 10.2 Environment Configuration

```typescript
// Environment-specific configurations
const config = {
  development: {
    aiTimeout: 30000,
    debugMode: true,
    mockAI: false,
  },
  production: {
    aiTimeout: 15000,
    debugMode: false,
    mockAI: false,
  },
};
```
