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

export const getOrdinalSuffix = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

export const toLocalDateString = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDayTabs = (daysAhead = 6) => {
  const tabs = [];
  const today = new Date();

  for (let i = 0; i <= daysAhead; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const dayNum = d.getDate();
    const suffix = getOrdinalSuffix(dayNum);
    const month = d.toLocaleDateString('en-IN', { month: 'short' });
    const weekday = d.toLocaleDateString('en-IN', { weekday: 'short' });

    let label = '';
    if (i === 0) label = 'Today';
    else if (i === 1) label = 'Tomorrow';
    else {
      label = `${weekday}, ${dayNum}${suffix} ${month}`;
    }

    tabs.push({
      date: toLocalDateString(d),
      label,
      dayNum,
      suffix,
      formattedDayMonth: `${dayNum}${suffix} ${month}`,
      month,
      weekday: i === 0 ? 'TODAY' : weekday.toUpperCase()
    });
  }

  return tabs;
};
