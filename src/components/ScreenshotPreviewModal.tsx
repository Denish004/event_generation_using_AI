import React, { useState } from 'react';
import { X, AlertCircle, Download } from 'lucide-react';
import { ScreenshotResult } from '../services/visionService';
interface ScreenshotPreviewModalProps {
  screenshot: ScreenshotResult;
  onAnalyze: (customPrompt?: string) => void;
  onDownload: () => void;
  onClose: () => void;
  isAnalyzing?: boolean;
}

const ScreenshotPreviewModal: React.FC<ScreenshotPreviewModalProps> = ({
  screenshot,
  onAnalyze,
  onDownload,
  onClose,
  isAnalyzing = false
}) => {
  const [customPrompt, setCustomPrompt] = useState('');

  const handleAnalyze = () => {
    onAnalyze(customPrompt.trim() || undefined);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 p-4" style={{ zIndex: 99999 }}>
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-7xl h-[95vh] flex flex-col overflow-hidden border-4 border-gray-200 dark:border-gray-600" style={{ zIndex: 99999 }}>
        
        {/* Screenshot Preview Section */}
        <div className="flex-1 bg-black relative rounded-t-3xl overflow-hidden">
          {/* Close button - top left over the screenshot */}
          <button
            onClick={onClose}
            className="absolute top-6 left-6 z-10 p-2 text-white hover:text-gray-300 transition-colors rounded-full hover:bg-black/20"
          >
            <X className="h-8 w-8" />
          </button>
          
          {/* Title - top center over the screenshot */}
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-10">
            <h3 className="text-xl font-bold text-white">
              Screenshot Preview
            </h3>
          </div>

          {/* Download button - top right over the screenshot */}
          <button
            onClick={onDownload}
            className="absolute top-6 right-6 z-10 flex items-center space-x-2 px-4 py-2 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-colors shadow-lg"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </button>

          {/* Screenshot centered */}
          <div className="w-full h-full flex items-center justify-center p-2 pt-15">
            <img
              src={screenshot.dataUrl}
              alt="Captured Journey Screenshot"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>

        {/* Prompt Box Section at Bottom */}
        <div className="bg-gray-900 dark:bg-gray-800 p-4 rounded-b-3xl">
          <div className="max-w-4xl mx-auto">
            {/* Gradient Prompt Box */}
            <div className="bg-indigo-500 p-4 rounded-3xl shadow-xl">
              
              {/* Header */}
             
              
              {/* Prompt Input with Arrow Button */}
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="• Focus on payment flow events only
• Identify events that span multiple screens  
• Look for banner interactions and their properties
• Extract wallet-related events with balance details"
                    className="w-full h-16 px-3 py-2 text-sm bg-white/10 backdrop-blur border border-white/20 rounded-lg text-white placeholder-white/70 resize-none focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
                  />
                </div>
                
                {/* Arrow Button */}
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className={`flex items-center justify-center w-16 h-16 rounded-full transition-all duration-200 transform hover:scale-110 ${
                    isAnalyzing
                      ? 'bg-white/30 cursor-not-allowed'
                      : 'bg-white hover:bg-gray-100 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isAnalyzing ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                  ) : (
                    <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Info text */}
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreenshotPreviewModal;