# Modules & Components Documentation

## Component Architecture Overview

### 1. Core Components

#### 1.1 App.tsx

**Purpose**: Root application component and main orchestrator
**Type**: Container Component
**Key Responsibilities**:

- Application state management
- Tab navigation control
- AI analysis orchestration
- User flow management

```typescript
interface AppState {
  activeTab: 'drawing' | 'capture' | 'events' | 'ai-analysis' | 'ai-config';
  userFlow: UserFlow | null;
  isAnalyzing: boolean;
}

// Key Methods:
- captureDrawing(): Creates UserFlow from drawing data
- analyzeWithAI(): Initiates AI analysis process
- analyzeUserJourney(): Fallback analysis implementation
```

#### 1.2 DrawingEditor.tsx

**Purpose**: Interactive drawing canvas interface
**Type**: UI Component
**Dependencies**: tldraw, AppContext

```typescript
interface DrawingEditorProps {
  // No props - gets data from context
}

// Key Features:
- tldraw integration for drawing
- Real-time state synchronization
- Drawing tools and controls
- Canvas export functionality
```

**Implementation Details**:

- Uses tldraw's Tldraw component
- Implements onChange handler for state updates
- Provides drawing tools: shapes, text, arrows, frames
- Auto-saves drawing state to context

#### 1.3 AIAnalysisPanel.tsx

**Purpose**: Displays AI analysis results with multiple views
**Type**: Dashboard Component
**Dependencies**: AIAnalysis data

```typescript
interface AIAnalysisPanelProps {
  userFlow: UserFlow;
  isAnalyzing: boolean;
}

// View Modes:
- overview: High-level metrics and summary
- events: Detailed event specifications
- journey: Step-by-step user flow
- code: Implementation code snippets
```

**Features**:

- Tabbed interface for different views
- Event property details
- Code generation for tracking implementation
- Export functionality
- Loading states during analysis

#### 1.4 DrawingCapture.tsx

**Purpose**: Shows captured drawing data and metadata
**Type**: Information Display Component

```typescript
interface DrawingCaptureProps {
  userFlow: UserFlow;
}

// Displays:
- Drawing snapshot information
- Record counts and metadata
- Capture timestamp
- Ready state for AI analysis
```

#### 1.5 AIConfigPanel.tsx

**Purpose**: AI provider configuration and testing
**Type**: Configuration Component
**Dependencies**: AIConfigContext

```typescript
interface AIConfigPanelProps {
  // Gets config from context
}

// Features:
- API key management
- Model selection
- Connection testing
- Configuration persistence
```

#### 1.6 EventPropertiesPanel.tsx

**Purpose**: Event and property editing interface
**Type**: Form Component

```typescript
interface EventPropertiesPanelProps {
  events: AnalyticsEvent[];
  onEventsUpdate: (events: AnalyticsEvent[]) => void;
}

// Capabilities:
- Event editing
- Property modification
- Type validation
- Requirement toggling
```

### 2. Context Providers

#### 2.1 AppContext

**Purpose**: Global application state management
**Location**: `src/context/AppContext.tsx`

```typescript
interface AppContextType {
  drawingData: StoreSnapshot<TLRecord> | null;
  setDrawingData: (data: StoreSnapshot<TLRecord>) => void;
}

// State Management:
- Drawing canvas data
- Real-time updates
- Cross-component data sharing
```

#### 2.2 AIConfigContext

**Purpose**: AI configuration and service management
**Location**: `src/context/AIConfigContext.tsx`

```typescript
interface AIConfigContextType {
  config: AIConfig;
  updateConfig: (newConfig: Partial<AIConfig>) => void;
  aiService: AIService | null;
  testConnection: (provider: string) => Promise<boolean>;
  saveConfig: () => void;
  loadConfig: () => void;
}

// Responsibilities:
- API key storage
- Service initialization
- Configuration persistence
- Provider testing
```

### 3. Services Layer

#### 3.1 AIService

**Purpose**: Multi-provider AI analysis service
**Location**: `src/services/aiService.ts`

**Core Architecture**:

```typescript
class AIService {
  private openai: OpenAI | null;
  private gemini: GoogleGenerativeAI | null;
  private claude: Anthropic | null;
  private config: AIConfig;

  // Main Analysis Pipeline:
  async analyzeUserJourney(
    snapshot: StoreSnapshot<TLRecord>
  ): Promise<AIAnalysis>;

  // Sub-processes:
  private async extractUserJourneySteps(): Promise<UserJourneyStep[]>;
  private async generateAnalyticsEvents(): Promise<AnalyticsEvent[]>;
  private async generateRecommendations(): Promise<string[]>;

  // Utility Methods:
  private parseJSONResponse(): object;
  private prepareDrawingDataForAI(): object[];
  private fallbackStepExtraction(): UserJourneyStep[];
}
```

