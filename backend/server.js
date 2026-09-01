/**
 * BIS Sahayak V2 - Backend Server Bridge
 * 
 * This file serves as an optional Node.js runner for the Python FastAPI server.
 * You can also run the server directly using:
 *   uvicorn app.main:app --reload --port 8000
 */

const { spawn } = require('child_process');

console.log('====================================================');
console.log('🏛️  Starting BIS Sahayak V2 Backend (FastAPI)...');
console.log('====================================================');

const isWindows = process.platform === 'win32';
const pythonCmd = isWindows ? 'python' : 'python3';

const server = spawn(pythonCmd, ['-m', 'uvicorn', 'app.main:app', '--reload', '--port', '8000'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env }
});

server.on('error', (err) => {
  console.error('Failed to start uvicorn process:', err.message);
  console.log('\nMake sure Python 3 is installed and your virtual environment is active:');
  console.log('  source venv/bin/activate  (or venv\\Scripts\\activate on Windows)');
  console.log('  pip install -r requirements.txt\n');
});

server.on('close', (code) => {
  if (code !== 0) {
    console.log(`Server process exited with code ${code}`);
  }
});
