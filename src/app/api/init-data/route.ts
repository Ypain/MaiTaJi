import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 商品图片URL配置（使用AI生成的真实图片）
const productImages = {
  // 服装区 - 上衣
  tops: [
    { name: '时尚针织毛衣', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_cca6ce56-8720-49c4-b11d-180cbaf99643.jpeg?sign=1805439318-1f903b3163-0-b7622ac8e207b1258e6279296bf069dac4d8a3cd571de02b12999227b4fc8833' },
    { name: '简约白色T恤', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_5168d314-52e7-4a14-a95b-9fe905f82a11.jpeg?sign=1805439319-26e5f34f48-0-111ac70d5c3d7ce9aac11f26ee3f43f86e87c97e9d86699debc34b0a5980c4d7' },
    { name: '优雅蕾丝衬衫', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_04f3ae2f-40ad-43c5-9072-8a2024309a9e.jpeg?sign=1805439319-932cdf0ef8-0-a60414a502531cbb552bfa1e5927f724a10063e60d2f560e265f93917688a220' },
    { name: '休闲条纹卫衣', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_95d9cc37-cfeb-40cd-9487-567db93e0282.jpeg?sign=1805439321-0f95c404d5-0-ac92d681e90e5307b34d7acd798b2818b99f88af1829ca69b59fa10e9edf6d72' },
  ],
  // 服装区 - 裤子
  pants: [
    { name: '高腰阔腿裤', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_d7b788f1-c29d-4e55-878d-d91659bfbcba.jpeg?sign=1805439319-55d5dd7637-0-680e7227819602d41e1affc067a5991a1076d5164946d241357937afd45c1347' },
    { name: '修身牛仔裤', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_5f15f2c4-4456-4050-9780-b507abc0abcb.jpeg?sign=1805439320-bd4a22d9cf-0-ab9443ac2cde8b233b222c0741319176f51091ec64d06b99b626d0edc48f95a8' },
    { name: '休闲运动裤', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_23432fee-b151-43c8-95e2-685ece6ef897.jpeg?sign=1805439321-6676260c43-0-37280be7e77a9982892da9509c6e2f3fc49bd3494704e7a85370c493bd480688' },
    { name: '优雅西装裤', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_0825d3d5-1590-4dac-9583-b297fb300aff.jpeg?sign=1805439323-0b99d979d9-0-e1b12eb9b7e1272c5affda3f25b7cd19eff8c33c2aa60a920ffa726fa9b91770' },
  ],
  // 服装区 - 鞋子
  shoes: [
    { name: '优雅高跟鞋', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_61421f1f-bb56-4899-a4b8-2fd6fd12ceaf.jpeg?sign=1805439319-00b8c175cb-0-d6dbc0025342befc1ed478b2ca7f0e9921dcab1a85332f121cbbc7bfa83d7fa9' },
    { name: '休闲运动鞋', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_e4e7b336-12ec-4dd6-8556-42d971ba36ce.jpeg?sign=1805439320-c7ff8ca635-0-ed213414b6cd90c58b091c17394040bfdf7bbf0db581b45a76e9b9cd9313bb2f' },
    { name: '时尚短靴', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_c9553fef-ae5e-4295-933b-c6ec3c1a3bf2.jpeg?sign=1805439320-b7e058d1e8-0-c9005b9c9954fbbe843b7d8100dbefd3a53404326c760f1cfd6490816e6b91d5' },
    { name: '舒适平底鞋', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_c4ae4cd3-d5c6-44ff-8bb2-9c0ecdf64e09.jpeg?sign=1805439321-8f88e7973b-0-1b02dedd92d22f23dd91f22e539121ce00048f0b6df08127d69c498d40701f74' },
  ],
  // 服装区 - 帽子
  hats: [
    { name: '时尚贝雷帽', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_48e97786-4a7b-42e4-9fbc-2e3b466aba3f.jpeg?sign=1805439319-6ebbddce05-0-efdf187c2f5f3650a7bdfe7242061aa027c8878d5d98ebb045213b4e2cf996ac' },
    { name: '休闲鸭舌帽', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_f64df3d8-ea74-490f-a31e-0813bd6d4fad.jpeg?sign=1805439320-e0b25781de-0-120a75041ae74dc9509b1f18d0ffd57588404a9972fb372f2aee7a4458da0eb6' },
    { name: '优雅礼帽', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_bb143956-d188-4d39-9ecc-2040de57bbcd.jpeg?sign=1805439320-b752c0e8e2-0-b116dd6f329bc635da86f35215f7a8a4c3a962bec10ffc3bc4fbb14b0fe69cd6' },
    { name: '冬日毛线帽', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_b170614e-96e4-4879-a79c-e8f9ae4f1238.jpeg?sign=1805439322-54167089d0-0-d11b8d71bad251d0ac02a4a5fca763a787c282420bf95d15ca07265646d9f561' },
  ],
  // 美妆区（一级类目）
  beauty: [
    { name: '精致口红套装', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_33db3704-6f1e-4890-9da6-025bd75829b9.jpeg?sign=1805439340-fcf58517ab-0-9dbe9498ed2dc01247c91ffdac17c5f26537a3a0fa9e9e0d9c824615183be91f' },
    { name: '奢华香水', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_12effe0d-913d-419e-83c4-76906bb34900.jpeg?sign=1805439341-f81607c729-0-7e805e954fdcec27dee97770d097d8731b742195db77707c94acd92ba624cba3' },
    { name: '护肤精华液', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_67351ee0-6e18-4bc0-9312-31d649438afc.jpeg?sign=1805439343-cd479956cc-0-f7fe4423be1e0fad4c38331714f412390245a14670aa2d34c25905bf88a797f0' },
    { name: '眼影盘', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_e08baaaf-eadf-4f2a-93a0-54ed0102cfa2.jpeg?sign=1805439343-75a8f38407-0-89ad1737286112f368e8ca36465e23ae9f5cc52090df64fb73f9c99a7177a274' },
  ],
  // 首饰区 - 手镯
  bracelets: [
    { name: '珍珠手镯', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_bc4f8862-d5af-45f3-8207-ddc91089a035.jpeg?sign=1805439339-5db0a58360-0-4ebb78d6b55ce58fb134f9ab0121f6a37fddab79c746a6acc39f3777b4472877' },
    { name: '黄金手镯', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_a4b2aeb4-6373-4dfc-809c-44392ec592de.jpeg?sign=1805439341-defb483798-0-d3557214fc0cc4ca125ef238ec0b6a019c7041e93093dbe599c612130d2c9e1a' },
    { name: '银饰手镯', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_501ed7d7-0c62-49b4-a0cf-53196b7ef889.jpeg?sign=1805439341-6a68d1f21b-0-e479c990362e824a2e5f47643ec73fadddb72b3a0e4f27bbb9319d766865c6bf' },
    { name: '水晶手镯', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_2414b92c-0cd4-45e3-93e5-d6b3a3c95cca.jpeg?sign=1805439343-eabe3e925c-0-0963b15f8bad210d3fc7492aabeded04051c1be3999703b55466129155c848d6' },
  ],
  // 首饰区 - 项链
  necklaces: [
    { name: '钻石项链', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_7d94c331-4bc9-420f-a3ad-f7504af24f85.jpeg?sign=1805439339-364928e225-0-5055ff47a06ead1a84b2c166140176a10c1030a055799fa7c735e42fd54f95b8' },
    { name: '珍珠项链', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_e2179a60-e717-420b-b912-b4b1976d06c6.jpeg?sign=1805439341-f443e00893-0-9d5d20364301416ff0481750caf4b6d737547b8cdc1c0c81fca0a9782a2bf928' },
    { name: '黄金项链', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_58689e38-8541-444e-83f5-234b629b91ac.jpeg?sign=1805439342-1d91cf1428-0-997c72e0411575ff798c286d49c86848e25109e47325a4fc6ae4ca940d42578a' },
    { name: '银饰项链', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_acfad80b-50bd-459a-a4c7-224f156fa074.jpeg?sign=1805439344-1598d40950-0-79d33d77408920a7128b9443f03515ad4fce429d803788624573ed00772bd220' },
  ],
  // 首饰区 - 耳环
  earrings: [
    { name: '钻石耳环', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_a68ea238-d70f-40b1-b099-9a30e96fc9d9.jpeg?sign=1805439339-2e2d27ee22-0-010aab05a7f9cce479dad77d4c915f29600591336ae91320eafd1e0c3b1dc864' },
    { name: '珍珠耳环', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_1d1ae604-f365-4c49-bc9a-3ffd075c5c71.jpeg?sign=1805439341-87c68cca0e-0-7ed8d505cde3aca44ffff3d7141d9af2e26e043b41a7b3ef881cc435e42c1729' },
    { name: '流苏耳环', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_93681cb8-f248-46e0-8034-0cf2f1c97d70.jpeg?sign=1805439342-628ac88684-0-faff34f1819669d1f9998d966ed70a114799fb5261e86a1f5345776501c2ed1c' },
    { name: '简约耳钉', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_279f294b-a266-4153-bbf4-f745f5f2aa8e.jpeg?sign=1805439343-721dcd2ded-0-ad73ed6d4b2ff4ca3cd1b7e6e8f9308cf9ea2df824c6eac0005745e4d77f8d78' },
  ],
  // 首饰区 - 戒指
  rings: [
    { name: '钻石戒指', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_e48d5499-2970-4500-b37e-149c6ba7673b.jpeg?sign=1805439362-3f119f6ccf-0-7e06753f718ccb34845144adf70b8f791ae7aaf2b7cf5f79fa4c2ad02c3b7573' },
    { name: '黄金戒指', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_6b325980-aafb-4ac0-b8ca-b7e9fd87cf6e.jpeg?sign=1805439362-d798acfd0d-0-d40b345344a9d76bc63d98693fa284b8712243e68bf0b77be38aa8cb5fcd4b33' },
    { name: '银饰戒指', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_0e540a26-a90d-43e3-91f4-bfb681bb5173.jpeg?sign=1805439364-94bdba4bf5-0-27dfd3586310e45067e09d81c11eb4c6540368ec1afb1f8cf2c49673abca7ac5' },
    { name: '宝石戒指', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_5644d992-66fb-4f2f-bd60-20d1c9389500.jpeg?sign=1805439364-716564c964-0-46bcc7389a0a0ba76ad99335eda7da569b21ce572dd642e01a08ebd514ce12c2' },
  ],
  // 首饰区 - 手链
  chains: [
    { name: '黄金手链', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_41d76fdd-c2ac-4642-af36-986d9125052e.jpeg?sign=1805439362-5b8d6beb7c-0-01490565d8038a9a29cfa4e4e96f6b98182e7bb390d3aa7ab8e470dd57a5f9bd' },
    { name: '银饰手链', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_65c48db5-154e-428c-b85f-8b13e6e74d97.jpeg?sign=1805439364-8bb9a17b39-0-9cbe21902c04a295be4b0c0bbddf845ec9a4beda1ca0e93e583294f08f0ccba5' },
    { name: '水晶手链', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_4dd09759-cc9f-4cd9-86bc-09eaf44a3fe7.jpeg?sign=1805439365-672a420542-0-eb2c7512d78ffb2211b9d0f12c85638ce5108e29d612ba92a8a5623d85ebba7e' },
    { name: '珍珠手链', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_247f26e4-bef1-4714-9bb2-7582733ffc41.jpeg?sign=1805439366-76ae6837bf-0-d79beadc468baf2ba58536f1a02fe7b0beb02fbaa27957b064f1912000026cab' },
  ],
};

// 买家展示图片
const showcaseImages = [
  { url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_b3e68772-aad9-4321-a12f-79f774e33caa.jpeg?sign=1805439362-4fc75ad34f-0-b06db6c558c0c9f1c3b7cfda46a8d0d9e4f3d4a4bfa0bd23332ccf198806438b', type: 'image' as const },
  { url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_216f94a1-bf1a-41e2-bd9f-c3c38301c016.jpeg?sign=1805439363-4d726c3c6b-0-92a8f4d705ce93eaf946a918207f9499e91a8db207f78a54988ae8567d632551', type: 'image' as const },
  { url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_2f670151-85b6-43ed-9c55-46bf11a57827.jpeg?sign=1805439364-94212336f9-0-89a62fbf8f6c34ea5fe2ff8404706939fc64ffd0c0c93e8141eb4174e8a5f683', type: 'image' as const },
  { url: 'https://coze-coding-project.tos.coze.site/coze_storage_7617779219451576356/image/generate_image_cd2831af-3d6c-4037-8404-f12d0c08f0f8.jpeg?sign=1805439365-955dda488c-0-2ae7082ee69fdb7efe65d8bee6e63511e68794f8fe36ce4ff1f221bf8bd298f8', type: 'image' as const },
];

export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    
    // 检查是否强制重新初始化
    const searchParams = request.nextUrl.searchParams;
    const force = searchParams.get('force') === 'true';
    
    // 如果不是强制模式，检查是否已有数据
    if (!force) {
      const { data: existingProducts } = await client
        .from('products')
        .select('id')
        .limit(1);
      
      if (existingProducts && existingProducts.length > 0) {
        return NextResponse.json({ 
          success: true, 
          message: '数据已存在，跳过初始化。如需重新初始化，请使用 /api/init-data?force=true' 
        });
      }
    } else {
      // 强制模式：先清空旧数据
      await client.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await client.from('showcases').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }
    
    const productsToInsert: any[] = [];
    
    // 添加服装区商品
    ['tops', 'pants', 'shoes', 'hats'].forEach((subcategory) => {
      const items = productImages[subcategory as keyof typeof productImages];
      if (Array.isArray(items)) {
        items.forEach((item: any) => {
          productsToInsert.push({
            name: item.name,
            category: 'clothing',
            subcategory: subcategory,
            image_url: item.url,
          });
        });
      }
    });
    
    // 添加美妆区商品（一级类目）
    productImages.beauty.forEach((item) => {
      productsToInsert.push({
        name: item.name,
        category: 'beauty',
        subcategory: null,
        image_url: item.url,
      });
    });
    
    // 添加首饰区商品
    ['bracelets', 'necklaces', 'earrings', 'rings', 'chains'].forEach((subcategory) => {
      const items = productImages[subcategory as keyof typeof productImages];
      if (Array.isArray(items)) {
        items.forEach((item: any) => {
          productsToInsert.push({
            name: item.name,
            category: 'jewelry',
            subcategory: subcategory,
            image_url: item.url,
          });
        });
      }
    });
    
    // 插入商品数据
    const { error: productError } = await client
      .from('products')
      .insert(productsToInsert);
    
    if (productError) {
      console.error('插入商品失败:', productError);
      return NextResponse.json({ 
        error: '插入商品失败', 
        details: productError.message 
      }, { status: 500 });
    }
    
    // 插入买家展示数据
    const showcasesToInsert = showcaseImages.map(item => ({
      media_url: item.url,
      media_type: item.type,
    }));
    
    const { error: showcaseError } = await client
      .from('showcases')
      .insert(showcasesToInsert);
    
    if (showcaseError) {
      console.error('插入买家展示失败:', showcaseError);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: '数据初始化成功',
      productsCount: productsToInsert.length,
      showcasesCount: showcasesToInsert.length,
    });
  } catch (error) {
    console.error('初始化数据失败:', error);
    return NextResponse.json(
      { error: '初始化数据失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
