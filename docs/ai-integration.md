# AI Integration Guide

## Overview

This guide covers the AI integration architecture, configuration, and best practices for the User Journey Analytics Tool. The system supports multiple AI providers with intelligent fallback mechanisms.

## Supported AI Providers

### 1. OpenAI GPT-4

**Primary Provider** - Used for most analysis tasks

**Models Supported**:

- `gpt-4o`: Latest GPT-4 Optimized model
- `gpt-4-turbo`: High-performance variant
- `gpt-4`: Standard GPT-4 model
- `gpt-4-vision-preview`: For future image analysis

**Strengths**:

- Excellent JSON parsing and structured output
- Strong reasoning capabilities
- Reliable for user journey analysis
- Good at generating implementation code

**Configuration**:

```typescript
{
  apiKeys: {
    openai: 'sk-...' // Your OpenAI API key
  },
  models: {
    textExtraction: 'gpt-4o',
    uiAnalysis: 'gpt-4o',
    eventGeneration: 'gpt-4o'
  }
}
```

### 2. Google Gemini

**Secondary Provider** - Fallback and cost optimization

**Models Supported**:

- `gemini-pro`: Primary Gemini model
- `gemini-pro-vision`: For image analysis (future)

**Strengths**:

- Fast response times
- Good multilingual support
- Competitive pricing
- Strong analytical capabilities

**Configuration**:

```typescript
{
  apiKeys: {
    gemini: 'AI...' // Your Google AI API key
  },
  models: {
    textExtraction: 'gemini-pro',
    uiAnalysis: 'gemini-pro',
    eventGeneration: 'gemini-pro'
  }
}
```

### 3. Anthropic Claude

**Specialized Provider** - For complex analysis tasks

**Models Supported**:

- `claude-3-sonnet-20240229`: Balanced performance
- `claude-3-opus-20240229`: Highest capability
- `claude-3-haiku-20240307`: Fast and efficient

**Strengths**:

- Excellent instruction following
- Strong analytical reasoning
- Good for complex user journey interpretation
- Detailed explanations

**Configuration**:

```typescript
{
  apiKeys: {
    claude: 'sk-ant-...' // Your Anthropic API key
  },
  models: {
    textExtraction: 'claude-3-sonnet-20240229',
    uiAnalysis: 'claude-3-sonnet-20240229',
    eventGeneration: 'claude-3-sonnet-20240229'
  }
}
```

## AI Analysis Pipeline

### 1. User Journey Step Extraction

**Purpose**: Convert drawing data into structured journey steps

**Prompt Strategy**:

```typescript
const prompt = `Analyze this Dream11 app user journey. Extract 3-5 main screens/steps.

Data: ${JSON.stringify(limitedData, null, 2)}

Return JSON only:
{
  "steps": [
    {
      "id": "step_1",
      "name": "Screen Name",
      "description": "What happens",
      "elements": [{"id": "btn_1", "type": "shape", "content": "Join Contest", "position": {"x": 0, "y": 0}, "properties": {}}]
    }
  ]
}

Focus on: contest selection, team creation, player selection.`;
```

**Expected Output**:

- 3-5 main user journey steps
- Screen identification and naming
- Interactive element extraction
- Logical flow sequence

### 2. Analytics Event Generation

**Purpose**: Create trackable events from journey steps

**Prompt Strategy**:

```typescript
const prompt = `Based on these user journey steps for a Dream11 fantasy sports app, generate analytics events for tracking.

Journey steps: ${JSON.stringify(steps, null, 2)}

Generate analytics events for interactive elements like buttons, forms, navigation.
Focus on business-critical events like:
- Contest joining
- Team creation
- Player selection
- Payment flows
- Match selection

Return JSON with this structure:
{
  "events": [
    {
      "id": "event_id",
      "name": "event_name",
      "elementId": "triggering_element_id",
      "properties": [
        {
          "name": "property_name",
          "type": "string|number|boolean",
          "source": "on-screen|carried-forward|global",
          "required": true|false,
          "example": "example_value",
          "confidence": 0.9,
          "description": "property description"
        }
      ],
      "triggers": ["Button Click", "Form Submit"],
      "sources": ["Screen Name"],
      "confidence": 0.9,
      "category": "user_action|screen_view|system_event"
    }
  ]
}`;
```

**Expected Output**:

- Business-relevant analytics events
- Properly typed event properties
- Confidence scoring
- Clear trigger definitions

### 3. Recommendation Generation

**Purpose**: Provide optimization suggestions for analytics implementation

**Prompt Strategy**:

```typescript
const prompt = `Based on this Dream11 user journey analysis, provide 5-7 specific recommendations for improving analytics tracking.

Journey: ${steps.length} steps, Events: ${events.length} events

Return JSON array of strings only:
["Standardize event naming using snake_case format", "Add user_id to all events for better segmentation", "Track contest_type and entry_fee for all contest events"]

Focus on: event naming, property standardization, missing tracking, data quality.`;
```

**Expected Output**:

- Actionable recommendations
- Best practice suggestions
- Data quality improvements
- Implementation optimizations

## Fallback Mechanisms

### 1. Provider Fallback Strategy

```typescript
async extractUserJourneySteps(drawingSnapshot: StoreSnapshot<TLRecord>): Promise<UserJourneyStep[]> {
  try {
    // Try OpenAI first (primary)
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
    // All providers failed - use mock data
    return this.fallbackStepExtraction();
  }
}
```

### 2. Error Handling

