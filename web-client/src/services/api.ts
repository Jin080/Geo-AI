import axios from 'axios';
import type { MineFeature } from '@/store/useDataStore';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export const apiClient = axios.create({
  baseURL: API_BASE || '/',
  timeout: 20000
});

export async function fetchMines(): Promise<MineFeature[]> {
  const resp = await apiClient.get('/api/mines');
  const data = resp.data;
  if (data?.type === 'FeatureCollection' && Array.isArray(data.features)) {
    return data.features as MineFeature[];
  }
  return [];
}

type StreamHandler = (data: string) => void;

export function streamChat(payload: Record<string, unknown>, onMessage: StreamHandler) {
  const controller = new AbortController();

  (async () => {
    const resp = await fetch(`${API_BASE || ''}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    if (!resp.ok || !resp.body) {
      throw new Error(`Chat request failed: ${resp.status} ${resp.statusText}`);
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder('utf-8');

    // Minimal SSE line parser; forwards data lines to callback.
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, newlineIndex).trimEnd();
        buffer = buffer.slice(newlineIndex + 1);
        if (!line) continue;
        if (line.startsWith('data:')) {
          onMessage(line.replace(/^data:\s*/, ''));
        }
      }
    }
  })().catch((err) => {
    console.error('streamChat error:', err);
    controller.abort();
  });

  return controller;
}
