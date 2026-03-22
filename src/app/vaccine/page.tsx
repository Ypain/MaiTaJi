'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Syringe, Check, Clock, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

// 2026年国家免疫规划疫苗程序表
const vaccineSchedule = [
  {
    age: '出生时',
    vaccines: [
      { name: '乙肝疫苗（第1剂）', type: 'free', desc: '出生24小时内接种' },
      { name: '卡介苗（1剂）', type: 'free', desc: '出生后尽快接种' },
    ],
  },
  {
    age: '1月龄',
    vaccines: [
      { name: '乙肝疫苗（第2剂）', type: 'free', desc: '' },
    ],
  },
  {
    age: '2月龄',
    vaccines: [
      { name: '脊灰疫苗（第1剂）', type: 'free', desc: 'IPV注射' },
      { name: '百白破疫苗（第1剂）', type: 'free', desc: '' },
      { name: '13价肺炎疫苗（第1剂）', type: 'paid', desc: '建议接种' },
      { name: '五价轮状疫苗（第1剂）', type: 'paid', desc: '口服' },
    ],
  },
  {
    age: '3月龄',
    vaccines: [
      { name: '脊灰疫苗（第2剂）', type: 'free', desc: 'IPV注射' },
      { name: '百白破疫苗（第2剂）', type: 'free', desc: '' },
      { name: '13价肺炎疫苗（第2剂）', type: 'paid', desc: '建议接种' },
      { name: '五价轮状疫苗（第2剂）', type: 'paid', desc: '口服' },
      { name: 'Hib疫苗（第1剂）', type: 'paid', desc: '建议接种' },
    ],
  },
  {
    age: '4月龄',
    vaccines: [
      { name: '脊灰疫苗（第3剂）', type: 'free', desc: 'IPV注射' },
      { name: '百白破疫苗（第3剂）', type: 'free', desc: '' },
      { name: '13价肺炎疫苗（第3剂）', type: 'paid', desc: '建议接种' },
      { name: '五价轮状疫苗（第3剂）', type: 'paid', desc: '口服' },
      { name: 'Hib疫苗（第2剂）', type: 'paid', desc: '建议接种' },
    ],
  },
  {
    age: '5月龄',
    vaccines: [
      { name: '五价轮状疫苗（第4剂）', type: 'paid', desc: '口服' },
      { name: 'Hib疫苗（第3剂）', type: 'paid', desc: '建议接种' },
    ],
  },
  {
    age: '6月龄',
    vaccines: [
      { name: '乙肝疫苗（第3剂）', type: 'free', desc: '' },
      { name: '流脑A群（第1剂）', type: 'free', desc: '' },
      { name: '13价肺炎疫苗（第4剂）', type: 'paid', desc: '加强针' },
    ],
  },
  {
    age: '8月龄',
    vaccines: [
      { name: '麻腮风疫苗（第1剂）', type: 'free', desc: '' },
      { name: '乙脑减毒活疫苗（第1剂）', type: 'free', desc: '' },
    ],
  },
  {
    age: '9月龄',
    vaccines: [
      { name: '流脑A群（第2剂）', type: 'free', desc: '' },
    ],
  },
  {
    age: '12月龄（1周岁）',
    vaccines: [
      { name: '水痘疫苗（第1剂）', type: 'paid', desc: '部分地区免费' },
      { name: 'Hib疫苗（第4剂）', type: 'paid', desc: '加强针' },
    ],
  },
  {
    age: '18月龄（1岁半）',
    vaccines: [
      { name: '百白破疫苗（第4剂）', type: 'free', desc: '' },
      { name: '麻腮风疫苗（第2剂）', type: 'free', desc: '' },
      { name: '甲肝减毒活疫苗（1剂）', type: 'free', desc: '或甲肝灭活疫苗2剂' },
      { name: '水痘疫苗（第2剂）', type: 'paid', desc: '部分地区免费' },
    ],
  },
  {
    age: '2周岁',
    vaccines: [
      { name: '乙脑减毒活疫苗（第2剂）', type: 'free', desc: '' },
      { name: '甲肝灭活疫苗（第2剂）', type: 'paid', desc: '如选择灭活疫苗' },
    ],
  },
  {
    age: '3周岁',
    vaccines: [
      { name: '流脑A+C群（第1剂）', type: 'free', desc: '' },
    ],
  },
  {
    age: '4周岁',
    vaccines: [
      { name: '脊灰疫苗（第4剂）', type: 'free', desc: '口服滴剂' },
    ],
  },
  {
    age: '6周岁',
    vaccines: [
      { name: '白破疫苗（1剂）', type: 'free', desc: '' },
      { name: '流脑A+C群（第2剂）', type: 'free', desc: '' },
    ],
  },
];

