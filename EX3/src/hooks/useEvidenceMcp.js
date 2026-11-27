import { useEffect } from 'react';
import { registerTool } from '../agent/modelContext.js';
import { queryClips } from '../lib/queryClips.js';

// Ex 3.1 — Exposing React Tools via WebMCP
// Tool CHỈ ĐỌC: readOnlyHint: true → agent được gọi tự động, không cần xác nhận.
// Đăng ký trong useEffect, cleanup gỡ tool khi unmount (không để lại "ghost tool").
export function useEvidenceMcp() {
  useEffect(() => {
    const unregister = registerTool({
      name: 'searchEvidenceClips',
      title: 'Search evidence clips',
      description:
        'Query FPS telemetry and handcam evidence clips by player and tournament stage. Read-only.',
      inputSchema: {
        type: 'object',
        properties: {
          player: { type: 'string', enum: ['Himass', 'TanVuu'], description: 'Player tag' },
          stage: {
            type: 'string',
            enum: ['Group Stage', 'Semi Final', 'Grand Final', 'Scrim'],
            description: 'Tournament stage (optional)',
          },
          limit: { type: 'integer', minimum: 1, maximum: 20, description: 'Max results (default 10)' },
        },
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      execute: async (input = {}) => queryClips(input),
    });

    return unregister; // abort signal + unregisterTool (tương thích slide)
  }, []);
}