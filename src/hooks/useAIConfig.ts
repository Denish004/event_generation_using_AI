import { useContext } from 'react';
import { AIConfigContext } from '../context/AIConfigContext';

export function useAIConfig() {
  const context = useContext(AIConfigContext);
  if (context === undefined) {
    throw new Error('useAIConfig must be used within an AIConfigProvider');
  }
  return context;
}
