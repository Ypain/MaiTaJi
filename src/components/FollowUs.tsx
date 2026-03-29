'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function FollowUs() {
  const [showGongzhonghao, setShowGongzhonghao] = useState(false);
  const [showShipinhao, setShowShipinhao] = useState(false);

  return (
    <>
      {/* 底部固定引流栏 */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 py-6">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-center text-white font-medium mb-4">
            关注我们，获取更多育儿干货
          </h3>
          
          <div className="flex justify-center gap-8">
            {/* 公众号 */}
            <div 
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => setShowGongzhonghao(true)}
            >
              <div className="w-20 h-20 bg-white rounded-lg p-1 shadow-lg group-hover:scale-105 transition-transform">
                <Image 
                  src="/qrcode-gongzhonghao.png" 
                  alt="麦塔记公众号" 
                  width={72} 
                  height={72}
                  className="rounded"
                />
              </div>
              <span className="text-white text-sm mt-2">公众号</span>
              <span className="text-white/80 text-xs">麦塔记</span>
            </div>

            {/* 视频号 */}
            <div 
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => setShowShipinhao(true)}
            >
              <div className="w-20 h-20 bg-white rounded-lg p-1 shadow-lg group-hover:scale-105 transition-transform">
                <Image 
                  src="/qrcode-shipinhao.png" 
                  alt="母婴帮手视频号" 
                  width={72} 
                  height={72}
                  className="rounded"
                />
              </div>
              <span className="text-white text-sm mt-2">视频号</span>
              <span className="text-white/80 text-xs">母婴帮手</span>
            </div>
          </div>
          
          <p className="text-center text-white/70 text-xs mt-4">
            长按识别二维码关注
          </p>
        </div>
      </div>

      {/* 公众号大图弹窗 */}
      {showGongzhonghao && (
        <div 
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowGongzhonghao(false)}
        >
          <div 
            className="bg-white rounded-2xl p-6 max-w-xs w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-lg font-semibold text-gray-800 mb-4">关注公众号</h4>
            <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg p-2 mb-4">
              <Image 
                src="/qrcode-gongzhonghao.png" 
                alt="麦塔记公众号" 
                width={180} 
                height={180}
                className="rounded"
              />
            </div>
            <p className="text-gray-800 font-medium mb-1">麦塔记</p>
            <p className="text-gray-500 text-sm mb-4">长按识别二维码关注</p>
            <button 
              className="w-full py-2 bg-gray-100 rounded-lg text-gray-600 text-sm hover:bg-gray-200 transition-colors"
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
            className="bg-white rounded-2xl p-6 max-w-xs w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-lg font-semibold text-gray-800 mb-4">关注视频号</h4>
            <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg p-2 mb-4">
              <Image 
                src="/qrcode-shipinhao.png" 
                alt="母婴帮手视频号" 
                width={180} 
                height={180}
                className="rounded"
              />
            </div>
            <p className="text-gray-800 font-medium mb-1">母婴帮手</p>
            <p className="text-gray-500 text-sm mb-4">长按识别二维码关注</p>
            <button 
              className="w-full py-2 bg-gray-100 rounded-lg text-gray-600 text-sm hover:bg-gray-200 transition-colors"
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
