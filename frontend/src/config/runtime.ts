function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function getDefaultHttpOrigin(): string {
  return window.location.origin;
}

function getDefaultWsOrigin(): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}`;
}

function normalizeHttpBase(value: string | undefined): string {
  if (!value) return '';

  const trimmed = trimTrailingSlash(value.trim());
  if (!trimmed) return '';

  if (/^https?:\/\//.test(trimmed)) {
    return trimTrailingSlash(trimmed);
  }

  if (trimmed.startsWith('/')) {
    return trimTrailingSlash(`${getDefaultHttpOrigin()}${trimmed}`);
  }

  return trimTrailingSlash(`${getDefaultHttpOrigin()}/${trimmed}`);
}

function normalizeWsUrl(value: string | undefined): string {
  if (!value) return `${getDefaultWsOrigin()}/ws`;

  const trimmed = value.trim();
  if (!trimmed) return `${getDefaultWsOrigin()}/ws`;

  if (/^wss?:\/\//.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('/')) {
    return `${getDefaultWsOrigin()}${trimmed}`;
  }

  return `${getDefaultWsOrigin()}/${trimmed}`;
}

const rawApiBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
const rawWsUrl = import.meta.env.VITE_WS_URL as string | undefined;
const apiBase = normalizeHttpBase(rawApiBase);

export const API_BASE_URL = apiBase ? `${apiBase}/api` : '/api';
export const WS_URL = normalizeWsUrl(rawWsUrl);
