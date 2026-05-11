function sanitizeDetails(details = {}) {
  return Object.fromEntries(
    Object.entries(details).filter(([, value]) => value !== undefined),
  );
}

export function logInfo(event, details = {}) {
  const payload = sanitizeDetails(details);
  if (Object.keys(payload).length === 0) {
    console.info(`[${event}]`);
    return;
  }

  console.info(`[${event}] ${JSON.stringify(payload)}`);
}
