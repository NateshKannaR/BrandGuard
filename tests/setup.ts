import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, vi } from 'vitest';

const directory = mkdtempSync(join(tmpdir(), 'brandguard-test-'));
vi.stubEnv('BRANDGUARD_DB_PATH', join(directory, 'db.json'));
vi.stubEnv('GEMINI_API_KEY', undefined);
vi.stubEnv('OPENAI_API_KEY', undefined);

afterAll(() => {
  rmSync(directory, { recursive: true, force: true });
  vi.unstubAllEnvs();
});
