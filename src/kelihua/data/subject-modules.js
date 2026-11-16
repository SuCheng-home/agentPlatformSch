// 学科应用矩阵：每个学科只展示本学科的知识模块。
// 物理五大模块来自教师说明文档「所属知识模块（声 光 力 热 电）」；信息科技按学校要求分三块。
// 模块色避开橙（工具）与蓝（智能体），配图位于 assets/modules/<key>.webp。
// 数学的真实资源尚未提供，模块先占位，待学校资料到位后补充。

export const SUBJECT_MODULES = {
  sx: {
    ready: false,
    modules: [
      { key: 'number', label: '数与代数', tone: 'teal' },
      { key: 'geometry', label: '图形与几何', tone: 'forest' },
      { key: 'statistics', label: '统计与概率', tone: 'brick' },
      { key: 'practice', label: '综合与实践', tone: 'plum' }
    ]
  },
  wl: {
    ready: true,
    modules: [
      { key: 'sound', label: '声', tone: 'teal' },
      { key: 'light', label: '光', tone: 'slate' },
      { key: 'force', label: '力', tone: 'forest' },
      { key: 'heat', label: '热', tone: 'brick' },
      { key: 'electricity', label: '电', tone: 'plum' }
    ],
    common: { key: 'common', label: '全模块通用', tone: 'stone' }
  },
  xx: {
    ready: true,
    modules: [
      { key: 'internet', label: '互联网', tone: 'teal' },
      { key: 'iot', label: '物联网', tone: 'forest' },
      { key: 'ai', label: '人工智能', tone: 'plum' }
    ]
  }
};

// 资源 → 所属模块与截图。模块依据教师说明文档；截图为平台实际页面或说明文档中的平台截图。
const SHOT = (id) => `kelihua-materials/shots/${id}.webp`;

export const RESOURCE_OVERLAY = {
  'resource-409f7d8de448': { modules: ['ai'] },
  'resource-570e341fe373': { modules: ['ai'] },
  'resource-162a99fc2d54': { modules: ['common'], shot: SHOT('162a99fc2d54') },
  'resource-6fd2d801fa34': { modules: ['electricity'], shot: SHOT('6fd2d801fa34') },
  'resource-fc0d423c1875': { modules: ['electricity'], shot: SHOT('fc0d423c1875') },
  'resource-83532bbac46b': { modules: ['electricity'], shot: SHOT('83532bbac46b') },
  'resource-c7767108d6f1': { modules: ['electricity'], shot: SHOT('c7767108d6f1') },
  'resource-a98b52e0f180': { modules: ['electricity'], shot: SHOT('a98b52e0f180') },
  'resource-41c7375746a5': { modules: ['electricity'], shot: SHOT('41c7375746a5') },
  'resource-8a585d0ad897': { modules: ['electricity'], shot: SHOT('8a585d0ad897') },
  // 说明文档标注为「电」，但内容为砖块底面积、重心与稳定性，按内容归入「力」，待作者确认。
  'resource-f30e865db7e9': { modules: ['force'], shot: SHOT('f30e865db7e9') },
  'resource-e59a7bf0e144': { modules: ['force'], shot: SHOT('e59a7bf0e144') },
  'resource-839cc4c013c7': { modules: ['force'], shot: SHOT('839cc4c013c7') },
  'resource-3ebd22e786c6': { modules: ['force', 'heat'], shot: SHOT('3ebd22e786c6') },
  'resource-82d3c8ad7b10': { modules: ['common'], shot: SHOT('82d3c8ad7b10') },
  'resource-1b9a5e149df8': { modules: ['electricity'], shot: SHOT('1b9a5e149df8') },
  'resource-1c69554bfd74': { modules: ['light'], shot: SHOT('1c69554bfd74') },
  'resource-4b24b429f8a0': { modules: ['light'], shot: SHOT('4b24b429f8a0') },
  'resource-eec5b5163187': { modules: ['electricity'], shot: SHOT('eec5b5163187'), url: 'https://aigc-rk.infi.cn/u3gps/html/6ada2bac777b780001bdee7e' },
  'resource-793b8d3d176f': { modules: ['electricity'], shot: SHOT('793b8d3d176f'), url: 'https://aigc-rk.infi.cn/u3gps/html/6adeb8c120bfa60001ab577f' },
  'resource-3d5f5d56e782': { modules: ['electricity'], shot: SHOT('3d5f5d56e782'), url: 'https://aigc-rk.infi.cn/u3gps/html/6adebeb657822b0001258773' },
  'resource-9cca1c1bdfce': { modules: ['force'], shot: SHOT('9cca1c1bdfce') },
  'resource-bc244e4c7e12': { modules: ['force'], shot: SHOT('bc244e4c7e12') },
  'resource-50b0ea215414': { modules: ['force'], shot: SHOT('50b0ea215414') },
  'resource-c745af7cff8f': { modules: ['light'] }
};
