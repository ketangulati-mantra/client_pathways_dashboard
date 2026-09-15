const fs = require('fs');

const content = `import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Filter } from 'lucide-react';
import { PATHWAYS } from '../mantra/pathways';

// Highlight matched text in search results
const HighlightText = ({ text, highlight }) => {
  if (!highlight.trim()) return <span>{text}</span>;
  
  const regex = new RegExp(\`(\${highlight})\`, 'gi');
  const parts = text.split(regex);
  
  return (
    <span>
      {parts.map((part, i) => 
        regex.test(part) ? <span key={i} style={{ background: '#fef08a', color: '#854d0e', padding: '0 2px', borderRadius: '2px' }}>{part}</span> : part
      )}
    </span>
  );
};

const PathwayFilter = ({ selectedPathway, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const filterRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredPathways = PATHWAYS.filter(p => 
    p.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div ref={filterRef} style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '12px 16px', background: '#ffffff',
          border: '1px solid #e5e7eb', borderRadius: '12px', cursor: 'pointer',
          fontSize: '0.95rem', color: 'var(--text-main)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="#64748b" />
          <span style={{ fontWeight: 500 }}>{selectedPathway}</span>
        </div>
        <ChevronDown size={16} color="#9ca3af" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
          background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', zIndex: 50, overflow: 'hidden'
        }}>
          <div style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', background: '#f8fafc' }}>
            <input 
              type="text" 
              placeholder="Search pathways..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '8px',
                border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
            />
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '8px' }}>
            <button
              onClick={() => { onSelect('All Pathways'); setIsOpen(false); setFilterQuery(''); }}
              style={{
                width: '100%', textAlign: 'left', padding: '10px 12px',
                background: selectedPathway === 'All Pathways' ? '#f0f9ff' : 'transparent',
                border: 'none', borderRadius: '8px', cursor: 'pointer',
                fontSize: '0.9rem', color: selectedPathway === 'All Pathways' ? '#0284c7' : 'var(--text-main)',
                fontWeight: selectedPathway === 'All Pathways' ? 600 : 400
              }}
            >
              All Pathways
            </button>
            {filteredPathways.map(pathway => (
              <button
                key={pathway}
                onClick={() => { onSelect(pathway); setIsOpen(false); setFilterQuery(''); }}
                style={{
                  width: '100%', textAlign: 'left', padding: '10px 12px',
                  background: selectedPathway === pathway ? '#f0f9ff' : 'transparent',
                  border: 'none', borderRadius: '8px', cursor: 'pointer',
                  fontSize: '0.9rem', color: selectedPathway === pathway ? '#0284c7' : 'var(--text-main)',
                  fontWeight: selectedPathway === pathway ? 600 : 400
                }}
              >
                {pathway}
              </button>
            ))}
            {filteredPathways.length === 0 && (
              <div style={{ padding: '12px', fontSize: '0.9rem', color: '#94a3b8', textAlign: 'center' }}>No pathways found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function ClientDashboard({ tasks, onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPathway, setSelectedPathway] = useState('All Pathways');
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (searchInputRef.current && document.activeElement !== searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const cleanQuery = searchQuery.trim().toLowerCase().replace(/\\s+/g, ' ');
  
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !cleanQuery || (task.title || '').toLowerCase().includes(cleanQuery) || (task.category || '').toLowerCase().includes(cleanQuery);
    const matchesPathway = selectedPathway === 'All Pathways' || task.pathway === selectedPathway;
    return matchesSearch && matchesPathway;
  });

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh', 
      background: 'var(--bg-app)', 
      padding: '36px 20px'
    }} className="animate-fade-in">
      <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '10px' }}>
          <span style={{ fontSize: '1.5rem' }}>✨</span>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
            Client Dashboard
          </h1>
        </div>
        
        <PathwayFilter selectedPathway={selectedPathway} onSelect={setSelectedPathway} />
        
        {/* Search Bar */}
        <div style={{ position: 'relative', marginTop: '4px' }}>
          <div style={{
            position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
            color: '#9ca3af', display: 'flex', alignItems: 'center', pointerEvents: 'none'
          }}>
            <Search size={18} />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search lessons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', height: '48px', padding: '0 16px 0 42px',
              borderRadius: '12px', border: '1px solid #e5e7eb', background: '#ffffff',
              fontSize: '0.95rem', color: 'var(--text-main)', outline: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)', transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
          <div style={{
            position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
            fontSize: '0.7rem', color: '#9ca3af', background: '#f3f4f6',
            padding: '4px 8px', borderRadius: '6px', pointerEvents: 'none',
            fontWeight: 700, border: '1px solid #e5e7eb'
          }}>
            Ctrl K
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', padding: '0 4px' }}>
          <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
            {cleanQuery ? \`Found \${filteredTasks.length} results\` : \`Showing all \${tasks.length} activities\`}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
          {filteredTasks.length === 0 ? (
            <div style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '48px 20px', background: '#fff', borderRadius: '16px',
              border: '1px dashed #eef0f3', textAlign: 'center', color: 'var(--text-secondary)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🔍</div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 6px' }}>
                No lessons found
              </h3>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                Try adjusting your search or pathway filter.
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div 
                key={task.id} 
                className="academy-card animate-slide-up" 
                style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  flexWrap: 'wrap', gap: '16px', background: '#fff'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                    <HighlightText text={task.title} highlight={cleanQuery} />
                  </h3>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    <span>Duration: {task.duration}</span>
                    <span>•</span>
                    <span style={{ color: 'var(--color-accent-orange)', fontWeight: 600 }}>Points: {task.points}</span>
                  </div>
                </div>
                <button 
                  onClick={() => onNavigate(task.path)}
                  style={{
                    padding: '10px 20px', borderRadius: 'var(--radius-md)',
                    background: 'var(--gradient-primary)', color: '#fff',
                    border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem'
                  }}
                >
                  Open Lesson
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/views/ClientDashboard.jsx', content);
console.log('ClientDashboard updated to use PathwayFilter');
