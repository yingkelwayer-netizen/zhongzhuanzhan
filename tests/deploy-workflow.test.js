const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const workflowPath = '.github/workflows/deploy.yml';
const deployWorkflow = process.env.TEST_COMMITTED_DEPLOY === '1'
  ? execFileSync('git', ['show', `HEAD:${workflowPath}`], { cwd: root, encoding: 'utf8' })
  : fs.readFileSync(path.join(root, workflowPath), 'utf8');

assert.match(
  deployWorkflow,
  /source:\s*"index\.html,privacy\.html,style\.css,assets\/"/,
  'The deploy workflow must continue uploading the generated static site'
);

assert.doesNotMatch(
  deployWorkflow,
  /\/www\/server\/panel\/vhost\/nginx\/|cat\s+>\s+"?\$?site_conf/,
  'Routine site deploys must not overwrite Baota-managed Nginx or TLS configuration'
);

console.log('Deploy workflow verified: static files deploy without rewriting Baota Nginx configuration.');
