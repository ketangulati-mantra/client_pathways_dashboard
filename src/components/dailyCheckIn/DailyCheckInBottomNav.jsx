import React, { useState } from 'react';
import { Plus, Wrench, Users, BarChart3 } from 'lucide-react';

export default function DailyCheckInBottomNav({ activeTab = 'checkin', onSelectTab }) {
  const [currentTab, setCurrentTab] = useState(activeTab);

  const tabs = [
    { id: 'checkin', label: 'Check in', icon: Plus, isAction: true },
    { id: 'tools', label: 'Tools', icon: Wrench },
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'analyze', label: 'Analyze', icon: BarChart3 }
  ];

  const handleTabClick = (tabId) => {
    setCurrentTab(tabId);
    if (onSelectTab) onSelectTab(tabId);
  };

  return (
    <nav
      style={{
        height: '60px',
        padding: '0 16px',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'rgba(5, 7, 14, 0.98)',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        position: 'sticky',
        bottom: 0,
        zIndex: 30,
        boxSizing: 'border-box'
      }}
    >
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        const IconComp = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabClick(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              color: isActive ? '#38bdf8' : '#64748b',
              cursor: 'pointer',
              padding: '6px 16px',
              outline: 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              <IconComp
                size={tab.isAction ? 22 : 18}
                strokeWidth={isActive ? 2.5 : 2}
                color={isActive ? (tab.isAction ? '#f43f5e' : '#38bdf8') : '#64748b'}
              />
            </div>
            <span
              style={{
                fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, sans-serif',
                fontSize: '0.72rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#f8fafc' : '#64748b'
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
