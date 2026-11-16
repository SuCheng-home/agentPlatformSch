import materials from './school-materials.json';
import { RESOURCE_OVERLAY } from './subject-modules';

export function buildSeedResources() {
  return materials.resources.map((resource) => {
    const overlay = RESOURCE_OVERLAY[resource.id] || {};
    const next = { ...resource, modules: overlay.modules || [], shot: overlay.shot || '' };
    if (overlay.url && !next.url && !next.asset) {
      next.url = overlay.url;
      next.availability = '已收录链接 · 外部服务待验证';
    }
    return next;
  });
}

export function buildSeedSubmissions() {
  return [];
}
