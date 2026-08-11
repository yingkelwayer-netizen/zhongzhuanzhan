const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const workflowPath = '.github/workflows/deploy.yml';
const deployWorkflow = process.env.TEST_COMMITTED_DEPLOY === '1'
  ? execFileSync('git', ['show', `HEAD:${workflowPath}`], { cwd: root, encoding: 'utf8' })
  : fs.readFileSync(path.join(root, workflowPath), 'utf8');

const testStepIndex = deployWorkflow.indexOf('run: npm test');
const deployStepIndex = deployWorkflow.indexOf('uses: appleboy/scp-action');
assert(testStepIndex >= 0, 'The deploy workflow must run the complete test suite');
assert(testStepIndex < deployStepIndex, 'The complete test suite must pass before files are uploaded');

assert.match(
  deployWorkflow,
  /source:\s*"index\.html,about\.html,services\.html,insights\.html,contact\.html,privacy\.html,style\.css,robots\.txt,sitemap\.xml,insights\/,assets\/"/,
  'The deploy workflow must upload the generated pages, article directory, and SEO discovery files'
);

assert.doesNotMatch(
  deployWorkflow,
  /\/www\/server\/panel\/vhost\/nginx\/|cat\s+>\s+"?\$?site_conf/,
  'Routine site deploys must not overwrite Baota-managed Nginx or TLS configuration'
);

console.log('Deploy workflow verified: static files deploy without rewriting Baota Nginx configuration.');
