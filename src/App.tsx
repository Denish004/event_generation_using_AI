import { useState, useCallback } from 'react';
import { Brain, Palette, Camera, Settings } from 'lucide-react';
import DrawingEditor from './components/DrawingEditor';
import AIAnalysisPanel from './components/AIAnalysisPanel';
import AIConfigPanel from './components/AIConfigPanel';
import { AppProvider } from './context/AppContext';
import { AIConfigProvider } from './context/AIConfigContext';
import { useAppContext } from './hooks/useAppContext';
import { useAIConfig } from './hooks/useAIConfig';
import { StoreSnapshot, TLRecord } from 'tldraw';
import { ScreenshotResult } from "./services/visionService"
import ScreenshotPreviewModal from './components/ScreenshotPreviewModal';
import { aiAnalysisService } from './services/aiService';

export interface Screenshot {
  id: string;
  name: string;
  url: string;
  timestamp: number;
}

export interface DrawingElement {
  id: string;
  type: 'shape' | 'text' | 'arrow' | 'frame';
  content: string;
  position: { x: number; y: number };
  properties: Record<string, unknown>;
}

export interface UserJourneyStep {
  id: string;
  name: string;
  description: string;
  elements: DrawingElement[];
  events: AnalyticsEvent[];
  connections: Connection[];
}

export interface Connection {
  id: string;
  fromElementId: string;
  toElementId: string;
  type: 'navigation' | 'action' | 'data-flow';
  label?: string;
  carriedProperties: string[];
}

export interface EventProperty {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object';
  source: 'on-screen' | 'carried-forward' | 'global';
  required: boolean;
  example: string | number | boolean;
  confidence: number;
  description?: string;
}

export interface AnalyticsEvent {
  id: string;
  name: string;
  elementId: string;
  screenId?: string;
  properties: EventProperty[];
  triggers: string[];
  sources: string[];
  confidence: number;
  category: 'user_action' | 'screen_view' | 'system_event';
}

export interface UserFlow {
  id: string;
  name: string;
  steps: UserJourneyStep[];
  drawingSnapshot: StoreSnapshot<TLRecord> | null;
  events: AnalyticsEvent[];
  aiAnalysis?: AIAnalysis;
}

export interface AIAnalysis {
  events: AnalyticsEvent[];
  globalProperties: EventProperty[];
  carriedProperties: { [stepId: string]: EventProperty[] };
  recommendations: string[];
  dataTypes: { [propertyName: string]: string };
  trackingSpec: TrackingSpec[];
  confidence: number;
}

export interface TrackingSpec {
  eventName: string;
  description: string;
  triggers: string[];
  properties: EventProperty[];
  examples: Record<string, string | number | boolean>;
  mandatory: string[];
  optional: string[];
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<'drawing' | 'ai-analysis' | 'ai-config'>('drawing');
  const [userFlow, setUserFlow] = useState<UserFlow | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { drawingData } = useAppContext();
  const { config: aiConfig } = useAIConfig();
  const [screenshotPreview, setScreenshotPreview] = useState<null | ScreenshotResult>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Handler to update user flow when events are edited
  const handleUpdateUserFlow = useCallback((updatedFlow: UserFlow) => {
    setUserFlow(updatedFlow);
  }, []);

  const captureJourneyScreenshot = useCallback(async () => {
    try {
      console.log('NewApp: Dispatching captureCanvas event...');
      
      // Dispatch a custom event to trigger the capture from within the DrawingEditor
      const captureEvent = new CustomEvent('captureCanvas', {
        detail: { 
          callback: (result: ScreenshotResult) => {
            console.log('NewApp: Received screenshot result:', result);
            setScreenshotPreview(result);
            setShowPreviewModal(true);
          }
        }
      });
      
      document.dispatchEvent(captureEvent);
      console.log('NewApp: Event dispatched successfully');
      
    } catch (error) {
      console.error('NewApp: Journey screenshot failed:', error);
      
      // Fallback to demo screenshot if capture fails
      const demoResult: ScreenshotResult = {
        dataUrl: '/journey-capture-1753392004304.png',
        blob: new Blob(), // Mock blob
        width: 1920,
        height: 1080,
        format: 'png',
        timestamp: Date.now()
      };
      
      setScreenshotPreview(demoResult);
      setShowPreviewModal(true);
    }
  }, []);

