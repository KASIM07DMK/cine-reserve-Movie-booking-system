export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

export const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

export const getDayTabs = (daysAhead = 4) => {
  const tabs = [];
  const today = new Date();

  for (let i = 0; i <= daysAhead; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    let label = '';
    if (i === 0) label = 'Today';
    else if (i === 1) label = 'Tomorrow';
    else {
      label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    }

    tabs.push({
      date: d.toISOString().split('T')[0],
      label,
      dayNum: d.getDate(),
      month: d.toLocaleDateString('en-IN', { month: 'short' }),
      weekday: d.toLocaleDateString('en-IN', { weekday: 'short' })
    });
  }

  return tabs;
};
