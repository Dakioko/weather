import React from 'react';

const BackgroundWrapper = ({ children, weatherCondition }) => {
  const getBackgroundClass = (condition) => {
    if (!condition) return 'bg-gradient-to-br from-blue-100 to-blue-300';
    
    const conditionLower = condition.toLowerCase();
    
    if (conditionLower.includes('clear')) {
      return 'bg-gradient-to-br from-yellow-100 via-orange-100 to-blue-300';
    } else if (conditionLower.includes('cloud')) {
      return 'bg-gradient-to-br from-gray-100 to-gray-300';
    } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
      return 'bg-gradient-to-br from-gray-200 to-blue-400';
    } else if (conditionLower.includes('thunderstorm')) {
      return 'bg-gradient-to-br from-gray-800 to-purple-900';
    } else if (conditionLower.includes('snow')) {
      return 'bg-gradient-to-br from-blue-100 to-white';
    } else if (conditionLower.includes('mist') || conditionLower.includes('fog') || conditionLower.includes('haze')) {
      return 'bg-gradient-to-br from-gray-300 to-gray-100';
    } else {
      return 'bg-gradient-to-br from-blue-100 to-blue-300';
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${getBackgroundClass(weatherCondition)}`}>
      {children}
    </div>
  );
};

export default BackgroundWrapper;