// 科利华中学 AI 矩阵平台：分类字典（学科、场景、育人领域、年级）
// 管理员可在「目录管理」中增删改，运行时以 store 中的副本为准。

export const RESOURCE_TYPES = {
  agent: { label: '智能体', short: '智' },
  tool: { label: '工具', short: '工' },
  prompt: { label: '提示词', short: '词' }
};

export const MATRICES = {
  subject: { label: '学科 AI 矩阵', code: 'XK' },
  education: { label: '育人管理矩阵', code: 'YR' },
  course: { label: 'AI 赋能学程案例矩阵', code: 'XC' }
};

export const GRADES = ['七年级', '八年级', '九年级'];

export const SUBJECTS = [
  { key: 'yw', label: '语文', code: 'YW' },
  { key: 'sx', label: '数学', code: 'SX' },
  { key: 'yy', label: '英语', code: 'YY' },
  { key: 'wl', label: '物理', code: 'WL' },
  { key: 'hx', label: '化学', code: 'HX' },
  { key: 'sw', label: '生物', code: 'SW' },
  { key: 'df', label: '道德与法治', code: 'DF' },
  { key: 'ls', label: '历史', code: 'LS' },
  { key: 'dl', label: '地理', code: 'DL' },
  { key: 'xx', label: '信息科技', code: 'XX' },
  { key: 'ms', label: '美术', code: 'MS' },
  { key: 'ty', label: '体育', code: 'TY' },
  { key: 'xl', label: '心理健康', code: 'XL' }
];

export const SCENES = [
  { key: 'prepare', label: '备课', hint: '教材解读、教学设计、课件生成' },
  { key: 'teach', label: '课堂教学', hint: '情境创设、互动问答、课堂生成' },
  { key: 'tutor', label: '学习辅导', hint: '作业设计、错题诊断、个性辅导' },
  { key: 'assess', label: '评价反馈', hint: '作文批改、学情分析、评语生成' }
];

export const DOMAINS = [
  { key: 'headteacher', label: '班主任工作', code: 'BZR', hint: '班级建设、学生谈心、班会设计', planned: false },
  { key: 'moral', label: '德育活动', code: 'DY', hint: '主题活动、仪式教育、社会实践', planned: false },
  { key: 'mental', label: '心理健康', code: 'XL', hint: '情绪识别、心理课程、危机预警', planned: false },
  { key: 'home', label: '家校沟通', code: 'JX', hint: '家长会、通知撰写、家访记录', planned: false },
  { key: 'evaluate', label: '学生综合评价', code: 'PJ', hint: '成长档案、评语、综合素质', planned: false },
  { key: 'academic', label: '教务管理', code: 'JW', hint: '排课调课、考务、成绩分析', planned: false },
  { key: 'office', label: '行政办公', code: 'XZ', hint: '公文写作、会议纪要、制度梳理', planned: false },
  { key: 'safety', label: '安全与后勤', code: 'AQ', hint: '安全教育、应急预案、物资管理', planned: true }
];

export const PROMPT_CATEGORIES = ['备课设计', '课堂互动', '作业辅导', '评价反馈', '班级管理', '家校沟通', '行政写作'];
