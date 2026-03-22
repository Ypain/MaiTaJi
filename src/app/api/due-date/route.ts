import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { lastPeriodDate } = await request.json();
    
    if (!lastPeriodDate) {
      return NextResponse.json({ error: '请选择末次月经日期' }, { status: 400 });
    }

    // 计算预产期：末次月经日期 + 280天
    const lastPeriod = new Date(lastPeriodDate);
    const dueDate = new Date(lastPeriod);
    dueDate.setDate(dueDate.getDate() + 280);
    
    // 计算当前孕周
    const today = new Date();
    const daysPregnant = Math.floor((today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24));
    const weeksPregnant = Math.floor(daysPregnant / 7);
    const daysRemaining = daysPregnant % 7;
    
    // 计算关键日期
    const trimester1End = new Date(lastPeriod);
    trimester1End.setDate(trimester1End.getDate() + 84); // 12周
    
    const trimester2End = new Date(lastPeriod);
    trimester2End.setDate(trimester2End.getDate() + 182); // 26周
    
    // NT检查时间：11-13周+6天
    const ntStart = new Date(lastPeriod);
    ntStart.setDate(ntStart.getDate() + 77); // 11周
    const ntEnd = new Date(lastPeriod);
    ntEnd.setDate(ntEnd.getDate() + 97); // 13周+6天
    
    // 大排畸时间：20-24周
    const anomalyStart = new Date(lastPeriod);
    anomalyStart.setDate(anomalyStart.getDate() + 140); // 20周
    const anomalyEnd = new Date(lastPeriod);
    anomalyEnd.setDate(anomalyEnd.getDate() + 168); // 24周
    
    // 糖耐量检查时间：24-28周
    const ogttStart = new Date(lastPeriod);
    ogttStart.setDate(ogttStart.getDate() + 168); // 24周
    const ogttEnd = new Date(lastPeriod);
    ogttEnd.setDate(ogttEnd.getDate() + 196); // 28周

    return NextResponse.json({
      success: true,
      data: {
        dueDate: dueDate.toISOString().split('T')[0],
        dueDateFormatted: `${dueDate.getFullYear()}年${dueDate.getMonth() + 1}月${dueDate.getDate()}日`,
        weeksPregnant,
        daysRemaining,
        daysPregnant,
        totalDays: 280,
        keyDates: {
          trimester1End: trimester1End.toISOString().split('T')[0],
          trimester2End: trimester2End.toISOString().split('T')[0],
          ntCheck: {
            start: ntStart.toISOString().split('T')[0],
            end: ntEnd.toISOString().split('T')[0]
          },
          anomalyScan: {
            start: anomalyStart.toISOString().split('T')[0],
            end: anomalyEnd.toISOString().split('T')[0]
          },
          ogttTest: {
            start: ogttStart.toISOString().split('T')[0],
            end: ogttEnd.toISOString().split('T')[0]
          }
        }
      }
    });
  } catch (error) {
    console.error('预产期计算失败:', error);
    return NextResponse.json(
      { error: '计算失败，请检查日期格式' },
      { status: 500 }
    );
  }
}
