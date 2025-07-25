import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { aiAnalysisService } from '../services/aiService';

export interface AIConfig {
  apiKeys: {
    openai: string;
    gemini: string;
  };
  selectedProvider: 'openai' | 'gemini';
  selectedModel: string;
  settings: {
    confidenceThreshold: number;
    maxProperties: number;
    autoDetectEvents: boolean;
    enablePropertyInference: boolean;
  };
}

export interface AIConfigContextType {
  config: AIConfig;
  updateConfig: (updates: Partial<AIConfig>) => void;
  saveConfig: () => void;
  testConnection: (provider: 'openai' | 'gemini') => Promise<boolean>;
  testAllConnections: () => Promise<{ [key: string]: boolean }>;
}

const defaultConfig: AIConfig = {
  apiKeys: {
    openai: '',
    gemini: ''
  },
  selectedProvider: 'openai',
  selectedModel: 'gpt-4o',
  settings: {
    confidenceThreshold: 0.8,
    maxProperties: 10,
    autoDetectEvents: true,
    enablePropertyInference: true
  }
};

export const AIConfigContext = createContext<AIConfigContextType | undefined>(undefined);

interface AIConfigProviderProps {
  children: ReactNode;
}

export const AIConfigProvider: React.FC<AIConfigProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<AIConfig>(defaultConfig);

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('ai-config');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(prev => ({ ...prev, ...parsedConfig }));
      } catch (error) {
        console.error('Failed to parse saved AI config:', error);
      }
    }
  }, []);

  const updateConfig = (updates: Partial<AIConfig>) => {
    setConfig(prev => ({
      ...prev,
      ...updates,
      apiKeys: { ...prev.apiKeys, ...updates.apiKeys },
      settings: { ...prev.settings, ...updates.settings }
    }));
  };

  const saveConfig = () => {
    localStorage.setItem('ai-config', JSON.stringify(config));
  };

  const testConnection = async (provider: 'openai' | 'gemini'): Promise<boolean> => {
    try {
      return await aiAnalysisService.testConnection(provider, config);
    } catch (error) {
      console.error(`Failed to test ${provider} connection:`, error);
      return false;
    }
  };

  const testAllConnections = async (): Promise<{ [key: string]: boolean }> => {
    const results: { [key: string]: boolean } = {};
    
    for (const provider of ['openai', 'gemini'] as const) {
      results[provider] = await testConnection(provider);
    }
    
    return results;
  };

  const contextValue: AIConfigContextType = {
    config,
    updateConfig,
    saveConfig,
    testConnection,
    testAllConnections
  };

  return (
    <AIConfigContext.Provider value={contextValue}>
      {children}
    </AIConfigContext.Provider>
  );
};