**Provider Integration**:

- OpenAI GPT-4 for primary analysis
- Google Gemini for fallback
- Anthropic Claude for specialized tasks
- Custom fallback for offline mode

### 4. Custom Hooks

#### 4.1 useAppContext

**Purpose**: Simplified context access
**Location**: `src/hooks/useAppContext.ts`

```typescript
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};
```

#### 4.2 useAIConfig

**Purpose**: AI configuration hook
**Location**: `src/hooks/useAIConfig.ts`

```typescript
export const useAIConfig = (): AIConfigContextType => {
  const context = useContext(AIConfigContext);
  if (!context) {
    throw new Error("useAIConfig must be used within AIConfigProvider");
  }
  return context;
};
```

#### 4.3 useWindowDimensions

**Purpose**: Responsive design support
**Location**: `src/hooks/useWindowDimensions.ts`

```typescript
interface WindowDimensions {
  width: number;
  height: number;
}

export const useWindowDimensions = (): WindowDimensions => {
  // Real-time window size tracking
  // Debounced updates for performance
};
```

### 5. Type Definitions

#### 5.1 Core Data Models

**Location**: `src/App.tsx` (to be moved to `src/types/`)

```typescript
// User Journey Models
interface UserFlow
interface UserJourneyStep
interface DrawingElement
interface Connection

// Analytics Models
interface AnalyticsEvent
interface EventProperty
interface AIAnalysis
interface TrackingSpec

// Configuration Models
interface AIConfig (in aiService.ts)
```

#### 5.2 Socket Types

**Location**: `src/types/socket.ts`
Currently unused - prepared for future real-time collaboration features.

### 6. Component Interaction Patterns

#### 6.1 State Flow Pattern

```
User Input → Component → Context → Service → AI API → Response → Context → Component → UI Update
```

#### 6.2 Error Handling Pattern

```
Component → Service → Provider 1 (fail) → Provider 2 (fail) → Provider 3 (fail) → Fallback → Component
```

#### 6.3 Configuration Pattern

```
UI Config → Context Update → Service Recreation → Provider Initialization → Connection Test
```

### 7. Module Dependencies

#### 7.1 External Dependencies

```typescript
// Core React
import React, { useState, useEffect, useContext } from "react";

// Drawing
import { Tldraw, StoreSnapshot, TLRecord } from "tldraw";

// AI Providers
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";

// UI Components
import { Brain, Zap, Download, Settings } from "lucide-react";
```

#### 7.2 Internal Dependencies

```typescript
// Context
import { useAppContext } from "./hooks/useAppContext";
import { useAIConfig } from "./hooks/useAIConfig";

// Services
import { AIService } from "./services/aiService";

// Components
import DrawingEditor from "./components/DrawingEditor";
import AIAnalysisPanel from "./components/AIAnalysisPanel";
```

### 8. Performance Optimizations

#### 8.1 Component Level

- React.memo for expensive components
- useCallback for event handlers
- useMemo for computed values
- Lazy loading for heavy components

#### 8.2 State Management

- Debounced updates for drawing changes
- Selective context updates
- Memoized context values

#### 8.3 Service Level

- Request caching
- Token optimization
- Fallback strategies

### 9. Testing Strategy

#### 9.1 Component Testing

```typescript
// Example test structure
describe("AIAnalysisPanel", () => {
  it("renders loading state correctly");
  it("displays analysis results");
  it("handles export functionality");
  it("switches between view modes");
});
```

#### 9.2 Service Testing

```typescript
describe("AIService", () => {
  it("initializes with correct configuration");
  it("handles provider fallbacks");
  it("parses AI responses correctly");
  it("generates fallback data when all providers fail");
});
```

#### 9.3 Integration Testing

- End-to-end drawing to analysis flow
- Context provider interactions
- Error boundary testing

### 10. Future Module Enhancements

#### 10.1 Planned Components

- **VersionControl**: Drawing version management
- **Collaboration**: Real-time multi-user editing
- **TemplateLibrary**: Pre-built journey templates
- **IntegrationHub**: Analytics platform connectors

#### 10.2 Service Extensions

- **CacheService**: Advanced caching strategies
- **SyncService**: Data synchronization
- **ValidationService**: Input validation
- **MetricsService**: Performance monitoring

#### 10.3 Hook Expansions

- **useDrawingHistory**: Undo/redo functionality
- **useRealTimeSync**: Multi-user synchronization
- **usePerformanceMonitor**: Performance tracking
- **useOfflineMode**: Offline capability support
