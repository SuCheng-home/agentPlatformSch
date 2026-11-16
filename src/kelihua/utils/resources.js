/** Public assets resolve correctly both in development and under the deployment prefix. */
export function assetUrl(path) {
  return path ? `${import.meta.env.BASE_URL}${path}` : '';
}

export function resourceUrl(resource) {
  return resource.asset ? assetUrl(resource.asset) : resource.url || '';
}

export function copyContent(resource) {
  if (resource.type !== 'agent') {
    return (resource.prompt || '').trim();
  }
  const content = [
    resource.persona && `【人设】\n${resource.persona}`,
    resource.reply && `【回复设定】\n${resource.reply}`
  ].filter(Boolean).join('\n\n');
  return content || (resource.prompt || '').trim();
}
