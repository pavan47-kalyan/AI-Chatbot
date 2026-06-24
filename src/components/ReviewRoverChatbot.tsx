import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { analyzeReview, type ReviewAnalysis } from '../services/reviewAnalysisService';
import ApiKeyModal from './ApiKeyModal';
import { saveApiKey, hasApiKey } from '../utils/apiKeyManager';
import { cn } from '@/lib/utils';
import { useAuth } from '../hooks/useAuth';

// Message Types
type MessageType = 'user' | 'bot';

interface Message {
  id: string;
  text: string;
  type: MessageType;
  timestamp: Date;
  analysis?: ReviewAnalysis;
}

const ReviewRoverChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  // Add welcome message on first load
  useEffect(() => {
    const welcomeMessage: Message = {
      id: uuidv4(),
      text: "🐾 Woof! I'm Review Rover, your friendly AI review analysis companion! Share any product review with me, and I'll fetch insights on quality, features, and more. Let's dig into those reviews together!",
      type: 'bot',
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
    
    // Check if API key is missing and user is not authenticated
    if (!hasApiKey() && !user) {
      setTimeout(() => {
        const apiKeyPrompt: Message = {
          id: uuidv4(),
          text: "🔑 I need an API key to analyze reviews. Please log in or sign up to continue!",
          type: 'bot',
          timestamp: new Date()
        };
        setMessages(prevMessages => [...prevMessages, apiKeyPrompt]);
      }, 1000);
    }
  }, [user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isProductReview = (text: string): boolean => {
    const reviewIndicators = [
      'review',
      'rating',
      'stars',
      'bought',
      'purchased',
      'quality',
      'recommend',
      'experience',
      'product',
      'using',
      'works',
      'great',
      'bad',
      'good',
      'worth'
    ];
    
    const lowercaseText = text.toLowerCase();
    return reviewIndicators.some(indicator => lowercaseText.includes(indicator));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    if (!user) {
      window.location.href = '/login';
      return;
    }
    
    if (!hasApiKey()) {
      toast.error("Please add your API key!", {
        action: {
          label: "Add Key",
          onClick: () => setIsApiKeyModalOpen(true)
        }
      });
      return;
    }

    if (!isProductReview(input)) {
      const greetingMessage: Message = {
        id: uuidv4(),
        text: "👋 Hi there! I'm looking forward to analyzing product reviews, but that doesn't quite look like a review. Could you share your experience with a product? For example, tell me about its features, quality, or whether you'd recommend it!",
        type: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, 
        {
          id: uuidv4(),
          text: input,
          type: 'user',
          timestamp: new Date()
        },
        greetingMessage
      ]);
      setInput('');
      return;
    }
    
    const userMessage: Message = {
      id: uuidv4(),
      text: input,
      type: 'user',
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsSubmitting(true);
    
    try {
      const thinkingId = uuidv4();
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: thinkingId,
          text: "🐾 Analyzing review...",
          type: 'bot',
          timestamp: new Date()
        }
      ]);
      
      const analysis = await analyzeReview(input);
      
      setMessages(prevMessages => {
        const filteredMessages = prevMessages.filter(m => m.id !== thinkingId);
        const botMessage: Message = {
          id: uuidv4(),
          text: "Here's my analysis of your review:",
          type: 'bot',
          timestamp: new Date(),
          analysis
        };
        return [...filteredMessages, botMessage];
      });
      
    } catch (error) {
      toast.error('Failed to analyze review. Please try again.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuestionClick = (questionId: number) => {
    setSelectedQuestion(questionId);
    
    // Find the last message with analysis
    const lastAnalysisMessage = [...messages].reverse().find(m => m.analysis);
    
    if (!lastAnalysisMessage?.analysis) return;
    
    // Find the selected question
    const question = lastAnalysisMessage.analysis.followUpQuestions.find(q => q.id === questionId);
    if (!question) return;
    
    // Add user question
    const userMessage: Message = {
      id: uuidv4(),
      text: question.question,
      type: 'user',
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Add bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: uuidv4(),
        text: getResponseForQuestion(questionId, lastAnalysisMessage.analysis!),
        type: 'bot',
        timestamp: new Date()
      };
      setMessages(prevMessages => [...prevMessages, botResponse]);
      setSelectedQuestion(null);
    }, 1000);
  };

  // Generate responses for follow-up questions
  const getResponseForQuestion = (questionId: number, analysis: ReviewAnalysis): string => {
    switch (questionId) {
      case 1:
        return `${analysis.sentiment.score > 70 
          ? "Based on the review, the noise cancellation appears to be excellent! It's mentioned as one of the standout features with effective ambient noise reduction." 
          : "The review doesn't specifically highlight noise cancellation as a strength. It might be average or not a key feature of this product."} Would you like to know more about any other specific features?`;
      case 2:
        return `The connectivity is rated ${getFeatureRating(analysis, "Connectivity")} out of 5. ${analysis.sentiment.score > 70 
          ? "It seems to connect reliably with minimal dropouts or pairing issues." 
          : "There might be some challenges with stable connections based on the review."} Is there anything else you'd like to know about the connectivity?`;
      case 3:
        return `Compared to similar products in this category, this one ${analysis.sentiment.score > 80 
          ? "stands out particularly well! It ranks above average in most key metrics and offers better value than many competitors." 
          : analysis.sentiment.score > 60 
            ? "is fairly competitive. It has some strengths that set it apart, though there are alternatives with different feature priorities." 
            : "faces tough competition. There are several alternatives that might offer better performance in key areas."} Would you like specific alternative recommendations?`;
      default:
        return "I don't have specific information about that question based on the review. Would you like to ask something else?";
    }
  };

  const getFeatureRating = (analysis: ReviewAnalysis, featureName: string): number => {
    const feature = analysis.keyFeatures.find(f => f.name.toLowerCase() === featureName.toLowerCase());
    return feature?.rating || 3;
  };

  // Format the review analysis for display
  const renderAnalysis = (analysis: ReviewAnalysis) => {
    return (
      <div className="analysis-container mt-4 bg-white bg-opacity-90 rounded-lg p-4 shadow-md animated-fade-in">
        <div className="analysis-header border-b border-purple-200 pb-2 mb-3">
          <h3 className="text-lg font-bold text-purple-800">
            🎯 Review Analysis
          </h3>
          <div className="sentiment flex items-center">
            <span className="text-sm font-medium">Sentiment: </span>
            <span className="ml-2 text-sm font-bold text-purple-700">
              {analysis.sentiment.score}% {analysis.sentiment.label}
            </span>
            <div className="ml-2 bg-gray-200 h-2 w-24 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full", 
                  analysis.sentiment.score > 70 ? "bg-green-500" : 
                  analysis.sentiment.score > 40 ? "bg-yellow-500" : "bg-red-500"
                )}
                style={{ width: `${analysis.sentiment.score}%` }}
              />
            </div>
          </div>
          <p className="text-sm text-gray-600 italic">
            {analysis.sentiment.description}
          </p>
        </div>

        {/* Key Features Section */}
        <div className="feature-ratings mb-3">
          <h4 className="text-sm font-bold text-gray-700 mb-2">
            📊 Feature Ratings
          </h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-purple-50">
                <th className="text-left py-1 px-2 rounded-l-md">Feature</th>
                <th className="text-left py-1 px-2">Rating</th>
                <th className="text-left py-1 px-2 rounded-r-md">Notes</th>
              </tr>
            </thead>
            <tbody>
              {analysis.keyFeatures.map((feature, idx) => (
                <tr 
                  key={idx} 
                  className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="py-1 px-2">{feature.name}</td>
                  <td className="py-1 px-2">
                    {"⭐".repeat(feature.rating)}
                  </td>
                  <td className="py-1 px-2">{feature.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Highlights Section */}
        <div className="highlights mb-3">
          <h4 className="text-sm font-bold text-gray-700 mb-2">
            ✨ Key Highlights
          </h4>
          <ul className="list-disc list-inside text-sm text-gray-700 pl-2">
            {analysis.highlights.map((highlight, idx) => (
              <li key={idx} className="mb-1">
                "{highlight}"
              </li>
            ))}
          </ul>
        </div>

        {/* Tags Section */}
        <div className="tags mb-3">
          <h4 className="text-sm font-bold text-gray-700 mb-2">
            🏷️ Smart Tags
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.tags.map((tag, idx) => (
              <span 
                key={idx} 
                className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Comparative Insights */}
        <div className="comparative-insights mb-3">
          <h4 className="text-sm font-bold text-gray-700 mb-2">
            💡 Comparative Insights
          </h4>
          <ol className="list-decimal list-inside text-sm text-gray-700 pl-2">
            {analysis.comparativeInsights.map((insight, idx) => (
              <li key={idx} className="mb-1">{insight}</li>
            ))}
          </ol>
        </div>

        {/* Overall Rating */}
        <div className="overall-rating mb-4 flex items-center">
          <span className="text-sm font-bold text-gray-700 mr-2">Overall Rating:</span>
          <span className="text-xl font-bold text-purple-700">
            {analysis.overallRating.toFixed(1)}/5.0
          </span>
          <div className="ml-2">
            {"⭐".repeat(Math.round(analysis.overallRating))}
          </div>
        </div>

        {/* Recommendation */}
        <div className="recommendation mb-4 p-2 bg-purple-50 rounded-md">
          <h4 className="text-sm font-bold text-purple-800">
            🎯 Recommendation
          </h4>
          <p className="text-sm text-gray-700">
            {analysis.recommendation}
          </p>
        </div>

        {/* Follow-up Questions */}
        <div className="follow-up-questions">
          <h4 className="text-sm font-bold text-gray-700 mb-2">
            Would you like to know more about:
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.followUpQuestions.map((q) => (
              <Button
                key={q.id}
                variant="outline"
                size="sm"
                className={cn(
                  "border-purple-300 text-purple-700 hover:bg-purple-50",
                  selectedQuestion === q.id && "bg-purple-100"
                )}
                onClick={() => handleQuestionClick(q.id)}
                disabled={selectedQuestion !== null}
              >
                {q.id}. {q.question}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="review-rover-container h-full flex flex-col">
      {/* Header */}
      <div className="chat-header flex items-center justify-between p-4 bg-gradient-to-r from-purple-600 to-blue-500 rounded-t-lg shadow-md">
        <div className="flex items-center">
          <span className="text-2xl mr-2">🐕</span>
          <h2 className="text-xl font-bold text-white">Review Rover</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full">
            {user?.name}
          </span>
          <Button 
            variant="outline"
            size="sm"
            className="bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-30"
            onClick={logout}
          >
            Logout
          </Button>
          <Button 
            variant="outline"
            size="sm"
            className="bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-30"
            onClick={() => setIsApiKeyModalOpen(true)}
          >
            API Key
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="chat-messages flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-purple-50 to-blue-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "message-container flex",
              message.type === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div 
              className={cn(
                "message max-w-[80%] p-3 rounded-lg shadow-sm transition-all duration-200",
                message.type === 'user' 
                  ? "bg-purple-600 text-white rounded-tr-none" 
                  : "bg-white rounded-tl-none"
              )}
            >
              <p className="message-text text-sm">
                {message.text}
              </p>
              {message.analysis && renderAnalysis(message.analysis)}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <form onSubmit={handleSubmit} className="chat-input p-4 bg-white border-t border-gray-200">
        <div className="flex space-x-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={user ? "Paste a product review here..." : "Login to analyze reviews..."}
            className="flex-1 resize-none border-gray-300 focus:border-purple-500 focus:ring-purple-500"
            rows={2}
            disabled={isSubmitting || !user}
          />
          <Button
            type="submit"
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
            disabled={isSubmitting || !input.trim() || !user}
          >
            {isSubmitting ? "Analyzing..." : user ? "Analyze" : "Login"}
          </Button>
        </div>
      </form>

      {/* API Key Modal */}
      <ApiKeyModal 
        isOpen={isApiKeyModalOpen} 
        onClose={() => setIsApiKeyModalOpen(false)} 
      />

      {/* CSS Styles */}
      <style>
        {`
        .chat-messages::-webkit-scrollbar {
          width: 6px;
        }
        .chat-messages::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-messages::-webkit-scrollbar-thumb {
          background-color: rgba(107, 33, 168, 0.3);
          border-radius: 20px;
        }
        .message {
          transition: transform 0.2s;
        }
        .message:hover {
          transform: translateY(-2px);
        }
        .animated-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}
      </style>
    </div>
  );
};

export default ReviewRoverChatbot;
