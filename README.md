# 🧠 AI-Powered Event Generation Tool

An intelligent tool for analyzing user interface wireframes and automatically generating comprehensive event tracking specifications using AI vision models. Perfect for product managers, UX designers, and analytics teams who need to quickly create detailed tracking plans from visual designs.

## 🌟 Features

### 🎨 **Interactive Drawing Canvas**
- Built-in TLDraw editor for sketching wireframes and user flows
- Support for uploading existing designs and mockups
- Real-time collaborative drawing experience
- Export drawings as high-quality screenshots

### 🤖 **Multi-Provider AI Analysis**
- **OpenAI GPT-4 Vision**: Advanced visual understanding and detailed analysis
- **Google Gemini 1.5 Flash**: Fast processing with excellent image recognition
- Automatic fallback between providers for reliability
- Custom prompt support for specific requirements

### 📊 **Comprehensive Event Generation**
- **Screen-by-Screen Analysis**: Identifies all interactive elements
- **Property Classification**: Categorizes data sources (on-screen, carried-forward, global)
- **Data Type Precision**: Proper typing for analytics tools (string, number, boolean, decimal)
- **Event Naming**: Context-aware, camelCase naming conventions
- **Confidence Scoring**: AI-generated confidence levels for each detected element

### 🔧 **Interactive Results Editor**
- Edit generated events and properties in real-time
- Add, remove, or modify event specifications
- Visual property source indicators
- Export to CSV for implementation teams

