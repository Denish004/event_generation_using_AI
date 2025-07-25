# API Documentation

## AI Service API

### Overview

The AIService class provides a unified interface for analyzing user journey drawings using multiple AI providers (OpenAI, Google Gemini, Anthropic Claude).

### Class: AIService

#### Constructor

```typescript
constructor(config: AIConfig)
```

**Parameters:**

- `config`: AIConfig object containing API keys, model preferences, and settings

**Example:**

```typescript
const aiService = new AIService({
  apiKeys: {
    openai: "sk-...",
    gemini: "AI...",
    claude: "sk-ant-...",
  },
  models: {
    textExtraction: "gpt-4o",
    uiAnalysis: "gpt-4o",
    eventGeneration: "gpt-4o",
  },
  settings: {
    confidenceThreshold: 0.8,
    maxProperties: 10,
    autoDetectEvents: true,
    enablePropertyInference: true,
  },
});
```

### Methods

#### analyzeUserJourney()

Main analysis method that processes drawing data and returns comprehensive analytics.

```typescript
async analyzeUserJourney(drawingSnapshot: StoreSnapshot<TLRecord>): Promise<AIAnalysis>
```

**Parameters:**

- `drawingSnapshot`: tldraw StoreSnapshot containing drawing data

**Returns:**

- `Promise<AIAnalysis>`: Complete analysis including events, properties, and recommendations

**Example:**

```typescript
const analysis = await aiService.analyzeUserJourney(drawingSnapshot);
console.log(`Found ${analysis.events.length} events`);
console.log(`Confidence: ${analysis.confidence}`);
```

**Response Structure:**

```typescript
interface AIAnalysis {
  events: AnalyticsEvent[]; // Generated analytics events
  globalProperties: EventProperty[]; // Properties common to all events
  carriedProperties: { [stepId: string]: EventProperty[] }; // Properties passed between steps
  recommendations: string[]; // Optimization recommendations
  dataTypes: { [propertyName: string]: string }; // Data type mapping
  trackingSpec: TrackingSpec[]; // Complete tracking specifications
  confidence: number; // Overall confidence score (0-1)
}
```

#### testConnection()

Tests connectivity to a specific AI provider.

```typescript
async testConnection(provider: 'openai' | 'gemini' | 'claude'): Promise<boolean>
```

**Parameters:**

- `provider`: AI provider to test

**Returns:**

- `Promise<boolean>`: true if connection successful, false otherwise

**Example:**

```typescript
const isConnected = await aiService.testConnection("openai");
if (isConnected) {
  console.log("OpenAI connection successful");
}
```

### Data Models

#### AIConfig

Configuration object for AI service initialization.

```typescript
interface AIConfig {
  apiKeys: {
    openai: string; // OpenAI API key
    gemini: string; // Google AI API key
    claude: string; // Anthropic API key
  };
  models: {
    textExtraction: string; // Model for text extraction
    uiAnalysis: string; // Model for UI analysis
    eventGeneration: string; // Model for event generation
  };
  settings: {
    confidenceThreshold: number; // Minimum confidence for events (0-1)
    maxProperties: number; // Maximum properties per event
    autoDetectEvents: boolean; // Enable automatic event detection
    enablePropertyInference: boolean; // Enable property type inference
  };
}
```

#### AnalyticsEvent

Represents a trackable user interaction or system event.

```typescript
interface AnalyticsEvent {
  id: string; // Unique event identifier
  name: string; // Event name (e.g., 'contest_joined')
  elementId: string; // ID of triggering UI element
  properties: EventProperty[]; // Event properties
  triggers: string[]; // What triggers this event
  sources: string[]; // Source screens/contexts
  confidence: number; // AI confidence score (0-1)
  category: "user_action" | "screen_view" | "system_event";
}
```

#### EventProperty

Defines a property of an analytics event.

```typescript
interface EventProperty {
  name: string; // Property name
  type: "string" | "number" | "boolean" | "object"; // Data type
  source: "on-screen" | "carried-forward" | "global"; // Property source
  required: boolean; // Whether property is required
  example: string | number | boolean; // Example value
  confidence: number; // AI confidence in this property
  description?: string; // Human-readable description
}
```

#### TrackingSpec

Complete specification for implementing event tracking.

```typescript
interface TrackingSpec {
  eventName: string; // Event name
  description: string; // Event description
  triggers: string[]; // Trigger conditions
  properties: EventProperty[]; // All properties
  examples: Record<string, string | number | boolean>; // Example data
  mandatory: string[]; // Required property names
  optional: string[]; // Optional property names
}
```

