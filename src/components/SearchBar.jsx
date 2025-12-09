import React, { useState, useEffect, useCallback, useRef } from 'react';

const SearchBar = ({ onSearch, onLocationClick, favorites, onFavoriteSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('recentWeatherSearches');
    return saved ? JSON.parse(saved) : [];
  });
  
  const suggestionsRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('recentWeatherSearches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) && 
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/find?q=${query}&type=like&sort=population&cnt=5&appid=${apiKey}`
      );
      const data = await response.json();
      
      if (data.list) {
        setSuggestions(data.list.map(item => ({
          name: item.name,
          country: item.sys.country,
          id: item.id
        })));
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchSuggestions(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, fetchSuggestions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm);
      addToRecentSearches(searchTerm);
      setSearchTerm('');
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      onSearch(searchTerm);
      addToRecentSearches(searchTerm);
      setSearchTerm('');
      setShowSuggestions(false);
    }
  };

  const addToRecentSearches = (city) => {
    if (!recentSearches.includes(city)) {
      const updated = [city, ...recentSearches.slice(0, 4)];
      setRecentSearches(updated);
    }
  };

  const handleSuggestionClick = (city) => {
    onSearch(city);
    addToRecentSearches(city);
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  // SVG Icons
  const SearchIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );

  const LocationIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  const MapPinIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  const CloseIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  const StarIcon = () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );

  return (
    <div className="relative w-full" style={{ zIndex: 100 }}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyPress={handleKeyPress}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search for a city..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-300 bg-white/95 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg text-base relative z-10"
              style={{ zIndex: 100 }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-20"
                style={{ zIndex: 101 }}
              >
                <CloseIcon />
              </button>
            )}
          </div>
          {/* Updated My Location Button - More Stunning */}
          <button
            type="button"
            onClick={onLocationClick}
            className="px-4 py-3 rounded-2xl bg-linear-to-r from-green-500 via-emerald-500 to-teal-600 text-white hover:opacity-90 transition-all duration-300 flex items-center gap-2 shadow-lg group relative overflow-hidden"
            title="Use my current location"
            style={{ zIndex: 100 }}
          >
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-linear-to-r from-teal-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center gap-2">
              <div className="relative">
                <div className="absolute -inset-1 bg-white/30 rounded-full animate-ping opacity-75"></div>
                <LocationIcon />
              </div>
              <span className="hidden md:inline font-medium">My Location</span>
            </div>
          </button>
        </div>
      </form>

      {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0 || favorites.length > 0) && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full mt-2 w-full bg-white/98 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200 overflow-hidden fade-in"
          style={{ zIndex: 9999 }}
        >
          {/* Favorites Section */}
          {favorites.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center gap-2 px-2 py-1 mb-2">
                <div className="text-yellow-500">
                  <StarIcon />
                </div>
                <h3 className="text-sm font-semibold text-gray-600">Favorite Cities</h3>
              </div>
              {favorites.slice(0, 3).map((fav, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onFavoriteSelect(`${fav.name}, ${fav.country}`);
                    setShowSuggestions(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 rounded-xl transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {fav.condition === 'Clear' && '☀️'}
                      {fav.condition === 'Clouds' && '☁️'}
                      {fav.condition === 'Rain' && '🌧️'}
                      {fav.condition === 'Snow' && '❄️'}
                    </span>
                    <div>
                      <span className="font-medium text-gray-800">{fav.name}, {fav.country}</span>
                    </div>
                  </div>
                  <span className="font-semibold text-gray-700">
                    {Math.round(fav.temp)}°C
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Suggestions Section */}
          {suggestions.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center gap-2 px-2 py-1 mb-2">
                <div className="text-blue-500">
                  <MapPinIcon />
                </div>
                <h3 className="text-sm font-semibold text-gray-600">City Suggestions</h3>
              </div>
              {suggestions.map((city) => (
                <button
                  key={city.id}
                  onClick={() => handleSuggestionClick(`${city.name}, ${city.country}`)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 rounded-xl transition-colors flex items-center gap-3"
                >
                  <MapPinIcon />
                  <span className="font-medium text-gray-800">{city.name}, {city.country}</span>
                </button>
              ))}
            </div>
          )}
          
          {/* Recent Searches Section */}
          {recentSearches.length > 0 && (
            <div className="p-3">
              <div className="flex justify-between items-center px-2 py-1 mb-2">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-sm font-semibold text-gray-600">Recent Searches</h3>
                </div>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-gray-400 hover:text-gray-600 font-medium"
                >
                  Clear all
                </button>
              </div>
              {recentSearches.map((city, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(city)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 rounded-xl transition-colors flex items-center gap-3"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span>{city}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
