import React from 'react';

const AQI_INFO = {
  1: { level: 'Good', accent: 'var(--teal)', description: 'Air quality is satisfactory', emoji: '😊' },
  2: { level: 'Fair', accent: '#c9a227', description: 'Air quality is acceptable', emoji: '😐' },
  3: { level: 'Moderate', accent: 'var(--amber-dark)', description: 'Sensitive groups may be affected', emoji: '😷' },
  4: { level: 'Poor', accent: 'var(--rose)', description: 'Everyone may be affected', emoji: '😨' },
  5: { level: 'Very Poor', accent: 'var(--violet)', description: 'Health emergency conditions', emoji: '⚠️' },
};

const AirQuality = ({ data }) => {
  if (!data) return null;

  const aqi = data.list?.[0]?.main?.aqi || 1;
  const aqiInfo = AQI_INFO[aqi] || AQI_INFO[1];
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
    <div className="panel p-5 md:p-7">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
        <div>
          <h2 className="font-display text-xl md:text-2xl font-semibold" style={{ color: 'var(--ink-900)' }}>
            Air Quality Index
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--ink-500)' }}>Real-time air pollution levels</p>
        </div>
        <div
          className="px-4 py-2 rounded-full text-white font-medium flex items-center gap-2 font-mono text-sm"
          style={{ background: aqiInfo.accent }}
        >
          <span aria-hidden="true">{aqiInfo.emoji}</span>
          <span>{aqiInfo.level}</span>
        </div>
      </div>

      {/* AQI scale */}
      <div className="mb-7">
        <div className="flex justify-between text-xs font-mono mb-2" style={{ color: 'var(--ink-500)' }}>
          <span>Good</span>
          <span>Very Poor</span>
        </div>
        <div className="h-3 rounded-full overflow-hidden relative" style={{ background: 'var(--line)' }}>
          <div
            className="h-full transition-all duration-1000"
            style={{ width: `${aqi * 20}%`, background: aqiInfo.accent }}
          ></div>
        </div>
      </div>

      <p className="mb-7 text-center rounded-xl p-4 text-sm" style={{ background: 'var(--paper-50)', color: 'var(--ink-700)', border: '1px solid var(--line)' }}>
        {aqiInfo.description}
      </p>

      {/* Pollutant grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {pollutants.map((pollutant, index) => {
          if (!pollutant.value) return null;

          const rawPercentage = (pollutant.value / pollutant.safe) * 100;
          const barPercentage = Math.min(rawPercentage, 100);
          let safetyLevel = 'Good';
          let isSafe = true;
          if (rawPercentage > 200) {
            safetyLevel = 'Very Poor'; isSafe = false;
          } else if (rawPercentage > 150) {
            safetyLevel = 'Poor'; isSafe = false;
          } else if (rawPercentage > 100) {
            safetyLevel = 'Moderate'; isSafe = false;
          }

          return (
            <div key={index} className="rounded-xl p-3 text-center" style={{ background: 'var(--paper-50)', border: '1px solid var(--line)' }}>
              <div className="font-semibold text-sm" style={{ color: 'var(--ink-900)' }}>{pollutant.name}</div>
              <div className="text-[11px] mb-2" style={{ color: 'var(--ink-500)' }}>{pollutant.description}</div>

              <div className="mb-2.5">
                <div className="font-mono text-xl font-medium" style={{ color: 'var(--ink-900)' }}>
                  {pollutant.value.toFixed(1)}
                </div>
                <div className="text-[10px] font-mono" style={{ color: 'var(--ink-500)' }}>{pollutant.unit}</div>
              </div>

              <div
                className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full mb-2 inline-block"
                style={{
                  background: isSafe ? 'color-mix(in srgb, var(--teal) 15%, transparent)' : 'color-mix(in srgb, var(--rose) 15%, transparent)',
                  color: isSafe ? 'var(--teal-dark)' : 'var(--rose)',
                }}
              >
                {safetyLevel}
              </div>

              <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ background: 'var(--line)' }}>
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: `${barPercentage}%`, background: isSafe ? 'var(--teal)' : 'var(--rose)' }}
                ></div>
              </div>
              <div className="text-[10px] font-mono" style={{ color: 'var(--ink-500)' }}>safe ≤{pollutant.safe}</div>
            </div>
          );
        })}
      </div>

      {/* Health recommendations */}
      <div className="mt-7 p-4 rounded-2xl" style={{ background: 'var(--paper-50)', border: '1px solid var(--line)' }}>
        <h3 className="font-display font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--ink-900)' }}>
          <span aria-hidden="true">💡</span> Health Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-sm" style={{ color: 'var(--ink-700)' }}>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span style={{ color: 'var(--teal)' }}>✓</span>
              <span>Generally safe for outdoor activities</span>
            </div>
            {aqi >= 3 && (
              <>
                <div className="flex items-start gap-2">
                  <span style={{ color: 'var(--amber-dark)' }}>⚠️</span>
                  <span>Consider reducing intense outdoor activities</span>
                </div>
                <div className="flex items-start gap-2">
                  <span style={{ color: 'var(--amber-dark)' }}>⚠️</span>
                  <span>Sensitive groups should limit exposure</span>
                </div>
              </>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-2"><span>🏠</span><span>Keep windows closed if air quality is poor</span></div>
            <div className="flex items-start gap-2"><span>💨</span><span>Use air purifiers for better indoor air</span></div>
            <div className="flex items-start gap-2"><span>😷</span><span>Consider wearing masks in poor conditions</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirQuality;
