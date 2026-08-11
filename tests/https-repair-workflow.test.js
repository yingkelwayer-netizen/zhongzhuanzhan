const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const workflowPath = path.join(root, '.github', 'workflows', 'repair-zonghuin-https.yml');
const workflow = fs.readFileSync(workflowPath, 'utf8');

assert.match(workflow, /workflow_dispatch:/, 'HTTPS repair must require an explicit manual dispatch');
assert.match(workflow, /\/www\/wwwroot\/zhongzhuanzhan/, 'HTTPS repair must target the correct site root');
assert.match(workflow, /\/www\/server\/panel\/vhost\/cert\/zonghuin\.com\/fullchain\.pem/, 'HTTPS repair must use the validated Baota certificate');
assert.match(workflow, /\/www\/server\/panel\/vhost\/cert\/zonghuin\.com\/privkey\.pem/, 'HTTPS repair must use the matching private key');
assert.match(workflow, /listen 443 ssl;/, 'HTTPS repair must configure a TLS listener');
assert.match(workflow, /return 301 https:\/\/zonghuin\.com\$request_uri;/, 'HTTP and www traffic must redirect to the canonical HTTPS host');
assert.match(workflow, /server_name www\.zonghuin\.com;[\s\S]*?return 301 https:\/\/zonghuin\.com\$request_uri;/, 'HTTPS www must redirect to the root domain');
assert.match(workflow, /location = \/index\.html \{\s*return 301 https:\/\/zonghuin\.com\/;\s*\}/, 'The duplicate /index.html URL must redirect to the canonical homepage');
assert(workflow.includes('index_https_headers='), 'Runtime verification must request /index.html');
assert(workflow.includes('^Location: https://zonghuin\\.com/\\r?$'), 'Runtime verification must check the exact /index.html canonical redirect with HTTP CRLF line endings');
assert.match(workflow, /Strict-Transport-Security/, 'The canonical HTTPS host must send HSTS');
assert.match(workflow, /cert_public_key.*key_public_key/s, 'The workflow must verify that certificate and private key match');
assert.match(workflow, /backup_conf.*restore_previous_config/s, 'The workflow must back up and roll back an invalid Nginx change');
assert.match(workflow, /configured_fingerprint.*loaded_fingerprint/s, 'Runtime verification must confirm Nginx loaded the expected certificate');
assert.match(workflow, /--noproxy '\*'/, 'Local runtime checks must bypass proxy settings');
assert.match(workflow, /for attempt in 1 2 3 4 5 6 7 8 9 10/, 'Runtime verification must tolerate graceful Nginx reload delay');
assert.doesNotMatch(workflow, /niuzonghui\.com/, 'The repair must not touch the unrelated niuzonghui.com site');

console.log('HTTPS repair workflow verified: scoped certificate, redirect, validation, and rollback are present.');
