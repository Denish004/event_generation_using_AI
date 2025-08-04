import { ScreenshotResult } from './visionService';
import { AnalyticsEvent, EventProperty, TrackingSpec } from '../App';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIConfig } from '../context/AIConfigContext';

export interface JourneyAnalysisResult {
  events: AnalyticsEvent[];
  globalProperties: EventProperty[];
  carriedProperties: { [stepId: string]: EventProperty[] };
  recommendations: string[];
  dataTypes: { [propertyName: string]: string };
  trackingSpec: TrackingSpec[];
  confidence: number;
  screenshots: ScreenshotResult[];
}

interface ScreenshotData {
  dataUrl: string;
  width: number;
  height: number;
  timestamp: number;
}

interface AIEventProperty {
  name: string;
  type: string;
  source: string;
  required: boolean;
  example: string | number | boolean;
  description: string;
  analytics_purpose: string;
}

interface AIEventResponse {
  name: string;
  description: string;
  screen: string;
  category: string;
  business_value: string;
  properties: AIEventProperty[];
  mandatory: string[];
  optional: string[];
  triggers: string[];
  similar_events_in_other_domains?: string[];
  // Legacy support
  eventName?: string;
  eventType?: string;
  element?: string;
  selector?: string;
  additionalProperties?: Record<string, string | number | boolean>;
}

interface AIScreenResponse {
  screen: string;
  events: AIEventResponse[];
}

export class AIAnalysisService {
  private aiConfig: AIConfig | null = null;

  constructor(aiConfig?: AIConfig) {
    this.aiConfig = aiConfig || null;
  }

  public setAIConfig(config: AIConfig) {
    this.aiConfig = config;
  }

  /**
   * Get the appropriate API key and model based on current configuration
   */
  private getApiConfig() {
    if (this.aiConfig?.selectedProvider === 'openai') {
      return {
        provider: 'openai' as const,
        apiKey: this.aiConfig.apiKeys?.openai || '',
        model: this.aiConfig.selectedModel || 'gpt-4o'
      };
    } else if (this.aiConfig?.selectedProvider === 'gemini') {
      return {
        provider: 'gemini' as const,
        apiKey: this.aiConfig.apiKeys?.gemini || '',
        model: this.aiConfig.selectedModel || 'gemini-1.5-flash'
      };
    }
    
    // Default fallback
    return {
      provider: 'openai' as const,
      apiKey: '',
      model: 'gpt-4o'
    };
  }

  /**
   * Analyze screenshots to detect events and generate tracking specifications
   */
  async analyzeScreenshots(screenshots: ScreenshotResult[], customPrompt?: string): Promise<JourneyAnalysisResult> {
    try {
      console.log(`🧠 Analyzing ${screenshots.length} screenshots...`);
      if (customPrompt) {
        console.log('Custom user prompt:', customPrompt);
      }

      const apiConfig = this.getApiConfig();
      
      console.log('Using AI provider:', apiConfig.provider);
      console.log('Using model:', apiConfig.model);
      console.log('API key length:', apiConfig.apiKey?.length || 0);
      
      // Convert screenshots to base64 for API
      const screenshotData: ScreenshotData[] = await Promise.all(
        screenshots.map(async (screenshot) => ({
          dataUrl: screenshot.dataUrl,
          width: screenshot.width,
          height: screenshot.height,
          timestamp: screenshot.timestamp
        }))
      );

      let analysisResult: JourneyAnalysisResult;

      // Try the selected provider first
      if (apiConfig.provider === 'openai' && apiConfig.apiKey) {
        try {
          console.log('Using OpenAI API for analysis...');
          analysisResult = await this.analyzeWithOpenAI(screenshotData, customPrompt, apiConfig.model, apiConfig.apiKey);
        } catch (error) {
          console.warn('OpenAI analysis failed:', error);
          throw error;
        }
      } else if (apiConfig.provider === 'gemini' && apiConfig.apiKey) {
        try {
          console.log('Using Gemini API for analysis...');
          analysisResult = await this.analyzeWithGemini(screenshotData, customPrompt, apiConfig.model, apiConfig.apiKey);
        } catch (error) {
          console.warn('Gemini analysis failed:', error);
          throw error;
        }
      } else {
        // Fallback to mock analysis if no valid config
        console.warn('No AI API keys found, using mock analysis');
        analysisResult = this.generateMockAnalysis(screenshots);
      }

      // Using direct results
      console.log('✅ Analysis completed');
      
      return analysisResult;
      
    } catch (error) {
      console.error('AI Analysis failed:', error);
      return this.generateMockAnalysis(screenshots);
    }
  }

