import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
        <p className="text-gray-600 text-lg">Loading WiseTrip...</p>
      </div>
    </div>
  );
}