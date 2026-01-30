import type { DriverMealSessionDto } from "@/lib/drivers/types";
import { formatDateLabel, formatTimeFromDate } from "@/lib/formatters";

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

export function getSessionDateLabel(session: DriverMealSessionDto): string {
  return formatDateLabel(session.sessionDate);
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
    return `${formatTimeFromDate(earliest)} – ${formatTimeFromDate(eventDate)}`;
  if (earliest) return formatTimeFromDate(earliest);
  if (eventDate) return formatTimeFromDate(eventDate);
  return "";
}
