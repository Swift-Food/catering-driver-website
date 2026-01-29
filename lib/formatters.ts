/**
 * Format a date string as DD-MM-YYYY.
 * Returns fallback if the input is empty or unparseable.
 */
export function formatDate(
  dateStr?: string | null,
  fallback = ""
): string {
  if (!dateStr) return fallback;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  } catch {
    return dateStr;
  }
}

/**
 * Format a date/time string to 12-hour time with AM/PM (e.g. "2:30 PM").
 * Handles both full ISO strings and time-only strings like "11:00".
 * Returns fallback if the input is empty or unparseable.
 */
export function formatTime(
  dateStr?: string | null,
  fallback = ""
): string {
  if (!dateStr) return fallback;
  try {
    let date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      // Try as time-only string (e.g. "11:00", "2:30 PM")
      date = new Date(`1970-01-01T${dateStr}`);
      if (isNaN(date.getTime())) return dateStr;
    }
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format a Date object to 12-hour time with AM/PM.
 */
export function formatTimeFromDate(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
