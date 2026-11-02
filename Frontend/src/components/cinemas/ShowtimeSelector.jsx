import React from 'react';
import { getDayTabs } from '../../utils/formatDate';
import { Calendar, Globe2, Film, Sparkles, Check } from 'lucide-react';

/**
 * District-style Date & Language Showtime Selector
 * Allows date-wise navigation with live show counts per day (e.g. 3rd Nov: 14 shows, 4th Nov: 18 shows)
 * and individual film language selection.
 */
export const ShowtimeSelector = ({
  selectedDate,
  onSelectDate,
  selectedFormat = 'All',
  onSelectFormat,
  languages = [],
  selectedLanguage,
  onSelectLanguage,
  dateShowCounts = {}
}) => {
  const tabs = getDayTabs(6); // 7 days of schedule
  const formats = ['All', '2D', '3D', 'IMAX'];

  return (
    <div
      style={{
        background: 'rgba(29, 29, 38, 0.85)',
        backdropFilter: 'blur(16px)',
        padding: '1.5rem',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid rgba(229, 9, 20, 0.25)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}
    >
      {/* Top Header: Section Title + District App Style Date Selector */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(229, 9, 20, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={18} color="var(--accent-primary)" />
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, display: 'block' }}>
                District Show Schedule
              </span>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF' }}>
                Select Show Date & Timings
              </h4>
            </div>
          </div>

          <span style={{ fontSize: '0.8rem', color: '#2EAD72', background: 'rgba(46, 173, 114, 0.12)', border: '1px solid rgba(46, 173, 114, 0.3)', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
            ⚡ Instant Seat Locking Available
          </span>
        </div>

        {/* District-style Date Ribbon with Show Count Badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'stretch',
            gap: '0.65rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
            scrollbarWidth: 'thin'
          }}
        >
          {tabs.map((tab) => {
            const isSelected = selectedDate === tab.date;
            const count = dateShowCounts[tab.date] ?? null;

            return (
              <button
                key={tab.date}
                onClick={() => onSelectDate(tab.date)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-lg)',
                  background: isSelected
                    ? 'linear-gradient(180deg, #E53945 0%, #B31E28 100%)'
                    : 'rgba(22, 22, 29, 0.95)',
                  color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                  border: isSelected
                    ? '1px solid #FF6B75'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  minWidth: '94px',
                  boxShadow: isSelected ? '0 4px 20px rgba(229, 57, 69, 0.45)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isSelected ? 'translateY(-2px)' : 'none'
                }}
              >
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    letterSpacing: '0.5px',
                    color: isSelected ? '#FFE4E6' : 'var(--text-muted)',
                    textTransform: 'uppercase',
                    marginBottom: '2px'
                  }}
                >
                  {tab.weekday}
                </span>

                <span style={{ fontSize: '1.25rem', fontWeight: 900, lineHeight: 1.1 }}>
                  {tab.dayNum}
                </span>

                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: isSelected ? '#FFFFFF' : 'var(--text-muted)',
                    marginTop: '2px'
                  }}
                >
                  {tab.month}
                </span>

                {/* District-style Show Count Badge (e.g. 3rd Nov • 14 Shows) */}
                <span
                  style={{
                    marginTop: '0.4rem',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.45rem',
                    borderRadius: 'var(--radius-full)',
                    background: isSelected
                      ? 'rgba(0, 0, 0, 0.35)'
                      : count && count > 0
                        ? 'rgba(46, 173, 114, 0.15)'
                        : 'rgba(255, 255, 255, 0.06)',
                    color: isSelected
                      ? '#FFFFFF'
                      : count && count > 0
                        ? '#2EAD72'
                        : 'var(--text-muted)',
                    border: isSelected
                      ? '1px solid rgba(255, 255, 255, 0.25)'
                      : count && count > 0
                        ? '1px solid rgba(46, 173, 114, 0.25)'
                        : '1px solid transparent',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {count !== null ? (count > 0 ? `${count} Shows` : 'No Shows') : 'Shows Available'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Filter Bar: Individual Film Languages + Formats */}
      <div
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}
      >
        {/* Requirement 3: Individual Film Language Filter - don't add all languages together */}
        {languages && languages.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>
              <Globe2 size={15} color="var(--accent-primary)" />
              <span>Film Language:</span>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {/* Individual languages of this specific film */}
              {languages.map((lang, idx) => {
                const isSelected = selectedLanguage === lang;
                const isPrimary = idx === 0;

                return (
                  <button
                    key={lang}
                    onClick={() => onSelectLanguage && onSelectLanguage(lang)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.4rem 0.85rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      background: isSelected
                        ? 'linear-gradient(90deg, rgba(229, 9, 20, 0.25) 0%, rgba(229, 9, 20, 0.4) 100%)'
                        : 'rgba(22, 22, 29, 0.8)',
                      border: isSelected
                        ? '1px solid var(--accent-primary)'
                        : '1px solid rgba(255, 255, 255, 0.12)',
                      color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                      boxShadow: isSelected ? '0 0 12px rgba(229, 9, 20, 0.35)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isSelected && <Check size={13} color="var(--accent-primary)" />}
                    <span>{lang}</span>
                    {isPrimary && (
                      <span style={{ fontSize: '0.65rem', color: isSelected ? '#FFA8AE' : 'var(--text-muted)', fontWeight: 600 }}>
                        (Original)
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Option to view all languages if film has multiple */}
              {languages.length > 1 && (
                <button
                  onClick={() => onSelectLanguage && onSelectLanguage('All')}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    background: selectedLanguage === 'All' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                    border: `1px solid ${selectedLanguage === 'All' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
                    color: selectedLanguage === 'All' ? '#FFFFFF' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  All Languages
                </button>
              )}
            </div>
          </div>
        )}

        {/* Format Selector: 2D, 3D, IMAX */}
        {selectedFormat !== undefined && onSelectFormat && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Film size={14} color="var(--accent-primary)" />
              <span>Format:</span>
            </span>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {formats.map((fmt) => {
                const isSelected = selectedFormat === fmt;
                return (
                  <button
                    key={fmt}
                    onClick={() => onSelectFormat(fmt)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      background: isSelected ? 'var(--accent-primary)' : 'rgba(22, 22, 29, 0.8)',
                      border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.1)'}`,
                      color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                      cursor: 'pointer'
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
    </div>
  );
};
