const DEFAULT_API_BASE_URL = 'http://localhost:8081/api';

function normalizeBaseUrl(value: string) {
  return value.replace(/\/$/, '');
}

function toWebSocketUrl(apiBaseUrl: string) {
  const baseWithoutApiSuffix = apiBaseUrl.replace(/\/api$/, '');

  if (baseWithoutApiSuffix.startsWith('https://')) {
    return `wss://${baseWithoutApiSuffix.slice('https://'.length)}/ws`;
  }

  if (baseWithoutApiSuffix.startsWith('http://')) {
    return `ws://${baseWithoutApiSuffix.slice('http://'.length)}/ws`;
  }

  return `${baseWithoutApiSuffix}/ws`;
}

export const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL,
);

export const WS_URL = normalizeBaseUrl(
  import.meta.env.VITE_WS_URL ?? toWebSocketUrl(API_BASE_URL),
);