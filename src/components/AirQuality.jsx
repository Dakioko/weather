import React from 'react';

const AirQuality = ({ data }) => {
  if (!data) return null;

  const getAQIData = (aqi) => {
    const aqiData = {
      1: { 
        level: 'Good', 
        color: 'bg-green-500',
        textColor: 'text-green-700',
        bgColor: 'bg-green-50',
        description: 'Air quality is satisfactory',
        emoji: '😊',
        gradient: 'from-green-400 to-green-500'
      },
      2: { 
        level: 'Fair', 
        color: 'bg-yellow-500',
        textColor: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        description: 'Air quality is acceptable',
        emoji: '😐',
        gradient: 'from-yellow-400 to-yellow-500'
      },
      3: { 
        level: 'Moderate', 
        color: 'bg-orange-500',
        textColor: 'text-orange-700',
        bgColor: 'bg-orange-50',
        description: 'Sensitive groups may be affected',
        emoji: '😷',
        gradient: 'from-orange-400 to-orange-500'
      },
      4: { 
        level: 'Poor', 
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50',
        description: 'Everyone may be affected',
        emoji: '😨',
        gradient: 'from-red-400 to-red-500'
      },
      5: { 
        level: 'Very Poor', 
        color: 'bg-purple-500',
        textColor: 'text-purple-700',
        bgColor: 'bg-purple-50',
        description: 'Health emergency conditions',
        emoji: '⚠️',
        gradient: 'from-purple-400 to-purple-500'
      }
    };
    return aqiData[aqi] || aqiData[1];
  };

  const aqiInfo = getAQIData(data.list?.[0]?.main?.aqi || 1);
  const components = data.list?.[0]?.components || {};

  const pollutants = [
    { name: 'PM2.5', value: components.pm2_5, unit: 'μg/m³', safe: 25, description: 'Fine particles' },
    { name: 'PM10', value: components.pm10, unit: 'μg/m³', safe: 50, description: 'Coarse particles' },
    { name: 'NO₂', value: components.no2, unit: 'μg/m³', safe: 40, description: 'Nitrogen dioxide' },
    { name: 'O₃', value: components.o3, unit: 'μg/m³', safe: 100, description: 'Ozone' },
    { name: 'SO₂', value: components.so2, unit: 'μg/m³', safe: 20, description: 'Sulfur dioxide' },
    { name: 'CO', value: components.co, unit: 'μg/m³', safe: 4400, description: 'Carbon monoxide' },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 md:p-6 fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">Air Quality Index</h2>
          <p className="text-gray-600 text-sm">Real-time air pollution levels</p>
        </div>
        <div className={`px-4 py-2 rounded-full bg-linear-to-r ${aqiInfo.gradient} text-white font-semibold flex items-center gap-2`}>
          <span className="text-lg">{aqiInfo.emoji}</span>
          <span>{aqiInfo.level}</span>
        </div>
      </div>

      {/* AQI Level Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span className="text-green-600 font-medium">Good</span>
          <span className="text-red-600 font-medium">Very Poor</span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden relative">
          <div 
            className={`h-full bg-linear-to-r ${aqiInfo.gradient} transition-all duration-1000`}
            style={{ width: `${(data.list?.[0]?.main?.aqi || 1) * 20}%` }}
          ></div>
          {/* Current position indicator */}
          <div 
            className="absolute top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-2 border-gray-300"
            style={{ left: `${((data.list?.[0]?.main?.aqi || 1) * 20) - 3}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
        </div>
      </div>

      <p className="text-gray-700 mb-8 text-center bg-gray-50/50 rounded-xl p-4">
        {aqiInfo.description}
      </p>

      {/* Pollutant Details - Grid layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {pollutants.map((pollutant, index) => {
          if (!pollutant.value) return null;
          
          const percentage = Math.min((pollutant.value / pollutant.safe) * 100, 100);
          const isSafe = pollutant.value <= pollutant.safe;
          const safetyLevel = isSafe ? 'Good' : 
                             percentage <= 150 ? 'Moderate' : 
                             percentage <= 200 ? 'Poor' : 'Very Poor';
          
          return (
            <div key={index} className="bg-gradient-to-b from-gray-50 to-white rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="text-center">
                <div className="font-bold text-lg text-gray-800 mb-1">{pollutant.name}</div>
                <div className="text-xs text-gray-500 mb-2">{pollutant.description}</div>
                
                <div className="mb-3">
                  <div className="text-2xl font-bold text-gray-800 mb-1">
                    {pollutant.value.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">{pollutant.unit}</div>
                </div>
                
                {/* Safety indicator */}
                <div className={`text-xs font-medium px-2 py-1 rounded-full mb-2 ${
                  isSafe ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {safetyLevel}
                </div>
                
                {/* Progress bar */}
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
                  <div 
                    className={`h-full ${isSafe ? 'bg-green-500' : 'bg-red-500'} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0</span>
                  <span>Safe: {pollutant.safe}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Health Recommendations */}
      <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-yellow-500">💡</span>
          Health Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span className="text-sm text-gray-700">Generally safe for outdoor activities</span>
            </div>
            {data.list?.[0]?.main?.aqi >= 3 && (
              <>
                <div className="flex items-start gap-2">
                  <span className="text-orange-500">⚠️</span>
                  <span className="text-sm text-gray-700">Consider reducing intense outdoor activities</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-500">⚠️</span>
                  <span className="text-sm text-gray-700">Sensitive groups should limit exposure</span>
                </div>
              </>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-blue-500">🏠</span>
              <span className="text-sm text-gray-700">Keep windows closed if air quality is poor</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500">💨</span>
              <span className="text-sm text-gray-700">Use air purifiers for better indoor air</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500">😷</span>
              <span className="text-sm text-gray-700">Consider wearing masks in poor conditions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirQuality;