### 📥 **Multiple Export Formats**
- CSV spreadsheets for project management
- Implementation code snippets
- Detailed documentation with examples
- Downloadable tracking specifications

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- OpenAI API key (for GPT-4 Vision)
- Google AI Studio API key (for Gemini, optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/Denish004/event_generation_using_AI.git
cd event_generation_using_AI

# Install dependencies
npm install

# Start development server
npm run dev
```

### Configuration

1. **Open the AI Config tab** in the application
2. **Add your API keys**:
   - OpenAI API key for GPT-4 Vision analysis
   - Google AI Studio key for Gemini analysis (optional)
3. **Select your preferred AI provider**
4. **Test the connection** to ensure setup is working

## 🎯 How It Works

### 1. **Draw Your Journey**
```
User Interface Design → TLDraw Canvas → Wireframe Creation
```
- Sketch your app screens, user flows, or upload existing designs
- Draw connections between screens to show data flow
- Add annotations and labels for context

### 2. **AI Analysis Pipeline**
```
Screenshot Capture → AI Vision Processing → Event Detection → Property Classification
```
- Capture your drawings as high-resolution screenshots
- AI analyzes visual elements and identifies interactive components
- Generates comprehensive event specifications with properties

### 3. **Results & Export**
```
Generated Events → Interactive Editing → CSV Export → Implementation
```
- Review and edit AI-generated tracking specifications
- Export to CSV for development teams
- Download implementation code snippets

## 🏗 Architecture Overview

### Core Components

#### **AI Analysis Service** (`src/services/aiService.ts`)
```typescript
// Multi-provider AI integration
class AIAnalysisService {
  async analyzeScreenshots(screenshots: ScreenshotResult[]): Promise<JourneyAnalysisResult> {
    // Handles OpenAI GPT-4 Vision and Google Gemini APIs
    // Returns structured event tracking specifications
  }
}
```

#### **Drawing Editor** (`src/components/DrawingEditor.tsx`)
```typescript
// TLDraw integration for wireframe creation
function DrawingEditor() {
  // Interactive canvas for drawing user journeys
  // Screenshot capture functionality
  // Integration with AI analysis pipeline
}
```

#### **Results Dashboard** (`src/components/AIAnalysisPanel.tsx`)
```typescript
// Interactive results display and editing
function AIAnalysisPanel({ userFlow, onUpdateUserFlow }) {
  // Event management and property editing
  // CSV export functionality
  // Implementation code generation
}
```

### Data Flow

```typescript
// Input Processing
interface ScreenshotResult {
  dataUrl: string;
  width: number;
  height: number;
  timestamp: number;
}

// AI Analysis Output
interface JourneyAnalysisResult {
  events: AnalyticsEvent[];
  globalProperties: EventProperty[];
  carriedProperties: { [stepId: string]: EventProperty[] };
  recommendations: string[];
  confidence: number;
}

// Event Structure
interface AnalyticsEvent {
  name: string;
  properties: EventProperty[];
  triggers: string[];
  category: 'user_action' | 'screen_view' | 'system_event';
  confidence: number;
}
```

## 📋 Use Cases

### **Product Teams**
- Generate tracking specs from product requirement documents
- Analyze competitor app flows for inspiration
- Create comprehensive analytics plans from wireframes

### **UX/UI Designers**
- Convert design mockups into trackable events
- Validate user journey completeness
- Generate handoff documentation for developers

### **Analytics Teams**
- Create detailed tracking specifications
- Ensure comprehensive event coverage
- Generate implementation documentation

### **Development Teams**
- Convert visual designs to implementation requirements
- Validate event property completeness
- Generate code snippets for analytics integration

## 🔧 Configuration Options

### AI Provider Settings
```typescript
interface AIConfig {
  selectedProvider: 'openai' | 'gemini';
  selectedModel: string;
  apiKeys: {
    openai: string;
    gemini: string;
  };
  settings: {
    temperature: number;
    maxTokens: number;
    useCustomPrompt: boolean;
  };
}
```

### Supported Models
- **OpenAI**: `gpt-4o`, `gpt-4-vision-preview`
- **Google**: `gemini-1.5-flash`, `gemini-1.5-pro`

## 📊 Example Output

### Generated Event Specification
```json
{
  "name": "contestCardClicked",
  "description": "User clicks on a contest card to view details",
  "properties": [
    {
      "name": "contestId",
      "type": "string",
      "source": "on-screen",
      "required": true,
      "example": "contest_123"
    },
    {
      "name": "entryFee",
      "type": "number",
      "source": "on-screen",
      "required": true,
      "example": 50
    },
    {
      "name": "userId",
      "type": "string",
      "source": "global",
      "required": true,
      "example": "user_456"
    }
  ],
  "triggers": ["User clicks contest card"],
  "confidence": 0.92
}
```

### CSV Export Format
```csv
Number,Event Name,Event Trigger,Parameters
1,"contestCardClicked","When the user clicks contest card","1. contestId - varchar
2. entryFee - long
3. userId - varchar"
```

## 🛠 Development

### Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Drawing**: TLDraw for interactive canvas
- **AI Integration**: OpenAI API, Google Generative AI
- **Build Tool**: Vite for fast development
- **Styling**: Tailwind CSS with dark mode support

### Project Structure
```
src/
├── components/          # UI components
│   ├── DrawingEditor.tsx    # TLDraw canvas integration
│   ├── AIAnalysisPanel.tsx  # Results dashboard
│   └── AIConfigPanel.tsx    # Provider configuration
├── services/            # Business logic
│   ├── aiService.ts         # AI analysis engine
│   └── visionService.ts     # Image processing
├── context/             # State management
│   ├── AIConfigContext.tsx  # AI provider settings
│   └── AppContext.tsx       # Global application state
└── types/              # TypeScript definitions
```

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm run format   # Format code with Prettier
```

## 🔒 Privacy & Security

- **API Keys**: Stored locally in browser, never transmitted to our servers
- **Image Processing**: Screenshots processed client-side before AI analysis
- **Data Storage**: All data remains in your browser's local storage
- **AI Providers**: Direct communication with OpenAI/Google APIs

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit with conventional commits: `git commit -m 'feat: add amazing feature'`
5. Push to your branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [TLDraw](https://tldraw.dev/) for the excellent drawing canvas
- [OpenAI](https://openai.com/) for GPT-4 Vision capabilities
- [Google AI](https://ai.google.dev/) for Gemini vision models
- [Tailwind CSS](https://tailwindcss.com/) for the styling system

## 📞 Support

- 📧 Email: [support@your-domain.com](mailto:support@your-domain.com)
- 🐛 Issues: [GitHub Issues](https://github.com/Denish004/event_generation_using_AI/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/Denish004/event_generation_using_AI/discussions)

---

**Made with ❤️ for the analytics and product community**
