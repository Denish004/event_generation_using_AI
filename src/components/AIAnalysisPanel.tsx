import React, { useState } from 'react';
import { 
  Brain, 
  Zap, 
  TrendingUp, 
  Download, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Code,
  Edit3,
  Trash2,
  Plus,
  Save,
  X
} from 'lucide-react';
import { UserFlow, AnalyticsEvent, EventProperty } from '../App';

interface AIAnalysisPanelProps {
  userFlow: UserFlow;
  isAnalyzing: boolean;
  onUpdateUserFlow?: (updatedFlow: UserFlow) => void;
}

const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({ userFlow, isAnalyzing, onUpdateUserFlow }) => {
  const [activeView, setActiveView] = useState<'overview' | 'events' | 'journey' | 'code'>('overview');
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [editingProperty, setEditingProperty] = useState<{eventId: string, propertyIndex: number} | null>(null);
  const [tempEventName, setTempEventName] = useState('');
  const [tempProperty, setTempProperty] = useState<EventProperty | null>(null);

  const aiAnalysis = userFlow.aiAnalysis;

  // Helper functions for updating analysis
  const updateAnalysis = (updatedEvents: AnalyticsEvent[]) => {
    if (!aiAnalysis || !onUpdateUserFlow) return;
    
    const updatedAnalysis = {
      ...aiAnalysis,
      events: updatedEvents
    };
    
    const updatedFlow = {
      ...userFlow,
      aiAnalysis: updatedAnalysis
    };
    
    onUpdateUserFlow(updatedFlow);
  };

  // Event management functions
  const startEditingEvent = (eventId: string, currentName: string) => {
    setEditingEvent(eventId);
    setTempEventName(currentName);
  };

  const saveEventName = (eventId: string) => {
    if (!aiAnalysis || !tempEventName.trim()) return;
    
    const updatedEvents = aiAnalysis.events.map(event =>
      event.id === eventId ? { ...event, name: tempEventName.trim() } : event
    );
    
    updateAnalysis(updatedEvents);
    setEditingEvent(null);
    setTempEventName('');
  };

  const deleteEvent = (eventId: string) => {
    if (!aiAnalysis) return;
    
    const updatedEvents = aiAnalysis.events.filter(event => event.id !== eventId);
    updateAnalysis(updatedEvents);
  };

  const addNewEvent = () => {
    if (!aiAnalysis) return;
    
    const newEvent: AnalyticsEvent = {
      id: `event_${Date.now()}`,
      name: 'New Event',
      elementId: 'new_element',
      screenId: 'new_screen',
      properties: [],
      triggers: ['User Action'],
      sources: ['Screen'],
      confidence: 0.8,
      category: 'user_action'
    };
    
    const updatedEvents = [...aiAnalysis.events, newEvent];
    updateAnalysis(updatedEvents);
  };

  // Property management functions
  const startEditingProperty = (eventId: string, propertyIndex: number) => {
    const event = aiAnalysis?.events.find(e => e.id === eventId);
    if (!event) return;
    
    setEditingProperty({ eventId, propertyIndex });
    setTempProperty({ ...event.properties[propertyIndex] });
  };

  const saveProperty = () => {
    if (!aiAnalysis || !editingProperty || !tempProperty) return;
    
    const updatedEvents = aiAnalysis.events.map(event => {
      if (event.id === editingProperty.eventId) {
        const updatedProperties = [...event.properties];
        updatedProperties[editingProperty.propertyIndex] = tempProperty;
        return { ...event, properties: updatedProperties };
      }
      return event;
    });
    
    updateAnalysis(updatedEvents);
    setEditingProperty(null);
    setTempProperty(null);
  };

  const deleteProperty = (eventId: string, propertyIndex: number) => {
    if (!aiAnalysis) return;
    
    const updatedEvents = aiAnalysis.events.map(event => {
      if (event.id === eventId) {
        const updatedProperties = event.properties.filter((_, index) => index !== propertyIndex);
        return { ...event, properties: updatedProperties };
      }
      return event;
    });
    
    updateAnalysis(updatedEvents);
  };

  const addProperty = (eventId: string) => {
    if (!aiAnalysis) return;
    
    const newProperty: EventProperty = {
      name: 'new_property',
      type: 'string',
      source: 'on-screen',
      required: false,
      example: 'example_value',
      confidence: 0.8,
      description: 'New property description'
    };
    
    const updatedEvents = aiAnalysis.events.map(event => {
      if (event.id === eventId) {
        return { ...event, properties: [...event.properties, newProperty] };
      }
      return event;
    });
    
    updateAnalysis(updatedEvents);
  };

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
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
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
          <div className="flex items-center space-x-3">
            <button
              onClick={() => alert('Submit functionality coming soon!')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Submit</span>
            </button>
            <button
              onClick={exportAnalysis}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>
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
          {/* Add New Event Button */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-dashed border-gray-300 dark:border-gray-600">
            <button
              onClick={addNewEvent}
              className="w-full flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Add New Event</span>
            </button>
          </div>

          {aiAnalysis.events.map(event => (
            <div key={event.id} className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  {editingEvent === event.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={tempEventName}
                        onChange={(e) => setTempEventName(e.target.value)}
                        className="text-lg font-semibold bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                        autoFocus
                      />
                      <button
                        onClick={() => saveEventName(event.id)}
                        className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingEvent(null)}
                        className="p-1 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {event.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Triggers: {event.triggers.join(', ')} • Sources: {event.sources.join(', ')}
                      </p>
                    </>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    event.confidence > 0.9 ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    event.confidence > 0.7 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {Math.round(event.confidence * 100)}% confidence
                  </div>
                  {editingEvent !== event.id && (
                    <>
                      <button
                        onClick={() => startEditingEvent(event.id, event.name)}
                        className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Properties Section */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">Properties</h4>
                  <button
                    onClick={() => addProperty(event.id)}
                    className="flex items-center space-x-1 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/20 px-2 py-1 rounded"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Property</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {event.properties.map((property, index) => (
                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg relative group">
                      {editingProperty?.eventId === event.id && editingProperty?.propertyIndex === index ? (
                        // Editing mode for property
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Name</label>
                            <input
                              type="text"
                              value={tempProperty?.name || ''}
                              onChange={(e) => setTempProperty(prev => prev ? {...prev, name: e.target.value} : null)}
                              className="w-full text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded px-2 py-1 focus:outline-none focus:border-purple-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Type</label>
                            <select
                              value={tempProperty?.type || 'string'}
                              onChange={(e) => setTempProperty(prev => prev ? {...prev, type: e.target.value as 'string' | 'number' | 'boolean' | 'object'} : null)}
                              className="w-full text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded px-2 py-1 focus:outline-none focus:border-purple-500"
                            >
                              <option value="string">String</option>
                              <option value="number">Number</option>
                              <option value="boolean">Boolean</option>
                              <option value="object">Object</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Source</label>
                            <select
                              value={tempProperty?.source || 'on-screen'}
                              onChange={(e) => setTempProperty(prev => prev ? {...prev, source: e.target.value as 'on-screen' | 'carried-forward' | 'global'} : null)}
                              className="w-full text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded px-2 py-1 focus:outline-none focus:border-purple-500"
                            >
                              <option value="on-screen">On Screen</option>
                              <option value="carried-forward">Carried Forward</option>
                              <option value="global">Global</option>
                            </select>
                          </div>

                          <div>
                            <label className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                              <input
                                type="checkbox"
                                checked={tempProperty?.required || false}
                                onChange={(e) => setTempProperty(prev => prev ? {...prev, required: e.target.checked} : null)}
                                className="rounded"
                              />
                              <span>Required</span>
                            </label>
                          </div>

                          <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Example</label>
                            <input
                              type="text"
                              value={String(tempProperty?.example || '')}
                              onChange={(e) => {
                                const value = tempProperty?.type === 'number' ? 
                                  (isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value)) :
                                  tempProperty?.type === 'boolean' ? 
                                  e.target.value.toLowerCase() === 'true' : 
                                  e.target.value;
                                setTempProperty(prev => prev ? {...prev, example: value} : null);
                              }}
                              className="w-full text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded px-2 py-1 focus:outline-none focus:border-purple-500"
                            />
                          </div>

                          <div className="flex justify-end space-x-2 pt-2">
                            <button
                              onClick={saveProperty}
                              className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditingProperty(null)}
                              className="p-1 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Display mode for property
                        <>
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
                          
                          {/* Property action buttons */}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                            <button
                              onClick={() => startEditingProperty(event.id, index)}
                              className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded"
                            >
                              <Edit3 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => deleteProperty(event.id, index)}
                              className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
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
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{userFlow.name}</h4>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{userFlow.events.length} events</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Analysis of user interactions and event tracking
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <span className="font-medium">Events:</span> {userFlow.events.length}
                  </div>
                  <div>
                    <span className="font-medium">AI Confidence:</span> {userFlow.aiAnalysis ? Math.round(userFlow.aiAnalysis.confidence * 100) + '%' : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
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
    </div>
  );
};

export default AIAnalysisPanel;