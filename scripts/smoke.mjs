// End-to-end smoke test: boots the built server on stdio, performs the MCP
// handshake, and asserts every primitive lists and that a tool actually
// answers. Catches the failure that matters — the server starts but the
// client sees nothing — which a type-check alone would not.
//
//   npm run build && node scripts/smoke.mjs
import { spawn } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const server = spawn(process.execPath, [join(ROOT, 'dist/index.js')], {
  stdio: ['pipe', 'pipe', 'inherit'],
});

const send = (msg) => server.stdin.write(JSON.stringify(msg) + '\n');
const replies = new Map();
let buffer = '';

server.stdout.on('data', (chunk) => {
  buffer += chunk;
  let nl;
  while ((nl = buffer.indexOf('\n')) !== -1) {
    const line = buffer.slice(0, nl).trim();
    buffer = buffer.slice(nl + 1);
    if (!line) continue;
    try {
      const msg = JSON.parse(line);
      if (msg.id !== undefined) replies.set(msg.id, msg);
    } catch { /* not a JSON-RPC frame */ }
  }
});

const waitFor = (id, ms = 10000) =>
  new Promise((resolve, reject) => {
    const started = Date.now();
    const tick = setInterval(() => {
      if (replies.has(id)) { clearInterval(tick); resolve(replies.get(id)); }
      else if (Date.now() - started > ms) { clearInterval(tick); reject(new Error(`timed out waiting for id ${id}`)); }
    }, 25);
  });

const problems = [];
const expect = (cond, msg) => {
  if (cond) console.log(`  ok    ${msg}`);
  else { problems.push(msg); console.log(`  FAIL  ${msg}`); }
};

try {
  send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {
    protocolVersion: '2024-11-05', capabilities: {},
    clientInfo: { name: 'smoke', version: '1' } } });
  const init = await waitFor(1);
  expect(!!init.result?.serverInfo?.name, `initialize handshake (server: ${init.result?.serverInfo?.name})`);

  send({ jsonrpc: '2.0', method: 'notifications/initialized' });

  send({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} });
  const tools = (await waitFor(2)).result?.tools ?? [];
  expect(tools.length > 0, `tools/list returned ${tools.length} tools`);
  for (const required of ['get_profile', 'get_experience', 'get_resume', 'has_skill', 'search_background']) {
    expect(tools.some((t) => t.name === required), `tool present: ${required}`);
  }

  send({ jsonrpc: '2.0', id: 3, method: 'resources/list', params: {} });
  const resources = (await waitFor(3)).result?.resources ?? [];
  expect(resources.length > 0, `resources/list returned ${resources.length} resources`);

  send({ jsonrpc: '2.0', id: 4, method: 'prompts/list', params: {} });
  const prompts = (await waitFor(4)).result?.prompts ?? [];
  expect(prompts.length > 0, `prompts/list returned ${prompts.length} prompts`);

  // A listing can look healthy while every call throws — so actually call one.
  send({ jsonrpc: '2.0', id: 5, method: 'tools/call',
         params: { name: 'get_profile', arguments: {} } });
  const call = await waitFor(5);
  const text = call.result?.content?.[0]?.text ?? '';
  expect(!call.error && text.length > 0, 'tools/call get_profile returned content');
  // Regression guard: has_skill once searched only skills + experience, so a
  // skill shipped purely in a side project (WebRTC) answered "no" — the exact
  // question the README advertises.
  send({ jsonrpc: '2.0', id: 6, method: 'tools/call',
         params: { name: 'has_skill', arguments: { skill: 'WebRTC' } } });
  const skill = JSON.parse((await waitFor(6)).result?.content?.[0]?.text ?? '{}');
  expect(skill.has === true && skill.evidence?.length > 0,
    `has_skill("WebRTC") is answered with evidence (${skill.evidence?.length ?? 0} item(s))`);

  send({ jsonrpc: '2.0', id: 7, method: 'tools/call',
         params: { name: 'get_projects', arguments: {} } });
  const projects = JSON.parse((await waitFor(7)).result?.content?.[0]?.text ?? '[]');
  expect(projects.length >= 5, `get_projects returned ${projects.length} projects`);
} catch (err) {
  problems.push(err.message);
  console.log(`  FAIL  ${err.message}`);
} finally {
  server.kill();
}

console.log();
if (problems.length) { console.error(`${problems.length} problem(s).`); process.exit(1); }
console.log('MCP smoke test passed.');
