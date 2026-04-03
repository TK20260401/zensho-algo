"use client";

import { QRCodeSVG } from "qrcode.react";

export function QRCodeSection() {
  return (
    <div className="max-w-4xl mx-auto mt-10 text-center">
      <details className="inline-block bg-white/10 backdrop-blur rounded-2xl">
        <summary className="px-6 py-3 cursor-pointer text-white text-sm font-semibold hover:text-white transition-colors focus-visible:ring-4 focus-visible:ring-blue-500 rounded-2xl">
          <ruby>スマホ<rp>(</rp><rt></rt><rp>)</rp></ruby>・タブレットでプレイ（QRコード）
        </summary>
        <div className="px-6 pb-6 pt-3 flex flex-col items-center gap-3">
          <div className="bg-white p-4 rounded-xl inline-block">
            <QRCodeSVG
              value="https://logic-riichi.vercel.app"
              size={180}
              level="M"
              marginSize={0}
            />
          </div>
          <p className="text-white text-xs">
            カメラで<ruby>読<rp>(</rp><rt>よ</rt><rp>)</rp></ruby>み<ruby>取<rp>(</rp><rt>と</rt><rp>)</rp></ruby>ってアクセス
          </p>
        </div>
      </details>
    </div>
  );
}
