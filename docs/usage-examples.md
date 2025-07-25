# Usage Examples & Best Practices

## Getting Started Workflow

### 1. Basic User Journey Analysis

**Scenario**: Analyzing a simple contest joining flow for Dream11

**Step 1: Create Drawing**

```
1. Open the application
2. Navigate to "Drawing" tab
3. Use drawing tools to create:
   - Homepage screen (rectangle + text "Browse Contests")
   - Contest details screen (rectangle + form elements)
   - Team creation screen (rectangle + player cards)
   - Payment screen (rectangle + payment form)
   - Success screen (rectangle + confirmation)
4. Connect screens with arrows showing user flow
```

**Step 2: Capture Drawing**

```
1. Click "Capture Journey" button
2. Review captured data showing:
   - Drawing records count
   - Journey steps (initially 0)
   - Analysis mode: AI-Powered
3. Proceed to AI analysis
```

**Step 3: AI Analysis**

```
1. Click "Analyze with AI" button
2. Wait for AI processing (typically 30-60 seconds)
3. Review generated results:
   - 4-5 user journey steps extracted
   - 8-12 analytics events identified
   - Event properties with types and sources
   - Implementation recommendations
```

**Expected Output**:

```json
{
  "events": [
    {
      "name": "contest_viewed",
      "properties": [
        { "name": "contest_id", "type": "string", "required": true },
        { "name": "contest_type", "type": "string", "required": true },
        { "name": "entry_fee", "type": "number", "required": true }
      ],
      "confidence": 0.92
    },
    {
      "name": "contest_joined",
      "properties": [
        { "name": "contest_id", "type": "string", "required": true },
        { "name": "team_id", "type": "string", "required": true },
        { "name": "payment_method", "type": "string", "required": false }
      ],
      "confidence": 0.88
    }
  ]
}
```

### 2. Complex Multi-Screen Flow

**Scenario**: Complete Dream11 user journey from registration to contest completion

**Drawing Structure**:

```
Registration → Profile Setup → Browse Contests → Contest Details
    ↓
Join Contest → Create Team → Select Captain → Make Payment
    ↓
View Matches → Track Performance → View Results → Withdraw Winnings
```

**Best Practices for Complex Flows**:

1. **Use Clear Labels**: Label each screen clearly
2. **Show Data Flow**: Use different arrow colors for data vs navigation
3. **Group Related Screens**: Use frames to group related functionality
4. **Add Annotations**: Include key user actions as text annotations

**Expected AI Output**:

- 8-10 main journey steps
- 25-30 analytics events
- Global properties (user_id, session_id, timestamp)
- Carried properties between screens
- Comprehensive recommendations

### 3. Mobile App Flow Analysis

**Scenario**: Analyzing mobile-specific interactions and gestures

**Drawing Considerations**:

```
- Use smaller rectangular containers for mobile screens
- Include swipe gestures (curved arrows)
- Show modal overlays and popups
- Indicate touch interactions (tap, long press)
- Show navigation patterns (tab bar, hamburger menu)
```

**Example Mobile Events Generated**:

```typescript
[
  {
    name: "screen_swipe",
    properties: [
      { name: "direction", type: "string", example: "left" },
      { name: "screen_name", type: "string", example: "contest_list" },
      { name: "swipe_distance", type: "number", example: 200 },
    ],
  },
  {
    name: "bottom_sheet_opened",
    properties: [
      { name: "content_type", type: "string", example: "player_details" },
      { name: "trigger_element", type: "string", example: "player_card" },
    ],
  },
];
```

## Advanced Usage Patterns

### 1. Error Flow Documentation

**Include Error Scenarios**:

```
- Network failure screens
- Payment failure flows
- Validation error messages
- Session timeout handling
- Offline mode behaviors
```

**AI Detection of Error Events**:

```json
{
  "name": "error_encountered",
  "properties": [
    { "name": "error_type", "type": "string", "required": true },
    { "name": "error_message", "type": "string", "required": false },
    { "name": "retry_count", "type": "number", "required": false },
    { "name": "previous_action", "type": "string", "required": true }
  ],
  "category": "system_event"
}
```

### 2. A/B Testing Scenarios

**Document Multiple Variants**:

