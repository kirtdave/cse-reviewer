import React from "react";

export default function PrintHeader({
  name,
  correctCount,
  wrongCount,
  unansweredCount,
  accuracy,
}) {
  return (
    <div className="hidden print:block p-8 border-b-2 border-gray-300">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{name}</h1>
        <p className="text-gray-600">Test Review Report</p>
        <p className="text-sm text-gray-500">
          Generated on {new Date().toLocaleDateString()}
        </p>
      </div>
      <div className="grid grid-cols-4 gap-4 max-w-4xl mx-auto">
        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-gray-600 mb-1">Correct</p>
          <p className="text-2xl font-bold text-green-600">{correctCount}</p>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
          <p className="text-sm text-gray-600 mb-1">Wrong</p>
          <p className="text-2xl font-bold text-red-600">{wrongCount}</p>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
          <p className="text-sm text-gray-600 mb-1">Unanswered</p>
          <p className="text-2xl font-bold text-orange-600">{unansweredCount}</p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-sm text-gray-600 mb-1">Accuracy</p>
          <p className="text-2xl font-bold text-purple-600">{accuracy}%</p>
        </div>
      </div>
    </div>
  );
}