// 教学工作台：课程包示例数据。
// agents / tools 中的 id 为平台「智能体广场」里已有的智能体与实用工具，课堂中点击会直接调起平台预览，实现资源打通。
// video.url 为空表示视频尚未接入，界面展示「待接入」状态而不是伪造播放源。
import lensCover from '@/assets/teaching/lens-imaging.jpg';
import reflectionCover from '@/assets/teaching/light-reflection.jpg';
import refractionCover from '@/assets/teaching/light-refraction.jpg';

/** 课程包内的资源类型：顺序即详情页与课堂切换栏的展示顺序 */
export const RESOURCE_TYPES = [
  { key: 'video', label: '课程视频', short: '视频', icon: 'play', tone: 'orange' },
  { key: 'slides', label: '课件', short: '课件', icon: 'slides', tone: 'red' },
  { key: 'design', label: '教学设计', short: '教案', icon: 'pen', tone: 'blue' },
  { key: 'agents', label: '智能体问答', short: '智能体', icon: 'bot', tone: 'violet' },
  { key: 'tools', label: 'AI 教学工具', short: '工具', icon: 'wand', tone: 'indigo' },
  { key: 'taskSheet', label: '学习任务单', short: '任务单', icon: 'clipboard', tone: 'green' },
  { key: 'exercises', label: '课后练习', short: '练习', icon: 'edit', tone: 'teal' }
];

