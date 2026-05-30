// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

/** Returns a safe http(s) URL for display, or empty string when absent/invalid. */
export function displayLinkUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed.length === 0) {
    return '';
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return trimmed;
    }
  } catch {
    return '';
  }

  return '';
}
