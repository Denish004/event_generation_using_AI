import React, { useState } from 'react';
import { 
  Brain, 
  Zap, 
  TrendingUp, 
  Download, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Code
} from 'lucide-react';
import { UserFlow } from '../NewApp';
import FeedbackPanel from './FeedbackPanel';

interface AIAnalysisPanelProps {
  userFlow: UserFlow;
  isAnalyzing: boolean;
}

const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({ userFlow, isAnalyzing }) => {
  const [activeView, setActiveView] = useState<'overview' | 'events' | 'journey' | 'code'>('overview');
  const [showFeedback, setShowFeedback] = useState(false);

  const aiAnalysis = userFlow.aiAnalysis;

  const generateTrackingCode = (eventName: string) => {
    const event = aiAnalysis?.events.find(e => e.name === eventName);
    if (!event) return '';

    const properties = event.properties.reduce((acc, prop) => {
      acc[prop.name] = prop.example;
      return acc;
    }, {} as Record<string, unknown>);

    return `// ${event.name} event tracking
analytics.track('${event.name}', ${JSON.stringify(properties, null, 2)});`;
  };

  const generateCSVContent = () => {
    if (!aiAnalysis) return '';

    // CSV Header
    const csvHeader = 'Number,Event Name,Event Trigger,Parameters\n';
    
    // CSV Rows
    const csvRows = aiAnalysis.events.map((event, index) => {
      const eventNumber = index + 1;
      const eventName = event.name;
      const eventTrigger = `When the user ${event.triggers.join(' or ')}`;
      
      // Format parameters as numbered list
      const parameters = event.properties.map((prop, propIndex) => {
        const propNumber = propIndex + 1;
        const propType = prop.type === 'string' ? 'varchar' : 
                        prop.type === 'number' ? 'long' : 
                        prop.type === 'boolean' ? 'boolean' : 'object';
        
        let paramDescription = `${propNumber}. ${prop.name} - ${propType}`;
        
        // Add example if available
        if (prop.example && prop.example !== '') {
          paramDescription += ` - Ex. ${prop.example}`;
        }
        
        return paramDescription;
      }).join('\n');
      
      // Escape CSV values properly
      const escapedEventName = `"${eventName}"`;
      const escapedEventTrigger = `"${eventTrigger}"`;
      const escapedParameters = `"${parameters.replace(/"/g, '""')}"`;
      
      return `${eventNumber},${escapedEventName},${escapedEventTrigger},${escapedParameters}`;
    }).join('\n');
    
    return csvHeader + csvRows;
  };

  const exportAnalysis = () => {
    if (!aiAnalysis) return;

    const csvContent = generateCSVContent();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tracking-specification.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isAnalyzing) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            AI is analyzing your user flow...
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This may take a few moments while we process your screenshots and connections.
          </p>
          <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Extracting UI elements and text</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-pulse w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span>Analyzing user interactions</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
              <span>Generating event specifications</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!aiAnalysis) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Ready for AI Analysis
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Create connections between UI elements to start the AI analysis process.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Analysis Results</h2>
          <button
            onClick={exportAnalysis}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Navigation */}
        <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'events', label: 'Events', icon: Zap },
            { id: 'journey', label: 'User Journey', icon: TrendingUp },
            { id: 'code', label: 'Implementation', icon: Code },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as 'overview' | 'events' | 'journey' | 'code')}
              className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
                activeView === tab.id
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Overview */}
      {activeView === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Events Identified</h3>
              <Zap className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {aiAnalysis.events.length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Unique tracking events discovered
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Properties</h3>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {aiAnalysis.events.reduce((sum, event) => sum + event.properties.length, 0)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total event properties
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Confidence</h3>
              <CheckCircle className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {Math.round(aiAnalysis.events.reduce((sum, event) => sum + event.confidence, 0) / aiAnalysis.events.length * 100)}%
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Average AI confidence
            </p>
          </div>

          {/* Recommendations */}
          <div className="md:col-span-3 bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">AI Recommendations</h3>
            <div className="space-y-3">
              {aiAnalysis.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {typeof recommendation === 'string' ? recommendation : JSON.stringify(recommendation)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Events */}
      {activeView === 'events' && (
        <div className="space-y-4">
          {aiAnalysis.events.map(event => (
            <div key={event.id} className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {event.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Triggers: {event.triggers.join(', ')} • Sources: {event.sources.join(', ')}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    event.confidence > 0.9 ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    event.confidence > 0.7 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {Math.round(event.confidence * 100)}% confidence
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {event.properties.map((property, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {property.name}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        property.type === 'string' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                        property.type === 'number' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        property.type === 'boolean' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {property.type}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Source:</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          property.source === 'on-screen' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                          property.source === 'carried-forward' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {property.source.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Required:</span>
                        <span className={property.required ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}>
                          {property.required ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Example:</span>
                        <code className="text-xs bg-gray-200 dark:bg-gray-600 px-1 rounded">
                          {JSON.stringify(property.example)}
                        </code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Journey */}
      {activeView === 'journey' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">User Journey Flow</h3>
          <div className="space-y-4">
            {userFlow.steps.map((step, index) => (
              <div key={step.id} className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">{step.name}</h4>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{step.elements.length} elements</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {step.description}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>
                      <span className="font-medium">Events:</span> {step.events.length}
                    </div>
                    <div>
                      <span className="font-medium">Connections:</span> {step.connections.length}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Implementation Code */}
      {activeView === 'code' && (
        <div className="space-y-4">
          {aiAnalysis.events.map(event => (
            <div key={event.id} className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {event.name}
                </h3>
                <button
                  onClick={() => navigator.clipboard.writeText(generateTrackingCode(event.name))}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  Copy Code
                </button>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{generateTrackingCode(event.name)}</code>
              </pre>
            </div>
          ))}
        </div>
      )}

      {/* 🚀 RAG Feedback Panel for Self-Improvement */}
      {aiAnalysis && (
        <FeedbackPanel
          analysisId={`analysis_${Date.now()}`}
          analysis={aiAnalysis}
          onFeedbackSubmitted={() => {
            console.log('Feedback submitted - AI will improve!');
          }}
        />
      )}
    </div>
  );
};

export default AIAnalysisPanel;