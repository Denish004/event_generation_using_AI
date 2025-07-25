# Contributing Guidelines

## Project Overview

Thank you for your interest in contributing to the AI-Powered User Journey Analytics Tool! This project aims to revolutionize how teams analyze and implement user journey tracking through AI-powered analysis of drawings and wireframes.

## How to Contribute

### 1. Types of Contributions

We welcome several types of contributions:

**🐛 Bug Reports**

- UI/UX issues
- AI analysis inaccuracies
- Performance problems
- Integration failures

**✨ Feature Requests**

- New AI providers
- Enhanced analysis capabilities
- Additional export formats
- Improved user experience

**📝 Documentation**

- Usage examples
- API documentation
- Tutorial content
- Best practices

**🔧 Code Contributions**

- Bug fixes
- Feature implementations
- Performance optimizations
- Test coverage improvements

**🎨 Design Contributions**

- UI/UX improvements
- Icon and illustration design
- Accessibility enhancements
- Mobile responsiveness

### 2. Development Setup

**Prerequisites**:

```bash
Node.js 18+
npm 8+
Git
Modern browser for testing
```

**Setup Process**:

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/your-username/ai-journey-analytics.git
cd ai-journey-analytics

# Install dependencies
npm install

# Create development branch
git checkout -b feature/your-feature-name

# Start development server
npm run dev
```

**Environment Configuration**:

```bash
# Create .env.local for development
VITE_OPENAI_API_KEY=your_key_here  # Optional
VITE_GEMINI_API_KEY=your_key_here  # Optional
VITE_CLAUDE_API_KEY=your_key_here  # Optional
```

### 3. Code Standards

**TypeScript Guidelines**:

```typescript
// Use strict typing
interface UserFlow {
  id: string;
  name: string;
  steps: UserJourneyStep[];
}

// Prefer interfaces over types for objects
interface ComponentProps {
  data: UserFlow;
  onUpdate: (flow: UserFlow) => void;
}

// Use enums for constants
enum EventCategory {
  USER_ACTION = "user_action",
  SCREEN_VIEW = "screen_view",
  SYSTEM_EVENT = "system_event",
}
```

**React Best Practices**:

```typescript
// Use functional components with hooks
const MyComponent: React.FC<Props> = ({ data, onUpdate }) => {
  const [loading, setLoading] = useState(false);

  // Memoize expensive calculations
  const processedData = useMemo(() => {
    return data.map((item) => processItem(item));
  }, [data]);

  // Memoize callbacks
  const handleClick = useCallback(() => {
    onUpdate(processedData);
  }, [processedData, onUpdate]);

  return <div onClick={handleClick}>{/* content */}</div>;
};
```

**Styling Guidelines**:

```typescript
// Use Tailwind CSS classes
<div className="flex items-center space-x-4 p-6 bg-white dark:bg-gray-800 rounded-lg">

// Group related classes
<button className={`
  px-4 py-2 rounded-lg transition-colors
  bg-blue-600 hover:bg-blue-700
  text-white font-medium
  disabled:opacity-50 disabled:cursor-not-allowed
`}>

// Use conditional classes for state
<div className={`
  p-4 rounded-lg border
  ${isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
  ${isError ? 'border-red-500 bg-red-50' : ''}
`}>
```

### 4. AI Integration Guidelines

**Adding New AI Providers**:

```typescript
// 1. Update AIConfig interface
interface AIConfig {
  apiKeys: {
    openai: string;
    gemini: string;
    claude: string;
    newProvider: string;  // Add new provider
  };
}

// 2. Implement provider integration
class AIService {
  private newProvider: NewProviderSDK | null = null;

  constructor(config: AIConfig) {
    if (config.apiKeys.newProvider) {
      this.newProvider = new NewProviderSDK({
        apiKey: config.apiKeys.newProvider
      });
    }
  }

  private async analyzeWithNewProvider(data: any): Promise<Analysis> {
    // Implementation for new provider
  }
}

// 3. Add to fallback chain
private async extractUserJourneySteps(): Promise<UserJourneyStep[]> {
  try {
    if (this.openai) return await this.analyzeWithOpenAI();
    if (this.gemini) return await this.analyzeWithGemini();
    if (this.claude) return await this.analyzeWithClaude();
    if (this.newProvider) return await this.analyzeWithNewProvider();
    throw new Error('No AI service available');
  } catch (error) {
    return this.fallbackStepExtraction();
  }
}
```

**Improving AI Prompts**:

```typescript
// Use clear, specific prompts
const prompt = `
Analyze this Dream11 fantasy sports user journey drawing.
Extract user journey steps focusing on:
1. Contest selection and joining
2. Team creation and player selection  
3. Payment and confirmation flows
4. Match tracking and results

Return JSON with this exact structure:
{
  "steps": [
    {
      "id": "step_1",
      "name": "Contest Selection",
      "description": "User browses and selects a contest",
      "elements": [...]
    }
  ]
}

Drawing data: ${JSON.stringify(data)}
`;
```

### 5. Testing Requirements

**Unit Tests**:

```typescript
// Component testing with React Testing Library
import { render, fireEvent, screen } from "@testing-library/react";
import { AIAnalysisPanel } from "./AIAnalysisPanel";

