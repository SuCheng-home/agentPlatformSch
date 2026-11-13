import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const outputDirectory = mkdtempSync(join(tmpdir(), 'agent-platform-preview-check-'));
const outputFile = join(outputDirectory, 'handler.mjs');
execFileSync('node_modules/.bin/esbuild', [
  'src/mock/request-handler.js', '--bundle', '--platform=node', '--format=esm', `--outfile=${outputFile}`
], { stdio: 'pipe' });

const storedValues = new Map();
globalThis.localStorage = {
  getItem: (key) => storedValues.get(key) || null,
  setItem: (key, value) => storedValues.set(key, value)
};
globalThis.fetch = () => {
  throw new Error('模拟处理器不允许访问网络');
};
const { handleMockRequest } = await import(pathToFileURL(outputFile));
const snapshot = JSON.parse(readFileSync('src/mock/snapshot.json', 'utf8'));
const request = (url, params = {}, data) => handleMockRequest({ url, params, data });
const listUrl = 'structure/aiSystem/aiAgent/admin/list';
const first = request(listUrl, { pageNo: 1, pageSize: 20 }).data;
assert.equal(first.pagination.total, snapshot.agents.length);
assert.equal(first.dataList.length, 20);
const allIds = [];
for (let pageNo = 1; pageNo <= Math.ceil(snapshot.agents.length / 20); pageNo += 1) {
  allIds.push(...request(listUrl, { pageNo, pageSize: 20 }).data.dataList.map((row) => row.id));
}
assert.equal(new Set(allIds).size, snapshot.agents.length, '分页必须覆盖全部资源，无遗漏或重复');

const selected = snapshot.agents.find((row) => row.subjectCodes && row.subjectCodes !== '-1');
const keywordResults = request(listUrl, { name: selected.name, pageSize: 200 }).data;
assert(keywordResults.dataList.some((row) => row.id === selected.id));
const typeResults = request(listUrl, { agentType: 1, pageSize: 200 }).data;
assert(typeResults.dataList.every((row) => row.agentType === 1));
assert.equal(typeResults.pagination.total, snapshot.agents.filter((row) => row.agentType === 1).length);
const subjectCode = selected.subjectCodes.split(',')[0];
assert(request(listUrl, { subjectCode, pageSize: 200 }).data.dataList.every((row) => String(row.subjectCodes).split(',').includes(subjectCode)));
const sorted = request(listUrl, { orderBy: 'useCount', pageSize: 200 }).data.dataList;
assert(sorted.every((row, index) => index === 0 || Number(sorted[index - 1].useCount) >= Number(row.useCount)));
assert.equal(request(listUrl, { approvalStatus: 0 }).data.pagination.total,
  snapshot.agents.filter((row) => Number(row.approvalStatus) === 0).length, '审批数量必须来自实际快照');
assert.equal(request(listUrl, { approvalStatus: 99 }).data.pagination.total,
  snapshot.agents.filter((row) => [1, 2].includes(Number(row.approvalStatus))).length);

const favoriteUrl = 'structure/aiSystem/aiFavorite';
assert.equal(request('structure/aiSystem/aiAgent/getMyCollectAgentPageList').data.pagination.total, 0);
request(`${favoriteUrl}/add`, {}, JSON.stringify({ objectId: selected.id }));
request(`${favoriteUrl}/add`, {}, { objectId: selected.id });
assert.equal(request('structure/aiSystem/aiAgent/myStats').data.favoriteCount, 1, '重复收藏保持幂等');
assert.equal(request('structure/aiSystem/aiAgent/getMyCollectAgentPageList').data.dataList[0].selfIsFavorite, 2);
request(`${favoriteUrl}/delete`, {}, { objectId: selected.id });
assert.equal(request('structure/aiSystem/aiAgent/myStats').data.favoriteCount, 0);

request('structure/aiSystem/aiAgentUseRecord/save', { agentId: selected.id });
assert.equal(request('structure/aiSystem/aiAgentUseRecord/pageList').data.dataList[0].id, selected.id);
assert.equal(request(`common/aiAgent/get/${selected.id}`).data.name, selected.name);
assert.equal(request('structure/aiSystem/aiAgent/pageList').data.pagination.total, 0, '本人创建不能冒用线上记录');
request('structure/aiSystem/aiAgent/admin/onOrOffLaunch', {}, { id: selected.id, status: 0 });
assert.equal(request(`common/aiAgent/get/${selected.id}`).data.publishStatus, 0);
request('structure/aiSystem/aiAgent/admin/onOrOffLaunch', {}, { id: selected.id, publishStatus: 1 });
assert.equal(request(`common/aiAgent/get/${selected.id}`).data.publishStatus, 1, '兼容管理页实际提交字段');
assert.throws(() => request('structure/aiSystem/aiAgent/admin/onOrOffLaunch', {}, { id: selected.id, publishStatus: 'invalid' }));
request('structure/aiSystem/aiAgent/update', {}, { id: selected.id, name: '本地修改验证' });
assert.equal(request(`common/aiAgent/get/${selected.id}`).data.name, '本地修改验证');
const created = request('structure/aiSystem/aiAgent/add', {}, { name: '本地新增验证', agentType: 2 }).data;
assert.equal(request('structure/aiSystem/aiAgent/pageList').data.dataList[0].id, created.id);
request('structure/aiSystem/aiAgent/delete', { id: created.id });
assert.throws(() => request(`common/aiAgent/get/${created.id}`));
assert.equal(request('common/aiBanner/list').data.length, 2);
assert(request('/wxcep-resource/common/studyResourceAtlas/getSchoolAutonomicResourceAtlsList').data.length > 0);
assert.throws(() => request('common/getWxCosFileSign'), /尚未接入本地模拟/);
assert.throws(() => request('not-captured'), /尚未接入本地模拟/);
assert.throws(() => request('structure/aiSystem/aiSetInfo/save', {}, { platformLogo: 'https://example.com/a.jpg' }), /本地图片/);
assert(storedValues.size > 0, '本地操作应保存到浏览器存储');
assert.equal(snapshot.agents.find((row) => row.id === selected.id).name, selected.name, '本地修改不能污染原始快照');
process.stdout.write('本地模拟验证通过：完整分页、搜索、筛选、排序、详情、收藏、最近使用、增删改、未知请求阻断和快照隔离。\n');
