import {
  format,
  formatDistanceToNow,
  isToday,
  isThisWeek,
  isThisYear,
  parseISO,
} from 'date-fns';

/**
 * Format a date to a human-readable string.
 */
export function formatDate(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (isToday(d)) return format(d, 'h:mm a');
  if (isThisYear(d)) return format(d, 'MMM d');
  return format(d, 'MMM d, yyyy');
}

/**
 * Format a date as a relative time string (e.g. "2 hours ago").
 */
export function formatRelativeTime(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Format a date with full detail for tooltips.
 */
export function formatFullDate(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMMM d, yyyy h:mm a');
}

/**
 * Group notifications/items by time period.
 */
export function groupByTimePeriod(items, dateField = 'createdAt') {
  const groups = { today: [], thisWeek: [], earlier: [] };
  items.forEach((item) => {
    const d = typeof item[dateField] === 'string' ? parseISO(item[dateField]) : item[dateField];
    if (isToday(d)) {
      groups.today.push(item);
    } else if (isThisWeek(d)) {
      groups.thisWeek.push(item);
    } else {
      groups.earlier.push(item);
    }
  });
  return groups;
}

/**
 * Returns avatar URL or null for initials fallback.
 */
export function getAvatarUrl(avatar) {
  if (!avatar) return null;
  if (avatar.startsWith('http') || avatar.startsWith('blob:') || avatar.startsWith('data:')) return avatar;
  const backendBase = (import.meta.env.VITE_API_URL || 'https://socialwave-app.onrender.com/api').replace(/\/api\/?$/, '');
  const cleanPath = avatar.startsWith('/') ? avatar : `/${avatar}`;
  return `${backendBase}${cleanPath}`;
}

/**
 * Format a large number to compact form (1000 → 1K, 1000000 → 1M).
 */
export function formatNumber(num) {
  if (!num && num !== 0) return '0';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(num);
}

/**
 * Truncate text to a specified length.
 */
export function truncateText(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
}

/**
 * Extract hashtags from text.
 */
export function extractHashtags(text) {
  if (!text) return [];
  const matches = text.match(/#[a-zA-Z0-9_]+/g) || [];
  return [...new Set(matches.map((tag) => tag.toLowerCase()))];
}

/**
 * Get initials from a name string.
 */
export function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Generate a consistent background color for a username/name (for avatars).
 */
export function getAvatarColor(name) {
  const colors = [
    '#1877F2', '#42B72A', '#E91E63', '#9C27B0', '#FF9800',
    '#009688', '#F44336', '#3F51B5', '#00BCD4', '#795548',
  ];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Highlight hashtags in text, returning segments.
 * Returns array of { text, isHashtag } objects.
 */
export function parseHashtags(text) {
  if (!text) return [{ text: '', isHashtag: false }];
  const parts = text.split(/(#[a-zA-Z0-9_]+)/g);
  return parts.map((part) => ({
    text: part,
    isHashtag: /^#[a-zA-Z0-9_]+$/.test(part),
  }));
}

/**
 * Returns a media URL (prepends /uploads if not absolute).
 */
export function getMediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
  const backendBase = (import.meta.env.VITE_API_URL || 'https://socialwave-app.onrender.com/api').replace(/\/api\/?$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${backendBase}${cleanPath}`;
}

/**
 * Debounce function.
 */
export function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}
