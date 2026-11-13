// 教学工作台：学科与教材目录（示例数据）。
// 课时 id 全局唯一，课程包通过 lessonIds 关联到一个或多个教材版本下的课时。

export const SUBJECTS = [
  { code: 'physics', name: '物理' },
  { code: 'chinese', name: '语文' },
  { code: 'math', name: '数学' },
  { code: 'english', name: '英语' },
  { code: 'chemistry', name: '化学' },
  { code: 'biology', name: '生物学' },
  { code: 'history', name: '历史' },
  { code: 'geography', name: '地理' }
];

export const TEXTBOOKS = [
  {
    id: 'sk-phy-8a',
    subject: 'physics',
    edition: '苏科版',
    grade: '八年级',
    volume: '上册',
    chapters: [
      {
        id: 'sk8a-c1',
        name: '第一章 声现象',
        lessons: [
          { id: 'sk8a-1-1', name: '1.1 声音是什么' },
          { id: 'sk8a-1-2', name: '1.2 乐音的三个特征' },
          { id: 'sk8a-1-3', name: '1.3 噪声及其控制' },
          { id: 'sk8a-1-4', name: '1.4 人耳听不见的声音' }
        ]
      },
      {
        id: 'sk8a-c2',
        name: '第二章 物态变化',
        lessons: [
          { id: 'sk8a-2-1', name: '2.1 物质的三态 温度的测量' },
          { id: 'sk8a-2-2', name: '2.2 汽化和液化' },
          { id: 'sk8a-2-3', name: '2.3 熔化和凝固' },
          { id: 'sk8a-2-4', name: '2.4 升华和凝华' }
        ]
      },
      {
        id: 'sk8a-c3',
        name: '第三章 光现象',
        lessons: [
          { id: 'sk8a-3-1', name: '3.1 光的色彩 颜色' },
          { id: 'sk8a-3-2', name: '3.2 人眼看不见的光' },
          { id: 'sk8a-3-3', name: '3.3 光的直线传播' },
          { id: 'sk8a-3-4', name: '3.4 平面镜' },
          { id: 'sk8a-3-5', name: '3.5 光的反射' }
        ]
      },
      {
        id: 'sk8a-c4',
        name: '第四章 光的折射 透镜',
        lessons: [
          { id: 'sk8a-4-1', name: '4.1 光的折射' },
          { id: 'sk8a-4-2', name: '4.2 透镜' },
          { id: 'sk8a-4-3', name: '4.3 探究凸透镜成像的规律' },
          { id: 'sk8a-4-4', name: '4.4 照相机与眼球 视力的矫正' },
          { id: 'sk8a-4-5', name: '4.5 望远镜与显微镜' }
        ]
      },
      {
        id: 'sk8a-c5',
        name: '第五章 物体的运动',
        lessons: [
          { id: 'sk8a-5-1', name: '5.1 长度和时间的测量' },
          { id: 'sk8a-5-2', name: '5.2 速度' },
          { id: 'sk8a-5-3', name: '5.3 直线运动' },
          { id: 'sk8a-5-4', name: '5.4 运动的相对性' }
        ]
      }
    ]
  },
  {
    id: 'sk-phy-8b',
    subject: 'physics',
    edition: '苏科版',
    grade: '八年级',
    volume: '下册',
    chapters: [
      {
        id: 'sk8b-c6',
        name: '第六章 物质的物理属性',
        lessons: [
          { id: 'sk8b-6-1', name: '6.1 物体的质量' },
          { id: 'sk8b-6-2', name: '6.2 测量物体的质量' },
          { id: 'sk8b-6-3', name: '6.3 物质的密度' },
          { id: 'sk8b-6-4', name: '6.4 密度知识的应用' }
        ]
      },
      {
        id: 'sk8b-c8',
        name: '第八章 力',
        lessons: [
          { id: 'sk8b-8-1', name: '8.1 力 弹力' },
          { id: 'sk8b-8-2', name: '8.2 重力 力的示意图' },
          { id: 'sk8b-8-3', name: '8.3 摩擦力' },
          { id: 'sk8b-8-4', name: '8.4 力的作用是相互的' }
        ]
      }
    ]
  },
  {
    id: 'rj-phy-8a',
    subject: 'physics',
    edition: '人教版',
    grade: '八年级',
    volume: '上册',
    chapters: [
      {
        id: 'rj8a-c4',
        name: '第四章 光现象',
        lessons: [
          { id: 'rj8a-4-1', name: '4.1 光的直线传播' },
          { id: 'rj8a-4-2', name: '4.2 光的反射' },
          { id: 'rj8a-4-3', name: '4.3 平面镜成像' },
          { id: 'rj8a-4-4', name: '4.4 光的折射' },
          { id: 'rj8a-4-5', name: '4.5 光的色散' }
        ]
      },
      {
        id: 'rj8a-c5',
        name: '第五章 透镜及其应用',
        lessons: [
          { id: 'rj8a-5-1', name: '5.1 透镜' },
          { id: 'rj8a-5-2', name: '5.2 生活中的透镜' },
          { id: 'rj8a-5-3', name: '5.3 凸透镜成像的规律' },
          { id: 'rj8a-5-4', name: '5.4 眼睛和眼镜' },
          { id: 'rj8a-5-5', name: '5.5 显微镜和望远镜' }
        ]
      }
    ]
  }
];

/** 课时 id → { lesson, chapter, textbook } 的索引，供详情页面包屑与课堂页回显使用 */
export const LESSON_INDEX = TEXTBOOKS.reduce((index, textbook) => {
  textbook.chapters.forEach((chapter) => {
    chapter.lessons.forEach((lesson) => {
      index[lesson.id] = { lesson, chapter, textbook };
    });
  });
  return index;
}, {});

export function textbooksOfSubject(subjectCode) {
  return TEXTBOOKS.filter((item) => item.subject === subjectCode);
}
