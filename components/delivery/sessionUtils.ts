import type { DriverMealSessionDto } from "@/lib/drivers/types";

function parseCollectionTime(
  timeStr: string,
  sessionDate?: string | null
): Date | null {
  const d = new Date(timeStr);
  if (!isNaN(d.getTime())) return d;

  if (sessionDate) {
    const datePrefix = sessionDate.split("T")[0];
    const combined = new Date(`${datePrefix}T${timeStr}`);
    if (!isNaN(combined.getTime())) return combined;
  }

  return null;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function getSessionDateLabel(session: DriverMealSessionDto): string {
  const dateStr = session.sessionDate;
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export function getSessionTimeRange(session: DriverMealSessionDto): string {
  // Earliest pickup time from restaurants
  const times: Date[] = [];

  for (const restaurant of session.restaurants) {
    if (restaurant.collectionTime) {
      const d = parseCollectionTime(restaurant.collectionTime, session.sessionDate);
      if (d) times.push(d);
    }
  }

  // Delivery / event time
  const eventDate = session.eventTime
    ? parseCollectionTime(session.eventTime, session.sessionDate)
    : null;

  const earliest =
    times.length > 0
      ? new Date(Math.min(...times.map((d) => d.getTime())))
      : null;

  if (!earliest && !eventDate) return "";
  if (earliest && eventDate)
    return `${formatTime(earliest)} – ${formatTime(eventDate)}`;
  if (earliest) return formatTime(earliest);
  if (eventDate) return formatTime(eventDate);
  return "";
}
