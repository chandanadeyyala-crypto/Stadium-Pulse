/**
 * Formats data sources and active timestamps into clean citations.
 */
export function formatSource(sourceName, timestamp = new Date()) {
  const timeStr = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `Verified Source: ${sourceName} · Updated at ${timeStr}`;
}
