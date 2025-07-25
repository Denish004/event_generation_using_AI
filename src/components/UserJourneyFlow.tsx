import React, { useState } from 'react';
import { ArrowRight, Eye, Brain } from 'lucide-react';
import { Screenshot, AnalyticsEvent as Event, EventProperty } from '../NewApp';
import { useEventAnalysis } from '../hooks/useEventAnalysis';
import { EventSpecChunk } from '../services/eventSpecFormatter';

interface UserJourneyFlowProps {
  screenshots: Screenshot[];
  events: Event[];
}

const UserJourneyFlow: React.FC<UserJourneyFlowProps> = ({ screenshots, events }) => {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const {
    isAnalyzing,
    analysisResult,
    error,
    analyzeScreenshots,
    downloadSpecs
  } = useEventAnalysis();

  const handleAnalyzeJourney = async () => {
    await analyzeScreenshots(screenshots);
    setShowAnalysis(true);
  };

  const getEventsForScreenshot = (screenshotId: string) => {
    return events.filter(event => 
      screenshots.find(s => s.id === screenshotId && s.id === event.screenId)
    );
  };



  return (
    <div className="space-y-6">
      {/* Header with Analysis Button */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Journey Flow</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleAnalyzeJourney}
              disabled={isAnalyzing}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isAnalyzing 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  <span>Analyze Journey</span>
                </>
              )}
            </button>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                showDetails 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Eye className="h-4 w-4" />
              <span>Show Details</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{screenshots.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Screens</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{events.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Events</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {events.reduce((sum, event) => sum + event.properties.length, 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Properties</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {events.filter(e => e.properties.some((p: EventProperty) => p.source === 'carried-forward')).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Connected Events</div>
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      {showAnalysis && analysisResult && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Event Analysis Results</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => downloadSpecs('markdown')}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Export MD
              </button>
              <button
                onClick={() => downloadSpecs('json')}
                className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
              >
                Export JSON
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 text-center mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {analysisResult.summary.totalScreens}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Screens Analyzed</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {analysisResult.summary.totalEvents}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Events Detected</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {analysisResult.summary.totalProperties}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Properties</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {Math.round(analysisResult.summary.confidence * 100)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Confidence</div>
            </div>
          </div>
          {/* Event Specifications */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">Event Specifications:</h4>
            {analysisResult.eventSpecs.map((spec: EventSpecChunk, index: number) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                  {spec.eventName}
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {spec.description}
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Properties: {spec.properties.length} | 
                  Sources: {spec.source.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Journey Flow Visualization */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Screen Flow</h3>
        
        <div className="relative">
          <div className="flex items-center space-x-4 overflow-x-auto pb-4">
            {screenshots.map((screenshot, index) => {
              const screenEvents = getEventsForScreenshot(screenshot.id);
              const hasCarriedProperties = screenEvents.some(event => 
                event.properties.some((prop: EventProperty) => prop.source === 'carried-forward')
              );
              
              return (
                <div key={screenshot.id} className="flex items-center">
                  {/* Screen Node */}
                  <div className="flex-shrink-0">
                    <div
                      className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedPath === screenshot.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPath(selectedPath === screenshot.id ? null : screenshot.id)}
                    >
                      <div className="w-24 h-16 bg-gray-100 dark:bg-gray-600 rounded mb-2 overflow-hidden">
                        <img
                          src={screenshot.url}
                          alt={screenshot.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="text-xs font-medium text-gray-900 dark:text-white text-center mb-1">
                        Screen {index + 1}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        {screenEvents.length} events
                      </div>
                      
                      {/* Event Indicators */}
                      <div className="absolute -top-2 -right-2 flex space-x-1">
                        {screenEvents.length > 0 && (
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-bold">{screenEvents.length}</span>
                          </div>
                        )}
                        {hasCarriedProperties && (
                          <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                            <ArrowRight className="h-2 w-2 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Arrow Connector */}
                  {index < screenshots.length - 1 && (
                    <div className="flex-shrink-0 mx-2">
                      <ArrowRight className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Property Flow Matrix */}
      {showDetails && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Property Flow Analysis</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left p-3 text-gray-600 dark:text-gray-400">Property</th>
                  <th className="text-left p-3 text-gray-600 dark:text-gray-400">Type</th>
                  <th className="text-left p-3 text-gray-600 dark:text-gray-400">Source</th>
                  {screenshots.map((screenshot, index) => (
                    <th key={screenshot.id} className="text-center p-3 text-gray-600 dark:text-gray-400">
                      Screen {index + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from(new Set(events.flatMap(e => e.properties.map((p: EventProperty) => p.name)))).map(propertyName => {
                  const propertyInstances = events.flatMap(e => 
                    e.properties.filter((p: EventProperty) => p.name === propertyName)
                  );
                  const firstInstance = propertyInstances[0];
                  
                  return (
                    <tr key={propertyName} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="p-3 font-medium text-gray-900 dark:text-white">
                        {propertyName}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          firstInstance.type === 'string' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                          firstInstance.type === 'number' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                          firstInstance.type === 'boolean' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {firstInstance.type}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          firstInstance.source === 'on-screen' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                          firstInstance.source === 'carried-forward' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {firstInstance.source.replace('-', ' ')}
                        </span>
                      </td>
                      {screenshots.map(screenshot => {
                        const screenEvents = getEventsForScreenshot(screenshot.id);
                        const hasProperty = screenEvents.some(event => 
                          event.properties.some((prop: EventProperty) => prop.name === propertyName)
                        );
                        
                        return (
                          <td key={screenshot.id} className="p-3 text-center">
                            {hasProperty ? (
                              <div className="w-4 h-4 bg-green-500 rounded-full mx-auto"></div>
                            ) : (
                              <div className="w-4 h-4 bg-gray-200 dark:bg-gray-600 rounded-full mx-auto"></div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Selected Screen Details */}
      {selectedPath && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {screenshots.find(s => s.id === selectedPath)?.name} - Event Details
          </h3>
          
          {getEventsForScreenshot(selectedPath).map(event => (
            <div key={event.id} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{event.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Event ID: {event.id}</p>
              
              <div className="space-y-2">
                <h5 className="font-medium text-gray-900 dark:text-white">Properties:</h5>
                {event.properties.map((property: EventProperty, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-gray-600 rounded">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-900 dark:text-white">{property.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">({property.type})</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        property.source === 'on-screen' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                        property.source === 'carried-forward' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {property.source.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {String(property.example)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserJourneyFlow;