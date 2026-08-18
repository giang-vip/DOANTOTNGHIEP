const { execSync } = require('child_process');
const fs = require('fs');

try {
  const output = execSync('npx tsc --noEmit', { stdio: 'pipe' });
  fs.writeFileSync('tsc_output.txt', output);
} catch (error) {
  fs.writeFileSync('tsc_output.txt', error.stdout || error.stderr || error.message);
}