export const PACKAGES = [
  {
    id: 'pkg-lens-imaging',
    title: '探究凸透镜成像的规律',
    subject: 'physics',
    lessonIds: ['sk8a-4-3', 'rj8a-5-3'],
    textbookLabel: '物理 · 八年级上册 · 苏科版 / 人教版通用',
    tags: ['精品课程包', '智能体赋能', '实验探究'],
    teacher: '陈思远',
    school: '示范初级中学',
    org: '区教师发展中心',
    cover: lensCover,
    duration: '45 分钟',
    updatedAt: '2026/10/18',
    views: 13200,
    likes: 412,
    rating: 4.8,
    ratingCount: 216,
    summary: '以“用凸透镜把发光的东方明珠接在光屏上”的挑战导入，学生分组完成光具座实验，借助 AI 演示工具验证规律，再由学伴智能体进行个性化答疑。',
    video: {
      title: '探究凸透镜成像的规律 · 课堂实录',
      duration: '40 分钟',
      url: ''
    },
    slides: [
      { layout: 'cover', title: '4.3 探究凸透镜成像的规律', subtitle: '第四章 光的折射 透镜', note: '开场：展示一张东方明珠夜景照片，提问“能不能把它装进光屏里？”' },
      { layout: 'question', title: '试一试', points: ['用凸透镜把窗外的景物接在光屏上', '你在光屏上看到了什么样的像？'], note: '学生自由尝试 2 分钟，鼓励描述像的正倒、大小。' },
      { layout: 'bullets', title: '相关概念', points: ['实像：由实际光线会聚而成，可以呈现在光屏上', '虚像：不是实际光线会聚而成，不能呈现在光屏上', '物距 u：物体到透镜光心的距离；像距 v：像到光心的距离'], note: '用光路图区分实像与虚像，强调“能否被光屏承接”是判断依据。' },
      { layout: 'activity', title: '分组实验', points: ['器材：光具座、凸透镜（f = 10 cm）、蜡烛、光屏', '调节烛焰、透镜、光屏中心在同一高度', '依次改变物距，移动光屏直到像最清晰，记录 u、v 与像的性质'], note: '巡视时关注“三心同高”是否调节到位，提醒学生如实记录。' },
      { layout: 'table', title: '凸透镜成像规律', table: { head: ['物距 u', '像的性质', '像距 v', '应用'], rows: [['u > 2f', '倒立 缩小 实像', 'f < v < 2f', '照相机'], ['u = 2f', '倒立 等大 实像', 'v = 2f', '测焦距'], ['f < u < 2f', '倒立 放大 实像', 'v > 2f', '投影仪'], ['u = f', '不成像', '—', '获得平行光'], ['u < f', '正立 放大 虚像', '同侧', '放大镜']] }, note: '引导学生从数据中归纳，再用 AI 演示工具动态验证。' },
      { layout: 'bullets', title: '规律记忆', points: ['一倍焦距分虚实，二倍焦距分大小', '成实像时：物近像远像变大', '成虚像时：物近像近像变小'], note: '结合 AI 工具拖动蜡烛，让学生观察像距和像的变化。' },
      { layout: 'summary', title: '课堂小结', points: ['凸透镜成像的五种情况及应用', '实验中“三心同高”的作用', '课后：用手机镜头观察并解释成像'], note: '布置课后练习，学生可在家继续向学伴智能体提问。' }
    ],
    design: {
      objectives: [
        '通过分组实验，归纳凸透镜成像的规律，能说出不同物距下像的性质。',
        '经历“提出问题—设计实验—收集数据—归纳结论”的科学探究过程。',
        '能用成像规律解释照相机、投影仪、放大镜的工作原理。'
      ],
      keyPoints: ['凸透镜成像规律的探究过程与结论'],
      difficulties: ['从实验数据中归纳规律；理解物距变化时像距、像大小的变化趋势'],
      preparation: ['光具座、f = 10 cm 凸透镜、蜡烛、光屏（每组一套）', '平台工具「演示凸透镜成像规律」', '学伴智能体「凸透镜学伴智能体」'],
      process: [
        { stage: '情境导入', minutes: 5, teacher: '展示东方明珠夜景，发起“把它装进光屏”挑战。', student: '用凸透镜尝试在光屏上成像，描述像的特点。', resource: '课件第 1–2 页' },
        { stage: '概念建构', minutes: 6, teacher: '讲解实像、虚像、物距、像距。', student: '结合光路图区分实像与虚像。', resource: '课件第 3 页' },
        { stage: '分组探究', minutes: 16, teacher: '指导调节三心同高，巡视记录。', student: '改变物距完成实验，填写学习任务单数据表。', resource: '学习任务单' },
        { stage: 'AI 验证', minutes: 8, teacher: '使用 AI 演示工具拖动物体，动态呈现成像变化。', student: '对比实验数据，修正并归纳规律。', resource: 'AI 教学工具' },
        { stage: '应用拓展', minutes: 6, teacher: '解释照相机、投影仪、放大镜原理。', student: '向学伴智能体提出自己的疑问。', resource: '智能体问答' },
        { stage: '小结检测', minutes: 4, teacher: '总结规律口诀，布置课后练习。', student: '完成当堂检测题。', resource: '课后练习' }
      ],
      reflection: '实验环节学生容易忽视“三心同高”导致像偏移，可在课前用 1 分钟示范；AI 工具适合放在实验之后，避免替代学生的真实探究。'
    },
    agents: [
      { id: '2115714294103355393', name: '凸透镜学伴智能体', usage: '课中答疑：学生就成像规律自由提问，获得启发式引导' },
      { id: '2102402563838746626', name: '初中物理答疑解惑', usage: '课后辅导：拓展到眼睛、照相机等生活应用问题' }
    ],
    tools: [
      { id: '2100125550755393537', name: '演示凸透镜成像规律', usage: '拖动蜡烛位置，动态呈现像的位置与大小变化' },
      { id: '2110538016538402817', name: '凸透镜成像规律（苏科版）', usage: '与教材配套的交互探究，适合学生上台操作' }
    ],
    taskSheet: {
      title: '《探究凸透镜成像的规律》学习任务单',
      sections: [
        { title: '任务一：试一试', items: ['用凸透镜把窗外景物接在光屏上，描述像的正倒、大小：__________'] },
        { title: '任务二：分组实验记录（f = 10 cm）', items: ['物距 30 cm：像距 ____ cm，像的性质 __________', '物距 20 cm：像距 ____ cm，像的性质 __________', '物距 15 cm：像距 ____ cm，像的性质 __________', '物距 5 cm：光屏上能否承接到像？透过透镜看到 __________'] },
        { title: '任务三：归纳与应用', items: ['一倍焦距分 ______，二倍焦距分 ______。', '照相机利用了 u ______ 2f 时成 ______ 的像。'] }
      ]
    },
    exercises: [
      { stem: '用焦距为 10 cm 的凸透镜做实验，蜡烛距透镜 25 cm，光屏上成的像是', options: ['倒立、缩小的实像', '倒立、放大的实像', '正立、放大的虚像', '倒立、等大的实像'], answer: 0, analysis: 'u = 25 cm > 2f = 20 cm，成倒立、缩小的实像，照相机就是利用这一原理。' },
      { stem: '投影仪成像时，投影片到镜头的距离应满足', options: ['u > 2f', 'f < u < 2f', 'u < f', 'u = 2f'], answer: 1, analysis: '投影仪成倒立、放大的实像，物距应在一倍焦距与二倍焦距之间。' },
      { stem: '成实像时，若物体从远处逐渐靠近焦点，则', options: ['像距变大，像变大', '像距变小，像变小', '像距变大，像变小', '像距不变，像变大'], answer: 0, analysis: '成实像时“物近像远像变大”。' },
      { stem: '实验中用纸遮住凸透镜的下半部分，光屏上', options: ['只剩上半部分的像', '只剩下半部分的像', '像仍完整，但亮度变暗', '不能成像'], answer: 2, analysis: '物体上每一点发出的光仍有部分通过上半部分透镜会聚成像，只是会聚的光变少，像变暗。' },
      { stem: '用放大镜观察邮票时，邮票到放大镜的距离应', options: ['大于二倍焦距', '等于二倍焦距', '在一倍与二倍焦距之间', '小于一倍焦距'], answer: 3, analysis: 'u < f 时成正立、放大的虚像，这就是放大镜的原理。' }
    ]
  },
  {
    id: 'pkg-light-reflection',
    title: '光的反射',
    subject: 'physics',
    lessonIds: ['sk8a-3-5', 'rj8a-4-2'],
    textbookLabel: '物理 · 八年级上册 · 苏科版 / 人教版通用',
    tags: ['精品课程包', '智能体赋能'],
    teacher: '林晓禾',
    school: '实验初级中学',
    org: '区教师发展中心',
    cover: reflectionCover,
    duration: '45 分钟',
    updatedAt: '2026/09/26',
    views: 9860,
    likes: 305,
    rating: 4.7,
    ratingCount: 158,
    summary: '从“激光笔如何击中目标”的游戏切入，用可折转纸板探究反射定律，借助平台交互工具建构“法线”概念，并区分镜面反射与漫反射。',
    video: { title: '光的反射 · 课堂实录', duration: '38 分钟', url: '' },
    slides: [
      { layout: 'cover', title: '3.5 光的反射', subtitle: '第三章 光现象', note: '用激光笔照向镜子，让光点落在黑板的目标上，引发好奇。' },
      { layout: 'question', title: '想一想', points: ['如何让激光经平面镜反射后击中目标？', '反射光的方向由什么决定？'], note: '请两名学生上台尝试，其余学生预测。' },
      { layout: 'bullets', title: '认识“一点两角三线”', points: ['入射点 O；法线 ON：过入射点垂直于镜面的直线', '入射角 i：入射光线与法线的夹角', '反射角 r：反射光线与法线的夹角'], note: '强调入射角是与法线的夹角，而不是与镜面的夹角。' },
      { layout: 'activity', title: '探究实验', points: ['把可折转纸板竖直立在平面镜上', '改变入射角，量出对应的反射角，记录 3 组数据', '把纸板 NOF 向后折，观察还能否看到反射光'], note: '提醒学生用量角器读数时视线与刻度垂直。' },
      { layout: 'bullets', title: '光的反射定律', points: ['反射光线、入射光线和法线在同一平面内', '反射光线、入射光线分别位于法线两侧', '反射角等于入射角；在反射现象中，光路可逆'], note: '用 AI 交互工具拖动入射光线，验证“两角相等”。' },
      { layout: 'table', title: '镜面反射与漫反射', table: { head: ['类型', '反射面', '特点', '实例'], rows: [['镜面反射', '光滑', '平行光反射后仍平行', '黑板“反光”'], ['漫反射', '粗糙', '反射光射向各个方向', '从各个方向看到书本']] }, note: '两种反射都遵循光的反射定律。' },
      { layout: 'summary', title: '课堂小结', points: ['一点两角三线', '光的反射定律与光路可逆', '镜面反射与漫反射'], note: '布置课后练习。' }
    ],
    design: {
      objectives: ['通过实验探究得出光的反射定律。', '能用光路图表示光的反射现象。', '能区分镜面反射与漫反射并解释生活现象。'],
      keyPoints: ['光的反射定律'],
      difficulties: ['法线概念的建立；“三线共面”的实验验证'],
      preparation: ['平面镜、可折转纸板、激光笔、量角器', '平台工具「光的反射规律（法线概念建构）」'],
      process: [
        { stage: '游戏导入', minutes: 5, teacher: '激光击靶游戏。', student: '预测并尝试调整镜面角度。', resource: '课件第 1–2 页' },
        { stage: '概念建立', minutes: 7, teacher: '借助交互工具引出法线。', student: '标注一点两角三线。', resource: 'AI 教学工具' },
        { stage: '探究实验', minutes: 15, teacher: '指导实验与数据记录。', student: '测量入射角与反射角，折转纸板。', resource: '学习任务单' },
        { stage: '归纳定律', minutes: 8, teacher: '组织汇报，归纳定律。', student: '用数据说明结论。', resource: '课件第 5 页' },
        { stage: '拓展应用', minutes: 6, teacher: '对比镜面反射与漫反射。', student: '向智能体提出生活中的反射问题。', resource: '智能体问答' },
        { stage: '当堂检测', minutes: 4, teacher: '布置检测。', student: '完成课后练习。', resource: '课后练习' }
      ],
      reflection: '“入射角是与法线的夹角”是学生最常见的错误，建议在检测题中重点设置。'
    },
    agents: [
      { id: '2102402563838746626', name: '初中物理答疑解惑', usage: '学生就反射现象自由提问' }
    ],
    tools: [
      { id: '2101877299568353281', name: '光的反射规律（法线概念建构）', usage: '拖动入射光线，建构法线与两角关系' },
      { id: '2102421684840210433', name: '光的反射', usage: '镜面反射与漫反射的交互对比' }
    ],
    taskSheet: {
      title: '《光的反射》学习任务单',
      sections: [
        { title: '任务一：标注', items: ['在光路图中标出入射点、法线、入射角和反射角。'] },
        { title: '任务二：实验记录', items: ['入射角 30°，反射角 ____', '入射角 45°，反射角 ____', '入射角 60°，反射角 ____', '纸板 NOF 向后折后，______（能/不能）看到反射光。'] },
        { title: '任务三：结论', items: ['反射角 ______ 入射角；反射光线、入射光线和法线在 ______ 内。'] }
      ]
    },
    exercises: [
      { stem: '一束光与镜面的夹角为 30°，则反射角为', options: ['30°', '60°', '90°', '120°'], answer: 1, analysis: '入射角是入射光线与法线的夹角：90° − 30° = 60°，反射角等于入射角。' },
      { stem: '入射角增大 10°，反射光线与入射光线的夹角', options: ['增大 10°', '增大 20°', '减小 10°', '不变'], answer: 1, analysis: '两角之和为 2i，入射角增大 10°，夹角增大 20°。' },
      { stem: '黑板“反光”导致部分同学看不清字，这是因为发生了', options: ['漫反射', '镜面反射', '光的折射', '光的直线传播'], answer: 1, analysis: '黑板局部过于光滑，发生镜面反射，反射光集中射向某一方向。' },
      { stem: '把纸板 NOF 向后折，看不到反射光，说明', options: ['反射角等于入射角', '光路可逆', '反射光线、入射光线和法线在同一平面内', '反射光线消失了'], answer: 2, analysis: '纸板折转后不再与入射光线、法线共面，所以无法显示反射光线。' }
    ]
  },
  {
    id: 'pkg-light-refraction',
    title: '光的折射',
    subject: 'physics',
    lessonIds: ['sk8a-4-1', 'rj8a-4-4'],
    textbookLabel: '物理 · 八年级上册 · 苏科版 / 人教版通用',
    tags: ['精品课程包', '演示实验'],
    teacher: '周启明',
    school: '育才初级中学',
    org: '区教师发展中心',
    cover: refractionCover,
    duration: '45 分钟',
    updatedAt: '2026/09/30',
    views: 7640,
    likes: 238,
    rating: 4.6,
    ratingCount: 121,
    summary: '从“水中的筷子为什么折断了”出发，利用水槽与激光观察光的折射，借助 AI 动画演示全反射，最后解释叉鱼、海市蜃楼等现象。',
    video: { title: '光的折射 · 课堂实录', duration: '41 分钟', url: '' },
    slides: [
      { layout: 'cover', title: '4.1 光的折射', subtitle: '第四章 光的折射 透镜', note: '展示插在水杯中“折断”的筷子。' },
      { layout: 'question', title: '奇怪的现象', points: ['水中的筷子为什么看起来“折断”了？', '池水看起来为什么比实际浅？'], note: '先让学生凭生活经验猜测。' },
      { layout: 'activity', title: '观察实验', points: ['激光从空气斜射入水中，观察光的传播方向', '改变入射角，观察折射角如何变化', '让光垂直射入水面，观察方向是否改变'], note: '水中滴入少量牛奶，烟雾显示空气中的光路。' },
      { layout: 'bullets', title: '光的折射规律', points: ['折射光线、入射光线和法线在同一平面内，分居法线两侧', '光从空气斜射入水或玻璃中，折射角小于入射角', '入射角增大，折射角也增大；垂直入射时方向不变'], note: '用 AI 动画演示光从水射向空气时的全反射。' },
      { layout: 'summary', title: '课堂小结', points: ['光的折射规律', '光路可逆', '解释叉鱼、池水变浅、海市蜃楼'], note: '布置课后练习。' }
    ],
    design: {
      objectives: ['通过实验认识光的折射现象，知道折射规律。', '能用折射规律解释生活中的现象。'],
      keyPoints: ['光的折射规律'],
      difficulties: ['用折射规律解释“看到的像”的位置'],
      preparation: ['水槽、激光笔、牛奶、烟雾', '平台工具「生成光的折射全反射演示动画」'],
      process: [
        { stage: '现象导入', minutes: 5, teacher: '展示“折断”的筷子。', student: '描述并猜测原因。', resource: '课件第 1–2 页' },
        { stage: '观察实验', minutes: 15, teacher: '演示并指导分组观察。', student: '记录入射角与折射角的变化。', resource: '学习任务单' },
        { stage: '归纳规律', minutes: 10, teacher: '组织归纳折射规律。', student: '对比反射规律总结异同。', resource: '课件第 4 页' },
        { stage: 'AI 演示', minutes: 7, teacher: '动画演示全反射。', student: '观察临界现象。', resource: 'AI 教学工具' },
        { stage: '解释现象', minutes: 8, teacher: '解释叉鱼、海市蜃楼。', student: '完成课后练习。', resource: '课后练习' }
      ],
      reflection: '解释“看到的鱼比实际高”时，应让学生先画出光路再判断，而不是直接记结论。'
    },
    agents: [
      { id: '2102402563838746626', name: '初中物理答疑解惑', usage: '解释生活中的折射现象' },
      { id: '2100796448098078721', name: '小课题研究小助手', usage: '课后小课题：自制“消失的硬币”实验' }
    ],
    tools: [
      { id: '2100125375106330626', name: '生成光的折射全反射演示动画', usage: '动态演示折射与全反射' }
    ],
    taskSheet: {
      title: '《光的折射》学习任务单',
      sections: [
        { title: '任务一：观察记录', items: ['光从空气斜射入水中，折射角 ______ 入射角。', '入射角增大，折射角 ______。', '光垂直射入水中时，传播方向 ______。'] },
        { title: '任务二：画一画', items: ['画出人在岸上看到水中鱼的光路图，并标出鱼的像。'] }
      ]
    },
    exercises: [
      { stem: '光从空气斜射入水中时，折射角与入射角相比', options: ['折射角大于入射角', '折射角小于入射角', '两者相等', '无法确定'], answer: 1, analysis: '光从空气斜射入水中，折射光线偏向法线，折射角小于入射角。' },
      { stem: '用鱼叉叉鱼时，应对准看到的“鱼”的', options: ['上方', '下方', '正前方', '任意位置'], answer: 1, analysis: '看到的是鱼经折射形成的虚像，位置比实际偏高，所以要往下叉。' },
      { stem: '下列现象属于光的折射的是', options: ['小孔成像', '水中倒影', '海市蜃楼', '树下的影子'], answer: 2, analysis: '海市蜃楼是光在密度不均匀的空气中发生折射形成的。' },
      { stem: '站在岸上看清澈的池底，看到的深度比实际', options: ['深', '浅', '一样', '无法判断'], answer: 1, analysis: '池底反射的光从水中斜射入空气中，折射角大于入射角，看到的像比实际位置浅。' }
    ]
  }
];

export function getPackage(id) {
  return PACKAGES.find((item) => item.id === id) || null;
}

export function packagesOfLesson(lessonId) {
  return PACKAGES.filter((item) => item.lessonIds.indexOf(lessonId) !== -1);
}
