import React, { useState, useEffect, useCallback, useRef } from 'react';

const SearchBar = ({ onSearch, onLocationClick, favorites, onFavoriteSelect, unit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('recentWeatherSearches');
    return saved ? JSON.parse(saved) : [];
  });

  const suggestionsRef = useRef(null);
  const inputRef = useRef(null);

  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent);

  // Same conversion rule as Favorites.jsx: a favorite's stored temp was
  // captured in whichever unit was active at favorite-time (fav.tempUnit),
  // so only convert if that differs from the currently selected unit.
  const formatFavTemp = (fav) => {
    const sourceUnit = fav.tempUnit || 'metric';
    let value = fav.temp;
    if (sourceUnit !== unit) {
      value = sourceUnit === 'metric' ? (value * 9) / 5 + 32 : ((value - 32) * 5) / 9;
    }
    return `${Math.round(value)}°`;
  };

  // The Geocoding API includes `state` (mainly for US results), which the
  // old /find endpoint didn't — use it to disambiguate e.g. Portland, OR
  // from Portland, ME instead of silently collapsing both to "Portland, US".
  const formatCityLabel = (city) =>
    city.state ? `${city.name}, ${city.state}, ${city.country}` : `${city.name}, ${city.country}`;


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
        setHighlightedIndex(-1);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handleGlobalKeydown);
    return () => document.removeEventListener('keydown', handleGlobalKeydown);
  }, []);

  // Reset the keyboard highlight whenever the candidate list is likely to
  // have changed shape — otherwise a stale index could point at the wrong
  // item (or nothing) after typing or once suggestions resolve.
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchTerm]);
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [suggestions]);


  const fetchSuggestions = useCallback(async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
      // OpenWeather's old /data/2.5/find endpoint is deprecated for newer
      // API keys — this is the Geocoding API, its replacement. Different
      // response shape: a plain array (not {list: [...]}), no `id` field
      // (synthesized from lat/lon below, which is guaranteed unique), and
      // it gives us `state` for free — useful for telling apart e.g.
      // Portland, OR from Portland, ME.
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${apiKey}`
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        setSuggestions(
          data.map((item) => ({
            id: `${item.lat},${item.lon}`,
            name: item.name,
            state: item.state,
            country: item.country,
            lat: item.lat,
            lon: item.lon,
          }))
        );
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
    setHighlightedIndex(-1);
  };

  const clearRecentSearches = () => setRecentSearches([]);

  // Flattened, in-render-order list of every currently visible suggestion
  // item, used for arrow-key navigation and Enter-to-select. Recomputed
  // each render (cheap, small lists) rather than memoized, so it always
  // matches exactly what's on screen.
  const flatItems = [
    ...favorites.slice(0, 3).map((fav) => ({
      id: `opt-fav-${fav.key || fav.name}`,
      action: () => {
        onFavoriteSelect(`${fav.name}, ${fav.country}`);
        setShowSuggestions(false);
        setHighlightedIndex(-1);
      },
    })),
    ...suggestions.map((city) => ({
      id: `opt-sugg-${city.id}`,
      action: () => handleSuggestionClick(formatCityLabel(city)),
    })),
    ...recentSearches.map((city, i) => ({
      id: `opt-recent-${i}`,
      action: () => handleSuggestionClick(city),
    })),
  ];

  // Keep the highlighted option scrolled into view as the user navigates.
  useEffect(() => {
    if (highlightedIndex < 0) return;
    const item = flatItems[highlightedIndex];
    if (!item) return;
    document.getElementById(item.id)?.scrollIntoView({ block: 'nearest' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightedIndex]);

  const handleInputKeyDown = (e) => {
    if (!showSuggestions || flatItems.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((i) => (i + 1) % flatItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((i) => (i - 1 + flatItems.length) % flatItems.length);
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      flatItems[highlightedIndex].action();
    }
  };

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
              onKeyDown={handleInputKeyDown}
              placeholder="Search for a city..."
              autoComplete="off"
              role="combobox"
              aria-expanded={showSuggestions && flatItems.length > 0}
              aria-controls="search-listbox"
              aria-autocomplete="list"
              aria-activedescendant={highlightedIndex >= 0 ? flatItems[highlightedIndex]?.id : undefined}
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
                className="absolute right-1.5 top-1/2 transform -translate-y-1/2 z-20 p-2.5 rounded-full hover:bg-black/5 transition-colors"
                style={{ color: 'var(--ink-500)' }}
              >
                <CloseIcon />
              </button>
            ) : (
              !isFocused && (
                <kbd
                  className="hidden md:inline-flex items-center gap-0.5 absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-[10px] px-1.5 py-1 rounded-md pointer-events-none select-none"
                  style={{ background: 'var(--ink-700)', color: 'var(--paper-0)' }}
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
          id="search-listbox"
          role="listbox"
          aria-label="City suggestions"
          className="absolute top-full mt-2 w-full rounded-2xl overflow-hidden fade-in"
          style={{ zIndex: 9999, background: 'var(--paper-0)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-card-hover)', maxHeight: '60vh', overflowY: 'auto' }}
        >
          {favorites.length > 0 && (
            <div className="p-3" style={{ borderBottom: '1px solid var(--line)' }}>
              <div className="flex items-center gap-2 px-2 py-1 mb-1" style={{ color: 'var(--amber-dark)' }}>
                <StarIcon />
                <h3 className="text-xs font-mono uppercase tracking-wide" style={{ color: 'var(--ink-500)' }}>Favorites</h3>
              </div>
              {favorites.slice(0, 3).map((fav, index) => {
                const optionId = `opt-fav-${fav.key || fav.name}`;
                const active = flatItems[highlightedIndex]?.id === optionId;
                return (
                  <button
                    key={index}
                    id={optionId}
                    role="option"
                    aria-selected={active}
                    onClick={() => { onFavoriteSelect(`${fav.name}, ${fav.country}`); setShowSuggestions(false); setHighlightedIndex(-1); }}
                    onMouseEnter={() => setHighlightedIndex(flatItems.findIndex((it) => it.id === optionId))}
                    className="w-full text-left px-4 py-3 rounded-xl transition-colors flex items-center justify-between"
                    style={{ background: active ? 'var(--paper-100)' : 'transparent' }}
                  >
                    <span className="font-medium text-sm" style={{ color: 'var(--ink-900)' }}>{fav.name}, {fav.country}</span>
                    <span className="font-mono text-sm" style={{ color: 'var(--ink-500)' }}>{formatFavTemp(fav)}</span>
                  </button>
                );
              })}
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="p-3" style={{ borderBottom: '1px solid var(--line)' }}>
              <div className="flex items-center gap-2 px-2 py-1 mb-1" style={{ color: 'var(--ink-500)' }}>
                <MapPinIcon />
                <h3 className="text-xs font-mono uppercase tracking-wide">Suggestions</h3>
              </div>
              {suggestions.map((city) => {
                const optionId = `opt-sugg-${city.id}`;
                const active = flatItems[highlightedIndex]?.id === optionId;
                return (
                  <button
                    key={city.id}
                    id={optionId}
                    role="option"
                    aria-selected={active}
                    onClick={() => handleSuggestionClick(formatCityLabel(city))}
                    onMouseEnter={() => setHighlightedIndex(flatItems.findIndex((it) => it.id === optionId))}
                    className="w-full text-left px-4 py-3 rounded-xl transition-colors flex items-center gap-3"
                    style={{ background: active ? 'var(--paper-100)' : 'transparent' }}
                  >
                    <MapPinIcon />
                    <span className="font-medium text-sm" style={{ color: 'var(--ink-900)' }}>{formatCityLabel(city)}</span>
                  </button>
                );
              })}
            </div>
          )}

          {recentSearches.length > 0 && (
            <div className="p-3">
              <div className="flex justify-between items-center px-2 py-1 mb-1">
                <h3 className="text-xs font-mono uppercase tracking-wide" style={{ color: 'var(--ink-500)' }}>Recent</h3>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs font-medium hover:underline p-2 -m-2 rounded"
                  style={{ color: 'var(--ink-500)' }}
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((city, index) => {
                const optionId = `opt-recent-${index}`;
                const active = flatItems[highlightedIndex]?.id === optionId;
                return (
                  <button
                    key={index}
                    id={optionId}
                    role="option"
                    aria-selected={active}
                    onClick={() => handleSuggestionClick(city)}
                    onMouseEnter={() => setHighlightedIndex(flatItems.findIndex((it) => it.id === optionId))}
                    className="w-full text-left px-4 py-3 rounded-xl transition-colors flex items-center gap-3"
                    style={{ background: active ? 'var(--paper-100)' : 'transparent' }}
                  >
                    <span className="text-sm" style={{ color: 'var(--ink-700)' }}>{city}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