  // Add these missing handler functions:
  const handleAnalyzeScreenshot = async (customPrompt?: string) => {
    if (!screenshotPreview) return;
    
    setShowPreviewModal(false);
    setIsAnalyzing(true);
    setActiveTab('ai-analysis');
    
    try {
      // Create a new user flow from the screenshot
      const newFlow: UserFlow = {
        id: 'flow-' + Date.now(),
        name: 'Screenshot Journey Analysis',
        steps: [],
        drawingSnapshot: null,
        events: []
      };
      
      setUserFlow(newFlow);
      
      // Update the AI service with the current config
      aiAnalysisService.setAIConfig(aiConfig);
      
      // Analyze the screenshot with AI (pass custom prompt)
      const analysis = await aiAnalysisService.analyzeScreenshots([screenshotPreview], customPrompt);
      
      // Convert to AIAnalysis format
      const aiAnalysis: AIAnalysis = {
        events: analysis.events,
        globalProperties: analysis.globalProperties,
        carriedProperties: analysis.carriedProperties,
        recommendations: analysis.recommendations,
        dataTypes: analysis.dataTypes,
        trackingSpec: analysis.trackingSpec,
        confidence: analysis.confidence
      };
      
      setUserFlow(prev => prev ? { 
        ...prev, 
        aiAnalysis: aiAnalysis
      } : null);
      
    } catch (error) {
      console.error('AI Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadScreenshot = () => {
    if (screenshotPreview) {
      try {
        // Create a download link for the screenshot
        const url = URL.createObjectURL(screenshotPreview.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `journey-screenshot-${Date.now()}.png`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL
        setTimeout(() => URL.revokeObjectURL(url), 100);
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.textContent = 'Screenshot downloaded successfully!';
        successMsg.className = 'fixed top-16 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg';
        document.body.appendChild(successMsg);
        setTimeout(() => document.body.removeChild(successMsg), 3000);
      } catch (error) {
        console.error('Download failed:', error);
        
        // Show error message
        const errorMsg = document.createElement('div');
        errorMsg.textContent = 'Download failed. Please try again.';
        errorMsg.className = 'fixed top-16 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg';
        document.body.appendChild(errorMsg);
        setTimeout(() => document.body.removeChild(errorMsg), 3000);
      }
    }
  };

  const handleClosePreviewModal = () => {
    setShowPreviewModal(false);
    setScreenshotPreview(null);
  };

  const analyzeWithAI = async () => {
    if (!userFlow || !userFlow.drawingSnapshot) return;
    
    setIsAnalyzing(true);
    setActiveTab('ai-analysis');
    
    try {
      // This would call actual AI APIs (OpenAI, Gemini, Claude)
      const analysis = await analyzeUserJourney();
      
      setUserFlow(prev => prev ? { 
        ...prev, 
        aiAnalysis: analysis 
      } : null);
    } catch (error) {
      console.error('AI Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeUserJourney = async (): Promise<AIAnalysis> => {
    // Simulate AI analysis - replace with actual API calls
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return {
      events: generateMockEvents(),
      globalProperties: generateGlobalProperties(),
      carriedProperties: {},
      recommendations: generateRecommendations(),
      dataTypes: {
        'entryFee': 'number',
        'contestType': 'string',
        'userId': 'string',
        'roundId': 'string',
        'teamId': 'string'
      },
      trackingSpec: generateTrackingSpec(),
      confidence: 0.87
    };
  };

  const generateMockEvents = (): AnalyticsEvent[] => [
    {
      id: 'event_1',
      name: 'contestJoined',
      elementId: 'joinButton',
      properties: [
        {
          name: 'entryFee',
          type: 'number',
          source: 'on-screen',
          required: true,
          example: 50,
          confidence: 0.95,
          description: 'Amount paid to join the contest'
        },
        {
          name: 'contestType',
          type: 'string',
          source: 'on-screen',
          required: true,
          example: 'cricketMatch',
          confidence: 0.92,
          description: 'Type of contest being joined'
        },
        {
          name: 'roundId',
          type: 'string',
          source: 'carried-forward',
          required: true,
          example: 'round123',
          confidence: 0.88,
          description: 'ID of the round from previous screen'
        }
      ],
      triggers: ['Join Contest Button Click'],
      sources: ['Contest Selection Screen'],
      confidence: 0.91,
      category: 'user_action'
    },
    {
      id: 'event_2',
      name: 'teamCreated',
      elementId: 'createTeamButton',
      properties: [
        {
          name: 'teamName',
          type: 'string',
          source: 'on-screen',
          required: true,
          example: 'My Dream Team',
          confidence: 0.94,
          description: 'Name given to the created team'
        },
        {
          name: 'sportType',
          type: 'string',
          source: 'carried-forward',
          required: true,
          example: 'cricket',
          confidence: 0.89,
          description: 'Sport type carried from contest selection'
        },
        {
          name: 'referrerScreen',
          type: 'string',
          source: 'global',
          required: true,
          example: 'contestJoinFlow',
          confidence: 0.96,
          description: 'Screen that triggered team creation'
        }
      ],
      triggers: ['Create Team Button Click', 'Contest Join Flow'],
      sources: ['Team Creation Screen', 'Contest Selection Screen'],
      confidence: 0.89,
      category: 'user_action'
    }
  ];

  const generateGlobalProperties = (): EventProperty[] => [
    {
      name: 'userId',
      type: 'string',
      source: 'global',
      required: true,
      example: 'user12345',
      confidence: 1.0,
      description: 'Unique identifier for the user'
    },
    {
      name: 'sessionId',
      type: 'string',
      source: 'global',
      required: true,
      example: 'sessionAbc123',
      confidence: 1.0,
      description: 'Current user session identifier'
    },
    {
      name: 'platform',
      type: 'string',
      source: 'global',
      required: true,
      example: 'mobileApp',
      confidence: 1.0,
      description: 'Platform where the event occurred'
    },
    {
      name: 'timestamp',
      type: 'number',
      source: 'global',
      required: true,
      example: 1672531200000,
      confidence: 1.0,
      description: 'Unix timestamp when event occurred'
    }
  ];

  const generateRecommendations = (): string[] => [
    'Use consistent camelCase naming for all events (contestJoined, teamCreated)',
    'Include referrerScreen property for better user journey tracking',
    'Add timing properties (screenViewDuration, actionCompletionTime)',
    'Ensure monetary values like entryFee are stored as numbers for aggregation',
    'Add validation for required properties before sending events',
    'Consider adding errorCode property for failed actions',
    'Include contestId for better cross-event correlation',
    'Add userTier property for user segmentation analytics'
  ];

  const generateTrackingSpec = (): TrackingSpec[] => [
    {
      eventName: 'contestJoined',
      description: 'User successfully joins a contest',
      triggers: ['Join Contest Button Click'],
      properties: [
        {
          name: 'entryFee',
          type: 'number',
          source: 'on-screen',
          required: true,
          example: 50,
          confidence: 0.95
        },
        {
          name: 'contestType',
          type: 'string',
          source: 'on-screen',
          required: true,
          example: 'cricketMatch',
          confidence: 0.92
        }
      ],
      examples: {
        entryFee: 50,
        contestType: 'cricketMatch',
        roundId: 'round123'
      },
      mandatory: ['entryFee', 'contestType', 'roundId', 'userId'],
      optional: ['teamId', 'referrerScreen']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Cricbuzz 11 Analytics</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Draw & Analyze User Journeys with AI</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {activeTab === 'drawing' && (
              <button
                onClick={captureJourneyScreenshot}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Camera className="h-4 w-4" />
                <span>Capture & Analyze</span>
              </button>
            )}
            
            <button
              onClick={analyzeWithAI}
              disabled={isAnalyzing || !userFlow}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Brain className="h-4 w-4" />
              <span>{isAnalyzing ? 'Analyzing...' : 'AI Analysis'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
        <div className="flex space-x-8">            {[
              { id: 'drawing', label: 'Draw Journey', icon: Palette },
              { id: 'ai-analysis', label: 'AI Analysis', icon: Brain },
              { id: 'ai-config', label: 'AI Config', icon: Settings },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'drawing' | 'ai-analysis' | 'ai-config')}
                className={`flex items-center space-x-2 px-3 py-4 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 h-[calc(100vh-140px)] overflow-hidden">
        {activeTab === 'drawing' && (
          <div className="h-full w-full">
            <DrawingEditor />
          </div>
        )}

        {activeTab === 'ai-analysis' && userFlow && (
          <div className="h-full overflow-auto">
            <AIAnalysisPanel 
              userFlow={userFlow}
              isAnalyzing={isAnalyzing}
              onUpdateUserFlow={handleUpdateUserFlow}
            />
          </div>
        )}

        {activeTab === 'ai-config' && (
          <div className="h-full overflow-auto">
            <AIConfigPanel />
          </div>
        )}

        {showPreviewModal && screenshotPreview && (
          <ScreenshotPreviewModal
            screenshot={screenshotPreview}
            onAnalyze={handleAnalyzeScreenshot}
            onDownload={handleDownloadScreenshot}
            onClose={handleClosePreviewModal}
          />
        )}

        {/* Welcome screen when no content */}
        {!drawingData && activeTab === 'drawing' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Brain className="h-16 w-16 text-purple-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Start Drawing Your User Journey
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                Use the drawing tools to create wireframes, flows, and user journey diagrams. 
                Then analyze them directly with AI to generate event tracking specifications.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Status Bar */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            {userFlow && (
              <>
                <span>Journey ready</span>
                <span>•</span>
                <span>{userFlow.events.length} events</span>
                {userFlow.aiAnalysis && (
                  <>
                    <span>•</span>
                    <span>Confidence: {Math.round(userFlow.aiAnalysis.confidence * 100)}%</span>
                  </>
                )}
              </>
            )}
          </div>
          <div>
            AI-Powered Journey Analytics
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AIConfigProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AIConfigProvider>
  );
}

export default App;
