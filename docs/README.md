# AI-Powered User Journey Analytics Tool

## Project Overview

A sophisticated web application that leverages AI to analyze user journey drawings and automatically generate comprehensive analytics event tracking specifications. Built specifically for Dream11 fantasy sports platform but adaptable to any application requiring user flow analysis.

## 🎯 Purpose

Transform hand-drawn user journey diagrams into production-ready analytics tracking specifications using advanced AI analysis. The tool bridges the gap between UX design and analytics implementation by automatically extracting:

- User journey steps and screens
- Interactive elements and actions
- Analytics events and properties
- Event tracking specifications
- Implementation code snippets

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌────────────────┐
│   Drawing UI    │ ── │  AI Analysis     │ ── │  Analytics     │
│   (tldraw)      │    │  Engine          │    │  Dashboard     │
└─────────────────┘    └──────────────────┘    └────────────────┘
         │                       │                       │
         │                       │                       │
    ┌─────────┐            ┌──────────┐           ┌──────────┐
    │ Context │            │ AI APIs  │           │ Export   │
    │ State   │            │ Service  │           │ System   │
    └─────────┘            └──────────┘           └──────────┘
```

## 🔧 Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Drawing Canvas**: tldraw (v3.14.2)
- **Styling**: Tailwind CSS
- **AI Integration**: OpenAI GPT-4, Google Gemini, Anthropic Claude
- **State Management**: React Context API
- **Build Tool**: Vite
- **Package Manager**: npm

## 📊 Core Features

### 1. Interactive Drawing Canvas

- Freehand drawing with tldraw
- Shape tools (rectangles, circles, arrows)
- Text annotations
- UI wireframe creation
- Multi-screen flow diagrams

### 2. AI Analysis Engine

- Multi-provider AI support (OpenAI, Gemini, Claude)
- Automatic journey step extraction
- Interactive element detection
- Event property inference
- Confidence scoring

### 3. Analytics Dashboard

- Event specification viewer
- Property details with types
- Implementation code generation
- Tracking recommendations
- Export capabilities

### 4. Configuration Management

- API key management
- Model selection
- Analysis parameters
- Local storage persistence

## 🚀 Quick Start

See [Installation Guide](./installation.md) for detailed setup instructions.

```bash
# Clone and install
npm install

# Configure AI API keys
# Add keys in AI Config panel

# Start development server
npm run dev
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── DrawingEditor.tsx       # Main drawing interface
│   ├── AIAnalysisPanel.tsx     # Analysis results viewer
│   ├── AIConfigPanel.tsx       # AI configuration
│   └── AnalyticsDashboard.tsx  # Event specifications
├── context/             # React context providers
│   ├── AppContext.tsx          # App state management
│   └── AIConfigContext.tsx     # AI configuration state
├── services/            # External services
│   └── aiService.ts            # AI API integration
├── hooks/              # Custom React hooks
└── types/              # TypeScript definitions
```

## 🔍 How It Works

1. **Draw**: Create user journey diagrams using the interactive canvas
2. **Capture**: Convert drawings to structured data format
3. **Analyze**: AI processes drawings to extract user flows
4. **Generate**: Automatic creation of analytics events and properties
5. **Export**: Production-ready tracking specifications

## 📋 Documentation Index

- [High-Level Design (HLD)](./high-level-design.md)
- [Low-Level Design (LLD)](./low-level-design.md)
- [API Documentation](./api-documentation.md)
- [AI Integration Guide](./ai-integration.md)
- [Sequence Diagrams](./sequence-diagrams.md)
- [Modules & Components](./modules-components.md)
- [Installation Guide](./installation.md)
- [Usage Examples](./usage-examples.md)
- [Contributing Guidelines](./contributing.md)

## 🔮 Future Enhancements

- Real-time collaboration
- Version control for journey diagrams
- A/B testing integration
- Advanced ML models for pattern recognition
- Custom event taxonomy support
- Integration with popular analytics platforms

## 📞 Support

For questions or issues, please refer to the documentation or create an issue in the project repository.