  /**
   * Analyze screenshots using OpenAI Vision API
   */
  private async analyzeWithOpenAI(screenshots: ScreenshotData[], customPrompt?: string, model?: string, apiKey?: string): Promise<JourneyAnalysisResult> {
    // Using basic prompt
    const basePrompt = this.buildAnalysisPrompt();
    
    const selectedModel = model || 'gpt-4o';
    const openaiKey = apiKey || '';
    
    console.log('🧠 Using standard OpenAI analysis');
    console.log('Using OpenAI model:', selectedModel);
    console.log('API Key (first 10 chars):', openaiKey.substring(0, 10) + '...');

    const messages = [
      {
        role: 'system',
        content: basePrompt
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze these ${screenshots.length} mobile app screenshots for comprehensive event tracking specification.

ANALYSIS REQUIREMENTS:

1. SCREEN-BY-SCREEN EVENT DETECTION:
   - Identify ALL interactive elements on each screen
   - Detect events like: bannerClicked, tabSwitched, seeAllClicked, dateScrolled, filterTabClicked
   - Look for navigation elements, form inputs, buttons, cards, lists

2. PROPERTY SOURCE CLASSIFICATION:
   - ON-SCREEN: Values visible to user (entryFee, contestType, bannerId)
   - CARRIED-FORWARD: Data from previous screens (roundId, matchId from earlier selection)
   - GLOBAL: Session data (userId, balances, platform)

3. CONNECTED SCREEN ANALYSIS:
   - If screens show connected flow (arrows/lines), identify carried properties
   - Example: Round selected on Screen 1 → roundId carried to Screen 2 contests

4. DATA TYPE PRECISION:
   - Use 'number' for monetary values, counts, IDs that need math operations
   - Use 'string' for text, status values, non-numeric IDs
   - Use 'boolean' for true/false flags
   - Use 'decimal' for precise monetary calculations

5. EVENT NAMING:
   - Use camelCase format
   - Be specific but reusable (feedBannerClicked vs generic bannerClicked)
   - Include context when needed (homeWalletClicked vs contestWalletClicked)

Focus on fantasy sports app context: contests, matches, teams, tournaments, wallet, etc.
Ensure each event has complete property set for meaningful analytics.

${customPrompt ? `\n**ADDITIONAL USER REQUIREMENTS:**\n${customPrompt}\n` : ''}` },
          ...screenshots.map(screenshot => ({
            type: 'image_url',
            image_url: {
              url: screenshot.dataUrl,
              detail: 'high'
            }
          }))
        ]
      }
    ];

    console.log('Sending RAG-enhanced request to OpenAI API...');

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: selectedModel,
          messages,
          max_tokens: 10000,
          temperature: 0.1
        })
      });

      console.log('OpenAI API Response Status:', response.status);
      console.log('OpenAI API Response Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API Error Response:', errorText);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('OpenAI API Success Response:', data);
      
      const analysisText = data.choices[0].message.content;
      console.log('AI Analysis Text:', analysisText);
      
      return this.parseAIResponse(analysisText, screenshots);
    } catch (error) {
      console.error('OpenAI API request failed:', error);
      throw error;
    }
  }

  /**
   * Analyze screenshots using Google Gemini API
   */
  private async analyzeWithGemini(screenshots: ScreenshotData[], customPrompt?: string, model?: string, apiKey?: string): Promise<JourneyAnalysisResult> {
    // Using basic prompt
    const basePrompt = this.buildAnalysisPrompt();
    
    const selectedModel = model || 'gemini-1.5-flash';
    const geminiKey = apiKey || '';
    
    console.log('🧠 Using standard Gemini analysis');
    console.log('Using Gemini model:', selectedModel);
    console.log('API Key (first 10 chars):', geminiKey.substring(0, 10) + '...');

    if (!geminiKey) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const generativeModel = genAI.getGenerativeModel({ model: selectedModel });

      // Convert screenshots to inline data format for Gemini
      const imageParts = screenshots.map(screenshot => ({
        inlineData: {
          data: screenshot.dataUrl.split(',')[1], // Remove data:image/png;base64, prefix
          mimeType: "image/png"
        }
      }));

      const textPrompt = `${basePrompt}



Analyze these ${screenshots.length} mobile app screenshots for comprehensive event tracking specification.

ANALYSIS REQUIREMENTS:

1. SCREEN-BY-SCREEN EVENT DETECTION:
   - Identify ALL interactive elements on each screen
   - Detect events like: bannerClicked, tabSwitched, seeAllClicked, dateScrolled
   - Look for navigation elements, form inputs, buttons, cards, lists

2. PROPERTY SOURCE CLASSIFICATION:
   - ON-SCREEN: Values visible to user (entryFee, contestType, bannerId)
   - CARRIED-FORWARD: Data from previous screens (roundId, matchId from earlier selection)
   - GLOBAL: Session data (userId, balances, platform)

3. CONNECTED SCREEN ANALYSIS:
   - If screens show connected flow (arrows/lines), identify carried properties
   - Example: Round selected on Screen 1 → roundId carried to Screen 2 contests

4. DATA TYPE PRECISION:
   - Use 'number' for monetary values, counts, IDs that need math operations
   - Use 'string' for text, status values, non-numeric IDs
   - Use 'boolean' for true/false flags
   - Use 'decimal' for precise monetary calculations

5. EVENT NAMING:
   - Use camelCase format
   - Be specific but reusable (feedBannerClicked vs generic bannerClicked)
   - Include context when needed (homeWalletClicked vs contestWalletClicked)

Focus on fantasy sports app context: contests, matches, teams, tournaments, wallet, etc.
Ensure each event has complete property set for meaningful analytics.
${customPrompt ? `\n**SPECIFIC REQUIREMENTS:**\n${customPrompt}\n` : ''}
Follow user requirements and provide detailed event tracking specifications.
`;

      console.log('Sending RAG-enhanced request to Gemini API...');
      console.log('Full prompt length:', textPrompt.length);

      const result = await generativeModel.generateContent([textPrompt, ...imageParts]);
      const response = await result.response;
      const analysisText = response.text();
      
      console.log('Gemini API Success Response');
      console.log('Gemini Analysis Text:', analysisText);
      console.log('Analysis text length:', analysisText.length);
      
      return this.parseAIResponse(analysisText, screenshots);
    } catch (error) {
      console.error('Gemini API request failed:', error);
      throw error;
    }
  }

  /**
   * Build comprehensive prompt for event analysis
   */
  private buildAnalysisPrompt(): string {
    return `You are a UI/UX analysis expert specializing in mobile application event tracking and user journey analysis. Analyze the provided mobile application screen sequences and generate comprehensive event tracking specifications for analytics implementation.

CORE RESPONSIBILITIES:

1. SCREEN-LEVEL EVENT DETECTION:
   For each screen, identify ALL interactive elements and their corresponding events:
   - UI interactions (button clicks, scrolls, selections, swipes)
   - Visual element interactions (Filter, banners, cards, navigation tabs)
   - Screen-specific actions (date scrolling, filtering, "see all" actions)
   - Form interactions (input fields, dropdowns, toggles)

2. EVENT PROPERTY CLASSIFICATION:
   For each detected event, categorize properties by source:
   
   a) ON-SCREEN VALUES: Data visible to the user
      - entryFee, contestType, bannerId, matchStatus
      - Any text, numbers, or selections visible on screen
      
   b) CARRIED PROPERTIES: Data passed from previous screens
      - roundId, matchId, tournamentId from earlier selections
      - Context from user's navigation path
      
   c) GLOBAL/SESSION PROPERTIES: Always available
      - userId, platform, sessionId, timestamp
      - Current user state (balance, location, device info)

3. EVENT NAMING CONVENTIONS:
   - Use camelCase format (bannerClicked, contestJoined)
   - Be specific but not overly detailed
   - Include source context when needed (homeBannerClicked vs contestBannerClicked)

4. DATA TYPES (Critical for analytics tools):
   - string: Text values, IDs, names, status
   - number/integer: Prices, counts, percentages, balances
   - boolean: True/false flags, toggles
   - decimal: Money amounts, precise calculations

5. PROPERTY REQUIREMENTS:
   - Mandatory: Required for event to be meaningful
   - Optional: Additional context that's useful but not essential

ANALYSIS RULES:

1. For each screen, detect events like:
   - banner_clicked, match_card_selected, tab_switched
   - see_all_matches_clicked, filter_applied, date_scrolled
   - wallet_clicked, profile_viewed, settings_opened

2. For connected screens (arrows in drawings):
   - Identify what data flows from screen A to screen B
   - Mark properties as "carried-forward" when they come from previous screens
   - Example: roundId selected on home screen → carried to contest screen

3. Consider referrer/source context:
   - Same event from different screens needs source property
   - Example: createTeam event from "join contest" vs "create team button"

4. Property completeness checklist:
   - Can analyst recreate user journey with these properties?
   - Are all visible values captured?
   - Are carried properties from previous screens included?
   - Are data types correct for analytics tools?

OUTPUT FORMAT (JSON):
{
  "events": [
    {
      "name": "eventName",
      "description": "Clear trigger description",
      "screen": "screenName",
      "properties": [
        {
          "name": "propertyName",
          "type": "string|number|boolean|decimal",
          "source": "on-screen|carried-forward|global",
          "required": true,
          "example": "example_value",
          "description": "What this property represents"
        }
      ],
      "mandatory": ["requiredProp1", "requiredProp2"],
      "optional": ["optionalProp1"],
      "triggers": ["User clicks banner", "Auto-triggered on scroll"]
    }
  ],
  "globalProperties": [
    {
      "name": "userId",
      "type": "string",
      "source": "global",
      "required": true,
      "example": "user_123",
      "description": "Unique user identifier"
    }
  ],
  "carriedProperties": {
    "screenName": [
      {
        "name": "roundId",
        "type": "string",
        "source": "carried-forward",
        "required": true,
        "example": "round_123",
        "description": "Selected round from previous screen"
      }
    ]
  },
  "recommendations": [
    "Track user balance changes after transactions",
    "Monitor click-through rates by banner position"
  ],
  "confidence": 0.85
}

FOCUS AREAS:
- Fantasy sports/gaming app context (contests, matches, teams)
- Mobile-first interactions (swipes, taps, scrolls)
- User journey flow analysis
- Cross-screen data persistence
- Event property completeness for analytics
- Proper data typing for mathematical operations`;
  }

  /**
   * Parse AI response and convert to structured format
   */
  private parseAIResponse(analysisText: string, screenshots: ScreenshotData[]): JourneyAnalysisResult {
    try {
      console.log('Raw AI Response:', analysisText);
      
      // Clean the response text
      let cleanedText = analysisText.trim();
      
      // Remove markdown code blocks if present
      cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/\s*```/g, '');
      
      // Remove any explanatory text before JSON
      const possibleStarts = ['```', '{', '['];
      for (const start of possibleStarts) {
        const startIndex = cleanedText.indexOf(start);
        if (startIndex > 0 && start === '{') {
          cleanedText = cleanedText.substring(startIndex);
          break;
        }
      }
      
      // Try to find JSON content more aggressively
      let jsonContent = '';
      
      // Method 1: Look for JSON array starting with [ or object starting with {
      const arrayStart = cleanedText.indexOf('[');
      const objectStart = cleanedText.indexOf('{');
      
      // Check if it's an array format first
      if (arrayStart !== -1 && (objectStart === -1 || arrayStart < objectStart)) {
        let bracketCount = 0;
        let jsonEnd = -1;
        
        for (let i = arrayStart; i < cleanedText.length; i++) {
          const char = cleanedText[i];
          if (char === '[') {
            bracketCount++;
          } else if (char === ']') {
            bracketCount--;
            if (bracketCount === 0) {
              jsonEnd = i;
              break;
            }
          }
        }
        
        if (jsonEnd !== -1) {
          jsonContent = cleanedText.substring(arrayStart, jsonEnd + 1);
        }
      } else if (objectStart !== -1) {
        // Handle single object format
        let braceCount = 0;
        let jsonEnd = -1;
        
        for (let i = objectStart; i < cleanedText.length; i++) {
          const char = cleanedText[i];
          if (char === '{') {
            braceCount++;
          } else if (char === '}') {
            braceCount--;
            if (braceCount === 0) {
              jsonEnd = i;
              break;
            }
          }
        }
        
        if (jsonEnd !== -1) {
          jsonContent = cleanedText.substring(objectStart, jsonEnd + 1);
        }
      }
      
      // Method 2: Fallback to regex if brace counting fails
      if (!jsonContent) {
        const jsonMatch = cleanedText.match(/\{[\s\S]*?\}(?=\s*(?:```|$|[^\s}]))/);
        if (jsonMatch) {
          jsonContent = jsonMatch[0];
        }
      }
      
      // Method 3: Try to extract everything between first { and last }
      if (!jsonContent) {
        const firstBrace = cleanedText.indexOf('{');
        const lastBrace = cleanedText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          jsonContent = cleanedText.substring(firstBrace, lastBrace + 1);
        }
      }
      
      // Method 4: Try to find complete JSON objects separated by newlines
      if (!jsonContent) {
        const lines = cleanedText.split('\n');
        const jsonLines = lines.filter(line => line.trim().startsWith('{') || line.trim().includes(':'));
        if (jsonLines.length > 0) {
          jsonContent = jsonLines.join('\n').trim();
        }
      }
      
      if (!jsonContent) {
        console.warn('No valid JSON found, attempting with full response');
        jsonContent = cleanedText;
      }
      
      console.log('Extracted JSON:', jsonContent);
      
      // Additional validation before parsing
      try {
        // Test if it's valid JSON first
        JSON.parse(jsonContent);
      } catch {
        console.warn('JSON validation failed, trying to fix common issues');
        
        // Try to fix common JSON issues
        jsonContent = jsonContent
          .replace(/,\s*}/g, '}')  // Remove trailing commas
          .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
          .replace(/(\w+):/g, '"$1":')  // Quote unquoted keys
          .replace(/:\s*([^",[{}]+)(?=\s*[,}])/g, ': "$1"');  // Quote unquoted string values
      }
      
      const parsed = JSON.parse(jsonContent);
      
      // Handle both array of screens and single screen format
      let allEvents: AIEventResponse[] = [];
      
      if (Array.isArray(parsed)) {
        // Array format: [{ screen: "Screen1", events: [...] }, { screen: "Screen2", events: [...] }]
        console.log('Processing array format with', parsed.length, 'screens');
        allEvents = parsed.flatMap((screenData: AIScreenResponse) => screenData.events || []);
      } else if (parsed.screens && Array.isArray(parsed.screens)) {
        // Multiple screens format: { screens: [{ screen: "Screen1", events: [...] }] }
        console.log('Processing screens format with', parsed.screens.length, 'screens');
        allEvents = parsed.screens.flatMap((screenData: AIScreenResponse) => screenData.events || []);
      } else if (parsed.events && Array.isArray(parsed.events)) {
        // New format: { events: [...], globalProperties: [...], ... }
        console.log('Processing new structured format with', parsed.events.length, 'events');
        allEvents = parsed.events;
      } else {
        console.warn('Unexpected AI response format, trying to extract events from root level');
        allEvents = [];
      }
      
      console.log('Total events extracted:', allEvents.length);

      // Convert AI response events to AnalyticsEvent format
      const events: AnalyticsEvent[] = allEvents.map((event: AIEventResponse, index: number) => {
        // Handle both new and legacy formats
        const eventName = event.name || event.eventName || `event_${index + 1}`;
        const elementId = event.selector || `element_${index + 1}`;
        
        // Convert AI properties to EventProperty format
        const properties: EventProperty[] = [];
        
        if (event.properties && Array.isArray(event.properties)) {
          // New format with structured properties
          properties.push(...event.properties.map(prop => ({
            name: prop.name,
            type: prop.type as 'string' | 'number' | 'boolean' | 'object',
            source: prop.source as 'on-screen' | 'carried-forward' | 'global',
            required: prop.required,
            example: prop.example,
            confidence: 0.9,
            description: prop.description
          })));
        } else {
          // Legacy format - create basic properties
          if (event.element) {
            properties.push({
              name: 'elementText',
              type: 'string',
              source: 'on-screen',
              required: true,
              example: event.element,
              confidence: 0.9,
              description: 'Text or description of the UI element'
            });
          }
          
          if (event.eventType) {
            properties.push({
              name: 'eventType',
              type: 'string',
              source: 'on-screen',
              required: true,
              example: event.eventType,
              confidence: 0.9,
              description: 'Type of user interaction'
            });
          }

          // Add additional properties from legacy format
          if (event.additionalProperties) {
            properties.push(...Object.entries(event.additionalProperties).map(([key, value]) => ({
              name: key,
              type: typeof value as 'string' | 'number' | 'boolean' | 'object',
              source: 'on-screen' as const,
              required: false,
              example: value,
              confidence: 0.8,
              description: `Additional property: ${key}`
            })));
          }
        }

        return {
          id: `event_${index + 1}`,
          name: eventName,
          elementId: elementId,
          properties: properties,
          triggers: event.triggers || [`User performs ${event.eventType || 'interaction'} on ${event.element || 'element'}`],
          sources: [event.screen || 'Mobile App Screen'],
          confidence: 0.85,
          category: 'user_action'
        };
      });

      // Handle global properties from AI response or generate defaults
      let globalProperties: EventProperty[] = [];
      
      if (parsed.globalProperties && Array.isArray(parsed.globalProperties)) {
        // Use AI-provided global properties
        globalProperties = parsed.globalProperties.map((prop: AIEventProperty) => ({
          name: prop.name,
          type: prop.type as 'string' | 'number' | 'boolean' | 'object',
          source: 'global' as const,
          required: prop.required,
          example: prop.example,
          confidence: 0.95,
          description: prop.description
        }));
      } else {
        // Generate basic global properties
        globalProperties = [
          {
            name: 'userId',
            type: 'string',
            source: 'global',
            required: true,
            example: 'user_123456',
            confidence: 0.95,
            description: 'Unique user identifier'
          },
          {
            name: 'sessionId',
            type: 'string',
            source: 'global',
            required: true,
            example: 'session_abc123',
            confidence: 0.95,
            description: 'Current session identifier'
          },
          {
            name: 'timestamp',
            type: 'string',
            source: 'global',
            required: true,
            example: new Date().toISOString(),
            confidence: 0.95,
            description: 'Event occurrence timestamp'
          }
        ];
      }

      // Handle carried properties from AI response
      const carriedProperties: { [stepId: string]: EventProperty[] } = {};
      
      if (parsed.carriedProperties && typeof parsed.carriedProperties === 'object') {
        for (const [screenId, props] of Object.entries(parsed.carriedProperties)) {
          if (Array.isArray(props)) {
            carriedProperties[screenId] = props.map(prop => ({
              name: prop.name,
              type: prop.type as 'string' | 'number' | 'boolean' | 'object',
              source: 'carried-forward' as const,
              required: prop.required,
              example: prop.example,
              confidence: 0.9,
              description: prop.description
            }));
          }
        }
      }

      // Convert tracking spec with proper null handling
      const trackingSpec: TrackingSpec[] = allEvents.map((event: AIEventResponse) => {
        const eventName = event.name || event.eventName || 'unknownEvent';
        const eventDescription = event.description || `User performs ${event.eventType || 'interaction'}`;
        
        return {
          eventName: eventName,
          description: eventDescription,
          triggers: event.triggers || [`User performs ${event.eventType || 'interaction'}`],
          properties: event.properties ? event.properties.map(prop => ({
            name: prop.name,
            type: prop.type as 'string' | 'number' | 'boolean' | 'object',
            source: prop.source as 'on-screen' | 'carried-forward' | 'global',
            required: prop.required,
            example: prop.example,
            confidence: 0.9,
            description: prop.description
          })) : [
            {
              name: 'elementText',
              type: 'string',
              source: 'on-screen',
              required: true,
              example: event.element || 'button',
              confidence: 0.9,
              description: 'Text or description of the UI element'
            }
          ],
          examples: event.properties ? event.properties.reduce((acc, prop) => {
            acc[prop.name] = prop.example;
            return acc;
          }, {} as Record<string, string | number | boolean>) : {
            elementText: event.element || 'button',
            eventType: event.eventType || 'click'
          },
          mandatory: event.mandatory || ['elementText'],
          optional: event.optional || []
        };
      });

      return {
        events,
        globalProperties,
        carriedProperties,
        recommendations: parsed.recommendations || [
          'Track all UI element interactions for comprehensive user behavior analysis',
          'Monitor event types to understand interaction patterns',
          'Analyze additional properties to identify optimization opportunities'
        ],
        dataTypes: {},
        trackingSpec,
        confidence: parsed.confidence || 0.85,
        screenshots: screenshots.map(s => ({
          dataUrl: s.dataUrl,
          width: s.width,
          height: s.height,
          format: 'png',
          timestamp: s.timestamp,
          blob: new Blob()
        }))
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      console.error('Raw response that failed:', analysisText);
      return this.generateMockAnalysis(screenshots.map(s => ({
        dataUrl: s.dataUrl,
        width: s.width,
        height: s.height,
        format: 'png',
        timestamp: s.timestamp,
        blob: new Blob()
      })));
    }
  }

  /**
   * Generate mock analysis for testing
   */
  private generateMockAnalysis(screenshots: ScreenshotData[]): JourneyAnalysisResult {
    const mockEvents: AnalyticsEvent[] = [
      {
        id: 'event_1',
        name: 'feedBannerClicked',
        elementId: 'promoBanner',
        properties: [
          {
            name: 'bannerId',
            type: 'string',
            source: 'on-screen',
            required: true,
            example: 'banner001',
            confidence: 0.95,
            description: 'Unique identifier for the clicked banner'
          },
          {
            name: 'imageUrl',
            type: 'string',
            source: 'on-screen',
            required: true,
            example: 'https://example.com/banner.jpg',
            confidence: 0.92,
            description: 'URL of the banner image'
          },
          {
            name: 'redirectUrl',
            type: 'string',
            source: 'on-screen',
            required: true,
            example: 'https://example.com/contest',
            confidence: 0.90,
            description: 'Destination URL when banner is clicked'
          },
          {
            name: 'source',
            type: 'string',
            source: 'global',
            required: true,
            example: 'homeScreen',
            confidence: 0.95,
            description: 'Screen where banner was clicked'
          }
        ],
        triggers: ['User clicks on promotional banner'],
        sources: ['Home Screen'],
        confidence: 0.93,
        category: 'user_action'
      },
      {
        id: 'event_2',
        name: 'roundSelected',
        elementId: 'matchCard',
        properties: [
          {
            name: 'roundId',
            type: 'number',
            source: 'on-screen',
            required: true,
            example: 12345,
            confidence: 0.95,
            description: 'Unique round identifier'
          },
          {
            name: 'contestJoinCount',
            type: 'number',
            source: 'global',
            required: false,
            example: 2,
            confidence: 0.88,
            description: 'Number of contests user has already joined for this round'
          },
          {
            name: 'isLineupOut',
            type: 'boolean',
            source: 'on-screen',
            required: true,
            example: true,
            confidence: 0.90,
            description: 'Whether team lineups are announced'
          },
          {
            name: 'roundStatus',
            type: 'string',
            source: 'on-screen',
            required: true,
            example: 'upcoming',
            confidence: 0.92,
            description: 'Current status of the round'
          },
          {
            name: 'section',
            type: 'string',
            source: 'on-screen',
            required: true,
            example: 'forYou',
            confidence: 0.85,
            description: 'Section where match was selected from'
          },
          {
            name: 'slotPosition',
            type: 'number',
            source: 'on-screen',
            required: false,
            example: 1,
            confidence: 0.80,
            description: 'Position of match card in the list'
          },
          {
            name: 'tourId',
            type: 'number',
            source: 'on-screen',
            required: true,
            example: 456,
            confidence: 0.92,
            description: 'Tournament identifier'
          }
        ],
        triggers: ['User clicks on match card'],
        sources: ['Home Screen'],
        confidence: 0.89,
        category: 'user_action'
      },
      {
        id: 'event_3',
        name: 'matchesTabInteracted',
        elementId: 'matchesTab',
        properties: [
          {
            name: 'matchesOption',
            type: 'string',
            source: 'on-screen',
            required: true,
            example: 'today',
            confidence: 0.92,
            description: 'Selected tab option (forYou, today, tomorrow, etc.)'
          },
          {
            name: 'previousTab',
            type: 'string',
            source: 'carried-forward',
            required: false,
            example: 'forYou',
            confidence: 0.75,
            description: 'Previously selected tab'
          }
        ],
        triggers: ['User switches between match tabs'],
        sources: ['Home Screen'],
        confidence: 0.87,
        category: 'user_action'
      },
      {
        id: 'event_4',
        name: 'seeAllMatchesClicked',
        elementId: 'see_all_button',
        properties: [
          {
            name: 'currentSection',
            type: 'string',
            source: 'on-screen',
            required: true,
            example: 'for_you',
            confidence: 0.90,
            description: 'Current matches section being viewed'
          },
          {
            name: 'visibleMatchesCount',
            type: 'number',
            source: 'on-screen',
            required: false,
            example: 5,
            confidence: 0.80,
            description: 'Number of matches visible before clicking see all'
          }
        ],
        triggers: ['User clicks see all matches'],
        sources: ['Home Screen'],
        confidence: 0.85,
        category: 'user_action'
      },
      {
        id: 'event_5',
        name: 'walletClicked',
        elementId: 'wallet_icon',
        properties: [
          {
            name: 'source',
            type: 'string',
            source: 'global',
            required: true,
            example: 'home_screen',
            confidence: 0.95,
            description: 'Screen from where wallet was accessed'
          },
          {
            name: 'currentAccountBalance',
            type: 'number',
            source: 'global',
            required: true,
            example: 1250.50,
            confidence: 0.92,
            description: 'Total account balance'
          },
          {
            name: 'currentCashBonusBalance',
            type: 'number',
            source: 'global',
            required: true,
            example: 100.00,
            confidence: 0.92,
            description: 'Cash bonus balance'
          },
          {
            name: 'currentDepositBalance',
            type: 'number',
            source: 'global',
            required: true,
            example: 500.00,
            confidence: 0.92,
            description: 'Deposited amount balance'
          },
          {
            name: 'currentWinningsBalance',
            type: 'number',
            source: 'global',
            required: true,
            example: 650.50,
            confidence: 0.92,
            description: 'Winnings balance'
          }
        ],
        triggers: ['User clicks on wallet icon'],
        sources: ['Any Screen'],
        confidence: 0.93,
        category: 'user_action'
      },
      {
        id: 'event_6',
        name: 'contestJoined',
        elementId: 'join_button',
        properties: [
          {
            name: 'contestId',
            type: 'string',
            source: 'on-screen',
            required: true,
            example: 'contest_789',
            confidence: 0.95,
            description: 'Unique contest identifier'
          },
          {
            name: 'entryFee',
            type: 'number',
            source: 'on-screen',
            required: true,
            example: 49,
            confidence: 0.95,
            description: 'Contest entry fee amount'
          },
          {
            name: 'roundId',
            type: 'number',
            source: 'carried-forward',
            required: true,
            example: 12345,
            confidence: 0.90,
            description: 'Round ID from previous screen selection'
          },
          {
            name: 'contestType',
            type: 'string',
            source: 'on-screen',
            required: true,
            example: 'head_to_head',
            confidence: 0.88,
            description: 'Type of contest being joined'
          },
          {
            name: 'totalSpots',
            type: 'number',
            source: 'on-screen',
            required: false,
            example: 2,
            confidence: 0.85,
            description: 'Total spots in the contest'
          },
          {
            name: 'spotsFilled',
            type: 'number',
            source: 'on-screen',
            required: false,
            example: 1,
            confidence: 0.85,
            description: 'Number of spots already filled'
          }
        ],
        triggers: ['User successfully joins a contest'],
        sources: ['Contest Selection Screen'],
        confidence: 0.91,
        category: 'user_action'
      }
    ];

    const mockGlobalProperties: EventProperty[] = [
      {
        name: 'userId',
        type: 'string',
        source: 'global',
        required: true,
        example: 'user_123456',
        confidence: 0.95,
        description: 'Unique user identifier'
      },
      {
        name: 'platform',
        type: 'string',
        source: 'global',
        required: true,
        example: 'mobile_android',
        confidence: 0.95,
        description: 'Platform identifier (mobile_android, mobile_ios, web)'
      },
      {
        name: 'sessionId',
        type: 'string',
        source: 'global',
        required: true,
        example: 'session_abc123def',
        confidence: 0.95,
        description: 'Current session identifier'
      },
      {
        name: 'appVersion',
        type: 'string',
        source: 'global',
        required: true,
        example: '2.1.5',
        confidence: 0.95,
        description: 'Application version'
      },
      {
        name: 'timestamp',
        type: 'string',
        source: 'global',
        required: true,
        example: '2025-07-18T08:30:00Z',
        confidence: 0.95,
        description: 'Event occurrence timestamp'
      }
    ];

    const mockTrackingSpec: TrackingSpec[] = [
      {
        eventName: 'feedBannerClicked',
        description: 'When user clicks on any promotional banner in the feed',
        triggers: ['User clicks on banner'],
        properties: mockEvents[0].properties,
        examples: {
          bannerId: 'banner001',
          imageUrl: 'https://example.com/banner.jpg',
          redirectUrl: 'https://example.com/contest',
          source: 'homeScreen'
        },
        mandatory: ['bannerId', 'imageUrl', 'redirectUrl', 'source'],
        optional: ['bannerPosition', 'bannerCategory']
      },
      {
        eventName: 'roundSelected',
        description: 'When user clicks on a round/match card',
        triggers: ['User clicks on match card'],
        properties: mockEvents[1].properties,
        examples: {
          roundId: 12345,
          contestJoinCount: 2,
          isLineupOut: true,
          roundStatus: 'upcoming',
          section: 'forYou',
          slotPosition: 1,
          tourId: 456
        },
        mandatory: ['roundId', 'isLineupOut', 'roundStatus', 'section', 'tourId'],
        optional: ['contestJoinCount', 'slotPosition', 'teamCount']
      },
      {
        eventName: 'matchesTabInteracted',
        description: 'When user switches between upcoming matches tabs',
        triggers: ['User clicks on tab'],
        properties: mockEvents[2].properties,
        examples: {
          matchesOption: 'today',
          previousTab: 'forYou'
        },
        mandatory: ['matchesOption'],
        optional: ['previousTab', 'timeSpentOnTab']
      },
      {
        eventName: 'seeAllMatchesClicked',
        description: 'When user clicks see all matches button',
        triggers: ['User clicks see all matches'],
        properties: mockEvents[3].properties,
        examples: {
          currentSection: 'forYou',
          visibleMatchesCount: 5
        },
        mandatory: ['currentSection'],
        optional: ['visibleMatchesCount', 'totalMatchesAvailable']
      },
      {
        eventName: 'walletClicked',
        description: 'When user clicks on wallet icon from any screen',
        triggers: ['User clicks wallet icon'],
        properties: mockEvents[4].properties,
        examples: {
          source: 'homeScreen',
          currentAccountBalance: 1250.50,
          currentCashBonusBalance: 100.00,
          currentDepositBalance: 500.00,
          currentWinningsBalance: 650.50
        },
        mandatory: ['source', 'currentAccountBalance', 'currentCashBonusBalance', 'currentDepositBalance', 'currentWinningsBalance'],
        optional: ['lastTransactionAmount', 'pendingWithdrawals']
      },
      {
        eventName: 'contestJoined',
        description: 'When user successfully joins a contest',
        triggers: ['User clicks join contest and completes action'],
        properties: mockEvents[5].properties,
        examples: {
          contestId: 'contest789',
          entryFee: 49,
          roundId: 12345,
          contestType: 'headToHead',
          totalSpots: 2,
          spotsFilled: 1
        },
        mandatory: ['contestId', 'entryFee', 'roundId', 'contestType'],
        optional: ['totalSpots', 'spotsFilled', 'discountApplied', 'teamId']
      }
    ];

    return {
      events: mockEvents,
      globalProperties: mockGlobalProperties,
      carriedProperties: {
        'homeScreen': [
          {
            name: 'roundId',
            type: 'number',
            source: 'carried-forward',
            required: true,
            example: 12345,
            confidence: 0.90,
            description: 'Round ID selected from home screen, carried to contest screen'
          },
          {
            name: 'tourId',
            type: 'number',
            source: 'carried-forward',
            required: true,
            example: 456,
            confidence: 0.88,
            description: 'Tournament ID carried from match selection'
          }
        ],
        'contestScreen': [
          {
            name: 'contestId',
            type: 'string',
            source: 'carried-forward',
            required: true,
            example: 'contest_789',
            confidence: 0.92,
            description: 'Contest ID carried to team creation screen'
          },
          {
            name: 'entryFee',
            type: 'number',
            source: 'carried-forward',
            required: true,
            example: 49,
            confidence: 0.90,
            description: 'Entry fee amount carried to payment screen'
          }
        ]
      },
      recommendations: [
        'Track source/referrer for all events to understand user journey paths',
        'Include slot_position for list items to analyze user interaction patterns',
        'Monitor balance changes after each transaction event',
        'Track contest join success/failure rates by entry fee ranges',
        'Analyze banner click-through rates by position and content type',
        'Monitor tab switching patterns to optimize content organization',
        'Track carried properties consistency across screens',
        'Ensure proper data types for mathematical operations on monetary values',
        'Include timestamp precision for time-based analytics',
        'Monitor user engagement depth by tracking see_all interactions'
      ],
      dataTypes: {
        'banner_id': 'string',
        'round_id': 'number',
        'contest_id': 'string',
        'entry_fee': 'number',
        'tour_id': 'number',
        'user_id': 'string',
        'contest_join_count': 'number',
        'is_lineup_out': 'boolean',
        'current_account_balance': 'number',
        'current_cash_bonus_balance': 'number',
        'current_deposit_balance': 'number',
        'current_winnings_balance': 'number',
        'slot_position': 'number',
        'visible_matches_count': 'number',
        'total_spots': 'number',
        'spots_filled': 'number'
      },
      trackingSpec: mockTrackingSpec,
      confidence: 0.88,
      screenshots: screenshots.map(s => ({
        dataUrl: s.dataUrl,
        width: s.width,
        height: s.height,
        format: 'png',
        timestamp: s.timestamp,
        blob: new Blob()
      }))
    };
  }

  /**
   * Test connection to a specific AI provider
   */
  async testConnection(provider: 'openai' | 'gemini', config?: AIConfig): Promise<boolean> {
    try {
      const testConfig = config || this.aiConfig;

      switch (provider) {
        case 'openai': {
          const apiKey = testConfig?.apiKeys?.openai || '';
          if (!apiKey) {
            throw new Error('OpenAI API key not configured');
          }
          
          const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: 'gpt-3.5-turbo',
              messages: [{ role: 'user', content: 'test' }],
              max_tokens: 5
            })
          });
          
          if (!openaiResponse.ok) {
            throw new Error(`OpenAI API error: ${openaiResponse.status}`);
          }
          
          return true;
        }

        case 'gemini': {
          const apiKey = testConfig?.apiKeys?.gemini || '';
          if (!apiKey) {
            throw new Error('Gemini API key not configured');
          }
          
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
          await model.generateContent('test');
          
          return true;
        }

        default:
          return false;
      }
    } catch (error) {
      console.error(`${provider} connection test failed:`, error);
      return false;
    }
  }
}

export const aiAnalysisService = new AIAnalysisService();
