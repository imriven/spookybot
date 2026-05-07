export const MIN_TIMER_INTERVAL_MS = 30000;
export const MAX_TIMER_INTERVAL_MS = 86400000;

export function isValidTimerInterval(value) {
  return Number.isInteger(value) && value >= MIN_TIMER_INTERVAL_MS && value <= MAX_TIMER_INTERVAL_MS;
}
