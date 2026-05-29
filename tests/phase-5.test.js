import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

// ── Mock import.meta.env before importing api.js ──────────────────────────────
vi.stubGlobal('import', {
  meta: {
    env: {
      VITE_API_BASE_URL: 'https://mock-api.example.com',
      VITE_API_KEY: 'mock-key',
      VITE_API_MODEL: 'mock-model',
    },
  },
});

// Helper to build a mock fetch that returns a specific string as the API response
function mockFetch(responseContent) {
  return vi.fn().mockResolvedValue({
    json: async () => ({
      choices: [{ message: { content: responseContent } }],
    }),
  });
}

describe('Phase 5 - API Layer Tests', () => {
  let generateResponse, analyseResponse, correctResponse;

  beforeEach(async () => {
    // Re-import fresh copy of module with mocked env
    vi.resetModules();
    const apiModule = await import('../src/utils/api.js');
    generateResponse = apiModule.generateResponse;
    analyseResponse = apiModule.analyseResponse;
    correctResponse = apiModule.correctResponse;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Export checks ──────────────────────────────────────────────────────────
  it('api.js exports a function named generateResponse', () => {
    expect(typeof generateResponse).toBe('function');
  });

  it('api.js exports a function named analyseResponse', () => {
    expect(typeof analyseResponse).toBe('function');
  });

  it('api.js exports a function named correctResponse', () => {
    expect(typeof correctResponse).toBe('function');
  });

  // ── generateResponse ───────────────────────────────────────────────────────
  it('generateResponse with valid JSON returns object with evaluative and response fields', async () => {
    vi.stubGlobal('fetch', mockFetch(JSON.stringify({ evaluative: true, response: 'You should hire.' })));
    const result = await generateResponse([{ role: 'user', content: 'Should I hire?' }]);
    expect(result).toHaveProperty('evaluative', true);
    expect(result).toHaveProperty('response', 'You should hire.');
  });

  it('generateResponse with malformed JSON returns { evaluative: false, response: [raw string] }', async () => {
    const raw = 'This is not JSON at all';
    vi.stubGlobal('fetch', mockFetch(raw));
    const result = await generateResponse([{ role: 'user', content: 'test' }]);
    expect(result.evaluative).toBe(false);
    expect(result.response).toBe(raw);
  });

  it('generateResponse with missing response field returns { evaluative: false, response: \'\' }', async () => {
    vi.stubGlobal('fetch', mockFetch(JSON.stringify({ evaluative: true })));
    const result = await generateResponse([{ role: 'user', content: 'test' }]);
    expect(result.evaluative).toBe(false);
    expect(result.response).toBe('');
  });

  // ── analyseResponse ────────────────────────────────────────────────────────
  it('analyseResponse with valid JSON returns object with all 4 arrays', async () => {
    const payload = {
      inference_flags: [{ quote: 'q', basis: 'b', missing: 'm' }],
      assumptions: [{ quote: 'q', fills: 'f', if_wrong: 'w' }],
      dependencies: [{ quote: 'q', conditions: ['c1'] }],
      gaps: ['gap1', 'gap2'],
    };
    vi.stubGlobal('fetch', mockFetch(JSON.stringify(payload)));
    const result = await analyseResponse('user msg', 'response text');
    expect(Array.isArray(result.inference_flags)).toBe(true);
    expect(Array.isArray(result.assumptions)).toBe(true);
    expect(Array.isArray(result.dependencies)).toBe(true);
    expect(Array.isArray(result.gaps)).toBe(true);
    expect(result.inference_flags.length).toBe(1);
    expect(result.gaps.length).toBe(2);
  });

  it('analyseResponse with missing arrays defaults each to []', async () => {
    vi.stubGlobal('fetch', mockFetch(JSON.stringify({ inference_flags: [{ quote: 'q' }] })));
    const result = await analyseResponse('user', 'response');
    expect(result.inference_flags.length).toBe(1);
    expect(result.assumptions).toEqual([]);
    expect(result.dependencies).toEqual([]);
    expect(result.gaps).toEqual([]);
  });

  it('analyseResponse with malformed JSON returns all 4 arrays as []', async () => {
    vi.stubGlobal('fetch', mockFetch('not json'));
    const result = await analyseResponse('user', 'response');
    expect(result).toEqual({ inference_flags: [], assumptions: [], dependencies: [], gaps: [] });
  });

  // ── correctResponse ────────────────────────────────────────────────────────
  it('correctResponse with valid JSON returns object with response and change_receipt', async () => {
    const payload = {
      response: 'Updated recommendation.',
      change_receipt: {
        changed: ['Framing changed'],
        unchanged: ['Budget unchanged'],
        still_open: ['Skill gap TBD'],
      },
    };
    vi.stubGlobal('fetch', mockFetch(JSON.stringify(payload)));
    const result = await correctResponse('original', 'correction');
    expect(result.response).toBe('Updated recommendation.');
    expect(Array.isArray(result.change_receipt.changed)).toBe(true);
    expect(Array.isArray(result.change_receipt.unchanged)).toBe(true);
    expect(Array.isArray(result.change_receipt.still_open)).toBe(true);
  });

  it('correctResponse with malformed JSON returns default structure with empty arrays', async () => {
    vi.stubGlobal('fetch', mockFetch('bad json'));
    const result = await correctResponse('original', 'correction');
    expect(result.response).toBe('');
    expect(result.change_receipt).toEqual({ changed: [], unchanged: [], still_open: [] });
  });

  // ── vercel.json check ──────────────────────────────────────────────────────
  it('vercel.json exists at project root and contains buildCommand', () => {
    const vercelPath = path.resolve(__dirname, '../vercel.json');
    expect(fs.existsSync(vercelPath)).toBe(true);
    const content = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
    expect(content).toHaveProperty('buildCommand');
    expect(content.buildCommand).toBe('npm run build');
  });
});
