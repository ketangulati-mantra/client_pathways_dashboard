import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, Plus, Loader2, X } from 'lucide-react';

export default function SearchableSelect({
  label,
  value = '',
  onChange,
  options = [],
  fetchOptions,
  placeholder = 'Search or select option...',
  allowCustom = true,
  error,
  disabled = false
}) {
  const [query, setQuery] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const isUserTypingRef = useRef(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Sync internal query with external value changes (only if user is not actively typing)
  useEffect(() => {
    if (!isUserTypingRef.current) {
      setQuery(value || '');
    }
  }, [value]);

  // Load / Filter options based on local array or remote fetchOptions
  useEffect(() => {
    let active = true;

    async function updateOptions() {
      if (fetchOptions) {
        try {
          // Only show spinner when dropdown is open and user is actively typing a query
          if (isUserTypingRef.current && query.trim().length >= 2 && isOpen) {
            setIsLoading(true);
          }
          const remoteData = await fetchOptions(query);
          if (active) {
            const formatted = (remoteData || []).map(opt => typeof opt === 'string' ? { label: opt, value: opt } : opt);
            setFilteredOptions(formatted);
          }
        } catch (err) {
          console.error('[SearchableSelect] Error fetching remote options:', err);
        } finally {
          if (active) setIsLoading(false);
        }
      } else {
        const normalized = (options || []).map(opt => typeof opt === 'string' ? { label: opt, value: opt } : opt);
        const search = query.toLowerCase().trim();
        const matches = search
          ? normalized.filter(opt => opt.label.toLowerCase().includes(search))
          : normalized;
        setFilteredOptions(matches);
      }
    }

    updateOptions();

    return () => {
      active = false;
    };
  }, [query, options, fetchOptions, isOpen]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
        isUserTypingRef.current = false;
        // Re-sync query to selected value if user didn't pick an option
        setQuery(value || '');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  const handleSelect = (option, isCustom = false) => {
    const finalVal = option.value || option.label;
    isUserTypingRef.current = false;
    setQuery(finalVal);
    setIsOpen(false);
    setHighlightedIndex(-1);
    if (onChange) {
      onChange(finalVal, { isCustom, label: option.label });
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    isUserTypingRef.current = false;
    setQuery('');
    setIsOpen(true);
    if (onChange) onChange('', { isCustom: false });
    if (inputRef.current) inputRef.current.focus();
  };

  const hasExactMatch = filteredOptions.some(
    opt => opt.label.toLowerCase().trim() === query.toLowerCase().trim()
  );

  const isCurrentValueSelected = Boolean(value) && query.trim().toLowerCase() === value.trim().toLowerCase() && !isUserTypingRef.current;

  const showAddCustomOption = allowCustom && query.trim() !== '' && !hasExactMatch && !isCurrentValueSelected;
  const totalNavItems = filteredOptions.length + (showAddCustomOption ? 1 : 0);

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      setHighlightedIndex(0);
      return;
    }

    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1 < totalNavItems ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev - 1 >= 0 ? prev - 1 : totalNavItems - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        handleSelect(filteredOptions[highlightedIndex], false);
      } else if (showAddCustomOption && (highlightedIndex === filteredOptions.length || highlightedIndex === -1)) {
        handleSelect({ label: query.trim(), value: query.trim() }, true);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
      isUserTypingRef.current = false;
      setQuery(value || '');
    }
  };

  // Substring text highlighting
  const renderHighlightedLabel = (text, searchQuery) => {
    if (!searchQuery.trim()) return text;
    const parts = text.split(new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, idx) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <strong key={idx} style={{ color: '#2563eb', fontWeight: 800, background: '#eff6ff' }}>{part}</strong>
      ) : (
        part
      )
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', position: 'relative' }} ref={containerRef}>
      {label && (
        <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
          {label}
        </label>
      )}

      {/* Control Container */}
      <div style={{ position: 'relative', width: '100%' }}>
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          placeholder={placeholder}
          value={query}
          onFocus={() => {
            setIsOpen(true);
          }}
          onChange={(e) => {
            isUserTypingRef.current = true;
            setQuery(e.target.value);
            setIsOpen(true);
            if (onChange) onChange(e.target.value, { isCustom: true });
          }}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          style={{
            width: '100%',
            height: '44px',
            padding: '0 38px 0 14px',
            borderRadius: '10px',
            border: error ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#0f172a',
            background: disabled ? '#f1f5f9' : '#ffffff',
            boxSizing: 'border-box',
            outline: 'none',
            transition: 'border-color 0.15s ease'
          }}
        />

        {/* Clear & Dropdown Icon Controls */}
        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isLoading && isUserTypingRef.current ? (
            <Loader2 size={16} className="animate-spin" color="#2563eb" />
          ) : query ? (
            <button
              type="button"
              onClick={handleClear}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}
            >
              <X size={16} />
            </button>
          ) : (
            <ChevronDown size={16} color="#64748b" style={{ pointerEvents: 'none' }} />
          )}
        </div>
      </div>

      {error && <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}>{error}</div>}

      {/* Floating Options Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            maxHeight: '260px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '14px',
            boxShadow: '0 12px 28px rgba(0, 0, 0, 0.15)',
            zIndex: 999,
            marginTop: '6px',
            overflowY: 'auto',
            padding: '4px 0'
          }}
        >
          {filteredOptions.length === 0 && !showAddCustomOption && (
            <div style={{ padding: '12px', fontSize: '0.84rem', color: '#94a3b8', textAlign: 'center' }}>
              No matching options found
            </div>
          )}

          {filteredOptions.map((opt, idx) => {
            const isSelected = value.toLowerCase().trim() === opt.value.toLowerCase().trim();
            const isHighlighted = idx === highlightedIndex;

            return (
              <div
                key={`${opt.value}-${idx}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(opt, false);
                }}
                onMouseEnter={() => setHighlightedIndex(idx)}
                style={{
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  background: isHighlighted ? '#eff6ff' : isSelected ? '#f8fafc' : 'transparent',
                  color: isSelected ? '#2563eb' : '#0f172a',
                  fontWeight: isSelected ? 800 : 500
                }}
              >
                <span>{renderHighlightedLabel(opt.label, query)}</span>
                {isSelected && <Check size={16} color="#2563eb" />}
              </div>
            );
          })}

          {/* + Add Custom Option Entry */}
          {showAddCustomOption && (
            <div
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect({ label: query.trim(), value: query.trim() }, true);
              }}
              onMouseEnter={() => setHighlightedIndex(filteredOptions.length)}
              style={{
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '0.88rem',
                fontWeight: 700,
                color: '#2563eb',
                borderTop: filteredOptions.length > 0 ? '1px solid #e2e8f0' : 'none',
                background: highlightedIndex === filteredOptions.length ? '#eff6ff' : '#f8fafc'
              }}
            >
              <Plus size={16} />
              <span>Add "{query.trim()}"</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
