/**
 * Parses an online time string (e.g., "1h 30m" or "45m") into total seconds.
 * @param timeStr The time string from the backend.
 * @returns Total seconds.
 */
export const parseOnlineTimeToSeconds = (timeStr: string | undefined): number => {
  if (!timeStr) return 0;

  let totalSeconds = 0;
  
  // Regex to find hours and minutes in strings like "1h 30m", "45m", "2h", "1 h 30 m"
  const hourMatch = timeStr.match(/(\d+)\s*h/i);
  const minuteMatch = timeStr.match(/(\d+)\s*m/i);

  if (hourMatch) {
    totalSeconds += parseInt(hourMatch[1], 10) * 3600;
  }
  
  if (minuteMatch) {
    totalSeconds += parseInt(minuteMatch[1], 10) * 60;
  }

  return totalSeconds;
};

/**
 * Formats seconds into a human-readable string with units.
 * @param totalSeconds Total seconds.
 * @param labels Optional labels for hours, minutes, and seconds.
 * @returns Formatted string.
 */
export const formatOnlineTime = (
  totalSeconds: number,
  labels: { h: string; m: string; s: string } = { h: 'h', m: 'm', s: 's' }
): string => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const sec = totalSeconds % 60;

  if (h > 0) {
    return `${h}${labels.h} ${m}${labels.m}`;
  }
  if (m > 0) {
    return `${m}${labels.m} ${sec}${labels.s}`;
  }
  return `${sec}${labels.s}`;
};