```
- Create separate flows for different variants
- Use different colors to distinguish variants
- Include variant identifiers in annotations
- Show decision points and split logic
```

**Generated Variant Events**:

```typescript
{
  "name": "experiment_exposure",
  "properties": [
    {"name": "experiment_id", "type": "string", "required": true},
    {"name": "variant_id", "type": "string", "required": true},
    {"name": "user_segment", "type": "string", "required": false}
  ]
}
```

### 3. Cross-Platform Consistency

**Document Multiple Platforms**:

```
- Web application flow
- Mobile app flow
- Tablet/iPad specific flow
- Desktop app differences
```

**Platform-Specific Properties**:

```json
{
  "name": "contest_joined",
  "properties": [
    { "name": "platform", "type": "string", "example": "web|mobile|tablet" },
    { "name": "device_type", "type": "string", "example": "desktop|mobile" },
    { "name": "app_version", "type": "string", "example": "2.1.0" }
  ]
}
```

## Code Implementation Examples

### 1. Basic Event Tracking

**Generated Implementation Code**:

```typescript
// contest_viewed event tracking
analytics.track("contest_viewed", {
  contest_id: "contest_12345",
  contest_type: "cricket",
  entry_fee: 50,
  contest_size: 100,
  user_id: "user_67890",
  timestamp: Date.now(),
});

// contest_joined event tracking
analytics.track("contest_joined", {
  contest_id: "contest_12345",
  team_id: "team_abc123",
  payment_method: "credit_card",
  entry_fee: 50,
  user_id: "user_67890",
  timestamp: Date.now(),
});
```

### 2. React Component Integration

**Using Generated Events in React**:

```typescript
import { useAnalytics } from "./hooks/useAnalytics";

const ContestCard = ({ contest }) => {
  const { track } = useAnalytics();

  const handleContestView = () => {
    track("contest_viewed", {
      contest_id: contest.id,
      contest_type: contest.type,
      entry_fee: contest.entryFee,
      contest_size: contest.maxParticipants,
    });
  };

  const handleJoinClick = () => {
    track("contest_join_attempt", {
      contest_id: contest.id,
      contest_type: contest.type,
      entry_fee: contest.entryFee,
      user_balance: user.balance,
    });

    // Navigate to team creation
    navigate(`/contests/${contest.id}/create-team`);
  };

  return (
    <div onClick={handleContestView}>
      <h3>{contest.name}</h3>
      <button onClick={handleJoinClick}>Join Contest</button>
    </div>
  );
};
```

### 3. Event Property Validation

**Type-Safe Event Tracking**:

```typescript
// Generated TypeScript interfaces
interface ContestViewedEvent {
  contest_id: string;
  contest_type: "cricket" | "football" | "basketball";
  entry_fee: number;
  contest_size: number;
  user_id: string;
  timestamp: number;
}

interface ContestJoinedEvent {
  contest_id: string;
  team_id: string;
  payment_method: "credit_card" | "wallet" | "upi";
  entry_fee: number;
  user_id: string;
  timestamp: number;
}

// Type-safe tracking function
const trackContestViewed = (props: ContestViewedEvent) => {
  analytics.track("contest_viewed", props);
};
```

## Export and Integration

### 1. JSON Export Format

**Complete Analysis Export**:

```json
{
  "userFlow": {
    "name": "User Journey Analysis",
    "steps": 5,
    "events": 12
  },
  "analysis": {
    "events": [...],
    "globalProperties": [...],
    "recommendations": [...],
    "confidence": 0.87
  },
  "trackingSpec": [
    {
      "event_name": "contest_viewed",
      "description": "Triggered when user views contest details",
      "properties": {
        "contest_id": {
          "type": "string",
          "source": "on-screen",
          "required": true,
          "example": "contest_12345"
        }
      }
    }
  ],
  "implementation": [
    {
      "event": "contest_viewed",
      "code": "analytics.track('contest_viewed', {...});"
    }
  ],
  "generated": "2024-01-15T10:30:00Z"
}
```

### 2. Integration with Analytics Platforms

**Google Analytics 4**:

```typescript
// Custom event tracking
gtag("event", "contest_viewed", {
  contest_id: "contest_12345",
  contest_type: "cricket",
  entry_fee: 50,
  custom_parameter_1: "value1",
});
```

