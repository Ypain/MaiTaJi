// 年龄段类目配置
export const AGE_CATEGORIES = [
  '出生',
  '一个月',
  '两个月',
  '三个月',
  '四个月',
  '五个月',
  '六个月',
  '七个月',
  '八个月',
  '九个月',
  '10个月',
  '11个月',
  '一岁',
  '两岁',
  '三岁',
  '四岁',
  '五岁',
  '6岁',
  '7岁',
  '8岁',
  '9岁',
  '10岁',
  '11岁',
  '12岁',
  '13岁',
  '14岁',
  '15岁',
  '16岁',
  '17岁',
  '18岁',
] as const;

export type AgeCategory = typeof AGE_CATEGORIES[number];

// 媒体类型
export type MediaType = 'image' | 'video';
