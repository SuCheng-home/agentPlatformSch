import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const ROOT = resolve(import.meta.dirname, '..');
const materials = JSON.parse(await readFile(join(ROOT, 'src/kelihua/data/school-materials.json'), 'utf8'));
const manifest = JSON.parse(await readFile(join(ROOT, 'src/kelihua/data/materials-manifest.json'), 'utf8'));
const lessons = materials.units.flatMap((unit) => unit.lessons);
assert.equal(lessons.length, 68);
assert.equal(new Set(lessons.map((lesson) => lesson.id)).size, 68);
assert.equal(materials.resources.length, 25);
assert.equal(new Set(materials.resources.map((resource) => resource.id)).size, 25);
assert.equal(new Set(materials.resources.map((resource) => resource.code)).size, 25);
for (const entry of manifest) {
  const bytes = await readFile(join(ROOT, 'public', entry.asset));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256, entry.asset);
}
for (const resource of materials.resources) {
  assert(materials.units.some((unit) => unit.id === resource.unitId && unit.subject === resource.subject));
  assert.equal(resource.prompt, '');
  assert.equal(resource.persona, '');
  assert.equal(resource.reply, '');
}
for (const lesson of lessons) {
  for (const id of lesson.resourceIds) {
    assert(materials.resources.some((resource) => resource.id === id));
  }
  assert(manifest.some((entry) => entry.asset === lesson.asset));
  assert(lesson.sourceText.length > 50);
  assert(!('views' in lesson) && !('rating' in lesson));
}

const folder = await mkdtemp(join(tmpdir(), 'kelihua-tests-'));
const storage = new Map();
globalThis.localStorage = { getItem: (key) => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) };
globalThis.sessionStorage = { getItem: () => null, setItem() {}, removeItem() {} };
try {
  const outfile = join(folder, 'store.mjs');
  await build({
    entryPoints: [join(ROOT, 'src/kelihua/store.js')], outfile, bundle: true, format: 'esm', platform: 'node',
    define: { 'import.meta.env.BASE_URL': JSON.stringify('/agentPlatformSch/') },
    plugins: [{
      name: 'test-environment',
      setup(builder) {
        builder.onResolve({ filter: /^@\// }, (args) => ({ path: args.path, namespace: 'test-env' }));
        builder.onLoad({ filter: /.*/, namespace: 'test-env' }, (args) => ({
          contents: args.path.includes('/auth') ? 'export const getToken = () => null;' : 'export const LOCAL_PREVIEW_ENABLED = true; export const MOCK_DATA_ENABLED = false;'
        }));
      }
    }]
  });
  const first = await import(pathToFileURL(outfile).href);
  const state = first.default;
  const agent = state.resources.find((resource) => resource.type === 'agent');
  assert.equal(first.actions.setOrder(agent.id, 5), false, 'Teacher cannot change ordering');
  first.actions.demoLogin('admin');
  for (const invalid of [0, -1, 1.5, NaN, Infinity, 1000000]) {
    assert.equal(first.actions.setOrder(agent.id, invalid), false);
  }
  first.actions.updateResource(agent.id, { code: 'CUSTOM-2', persona: '测试用人设', reply: '测试用回复' });
  const other = state.resources.find((resource) => resource.type === 'agent' && resource.id !== agent.id);
  first.actions.updateResource(other.id, { code: 'CUSTOM-10' });
  first.actions.setOrder(agent.id, 7);
  first.actions.setOrder(other.id, 7);
  assert.deepEqual(first.getters.published((resource) => resource.type === 'agent').map((resource) => resource.id), [agent.id, other.id]);
  first.actions.move(other.id, -1);
  assert.equal(first.getters.published((resource) => resource.type === 'agent')[0].id, other.id);
  first.actions.sortByCode('subject:xx');
  assert.equal(first.getters.published((resource) => resource.type === 'agent')[0].id, agent.id);
  assert.equal(first.getters.allPrompts().find((resource) => resource.id === agent.id).prompt, '【人设】\n测试用人设\n\n【回复设定】\n测试用回复');
  first.actions.addCategory('domain', '验证领域');
  const addedDomain = state.domains.find((domain) => domain.label === '验证领域');
  first.actions.setCategoryCode('domain', addedDomain.key, 'VERIFY');
  const submission = first.actions.submit({ name: '验证新增智能体', type: 'agent', matrix: 'education', domain: addedDomain.key, prompt: '旧格式系统设定', url: 'https://example.invalid', grades: ['七年级'] });
  first.actions.approve(submission.id, '验证初审');
  const published = first.actions.approve(submission.id, '验证终审');
  first.actions.setOrder(published.id, 8);
  assert.equal(first.getters.allPrompts().find((resource) => resource.id === published.id).prompt, '旧格式系统设定');
  const second = await import(`${pathToFileURL(outfile).href}?reload=1`);
  assert.equal(second.getters.findById(agent.id).code, 'CUSTOM-2');
  assert.equal(second.getters.findById(agent.id).persona, '测试用人设');
  assert.equal(second.getters.findById(agent.id).order, 1);
  assert.equal(second.default.domains.find((domain) => domain.key === addedDomain.key).code, 'VERIFY');
  assert.equal(second.getters.findById(published.id).order, 8);
  assert.equal(second.getters.findById(published.id).url, 'https://example.invalid');
  assert.deepEqual(second.getters.findById(published.id).grades, ['七年级']);
  globalThis.localStorage.setItem = () => { throw new Error('Quota exceeded'); };
  first.actions.setOrder(agent.id, 4);
  assert(state.catalogStorageError.includes('保存失败'));
  storage.set('kelihua-catalog-v1', '{invalid-json');
  const third = await import(`${pathToFileURL(outfile).href}?corrupt=1`);
  assert.equal(third.default.resources.length, 25);
  process.stdout.write('PASS: 68 lesson files, 25 resources, source hashes, references, ordering, copy content, reload persistence, invalid values and storage failure.\n');
} finally {
  await rm(folder, { recursive: true, force: true });
}
