import React, { useState } from 'react';
import { AnalyticsEvent, AIAnalysis } from '../NewApp';
import { aiAnalysisService } from '../services/aiService';
import { CheckCircle, X, ThumbsUp, ThumbsDown, MessageSquare, Brain, TrendingUp } from 'lucide-react';

interface FeedbackPanelProps {
  analysisId: string;
  analysis: AIAnalysis;
  onFeedbackSubmitted: () => void;
}

interface EventFeedback {
  eventId: string;
  correctedName?: string;
  correctedCategory?: string;
  correctedProperties?: string[];
  rating: 'good' | 'needs_improvement' | 'poor';
  comments?: string;
}

const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ 
  analysisId, 
  analysis, 
  onFeedbackSubmitted 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [eventFeedback, setEventFeedback] = useState<{ [eventId: string]: EventFeedback }>({});
  const [overallRating, setOverallRating] = useState<number>(3);
  const [generalComments, setGeneralComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleEventRating = (eventId: string, rating: 'good' | 'needs_improvement' | 'poor') => {
    setEventFeedback(prev => ({
      ...prev,
      [eventId]: {
        ...prev[eventId],
        eventId,
        rating
      }
    }));
  };

  const handleEventCorrection = (eventId: string, field: string, value: string) => {
    setEventFeedback(prev => ({
      ...prev,
      [eventId]: {
        ...prev[eventId],
        eventId,
        [field]: value
      }
    }));
  };

  const handleSubmitFeedback = async () => {
    setIsSubmitting(true);
    
    try {
      // Convert feedback to corrected events
      const correctedEvents: AnalyticsEvent[] = analysis.events.map((event: AnalyticsEvent) => {
        const feedback = eventFeedback[event.id];
        if (!feedback) return event;
        
        return {
          ...event,
          name: feedback.correctedName || event.name,
          category: (feedback.correctedCategory as 'user_action' | 'screen_view' | 'system_event') || event.category,
          // Add more corrections as needed
        };
      });

      // Calculate confidence based on ratings
      const ratings = Object.values(eventFeedback).map(f => f.rating);
      const goodRatings = ratings.filter(r => r === 'good').length;
      const confidence = ratings.length > 0 ? goodRatings / ratings.length : overallRating / 5;

      // Submit feedback to AI service
      await aiAnalysisService.processFeedback(
        analysisId,
        analysis,
        correctedEvents,
        generalComments,
        confidence
      );

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setIsOpen(false);
        onFeedbackSubmitted();
      }, 2000);

    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2 transition-all duration-200 hover:scale-105"
        >
          <Brain className="h-5 w-5" />
          <span>Improve AI Analysis</span>
          <TrendingUp className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Thank You! 🎉
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your feedback will help improve future AI analysis. The system is now smarter!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center space-x-2">
                <Brain className="h-6 w-6" />
                <span>Help Improve AI Analysis</span>
              </h2>
              <p className="text-purple-100 mt-1">
                Your feedback helps train the system for better future analysis
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[70vh]">
          {/* Overall Rating */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Overall Analysis Quality
            </h3>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">Poor</span>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setOverallRating(rating)}
                    className={`w-8 h-8 rounded-full transition-colors ${
                      rating <= overallRating
                        ? 'bg-yellow-400 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-400'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Excellent</span>
            </div>
          </div>

          {/* Event-by-Event Feedback */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Event Analysis Feedback
            </h3>
            <div className="space-y-4">
              {analysis.events.slice(0, 6).map((event: AnalyticsEvent) => (
                <div 
                  key={event.id} 
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {event.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {event.properties.length} properties · {Math.round(event.confidence * 100)}% confidence
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEventRating(event.id, 'good')}
                        className={`p-2 rounded transition-colors ${
                          eventFeedback[event.id]?.rating === 'good'
                            ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                            : 'bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600 dark:bg-gray-600 dark:hover:bg-green-900'
                        }`}
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEventRating(event.id, 'needs_improvement')}
                        className={`p-2 rounded transition-colors ${
                          eventFeedback[event.id]?.rating === 'needs_improvement'
                            ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400'
                            : 'bg-gray-100 text-gray-400 hover:bg-yellow-100 hover:text-yellow-600 dark:bg-gray-600 dark:hover:bg-yellow-900'
                        }`}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEventRating(event.id, 'poor')}
                        className={`p-2 rounded transition-colors ${
                          eventFeedback[event.id]?.rating === 'poor'
                            ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                            : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600 dark:bg-gray-600 dark:hover:bg-red-900'
                        }`}
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Correction Fields */}
                  {eventFeedback[event.id]?.rating === 'needs_improvement' && (
                    <div className="mt-3 space-y-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Correct Event Name
                        </label>
                        <input
                          type="text"
                          placeholder={event.name}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                          onChange={(e) => handleEventCorrection(event.id, 'correctedName', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Comments
                        </label>
                        <textarea
                          placeholder="What should be improved about this event?"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                          rows={2}
                          onChange={(e) => handleEventCorrection(event.id, 'comments', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* General Comments */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Additional Comments
            </h3>
            <textarea
              value={generalComments}
              onChange={(e) => setGeneralComments(e.target.value)}
              placeholder="Any general feedback about the AI analysis? What could be improved?"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              rows={4}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>💡 Your feedback improves the AI for everyone</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Skip for now
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Learning...</span>
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4" />
                    <span>Submit Feedback</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPanel;
