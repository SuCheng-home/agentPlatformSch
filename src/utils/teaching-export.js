// 课程包导出：单项资源下载与一键打包（ZIP）。
// 文档导出为带内联样式的 HTML，可直接用 Word / WPS 打开继续改编；智能体与工具导出为平台链接清单。
import { RESOURCE_TYPES } from '@/data/teaching/packages';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function list(items) {
  return `<ul>${(items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function documentShell(title, body) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>
  body { font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; color: #13213d; line-height: 1.7; max-width: 820px; margin: 32px auto; padding: 0 24px; }
  h1 { font-size: 24px; margin: 0 0 4px; }
  h2 { font-size: 17px; margin: 28px 0 8px; padding-left: 10px; border-left: 4px solid #2168f3; }
  .meta { color: #6f7d98; font-size: 13px; margin-bottom: 20px; }
  table { border-collapse: collapse; width: 100%; font-size: 14px; }
  th, td { border: 1px solid #d5deee; padding: 8px 10px; text-align: left; vertical-align: top; }
  th { background: #edf3ff; }
  .slide { border: 1px solid #d5deee; border-radius: 8px; padding: 18px 22px; margin: 16px 0; page-break-inside: avoid; }
  .slide small { color: #6f7d98; }
  .note { background: #f5f8fe; border-radius: 6px; padding: 8px 12px; font-size: 13px; color: #53617a; }
  .answer { color: #0e7a55; font-size: 14px; }
  @media print { body { margin: 0 auto; } }
</style>
</head>
<body>
${body}
</body>
</html>`;
}

function metaLine(pkg) {
  return `<div class="meta">${escapeHtml(pkg.textbookLabel)} ｜ 授课教师：${escapeHtml(pkg.teacher)} ｜ ${escapeHtml(pkg.school)}</div>`;
}

function slideBody(slide) {
  if (slide.table) {
    const head = slide.table.head.map((cell) => `<th>${escapeHtml(cell)}</th>`).join('');
    const rows = slide.table.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('');
    return `<table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`;
  }
  if (slide.subtitle && !slide.points) {
    return `<p>${escapeHtml(slide.subtitle)}</p>`;
  }
  return list(slide.points);
}

function buildSlides(pkg) {
  const slides = pkg.slides.map((slide, index) => `
<div class="slide">
  <small>第 ${index + 1} 页</small>
  <h2>${escapeHtml(slide.title)}</h2>
  ${slideBody(slide)}
  ${slide.note ? `<div class="note">讲稿：${escapeHtml(slide.note)}</div>` : ''}
</div>`).join('');
  return documentShell(`${pkg.title} · 课件`, `<h1>${escapeHtml(pkg.title)} · 课件（含讲稿）</h1>${metaLine(pkg)}${slides}`);
}

function buildDesign(pkg) {
  const d = pkg.design;
  const rows = d.process.map((step) => `
<tr><td>${escapeHtml(step.stage)}<br><small>${step.minutes} 分钟</small></td><td>${escapeHtml(step.teacher)}</td><td>${escapeHtml(step.student)}</td><td>${escapeHtml(step.resource)}</td></tr>`).join('');
  const body = `
<h1>${escapeHtml(pkg.title)} · 教学设计</h1>
${metaLine(pkg)}
<h2>教学目标</h2>${list(d.objectives)}
<h2>教学重点</h2>${list(d.keyPoints)}
<h2>教学难点</h2>${list(d.difficulties)}
<h2>教学准备</h2>${list(d.preparation)}
<h2>教学过程</h2>
<table><thead><tr><th style="width:110px">环节</th><th>教师活动</th><th>学生活动</th><th style="width:120px">使用资源</th></tr></thead><tbody>${rows}</tbody></table>
<h2>教学反思</h2><p>${escapeHtml(d.reflection)}</p>`;
  return documentShell(`${pkg.title} · 教学设计`, body);
}

function buildTaskSheet(pkg) {
  const sheet = pkg.taskSheet;
  const sections = sheet.sections.map((section) => `<h2>${escapeHtml(section.title)}</h2>${list(section.items)}`).join('');
  return documentShell(sheet.title, `<h1>${escapeHtml(sheet.title)}</h1><div class="meta">班级：________ 姓名：________ 学号：________</div>${sections}`);
}

