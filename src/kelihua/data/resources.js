import materials from './school-materials.json';

export function buildSeedResources() {
  return materials.resources.map((resource) => ({ ...resource }));
}

export function buildSeedSubmissions() {
  return [];
}
