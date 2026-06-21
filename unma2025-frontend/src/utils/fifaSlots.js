/** First published slot that is still open for predictions. */
export function getActiveFifaSlot(slots) {
  if (!slots?.length) return null;
  return slots.find((s) => !s.locked) ?? null;
}

/** Milliseconds until closesAt; 0 if past or invalid. */
export function getMsUntilClose(closesAt) {
  if (!closesAt) return 0;
  return Math.max(0, new Date(closesAt).getTime() - Date.now());
}

export function formatCountdown(ms) {
  if (ms <= 0) return null;

  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  const pad = (n) => String(n).padStart(2, "0");

  if (days > 0) {
    return { days, hours, mins, secs, label: `${days}d ${pad(hours)}h ${pad(mins)}m ${pad(secs)}s` };
  }

  return { days: 0, hours, mins, secs, label: `${pad(hours)}h ${pad(mins)}m ${pad(secs)}s` };
}