describe("AIAnalysisPanel", () => {
  const mockUserFlow = {
    id: "test-flow",
    name: "Test Flow",
    steps: [],
    events: [],
    drawingSnapshot: null,
  };

  it("displays loading state during analysis", () => {
    render(<AIAnalysisPanel userFlow={mockUserFlow} isAnalyzing={true} />);
    expect(screen.getByText(/analyzing/i)).toBeInTheDocument();
  });

  it("shows analysis results when complete", () => {
    const flowWithAnalysis = {
      ...mockUserFlow,
      aiAnalysis: { events: [], confidence: 0.85 },
    };
    render(<AIAnalysisPanel userFlow={flowWithAnalysis} isAnalyzing={false} />);
    expect(screen.getByText(/confidence: 85%/i)).toBeInTheDocument();
  });
});
```

**Service Testing**:

```typescript
// AI service testing with mocks
import { AIService } from "./aiService";

describe("AIService", () => {
  let aiService: AIService;

  beforeEach(() => {
    aiService = new AIService({
      apiKeys: { openai: "test-key" },
      models: { uiAnalysis: "gpt-4" },
    });
  });

  it("analyzes user journey successfully", async () => {
    const mockSnapshot = { store: { record1: { type: "shape" } } };
    const result = await aiService.analyzeUserJourney(mockSnapshot);

    expect(result.events).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0);
  });
});
```

**Integration Tests**:

```typescript
// End-to-end testing with Playwright or Cypress
describe("Complete User Journey", () => {
  it("allows user to draw, capture, and analyze journey", () => {
    cy.visit("/");

    // Draw on canvas
    cy.get('[data-testid="drawing-canvas"]').click(100, 100);
    cy.get('[data-testid="shape-tool"]').click();

    // Capture journey
    cy.get('[data-testid="capture-button"]').click();
    cy.get('[data-testid="capture-tab"]').should("be.visible");

    // Analyze with AI
    cy.get('[data-testid="analyze-button"]').click();
    cy.get('[data-testid="analysis-results"]').should("be.visible");
  });
});
```

### 6. Documentation Standards

**Code Documentation**:

```typescript
/**
 * Analyzes user journey drawings using AI to extract analytics events
 * @param drawingSnapshot - tldraw snapshot containing drawing data
 * @returns Promise resolving to complete AI analysis
 * @throws Error if all AI providers fail
 */
async analyzeUserJourney(
  drawingSnapshot: StoreSnapshot<TLRecord>
): Promise<AIAnalysis> {
  // Implementation
}

/**
 * Event property representing trackable data
 * @interface EventProperty
 * @property name - Property identifier (snake_case)
 * @property type - Data type (string, number, boolean, object)
 * @property source - Where property originates from
 * @property required - Whether property is mandatory
 * @property example - Sample value for documentation
 * @property confidence - AI confidence score (0-1)
 */
interface EventProperty {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object';
  source: 'on-screen' | 'carried-forward' | 'global';
  required: boolean;
  example: string | number | boolean;
  confidence: number;
  description?: string;
}
```

**README Updates**:

- Update feature lists for new capabilities
- Add usage examples for new functionality
- Document breaking changes clearly
- Include migration guides when needed

### 7. Pull Request Process

**Before Submitting**:

```bash
# Run all checks
npm run lint        # ESLint checks
npm run type-check  # TypeScript validation
npm run test        # Unit tests
npm run build       # Production build test
```

**PR Requirements**:

1. **Clear Description**: Explain what changes and why
2. **Test Coverage**: Include tests for new functionality
3. **Documentation**: Update relevant docs
4. **Screenshots**: For UI changes, include before/after
5. **Breaking Changes**: Clearly document any breaking changes

**PR Template**:

```markdown
## Description

Brief description of changes and motivation.

## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Screenshots (if applicable)

Before: [screenshot]
After: [screenshot]

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
```

### 8. Issue Reporting

**Bug Report Template**:

```markdown
## Bug Description

Clear and concise description of what the bug is.

## Steps to Reproduce

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior

What you expected to happen.

## Actual Behavior

What actually happened.

## Environment

- Browser: [e.g. Chrome 91]
- OS: [e.g. Windows 10]
- App Version: [e.g. 1.0.0]
- AI Provider: [e.g. OpenAI GPT-4]

## Additional Context

Add any other context about the problem here.
```

**Feature Request Template**:

```markdown
## Feature Description

Clear and concise description of the feature you'd like to see.

## Problem Statement

What problem would this feature solve?

## Proposed Solution

Describe the solution you'd like.

## Alternatives Considered

Describe any alternative solutions or features you've considered.

## Additional Context

Add any other context or screenshots about the feature request here.
```

### 9. Code Review Guidelines

**For Reviewers**:

- Focus on logic, security, and maintainability
- Check for proper error handling
- Verify test coverage
- Ensure documentation is updated
- Test the changes locally when possible

**Review Checklist**:

- [ ] Code is readable and well-documented
- [ ] No security vulnerabilities introduced
- [ ] Performance impact considered
- [ ] Error handling implemented
- [ ] Tests cover new functionality
- [ ] Breaking changes documented

### 10. Release Process

**Version Management**:

```bash
# Update version in package.json
npm version patch  # For bug fixes
npm version minor  # For new features
npm version major  # For breaking changes
```

**Release Notes**:

- List all new features
- Document bug fixes
- Highlight breaking changes
- Include migration instructions
- Thank contributors

### 11. Community Guidelines

**Communication**:

- Be respectful and inclusive
- Use clear, professional language
- Provide constructive feedback
- Help newcomers learn

**Getting Help**:

- Check existing issues and documentation first
- Provide detailed information when asking questions
- Share solutions that work for you
- Contribute back to help others

## Recognition

Contributors will be recognized in:

- Project README
- Release notes
- Contributor hall of fame
- Social media acknowledgments

Thank you for helping make this project better! Every contribution, no matter how small, is valuable and appreciated.
