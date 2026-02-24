import { spawn } from 'node:child_process';

const PREVIEW_URL = 'http://127.0.0.1:4173';
const LIGHTHOUSE_OUTPUT = './lighthouse-report.html';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      ...options,
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

async function waitForServer(url, retries = 60, intervalMs = 500) {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Keep polling until preview is available.
    }
    await sleep(intervalMs);
  }

  throw new Error(`Preview server did not start at ${url}`);
}

async function stopPreview(child) {
  if (!child || child.killed) return;

  if (process.platform === 'win32') {
    await runCommand('taskkill', ['/pid', String(child.pid), '/T', '/F']).catch(() => {});
    return;
  }

  child.kill('SIGTERM');
}

async function main() {
  const preview = spawn(
    'npx',
    ['vite', 'preview', '--host', '127.0.0.1', '--port', '4173', '--strictPort'],
    {
      stdio: 'inherit',
      shell: process.platform === 'win32',
    }
  );

  try {
    await waitForServer(PREVIEW_URL);
    await runCommand('npx', [
      'lighthouse',
      PREVIEW_URL,
      '--output-path',
      LIGHTHOUSE_OUTPUT,
    ]);
  } finally {
    await stopPreview(preview);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
