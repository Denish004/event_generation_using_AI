import React, { useState } from 'react';
import { Key, Brain, Save, TestTube, Zap } from 'lucide-react';
import { useAIConfig } from '../hooks/useAIConfig';

const AIConfigPanel: React.FC = () => {
  const { config, updateConfig, saveConfig, testConnection, testAllConnections } = useAIConfig();
  const [isTestingConnection, setIsTestingConnection] = useState<{[key: string]: boolean}>({});
  const [isTestingAll, setIsTestingAll] = useState(false);

  const handleApiKeyChange = (provider: string, value: string) => {
    updateConfig({
      apiKeys: {
        ...config.apiKeys,
        [provider]: value
      }
    });
  };

  const handleProviderChange = (provider: 'openai' | 'gemini') => {
    updateConfig({
      selectedProvider: provider,
      selectedModel: provider === 'openai' ? 'gpt-4o' : 'gemini-1.5-flash'
    });
  };

  const handleModelChange = (model: string) => {
    updateConfig({
      selectedModel: model
    });
  };

  const handleSettingChange = (setting: string, value: number | boolean) => {
    updateConfig({
      settings: {
        ...config.settings,
        [setting]: value
      }
    });
  };

  const testConnectionForProvider = async (provider: 'openai' | 'gemini') => {
    if (!config.apiKeys[provider]) {
      alert(`Please enter a valid ${provider} API key first`);
      return;
    }

    setIsTestingConnection(prev => ({ ...prev, [provider]: true }));
    
    try {
      const result = await testConnection(provider);
      
      if (result) {
        alert(`✅ ${provider} connection test successful!`);
      } else {
        alert(`❌ ${provider} connection test failed. Please check your API key.`);
      }
    } catch (error) {
      console.error(`${provider} test failed:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`❌ ${provider} connection test failed: ${errorMessage}`);
    } finally {
      setIsTestingConnection(prev => ({ ...prev, [provider]: false }));
    }
  };

  const handleSaveConfig = () => {
    saveConfig();
    alert('✅ AI Configuration saved successfully!');
  };

  const handleTestAllConnections = async () => {
    setIsTestingAll(true);
    
    try {
      const results = await testAllConnections();
      console.log('All connection test results:', results);
      
      const successCount = Object.values(results).filter(Boolean).length;
      const totalCount = Object.keys(results).length;
      
      if (successCount === totalCount) {
        alert(`✅ All ${totalCount} AI providers are working correctly!`);
      } else {
        alert(`⚠️ ${successCount}/${totalCount} AI providers are working. Check the console for details.`);
      }
    } catch (error) {
      console.error('Test all connections failed:', error);
      alert('❌ Failed to test all connections. Check the console for details.');
    } finally {
      setIsTestingAll(false);
    }
  };

  const modelOptions = [
    // OpenAI Models
    { value: 'gpt-4o', label: 'GPT-4o (OpenAI) - Recommended', provider: 'openai' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini (OpenAI) - Faster', provider: 'openai' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo (OpenAI)', provider: 'openai' },
    // Gemini Models
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Google) - Recommended', provider: 'gemini' },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Google) - Advanced', provider: 'gemini' },
    { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash (Google) - Experimental', provider: 'gemini' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">AI Configuration</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Configure one AI provider to analyze your user journey screenshots and generate event tracking specifications.
        </p>
      </div>

      {/* Provider Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Choose AI Provider</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { 
              id: 'openai', 
              name: 'OpenAI', 
              description: 'GPT-4o with excellent vision capabilities',
              recommended: true 
            },
            { 
              id: 'gemini', 
              name: 'Google Gemini', 
              description: 'Gemini 1.5 with multimodal understanding',
              recommended: false 
            }
          ].map(provider => (
            <div 
              key={provider.id}
              className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                config.selectedProvider === provider.id
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              }`}
              onClick={() => handleProviderChange(provider.id as 'openai' | 'gemini')}
            >
              {provider.recommended && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Recommended
                </div>
              )}
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  config.selectedProvider === provider.id
                    ? 'border-purple-500 bg-purple-500'
                    : 'border-gray-300'
                }`}>
                  {config.selectedProvider === provider.id && (
                    <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{provider.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{provider.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">API Keys</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { id: 'openai', name: 'OpenAI', placeholder: 'sk-...' },
            { id: 'gemini', name: 'Google Gemini', placeholder: 'AI...' }
          ].map(provider => (
            <div key={provider.id} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {provider.name}
              </label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Key className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="password"
                    value={config.apiKeys[provider.id as keyof typeof config.apiKeys]}
                    onChange={(e) => handleApiKeyChange(provider.id, e.target.value)}
                    placeholder={provider.placeholder}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <button
                  onClick={() => testConnectionForProvider(provider.id as 'openai' | 'gemini')}
                  disabled={isTestingConnection[provider.id]}
                  className="flex items-center space-x-1 px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  <TestTube className="h-3 w-3" />
                  <span>{isTestingConnection[provider.id] ? 'Testing...' : 'Test'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Model Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Model Selection</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Selected Model
            </label>
            <select
              value={config.selectedModel}
              onChange={(e) => handleModelChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <optgroup label="OpenAI Models">
                {modelOptions.filter(model => model.provider === 'openai').map(model => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Google Gemini Models">
                {modelOptions.filter(model => model.provider === 'gemini').map(model => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </optgroup>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              This model will be used for all analysis tasks including UI analysis and event generation
            </p>
            {config.selectedModel && (
              <div className="mt-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded text-xs">
                <span className="font-medium">Selected:</span> {modelOptions.find(m => m.value === config.selectedModel)?.label}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Analysis Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confidence Threshold
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={config.settings.confidenceThreshold}
              onChange={(e) => handleSettingChange('confidenceThreshold', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>0.1</span>
              <span>{config.settings.confidenceThreshold}</span>
              <span>1.0</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Minimum confidence for AI predictions
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Properties per Event
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={config.settings.maxProperties}
              onChange={(e) => handleSettingChange('maxProperties', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Maximum properties to generate per event
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="autoDetectEvents"
              checked={config.settings.autoDetectEvents}
              onChange={(e) => handleSettingChange('autoDetectEvents', e.target.checked)}
              className="rounded"
            />
            <label htmlFor="autoDetectEvents" className="text-sm text-gray-700 dark:text-gray-300">
              Auto-detect events from UI interactions
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="enablePropertyInference"
              checked={config.settings.enablePropertyInference}
              onChange={(e) => handleSettingChange('enablePropertyInference', e.target.checked)}
              className="rounded"
            />
            <label htmlFor="enablePropertyInference" className="text-sm text-gray-700 dark:text-gray-300">
              Enable automatic property type inference
            </label>
          </div>
        </div>
      </div>

      {/* AI Capabilities Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">What AI Will Do</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h4 className="font-semibold text-gray-900 dark:text-white">Screenshot Analysis</h4>
            </div>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>• Identify all UI elements and screens</li>
              <li>• Detect user interaction points</li>
              <li>• Extract text and visual information</li>
              <li>• Map element relationships</li>
            </ul>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h4 className="font-semibold text-gray-900 dark:text-white">Event Generation</h4>
            </div>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>• Generate tracking events for interactions</li>
              <li>• Define event properties and data types</li>
              <li>• Create implementation specifications</li>
              <li>• Provide usage recommendations</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={handleTestAllConnections}
          disabled={isTestingAll}
          className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <TestTube className="h-4 w-4" />
          <span>{isTestingAll ? 'Testing All...' : 'Test All Connections'}</span>
        </button>
        
        <button
          onClick={handleSaveConfig}
          className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Save className="h-4 w-4" />
          <span>Save Configuration</span>
        </button>
      </div>
    </div>
  );
};

export default AIConfigPanel;