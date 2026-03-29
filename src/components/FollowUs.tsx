'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function FollowUs() {
  const [showGongzhonghao, setShowGongzhonghao] = useState(false);
  const [showShipinhao, setShowShipinhao] = useState(false);

  return (
    <>
      {/* 功能列表底部的引流区域 */}
      <div className="mt-8 mb-4 mx-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-8 px-4 shadow-lg">
        <h3 className="text-center text-white font-medium text-lg mb-6">
          关注我们，获取更多育儿干货
        </h3>
        
        <div className="flex justify-center gap-12">
          {/* 公众号 */}
          <div 
            className="flex flex-col items-center cursor-pointer group"
            onClick={() => setShowGongzhonghao(true)}
          >
            <div className="w-24 h-24 bg-white rounded-xl p-2 shadow-lg group-hover:scale-105 transition-transform mb-3">
              <Image 
                src="/qrcode-gongzhonghao.png" 
                alt="麦塔记公众号" 
                width={88} 
                height={88}
                className="rounded-lg w-full h-full object-contain"
              />
            </div>
            <p className="text-white font-medium text-base">公众号</p>
            <p className="text-white/80 text-sm mt-1">麦塔记</p>
          </div>

          {/* 视频号 */}
          <div 
            className="flex flex-col items-center cursor-pointer group"
            onClick={() => setShowShipinhao(true)}
          >
            <div className="w-24 h-24 bg-white rounded-xl p-2 shadow-lg group-hover:scale-105 transition-transform mb-3">
              <Image 
                src="/qrcode-shipinhao.png" 
                alt="母婴帮手视频号" 
                width={88} 
                height={88}
                className="rounded-lg w-full h-full object-contain"
              />
            </div>
            <p className="text-white font-medium text-base">视频号</p>
            <p className="text-white/80 text-sm mt-1">母婴帮手</p>
          </div>
        </div>
        
        <p className="text-center text-white/90 text-sm mt-6">
          点击二维码可放大，长按识别关注
        </p>
      </div>

      {/* 公众号大图弹窗 */}
      {showGongzhonghao && (
        <div 
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowGongzhonghao(false)}
        >
          <div 
            className="bg-white rounded-2xl p-8 max-w-xs w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-lg font-semibold text-gray-800 mb-6">关注公众号</h4>
            <div className="w-52 h-52 mx-auto bg-gray-100 rounded-lg p-3 mb-6">
              <Image 
                src="/qrcode-gongzhonghao.png" 
                alt="麦塔记公众号" 
                width={200} 
                height={200}
                className="rounded w-full h-full object-contain"
              />
            </div>
            <p className="text-gray-800 font-medium text-lg mb-2">麦塔记</p>
            <p className="text-gray-500 text-sm mb-6">截图微信识别二维码关注</p>
            <button 
              className="w-full py-3 bg-gray-100 rounded-lg text-gray-600 text-sm hover:bg-gray-200 transition-colors"
              onClick={() => setShowGongzhonghao(false)}
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* 视频号大图弹窗 */}
      {showShipinhao && (
        <div 
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowShipinhao(false)}
        >
          <div 
            className="bg-white rounded-2xl p-8 max-w-xs w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-lg font-semibold text-gray-800 mb-6">关注视频号</h4>
            <div className="w-52 h-52 mx-auto bg-gray-100 rounded-lg p-3 mb-6">
              <Image 
                src="/qrcode-shipinhao.png" 
                alt="母婴帮手视频号" 
                width={200} 
                height={200}
                className="rounded w-full h-full object-contain"
              />
            </div>
            <p className="text-gray-800 font-medium text-lg mb-2">母婴帮手</p>
            <p className="text-gray-500 text-sm mb-6">截图微信识别二维码关注</p>
            <button 
              className="w-full py-3 bg-gray-100 rounded-lg text-gray-600 text-sm hover:bg-gray-200 transition-colors"
              onClick={() => setShowShipinhao(false)}
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </>
  );
}
