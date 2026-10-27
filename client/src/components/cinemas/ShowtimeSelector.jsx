import React from 'react';
import { getDayTabs } from '../../utils/formatDate';
import { Calendar } from 'lucide-react';

export const ShowtimeSelector = ({
  selectedDate,
  onSelectDate,
  selectedFormat,
  onSelectFormat
}) => {
  const tabs = getDayTabs(4);
  const formats = ['All', '2D', '3D', 'IMAX'];

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        padding: '1.25rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}
    >
      {/* Date Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
        <Calendar size={18} color="var(--accent-primary)" style={{ flexShrink: 0, marginRight: '0.25rem' }} />
        {tabs.map((tab) => {
          const isSelected = selectedDate === tab.date;
          return (
            <button
              key={tab.date}
              onClick={() => onSelectDate(tab.date)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: isSelected ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                minWidth: '70px',
                transition: 'all var(--transition-fast)'
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                {tab.weekday}
              </span>
              <span style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                {tab.dayNum}
              </span>
              <span style={{ fontSize: '0.7rem', color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>
                {tab.month}
              </span>
            </button>
          );
        })}
      </div>

      {/* Format Filter */}
      {selectedFormat !== undefined && onSelectFormat && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Format:
          </span>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {formats.map((fmt) => {
              const isSelected = selectedFormat === fmt;
              return (
                <button
                  key={fmt}
                  onClick={() => onSelectFormat(fmt)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    background: isSelected ? 'var(--accent-subtle)' : 'var(--bg-secondary)',
                    border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                    color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)'
                  }}
                >
                  {fmt}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
