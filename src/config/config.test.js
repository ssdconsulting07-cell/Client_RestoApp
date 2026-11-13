import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  delete window.__SENYUMMIES_CONFIG__;
  vi.resetModules();
});

describe('configuration au demarrage', () => {
  it('prend /config.js (Docker) en priorite', async () => {
    window.__SENYUMMIES_CONFIG__ = { API_BASE_URL: '/api/v1' };
    const { configuration } = await import('./runtime');
    expect(configuration('API_BASE_URL', 'http://vite', 'defaut')).toBe('/api/v1');
  });

  it('ignore une valeur vide et retombe sur Vite puis le defaut', async () => {
    window.__SENYUMMIES_CONFIG__ = { API_BASE_URL: '  ' };
    const { configuration } = await import('./runtime');
    expect(configuration('API_BASE_URL', 'http://vite', 'defaut')).toBe('http://vite');
    expect(configuration('API_BASE_URL', undefined, 'defaut')).toBe('defaut');
  });
});

describe('support', () => {
  it('rend le numero lisible', async () => {
    const { telephoneLisible } = await import('./support');
    expect(telephoneLisible('+221771234567')).toBe('+221 77 123 45 67');
    expect(telephoneLisible('+33 1 23')).toBe('+33 1 23');
  });
});