function buildExercises(pkg) {
  const items = pkg.exercises.map((item, index) => `
<div class="slide">
  <p><b>${index + 1}.</b> ${escapeHtml(item.stem)}（　　）</p>
  <p>${item.options.map((option, i) => `${LETTERS[i]}. ${escapeHtml(option)}`).join('　　')}</p>
  <p class="answer">答案：${LETTERS[item.answer]}　解析：${escapeHtml(item.analysis)}</p>
</div>`).join('');
  return documentShell(`${pkg.title} · 课后练习`, `<h1>${escapeHtml(pkg.title)} · 课后练习</h1>${metaLine(pkg)}${items}`);
}

/** 平台内智能体/工具的分享预览地址：老师下载后仍可从链接回到平台使用 */
export function platformShareUrl(id) {
  const { origin, pathname } = window.location;
  return `${origin}${pathname}#/agent-share?id=${encodeURIComponent(id)}`;
}

function buildPlatformManifest(pkg, key) {
  const source = key === 'agents' ? pkg.agents : pkg.tools;
  return JSON.stringify({
    package: pkg.title,
    type: key === 'agents' ? '智能体问答' : 'AI 教学工具',
    items: source.map((item) => ({ id: item.id, name: item.name, usage: item.usage, url: platformShareUrl(item.id) }))
  }, null, 2);
}

function buildVideoNote(pkg) {
  const video = pkg.video;
  return [
    `课程视频：${video.title}`,
    `时长：${video.duration}`,
    video.url ? `播放地址：${video.url}` : '状态：视频源尚未接入平台，接入后此处会提供下载或播放地址。'
  ].join('\n');
}

/** 资源类型 → { 文件名, 内容, MIME } */
function buildResourceFile(pkg, key) {
  switch (key) {
    case 'video':
      return { name: '01-课程视频说明.txt', content: buildVideoNote(pkg), mime: 'text/plain' };
    case 'slides':
      return { name: '02-课件（含讲稿）.html', content: buildSlides(pkg), mime: 'text/html' };
    case 'design':
      return { name: '03-教学设计.html', content: buildDesign(pkg), mime: 'text/html' };
    case 'agents':
      return { name: '04-智能体问答.json', content: buildPlatformManifest(pkg, 'agents'), mime: 'application/json' };
    case 'tools':
      return { name: '05-AI教学工具.json', content: buildPlatformManifest(pkg, 'tools'), mime: 'application/json' };
    case 'taskSheet':
      return { name: '06-学习任务单.html', content: buildTaskSheet(pkg), mime: 'text/html' };
    case 'exercises':
      return { name: '07-课后练习.html', content: buildExercises(pkg), mime: 'text/html' };
    default:
      return null;
  }
}

function buildReadme(pkg, keys) {
  const labels = RESOURCE_TYPES.filter((type) => keys.indexOf(type.key) !== -1).map((type) => `- ${type.label}`);
  return [
    `# ${pkg.title} · 课程包`,
    '',
    `${pkg.textbookLabel}`,
    `授课教师：${pkg.teacher}（${pkg.school}）`,
    '',
    '## 包含内容',
    ...labels,
    '',
    '## 如何改编',
    '- .html 文档可直接用 Word / WPS 打开，另存为 .docx 后自由修改。',
    '- 智能体与工具清单中的链接可回到平台直接使用，也可以在平台中复制后二次创作。',
    ''
  ].join('\n');
}

function triggerDownload(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadResource(pkg, key) {
  const file = buildResourceFile(pkg, key);
  if (!file) return;
  const blob = new Blob(['\ufeff', file.content], { type: `${file.mime};charset=utf-8` });
  triggerDownload(blob, `${pkg.title}-${file.name.replace(/^\d+-/, '')}`);
}

/** 一键打包：按所选资源类型生成 ZIP；JSZip 按需加载，不影响首屏体积 */
export async function downloadPackage(pkg, keys) {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  const folder = zip.folder(pkg.title);
  keys.forEach((key) => {
    const file = buildResourceFile(pkg, key);
    if (file) folder.file(file.name, `\ufeff${file.content}`);
  });
  folder.file('README.md', buildReadme(pkg, keys));
  const blob = await zip.generateAsync({ type: 'blob' });
  triggerDownload(blob, `${pkg.title}-课程包.zip`);
}
