// 学科 AI 矩阵：按「学科 → 年级 → 册次 → 单元 → 课时」组织的校本课例
// agentName 与资源库中的智能体名称对应；cover 决定课例封面（book 文科 / science 理科）。
// 正式接入后由后端接口返回，字段保持一致即可。

const L = (title, teacher, opts = {}) => ({ title, teacher, ai: false, featured: false, ...opts });

const RAW = [
  {
    subject: 'yw', grade: '七年级', volume: '上册', edition: '统编版', cover: 'book',
    units: [
      ['第一单元', '四季美景', [
        L('春', '陈雨桐', { ai: true, featured: true, agentName: '古诗文情境朗读', goal: '品味朱自清笔下春的生机，学习抓住景物特点、调动多种感官的写景方法。' }),
        L('济南的冬天', '王思远', { ai: true, agentName: '大单元备课助手', goal: '体会“温晴”的冬天特点，揣摩比喻、拟人等修辞的表达效果。' }),
        L('雨的四季', '林知夏', { featured: true, goal: '梳理四季之雨的不同形态，体会作者寄托在雨中的情感。' }),
        L('古代诗歌四首', '陈雨桐', { ai: true, agentName: '古诗文情境朗读', goal: '借助节奏与意象朗读古诗，体会诗人情感，积累写景名句。' })
      ]],
      ['第二单元', '至爱亲情', [
        L('秋天的怀念', '林知夏', { ai: true, featured: true, agentName: '作文分项批改官', goal: '抓住细节描写体会母爱的深沉，理解“好好儿活”的含义。' }),
        L('散步', '王思远', { goal: '理解一家人在分歧中的相互体谅，体会平凡生活中的责任与亲情。' }),
        L('散文诗二首', '周可言', { ai: true, agentName: '古诗文情境朗读', goal: '朗读品味散文诗的语言节奏，感受孩子对母亲的依恋。' }),
        L('《世说新语》二则', '陈雨桐', { featured: true, goal: '积累文言词语，体会人物语言中的机智与家风。' })
      ]],
      ['第三单元', '学习生活', [
        L('从百草园到三味书屋', '王思远', { ai: true, agentName: '大单元备课助手', goal: '比较两处生活场景，体会作者对童年的怀念与成长的思考。' }),
        L('再塑生命的人', '周可言', { goal: '感受莎莉文老师的教育智慧，理解“爱与光明”对生命的意义。' }),
        L('《论语》十二章', '林知夏', { ai: true, featured: true, agentName: '大单元备课助手', goal: '诵读积累《论语》名句，联系自身学习体会为学之道。' })
      ]],
      ['第四单元', '人生之舟', [
        L('纪念白求恩', '陈雨桐', { featured: true, goal: '把握议论性文字的观点与论据，理解白求恩精神的时代价值。' }),
        L('植树的牧羊人', '周可言', { ai: true, agentName: '作文分项批改官', goal: '梳理牧羊人数十年的坚持，体会平凡人的伟大。' }),
        L('走一步，再走一步', '林知夏', { goal: '体会“我”在困境中的心理变化，学习化整为零面对困难。' })
      ]]
    ]
  },
  {
    subject: 'yw', grade: '七年级', volume: '下册', edition: '统编版', cover: 'book',
    units: [
      ['第一单元', '群星闪耀', [
        L('邓稼先', '王思远', { ai: true, featured: true, agentName: '大单元备课助手', goal: '了解邓稼先的贡献与品格，学习多角度刻画人物的写法。' }),
        L('说和做', '陈雨桐', { goal: '体会闻一多先生言行一致的品格，品味凝练传神的语言。' }),
        L('回忆鲁迅先生', '周可言', { ai: true, agentName: '作文分项批改官', goal: '通过生活细节认识鲁迅，学习选取典型材料写人。' }),
        L('孙权劝学', '林知夏', { featured: true, goal: '积累文言知识，理解“刮目相待”中学习改变人的道理。' })
      ]]
    ]
  },
  {
    subject: 'yw', grade: '八年级', volume: '上册', edition: '统编版', cover: 'book',
    units: [
      ['第一单元', '新闻在身边', [
        L('消息二则', '王思远', { ai: true, agentName: '大单元备课助手', goal: '比较两则消息的结构，体会新闻语言的准确简洁。' }),
        L('“飞天”凌空', '陈雨桐', { featured: true, goal: '体会新闻特写抓细节、重现场的写法。' }),
        L('新闻写作与发布', '林知夏', { ai: true, featured: true, agentName: '作文分项批改官', goal: '完成新闻写作并互评修改，汇编班级小报。' })
      ]]
    ]
  },
  {
    subject: 'sx', grade: '七年级', volume: '上册', edition: '苏科版', cover: 'science',
    units: [
      ['第二章', '有理数', [
        L('正数与负数', '李明哲', { featured: true, goal: '在生活情境中理解正负数的意义，会用正负数表示相反意义的量。' }),
        L('数轴', '赵可欣', { ai: true, agentName: '函数图像探究伙伴', goal: '理解数轴三要素，能在数轴上表示有理数并比较大小。' }),
        L('绝对值与相反数', '李明哲', { ai: true, agentName: '错题诊断助手', goal: '理解绝对值的几何意义，掌握相反数的求法。' }),
        L('有理数的加法与减法', '赵可欣', { ai: true, featured: true, agentName: '分层作业设计师', goal: '探索有理数加减法则，能熟练进行运算。' })
      ]],
      ['第三章', '代数式', [
        L('字母表示数', '李明哲', { goal: '体会用字母表示数的简洁与一般性。' }),
        L('代数式的值', '赵可欣', { ai: true, agentName: '分层作业设计师', goal: '会求代数式的值，体会“数”与“式”的联系。' }),
        L('合并同类项', '李明哲', { featured: true, goal: '识别同类项，掌握合并同类项的法则。' })
      ]]
    ]
  },
  {
    subject: 'sx', grade: '八年级', volume: '上册', edition: '苏科版', cover: 'science',
    units: [
      ['第六章', '一次函数', [
        L('一次函数的概念', '李明哲', { ai: true, agentName: '分层作业设计师', goal: '从实际问题抽象出一次函数解析式。' }),
        L('一次函数的图像与性质', '赵可欣', { ai: true, featured: true, agentName: '函数图像探究伙伴', goal: '探究 k、b 对图像的影响。' }),
        L('用一次函数解决问题', '李明哲', { goal: '用一次函数为社团活动设计最优收费方案。' })
      ]]
    ]
  },
  {
    subject: 'yy', grade: '七年级', volume: '上册', edition: '译林版', cover: 'book',
    units: [
      ['Unit 1', 'This is me', [
        L('Welcome to the unit', 'Grace 周', { goal: '用简单句介绍自己的姓名、年龄与爱好。' }),
        L('Reading: Meet our new friends', '沈一鸣', { ai: true, featured: true, agentName: '英语口语陪练', goal: '读懂人物介绍文本，提取关键信息并复述。' }),
        L('Speaking & Writing: My profile', 'Grace 周', { ai: true, agentName: '英语写作润色', goal: '完成个人简介写作并在小组中展示。' })
      ]],
      ['Unit 2', "Let's play sports", [
        L('Reading: My favourite sport', '沈一鸣', { featured: true, goal: '读懂运动明星介绍，学习一般现在时的用法。' }),
        L('Speaking: 运动话题对话', 'Grace 周', { ai: true, agentName: '英语口语陪练', goal: '围绕运动爱好开展情境对话练习。' })
      ]]
    ]
  },
  {
    subject: 'wl', grade: '八年级', volume: '上册', edition: '苏科版', cover: 'science',
    units: [
      ['第三章', '光现象', [
        L('光的色彩与颜色', '孙浩然', { goal: '认识光的色散与物体的颜色。' }),
        L('光的直线传播', '孙浩然', { ai: true, agentName: '物理实验模拟讲解', goal: '通过小孔成像实验理解光的直线传播。' }),
        L('平面镜成像', '韩书言', { ai: true, featured: true, agentName: '物理实验模拟讲解', goal: '探究平面镜成像的特点并解释生活现象。' })
      ]]
    ]
  }
];

// 示例浏览数据：按课时序号生成稳定的数字，避免每次渲染变化
const stat = (seed) => ({
  views: 2000 + ((seed * 7919) % 11000),
  likes: 300 + ((seed * 104729) % 3200),
  rating: Math.round((4.6 + ((seed * 31) % 4) / 10) * 10) / 10,
  ratingCount: 120 + ((seed * 613) % 800)
});

let seq = 0;

export const LESSON_UNITS = RAW.flatMap((book) => book.units.map(([order, title, lessons], ui) => {
  const unitId = `${book.subject}-${book.grade}-${book.volume}-${ui + 1}`;
  return {
    id: unitId,
    subject: book.subject,
    grade: book.grade,
    volume: book.volume,
    edition: book.edition,
    order,
    title,
    lessons: lessons.map((l) => {
      seq += 1;
      return { ...l, ...stat(seq), id: `ls${seq}`, unitId, cover: book.cover, school: '南京市科利华中学' };
    })
  };
}));