// 疫苗分类说明
const vaccineTypes = [
  {
    name: '一类疫苗（免费）',
    desc: '国家免疫规划疫苗，由政府免费提供，必须接种',
    color: 'bg-green-500',
  },
  {
    name: '二类疫苗（自费）',
    desc: '自愿选择接种，建议有条件尽量接种',
    color: 'bg-blue-500',
  },
];

// 接种注意事项
const tips = [
  '接种前确保宝宝身体健康，无发热、腹泻等症状',
  '接种后需在接种点观察30分钟，无异常方可离开',
  '接种后24小时内不要洗澡，避免接种部位感染',
  '接种后可能出现轻微发热、局部红肿，属正常反应',
  '如出现高热（≥38.5℃）、持续哭闹等异常，应及时就医',
  '按时接种效果最佳，如遇特殊情况可适当推迟',
];

export default function VaccinePage() {
  const [expandedAge, setExpandedAge] = useState<string | null>('出生时');

  const toggleExpand = (age: string) => {
    setExpandedAge(expandedAge === age ? null : age);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-violet-500 text-white">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-4 text-sm">
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Syringe className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">疫苗接种</h1>
              <p className="text-sm text-white/80">2026年儿童疫苗接种时间表</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 -mt-4">
        {/* 疫苗分类说明 */}
        <Card className="border-0 shadow-lg mb-4">
          <CardContent className="pt-4">
            <div className="flex gap-4">
              {vaccineTypes.map((type) => (
                <div key={type.name} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${type.color}`}></div>
                  <span className="text-sm text-gray-600">{type.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 疫苗时间表 */}
        <div className="space-y-3">
          {vaccineSchedule.map((item) => (
            <Card key={item.age} className="border-0 shadow-sm overflow-hidden">
              <div
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleExpand(item.age)}
              >
                <CardContent className="py-4 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Clock className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{item.age}</h3>
                        <p className="text-xs text-gray-500">
                          {item.vaccines.length} 种疫苗
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.vaccines.some((v) => v.type === 'free') && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                          免费
                        </Badge>
                      )}
                      {item.vaccines.some((v) => v.type === 'paid') && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                          自费
                        </Badge>
                      )}
                      {expandedAge === item.age ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </div>

              {expandedAge === item.age && (
                <div className="border-t border-gray-100 bg-gray-50">
                  {item.vaccines.map((vaccine, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 border-b border-gray-100 last:border-b-0 flex items-start gap-3"
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          vaccine.type === 'free' ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                      ></div>
                      <div>
                        <p className="font-medium text-gray-800">{vaccine.name}</p>
                        {vaccine.desc && (
                          <p className="text-xs text-gray-500 mt-0.5">{vaccine.desc}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* 接种注意事项 */}
        <Card className="border-0 shadow-lg mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-gray-800">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              接种注意事项
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* 提示 */}
        <div className="mt-4 text-center text-xs text-gray-400">
          <p>以上为2026年最新疫苗接种程序，具体以当地疾控中心为准</p>
        </div>
      </div>
    </div>
  );
}