### Error Handling

The AI service implements comprehensive error handling with fallback mechanisms:

#### Error Types

1. **API Key Errors**: Invalid or missing API keys
2. **Rate Limit Errors**: API quota exceeded
3. **Network Errors**: Connection issues
4. **Parsing Errors**: Invalid AI responses
5. **Service Unavailable**: All providers offline

#### Fallback Strategy

```typescript
// Example error handling flow
try {
  return await this.analyzeWithOpenAI(data);
} catch (openaiError) {
  try {
    return await this.analyzeWithGemini(data);
  } catch (geminiError) {
    try {
      return await this.analyzeWithClaude(data);
    } catch (claudeError) {
      return this.fallbackAnalysis(data);
    }
  }
}
```

### Usage Examples

#### Basic Usage

```typescript
// Initialize service
const aiService = new AIService(config);

// Analyze drawing
const analysis = await aiService.analyzeUserJourney(drawingSnapshot);

// Access results
analysis.events.forEach((event) => {
  console.log(`Event: ${event.name}`);
  console.log(`Properties: ${event.properties.length}`);
  console.log(`Confidence: ${event.confidence}`);
});
```

#### Advanced Configuration

```typescript
// Custom configuration for specific needs
const customConfig: AIConfig = {
  apiKeys: {
    openai: process.env.OPENAI_KEY,
    gemini: "", // Skip Gemini
    claude: process.env.CLAUDE_KEY,
  },
  models: {
    textExtraction: "gpt-4-turbo",
    uiAnalysis: "gpt-4-vision-preview",
    eventGeneration: "gpt-4",
  },
  settings: {
    confidenceThreshold: 0.9, // Higher threshold
    maxProperties: 15, // More properties
    autoDetectEvents: true,
    enablePropertyInference: true,
  },
};

const aiService = new AIService(customConfig);
```

#### Error Handling Example

```typescript
try {
  const analysis = await aiService.analyzeUserJourney(drawingSnapshot);

  if (analysis.confidence < 0.7) {
    console.warn("Low confidence analysis - review results carefully");
  }

  return analysis;
} catch (error) {
  if (error.message.includes("API key")) {
    // Handle API key issues
    console.error("Please configure valid API keys");
  } else if (error.message.includes("rate limit")) {
    // Handle rate limiting
    console.error("Rate limit exceeded - try again later");
  } else {
    // Generic error handling
    console.error("Analysis failed:", error.message);
  }

  // Return fallback analysis
  return generateFallbackAnalysis();
}
```

## Context APIs

### AppContext

Manages global application state including drawing data.

```typescript
interface AppContextType {
  drawingData: StoreSnapshot<TLRecord> | null;
  setDrawingData: (data: StoreSnapshot<TLRecord>) => void;
}

// Usage
const { drawingData, setDrawingData } = useAppContext();
```

### AIConfigContext

Manages AI configuration and service instances.

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

// Usage
const { aiService, config, updateConfig } = useAIConfig();
```

## Export Functions

### JSON Export

```typescript
// Export analysis as JSON
const exportData = {
  userFlow: {
    name: userFlow.name,
    steps: userFlow.steps.length,
    events: userFlow.events.length,
  },
  analysis: aiAnalysis,
  trackingSpec: trackingSpecifications,
  implementation: implementationCode,
  generated: new Date().toISOString(),
};

const blob = new Blob([JSON.stringify(exportData, null, 2)], {
  type: "application/json",
});
```

### Code Generation

```typescript
// Generate tracking implementation code
const generateTrackingCode = (eventName: string) => {
  const event = aiAnalysis.events.find((e) => e.name === eventName);
  const properties = event.properties.reduce((acc, prop) => {
    acc[prop.name] = prop.example;
    return acc;
  }, {});

  return `analytics.track('${event.name}', ${JSON.stringify(
    properties,
    null,
    2
  )});`;
};
```

## Performance Considerations

### Token Management

- Drawing data is limited to prevent token overflow
- Large datasets are truncated intelligently
- Batch processing for multiple screens

### Caching Strategy

- AI responses cached for identical inputs
- Configuration persisted in localStorage
- Drawing snapshots cached during session

### Rate Limiting

- Built-in retry mechanisms
- Exponential backoff for failed requests
- Provider rotation on rate limits
