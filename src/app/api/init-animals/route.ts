import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

const animalsData = [
  {
    name: '大熊猫',
    species: '熊猫',
    description: '大熊猫是中国特有的珍稀动物，以其黑白相间的毛色和憨态可掬的外表闻名于世。它们主要以竹子为食，是世界上最具标志性的保护动物之一。',
    image_url: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800',
    habitat: '中国西南部山区竹林',
    diet: '竹子为主，偶尔吃小型啮齿动物',
    conservation_status: '易危'
  },
  {
    name: '非洲象',
    species: '大象',
    description: '非洲象是现存最大的陆生动物，以其巨大的耳朵和长鼻子著称。它们生活在非洲的草原和森林中，是高度社会化的动物。',
    image_url: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=800',
    habitat: '非洲草原和森林',
    diet: '草、树叶、树皮、水果',
    conservation_status: '易危'
  },
  {
    name: '孟加拉虎',
    species: '老虎',
    description: '孟加拉虎是老虎亚种中数量最多的一种，以其橙黄色的皮毛和黑色条纹闻名。它们是顶级掠食者，在维持生态平衡中发挥重要作用。',
    image_url: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800',
    habitat: '印度、孟加拉国的热带雨林和草原',
    diet: '鹿、野猪、水牛等大型哺乳动物',
    conservation_status: '濒危'
  },
  {
    name: '北极熊',
    species: '熊',
    description: '北极熊是世界上最大的陆地食肉动物，适应了极端寒冷的北极环境。它们的白色皮毛实际上是透明的，皮肤是黑色的。',
    image_url: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=800',
    habitat: '北极圈的海冰和沿海地区',
    diet: '海豹为主，也吃鱼类和海鸟',
    conservation_status: '易危'
  },
  {
    name: '长颈鹿',
    species: '长颈鹿',
    description: '长颈鹿是世界上最高的陆生动物，以其极长的脖子和腿著称。它们独特的斑纹就像人类的指纹一样，每一只都不同。',
    image_url: 'https://images.unsplash.com/photo-1547721064-da6cfb341d50?w=800',
    habitat: '非洲稀树草原和开阔林地',
    diet: '金合欢树叶和其他树种的叶子',
    conservation_status: '易危'
  },
  {
    name: '企鹅',
    species: '企鹅',
    description: '企鹅是一类不会飞的海鸟，主要生活在南半球。它们是出色的游泳健将，在水中捕食鱼类和乌贼。',
    image_url: 'https://images.unsplash.com/photo-1551986782-d0169b3f8fa7?w=800',
    habitat: '南极洲及南半球沿海地区',
    diet: '鱼类、磷虾、乌贼',
    conservation_status: '依赖物种'
  },
  {
    name: '考拉',
    species: '考拉',
    description: '考拉是澳大利亚特有的有袋类动物，以吃桉树叶为生。它们每天睡眠长达20小时，以保存能量。',
    image_url: 'https://images.unsplash.com/photo-1579674285690-556c3c8d4c46?w=800',
    habitat: '澳大利亚东部桉树林',
    diet: '桉树叶',
    conservation_status: '易危'
  },
  {
    name: '狮子',
    species: '狮子',
    description: '狮子是大型猫科动物，被称为"草原之王"。雄狮以其威武的鬃毛著称，是唯一群居的大型猫科动物。',
    image_url: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800',
    habitat: '非洲撒哈拉以南草原',
    diet: '斑马、角马、水牛等大型哺乳动物',
    conservation_status: '易危'
  },
  {
    name: '海豚',
    species: '海豚',
    description: '海豚是高度智能的海洋哺乳动物，以其友好的性格和出色的学习能力著称。它们使用声纳系统进行导航和捕食。',
    image_url: 'https://images.unsplash.com/photo-1607153333879-c174d265f1d2?w=800',
    habitat: '全球温带和热带海域',
    diet: '鱼类、乌贼、虾类',
    conservation_status: '无危'
  },
  {
    name: '红熊猫',
    species: '小熊猫',
    description: '红熊猫是一种小型树栖哺乳动物，与大熊猫并非近亲。它们有红棕色的毛皮和蓬松的尾巴，非常可爱。',
    image_url: 'https://images.unsplash.com/photo-1590691566903-692bf5ca7493?w=800',
    habitat: '喜马拉雅山脉和中国的温带森林',
    diet: '竹子、水果、昆虫',
    conservation_status: '濒危'
  }
];

export async function POST() {
  try {
    const client = getSupabaseClient();
    
    // 检查是否已有数据
    const { data: existingAnimals } = await client
      .from('animals')
      .select('id')
      .limit(1);
    
    if (existingAnimals && existingAnimals.length > 0) {
      return NextResponse.json({ 
        message: '动物数据已存在，跳过初始化',
        count: existingAnimals.length 
      });
    }
    
    // 插入动物数据
    const { data, error } = await client
      .from('animals')
      .insert(animalsData)
      .select();
    
    if (error) {
      console.error('插入动物数据失败:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      message: '动物数据初始化成功',
      count: data?.length || 0,
      data 
    });
  } catch (error) {
    console.error('初始化动物数据失败:', error);
    return NextResponse.json(
      { error: '初始化失败' },
      { status: 500 }
    );
  }
}