**Common Error Types**:

- Rate limiting (429)
- Invalid API keys (401)
- Network timeouts
- Invalid responses
- Token limits exceeded

**Response Strategy**:

```typescript
try {
  const response = await this.openai.chat.completions.create({...});
  return this.parseJSONResponse(response.choices[0].message.content);
} catch (error) {
  if (error.status === 429) {
    // Rate limit - try different provider
    return await this.tryNextProvider();
  } else if (error.status === 401) {
    // Invalid API key - show configuration error
    throw new Error('Invalid OpenAI API key');
  } else {
    // Generic error - use fallback
    return this.fallbackAnalysis();
  }
}
```

## Configuration Best Practices

### 1. API Key Management

**Security Guidelines**:

- Store keys in localStorage (client-side only)
- Never log API keys in console
- Use environment variables in development
- Rotate keys regularly

**Implementation**:

```typescript
const saveConfig = () => {
  const configToSave = {
    ...config,
    // Mask API keys in logs
    apiKeys: Object.keys(config.apiKeys).reduce((acc, key) => {
      acc[key] = config.apiKeys[key] ? "***" : "";
      return acc;
    }, {}),
  };
  localStorage.setItem("ai-config", JSON.stringify(configToSave));
};
```

### 2. Model Selection

**Recommended Configurations**:

**Performance Focused**:

```typescript
{
  models: {
    textExtraction: 'gpt-4o',    // Fast and accurate
    uiAnalysis: 'gemini-pro',   // Cost-effective
    eventGeneration: 'gpt-4o'   // High quality output
  }
}
```

**Quality Focused**:

```typescript
{
  models: {
    textExtraction: 'gpt-4o',
    uiAnalysis: 'claude-3-sonnet-20240229',
    eventGeneration: 'gpt-4o'
  }
}
```

**Cost Optimized**:

```typescript
{
  models: {
    textExtraction: 'gemini-pro',
    uiAnalysis: 'gemini-pro',
    eventGeneration: 'gemini-pro'
  }
}
```

### 3. Performance Optimization

**Token Management**:

```typescript
// Limit data size to prevent token overflow
const limitedData = drawingData.slice(0, 10);

// Remove unnecessary fields
const sanitizedData = data.map((record) => ({
  type: record.typeName,
  content: record.content,
  position: record.position,
}));
```

**Caching Strategy**:

```typescript
// Cache responses to avoid redundant API calls
const cacheKey = `analysis_${hash(drawingSnapshot)}`;
const cached = sessionStorage.getItem(cacheKey);
if (cached) {
  return JSON.parse(cached);
}

const result = await aiService.analyze(drawingSnapshot);
sessionStorage.setItem(cacheKey, JSON.stringify(result));
return result;
```

## Testing AI Integration

### 1. Connection Testing

```typescript
async testConnection(provider: 'openai' | 'gemini' | 'claude'): Promise<boolean> {
  try {
    switch (provider) {
      case 'openai':
        await this.openai?.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 5
        });
        return true;

      case 'gemini':
        const model = this.gemini?.getGenerativeModel({ model: 'gemini-pro' });
        await model?.generateContent('test');
        return true;

      case 'claude':
        await this.claude?.messages.create({
          model: 'claude-3-haiku-20240307',
          max_tokens: 5,
          messages: [{ role: 'user', content: 'test' }]
        });
        return true;

      default:
        return false;
    }
  } catch (error) {
    console.error(`${provider} connection test failed:`, error);
    return false;
  }
}
```

### 2. Response Validation

````typescript
private parseJSONResponse(response: string): { steps?: UserJourneyStep[]; events?: AnalyticsEvent[] } {
  try {
    // Remove markdown code blocks if present
    const cleanResponse = response.replace(/```json\s*|\s*```/g, '').trim();

    // Extract JSON object if it's wrapped in other text
    const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      // Validate structure
      if (parsed.steps && Array.isArray(parsed.steps)) {
        return parsed;
      }
      if (parsed.events && Array.isArray(parsed.events)) {
        return parsed;
      }
    }

    throw new Error('Invalid JSON structure');
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return { steps: [], events: [] };
  }
}
````

## Troubleshooting

### Common Issues

1. **API Key Errors**

   - Verify key format and validity
   - Check API key permissions
   - Ensure sufficient credits/quota

2. **Rate Limiting**

   - Implement exponential backoff
   - Switch to alternative providers
   - Optimize request frequency

3. **Invalid Responses**

   - Improve prompt engineering
   - Add response validation
   - Implement fallback data

4. **Network Issues**
   - Add timeout handling
   - Implement retry mechanisms
   - Show appropriate error messages

### Monitoring and Debugging

**Logging Strategy**:

```typescript
// Log AI requests and responses
console.log("🤖 AI Request:", { provider, model, promptLength });
console.log("✅ AI Response:", { provider, responseLength, confidence });
console.log("❌ AI Error:", { provider, error: error.message });
```

**Performance Metrics**:

- Response times per provider
- Success/failure rates
- Token usage tracking
- Confidence score distributions

## Future Enhancements

### 1. Advanced AI Features

- Image analysis for wireframe recognition
- Custom model fine-tuning
- Multi-modal input processing
- Real-time streaming responses

### 2. Self-Improving System

- User feedback collection
- Response quality scoring
- Automated prompt optimization
- Learning from usage patterns

### 3. Enterprise Features

- Custom AI model hosting
- Advanced security controls
- Usage analytics and reporting
- Team collaboration features