**Mixpanel Integration**:

```typescript
mixpanel.track("Contest Viewed", {
  "Contest ID": "contest_12345",
  "Contest Type": "cricket",
  "Entry Fee": 50,
  "User Segment": "premium",
});
```

**Custom Analytics Implementation**:

```typescript
const analytics = {
  track: (eventName: string, properties: Record<string, any>) => {
    // Send to your analytics backend
    fetch("/api/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: eventName,
        properties: {
          ...properties,
          timestamp: Date.now(),
          session_id: getSessionId(),
          user_id: getUserId(),
        },
      }),
    });
  },
};
```

## Best Practices

### 1. Drawing Best Practices

**Screen Design**:

- Use consistent sizing for similar screen types
- Include key UI elements (buttons, forms, lists)
- Show navigation elements (tabs, menu, back buttons)
- Add loading states and empty states

**Flow Documentation**:

- Use clear, descriptive labels
- Show both happy path and error scenarios
- Include conditional flows (if/else logic)
- Document user decision points

**Annotations**:

- Add context for complex interactions
- Explain business rules and validations
- Include external dependencies (APIs, payments)
- Note performance considerations

### 2. AI Analysis Optimization

**Improve AI Accuracy**:

- Use business-relevant terminology
- Include context about the Dream11 domain
- Be specific about user actions and triggers
- Show data relationships between screens

**Model Selection**:

- Use GPT-4 for complex analysis
- Try Claude for detailed explanations
- Use Gemini for cost optimization
- Configure multiple providers for redundancy

### 3. Event Design Principles

**Naming Conventions**:

- Use snake_case for event names
- Include action verbs (viewed, clicked, completed)
- Be specific about the object (contest_viewed vs page_viewed)
- Group related events with prefixes

**Property Design**:

- Include essential business context
- Use consistent data types
- Provide meaningful examples
- Document property relationships

**Quality Assurance**:

- Review AI-generated events for accuracy
- Validate property types and requirements
- Test implementation with real data
- Monitor event volume and patterns

### 4. Implementation Guidelines

**Code Organization**:

```typescript
// Centralized event definitions
export const EVENTS = {
  CONTEST_VIEWED: "contest_viewed",
  CONTEST_JOINED: "contest_joined",
  TEAM_CREATED: "team_created",
} as const;

// Centralized property definitions
export const PROPERTIES = {
  CONTEST_ID: "contest_id",
  USER_ID: "user_id",
  TIMESTAMP: "timestamp",
} as const;
```

**Error Handling**:

```typescript
const trackEvent = (eventName: string, properties: object) => {
  try {
    analytics.track(eventName, {
      ...properties,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Analytics tracking failed:", error);
    // Optional: Send to error tracking service
  }
};
```

**Testing Strategy**:

```typescript
// Mock analytics for testing
const mockAnalytics = {
  track: jest.fn(),
  identify: jest.fn(),
};

// Test event tracking
it("tracks contest view event", () => {
  renderContestCard();
  fireEvent.click(screen.getByText("Contest Details"));

  expect(mockAnalytics.track).toHaveBeenCalledWith("contest_viewed", {
    contest_id: "test_contest",
    contest_type: "cricket",
  });
});
```

## Troubleshooting Common Issues

### 1. Poor AI Analysis Results

**Symptoms**: Irrelevant events, incorrect properties, low confidence scores

**Solutions**:

- Simplify complex drawings
- Add more descriptive labels
- Include business context in annotations
- Try different AI providers
- Review and manually adjust results

### 2. Missing Business Context

**Symptoms**: Generic event names, missing key properties

**Solutions**:

- Add Dream11-specific terminology to drawings
- Include domain knowledge in screen labels
- Show data relationships explicitly
- Use business-relevant examples

### 3. Implementation Challenges

**Symptoms**: Type errors, missing properties, integration issues

**Solutions**:

- Use generated TypeScript interfaces
- Validate properties before tracking
- Test with real data scenarios
- Implement graceful error handling

This comprehensive usage guide provides practical examples and best practices for maximizing the value of the AI-Powered User Journey Analytics Tool in real-world scenarios.
