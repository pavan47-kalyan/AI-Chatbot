
import React from 'react';
import ReviewRoverChatbot from '../components/ReviewRoverChatbot';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-100 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="py-6 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl font-bold text-purple-800">
          Review Rover Insights
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          AI-powered review analysis at your fingertips
        </p>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center py-8">
        <div className="w-full max-w-4xl h-[600px] bg-white bg-opacity-40 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden border border-purple-100">
          <ReviewRoverChatbot />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-4 px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
        <p>Powered by Review Rover AI &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default Index;
