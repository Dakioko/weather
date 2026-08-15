import React, { useState, useEffect, useCallback, useRef } from 'react';

const SearchBar = ({ onSearch, onLocationClick, favorites, onFavoriteSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('recentWeatherSearches');
    return saved ? JSON.parse(saved) : [];
  });

  const suggestionsRef = useRef(null);
  const inputRef = useRef(null);

  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent);

  useEffect(() => {
    localStorage.setItem('recentWeatherSearches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
        inputRef.current && !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Command-palette shortcut: ⌘K / Ctrl+K focuses search from anywhere,
  // Escape closes suggestions and blurs.
  useEffect(() => {
    const handleGlobalKeydown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        setShowSuggestions(true);
      } else if (event.key === 'Escape' && document.activeElement === inputRef.current) {
        setShowSuggestions(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handleGlobalKeydown);
    return () => document.removeEventListener('keydown', handleGlobalKeydown);
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
        setSuggestions(data.list.map((item) => ({ name: item.name, country: item.sys.country, id: item.id })));
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => fetchSuggestions(searchTerm), 300);
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

  const addToRecentSearches = (city) => {
    if (!recentSearches.includes(city)) {
      setRecentSearches([city, ...recentSearches.slice(0, 4)]);
    }
  };

  const handleSuggestionClick = (city) => {
    onSearch(city);
    addToRecentSearches(city);
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const clearRecentSearches = () => setRecentSearches([]);

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
      <form onSubmit={handleSubmit} className="relative" role="search">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2" style={{ color: 'var(--ink-500)' }}>
              <SearchIcon />
            </div>
            <label htmlFor="city-search" className="sr-only">Search for a city</label>
            <input
              id="city-search"
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setShowSuggestions(true); }}
              onFocus={() => { setShowSuggestions(true); setIsFocused(true); }}
              onBlur={() => setIsFocused(false)}
              placeholder="Search for a city..."
              autoComplete="off"
              className="w-full pl-12 pr-10 py-3 rounded-2xl text-base relative z-10 focus:outline-none"
              style={{
                border: '1px solid var(--line)',
                background: 'var(--paper-0)',
                color: 'var(--ink-900)',
                boxShadow: 'var(--shadow-card)',
              }}
            />
            {searchTerm ? (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20"
                style={{ color: 'var(--ink-500)' }}
              >
                <CloseIcon />
              </button>
            ) : (
              !isFocused && (
                <kbd
                  className="hidden md:inline-flex items-center gap-0.5 absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-[10px] px-1.5 py-1 rounded-md pointer-events-none select-none"
                  style={{ background: 'var(--paper-100)', color: 'var(--ink-500)', border: '1px solid var(--line)' }}
                  aria-hidden="true"
                >
                  {isMac ? '⌘' : 'Ctrl'} K
                </kbd>
              )
            )}
          </div>

          <button
            type="button"
            onClick={onLocationClick}
            aria-label="Use my current location"
            title="Use my current location"
            className="px-4 py-3 rounded-2xl text-white flex items-center gap-2 shadow-sm relative overflow-hidden hover:opacity-90 active:scale-95 transition-all"
            style={{ background: 'var(--teal)' }}
          >
            <LocationIcon />
            <span className="hidden md:inline font-medium text-sm">My Location</span>
          </button>
        </div>
      </form>

      {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0 || favorites.length > 0) && (
        <div
          ref={suggestionsRef}
          className="absolute top-full mt-2 w-full rounded-2xl overflow-hidden fade-in"
          style={{ zIndex: 9999, background: 'var(--paper-0)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-card-hover)' }}
        >
          {favorites.length > 0 && (
            <div className="p-3" style={{ borderBottom: '1px solid var(--line)' }}>
              <div className="flex items-center gap-2 px-2 py-1 mb-1" style={{ color: 'var(--amber-dark)' }}>
                <StarIcon />
                <h3 className="text-xs font-mono uppercase tracking-wide" style={{ color: 'var(--ink-500)' }}>Favorites</h3>
              </div>
              {favorites.slice(0, 3).map((fav, index) => (
                <button
                  key={index}
                  onClick={() => { onFavoriteSelect(`${fav.name}, ${fav.country}`); setShowSuggestions(false); }}
                  className="w-full text-left px-4 py-2.5 rounded-xl transition-colors flex items-center justify-between hover:bg-black/5"
                >
                  <span className="font-medium text-sm" style={{ color: 'var(--ink-900)' }}>{fav.name}, {fav.country}</span>
                  <span className="font-mono text-sm" style={{ color: 'var(--ink-500)' }}>{Math.round(fav.temp)}°C</span>
                </button>
              ))}
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="p-3" style={{ borderBottom: '1px solid var(--line)' }}>
              <div className="flex items-center gap-2 px-2 py-1 mb-1" style={{ color: 'var(--ink-500)' }}>
                <MapPinIcon />
                <h3 className="text-xs font-mono uppercase tracking-wide">Suggestions</h3>
              </div>
              {suggestions.map((city) => (
                <button
                  key={city.id}
                  onClick={() => handleSuggestionClick(`${city.name}, ${city.country}`)}
                  className="w-full text-left px-4 py-2.5 rounded-xl transition-colors flex items-center gap-3 hover:bg-black/5"
                >
                  <MapPinIcon />
                  <span className="font-medium text-sm" style={{ color: 'var(--ink-900)' }}>{city.name}, {city.country}</span>
                </button>
              ))}
            </div>
          )}

          {recentSearches.length > 0 && (
            <div className="p-3">
              <div className="flex justify-between items-center px-2 py-1 mb-1">
                <h3 className="text-xs font-mono uppercase tracking-wide" style={{ color: 'var(--ink-500)' }}>Recent</h3>
                <button onClick={clearRecentSearches} className="text-xs font-medium hover:underline" style={{ color: 'var(--ink-500)' }}>
                  Clear
                </button>
              </div>
              {recentSearches.map((city, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(city)}
                  className="w-full text-left px-4 py-2.5 rounded-xl transition-colors flex items-center gap-3 hover:bg-black/5"
                >
                  <span className="text-sm" style={{ color: 'var(--ink-700)' }}>{city}</span>
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
