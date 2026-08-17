import React, { useState, useEffect, useRef } from 'react';
import { COUNTRY_LIST, detectCountryCodeByIP } from '../../utils/countryData';
import { Search, ChevronDown, Check } from 'lucide-react';

export default function PhoneInputWithCountry({
  countryCode,
  setCountryCode,
  phoneNumber,
  setPhoneNumber,
  placeholder = 'Phone Number',
  onBlur,
  error
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Auto-detect country code by IP on mount
  useEffect(() => {
    let isMounted = true;
    detectCountryCodeByIP().then(code => {
      if (isMounted && setCountryCode && code) {
        setCountryCode(code);
      }
    });
    return () => { isMounted = false; };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const selectedCountry = COUNTRY_LIST.find(c => c.dialCode === countryCode) || 
    COUNTRY_LIST.find(c => c.code === 'IN') || COUNTRY_LIST[0];

  const filteredCountries = COUNTRY_LIST.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.dialCode.includes(searchQuery)
  );

  const handleSelect = (c) => {
    if (setCountryCode) {
      setCountryCode(c.dialCode);
    }
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleNumberChange = (e) => {
    const val = e.target.value.replace(/[^\d\s-]/g, '');
    if (setPhoneNumber) {
      setPhoneNumber(val);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', position: 'relative' }} ref={dropdownRef}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        border: error ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
        borderRadius: '10px',
        background: '#ffffff',
        overflow: 'visible',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        transition: 'all 0.15s ease'
      }}>
        {/* Searchable Country Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: '0 10px',
            border: 'none',
            borderRight: '1px solid #cbd5e1',
            background: '#f8fafc',
            fontSize: '0.82rem',
            fontWeight: 800,
            color: '#0f172a',
            outline: 'none',
            cursor: 'pointer',
            height: '46px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            flexShrink: 0,
            whiteSpace: 'nowrap',
            maxWidth: '115px',
            borderTopLeftRadius: '10px',
            borderBottomLeftRadius: '10px'
          }}
        >
          <span>{selectedCountry.code}</span>
          <span style={{ color: '#2563eb' }}>{selectedCountry.dialCode}</span>
          <ChevronDown size={14} style={{ color: '#64748b', flexShrink: 0, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
        </button>

        {/* Number Input Field */}
        <input
          type="tel"
          placeholder={placeholder}
          value={phoneNumber || ''}
          onChange={handleNumberChange}
          onBlur={onBlur}
          style={{
            flex: 1,
            minWidth: 0,
            width: '100%',
            padding: '10px 12px',
            border: 'none',
            fontSize: '0.88rem',
            color: '#0f172a',
            outline: 'none',
            background: 'transparent',
            height: '46px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Floating Searchable Country Selector Popover */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          zIndex: 99999,
          width: '320px',
          maxWidth: '90vw',
          maxHeight: '320px',
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 12px 32px rgba(15,23,42,0.18)',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.15s ease'
        }}>
          {/* Sticky Search Header */}
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', position: 'sticky', top: 0, zIndex: 2 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              borderRadius: '8px',
              padding: '6px 10px'
            }}>
              <Search size={14} color="#64748b" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country or code..."
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.82rem',
                  width: '100%',
                  color: '#0f172a',
                  background: 'transparent'
                }}
              />
            </div>
          </div>

          {/* Scrollable Country List */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '4px 0' }}>
            {filteredCountries.length > 0 ? (
              filteredCountries.map((c) => {
                const isSelected = c.dialCode === selectedCountry.dialCode && c.code === selectedCountry.code;
                return (
                  <button
                    key={`${c.code}-${c.dialCode}`}
                    type="button"
                    onClick={() => handleSelect(c)}
                    style={{
                      width: '100%',
                      padding: '8px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: 'none',
                      background: isSelected ? '#eff6ff' : 'transparent',
                      color: isSelected ? '#1d4ed8' : '#334155',
                      fontSize: '0.84rem',
                      fontWeight: isSelected ? 800 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.1s'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, overflow: 'hidden' }}>
                      <span style={{ fontSize: '1rem' }}>{c.flag}</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                      <span style={{ color: '#94a3b8', fontSize: '0.74rem' }}>({c.code})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '0.82rem' }}>{c.dialCode}</span>
                      {isSelected && <Check size={14} color="#2563eb" />}
                    </div>
                  </button>
                );
              })
            ) : (
              <div style={{ padding: '16px', fontSize: '0.82rem', color: '#64748b', textAlign: 'center' }}>
                No country found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <span style={{ fontSize: '0.76rem', color: '#ef4444', fontWeight: 700 }}>
          {error}
        </span>
      )}
    </div>
  );
}
