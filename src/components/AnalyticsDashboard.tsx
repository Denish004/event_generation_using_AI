import React, { useState } from 'react';
import { BarChart3, TrendingUp, Download, Filter, Search, Calendar } from 'lucide-react';
import { Screenshot, Event } from '../App';

interface AnalyticsDashboardProps {
  screenshots: Screenshot[];
  events: Event[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ screenshots, events }) => {
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('7d');

  // Analytics calculations
  const totalEvents = events.length;
  const totalProperties = events.reduce((sum, event) => sum + event.properties.length, 0);
  const onScreenProperties = events.reduce((sum, event) => 
    sum + event.properties.filter(p => p.source === 'on-screen').length, 0);
  const carriedForwardProperties = events.reduce((sum, event) => 
    sum + event.properties.filter(p => p.source === 'carried-forward').length, 0);
  const globalProperties = events.reduce((sum, event) => 
    sum + event.properties.filter(p => p.source === 'global').length, 0);

  const propertyTypeDistribution = events.reduce((acc, event) => {
    event.properties.forEach(prop => {
      acc[prop.type] = (acc[prop.type] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const eventTypeDistribution = events.reduce((acc, event) => {
    const category = event.name.includes('click') ? 'Interactions' :
                    event.name.includes('view') ? 'Views' :
                    event.name.includes('join') ? 'Conversions' : 'Other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedEventType === 'all' || event.name.includes(selectedEventType);
    return matchesSearch && matchesType;
  });

  const exportTrackingSpec = () => {
    const spec = {
      project: "User Journey Analytics",
      version: "1.0.0",
      generated: new Date().toISOString(),
      events: events.map(event => ({
        name: event.name,
        description: event.description,
        screen: event.screen,
        properties: event.properties.map(prop => ({
          name: prop.name,
          type: prop.type,
          source: prop.source,
          required: prop.required,
          description: prop.description,
          example: prop.example
        }))
      })),
      summary: {
        total_events: totalEvents,
        total_properties: totalProperties,
        screens_analyzed: screenshots.length
      }
    };

    const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tracking-specification.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
          <button
            onClick={exportTrackingSpec}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export Tracking Spec</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search events..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <select
            value={selectedEventType}
            onChange={(e) => setSelectedEventType(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Events</option>
            <option value="click">Click Events</option>
            <option value="view">View Events</option>
            <option value="join">Join Events</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalEvents}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Events</div>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{totalProperties}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Properties</div>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{screenshots.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Screens</div>
              </div>
              <Filter className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {Math.round((carriedForwardProperties / totalProperties) * 100) || 0}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Connected</div>
              </div>
              <Calendar className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property Source Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Property Sources</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">On-screen</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full" 
                    style={{ width: `${(onScreenProperties / totalProperties) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{onScreenProperties}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Carried Forward</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${(carriedForwardProperties / totalProperties) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{carriedForwardProperties}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Global</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gray-500 h-2 rounded-full" 
                    style={{ width: `${(globalProperties / totalProperties) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{globalProperties}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Property Type Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Property Types</h3>
          <div className="space-y-4">
            {Object.entries(propertyTypeDistribution).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{type}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(count / totalProperties) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Event Specification</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Complete tracking specification for all identified events
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Event Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Screen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Properties
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Example
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEvents.map(event => (
                <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {event.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {event.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {event.screen}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {event.properties.map((prop, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {prop.name}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            prop.type === 'string' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                            prop.type === 'number' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                            prop.type === 'boolean' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {prop.type}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            prop.source === 'on-screen' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                            prop.source === 'carried-forward' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {prop.source.replace('-', ' ')}
                          </span>
                          {prop.required && (
                            <span className="text-xs text-red-500">*</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                      {JSON.stringify(event.example, null, 2)}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;