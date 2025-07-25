import { useState, useCallback } from 'react';
import { Screenshot } from '../App_old';
import { VisionEventAnalyzer, JourneyAnalysisResult } from '../services/visionService';

export function useEventAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<JourneyAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeScreenshots = useCallback(async (screenshots: Screenshot[]) => {
    if (screenshots.length === 0) {
      setError('No screenshots provided for analysis');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const analyzer = new VisionEventAnalyzer();
      const result = await analyzer.analyzeUserJourney(screenshots);
      setAnalysisResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const exportTrackingSpecs = useCallback(() => {
    if (!analysisResult) return null;
    const analyzer = new VisionEventAnalyzer();
    return analyzer.generateEventTrackingSpecs(analysisResult);
  }, [analysisResult]);

  const exportAsJSON = useCallback(() => {
    if (!analysisResult) return null;
    const analyzer = new VisionEventAnalyzer();
    return analyzer.exportAsJSON(analysisResult);
  }, [analysisResult]);

  const downloadSpecs = useCallback((format: 'markdown' | 'json') => {
    if (!analysisResult) return;
    let content: string;
    let filename: string;
    let mimeType: string;
    if (format === 'markdown') {
      const analyzer = new VisionEventAnalyzer();
      content = analyzer.generateEventTrackingSpecs(analysisResult);
      filename = 'event-tracking-specs.md';
      mimeType = 'text/markdown';
    } else {
      const analyzer = new VisionEventAnalyzer();
      content = analyzer.exportAsJSON(analysisResult);
      filename = 'event-tracking-specs.json';
      mimeType = 'application/json';
    }
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [analysisResult]);

  return {
    isAnalyzing,
    analysisResult,
    error,
    analyzeScreenshots,
    exportTrackingSpecs,
    exportAsJSON,
    downloadSpecs
  };
} 