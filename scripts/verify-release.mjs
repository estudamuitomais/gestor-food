import { spawnSync } from 'node:child_process';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const npmExecPath = process.env.npm_execpath;
const commands = [
  ['check', []],
  ['test', []],
  ['smoke:production', []],
];

for (const [script, args] of commands) {
  console.log(`\n==> npm run ${script}`);
  const command = npmExecPath ? process.execPath : npm;
  const commandArgs = npmExecPath ? [npmExecPath, 'run', script, ...args] : ['run', script, ...args];
  const result = spawnSync(command, commandArgs, { stdio: 'inherit', shell: !npmExecPath && process.platform === 'win32' });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    console.error(`Falha em npm run ${script}.`);
    process.exit(result.status ?? 1);
  }
}

console.log('\nRelease preflight aprovado. Homologação oficial do iFood continua pendente.');
