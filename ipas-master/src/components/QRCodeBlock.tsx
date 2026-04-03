"use client";

import { QRCodeSVG } from "qrcode.react";

interface QRCodeBlockProps {
  url: string;
}

export default function QRCodeBlock({ url }: QRCodeBlockProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm text-emerald-200 font-bold">
        スマホ・タブレットでアクセス
      </p>
      <div className="bg-white p-3 rounded-xl shadow-lg">
        <QRCodeSVG
          value={url}
          size={120}
          level="M"
          bgColor="#ffffff"
          fgColor="#064e3b"
        />
      </div>
      <p className="text-xs text-emerald-300 break-all max-w-[200px] text-center">
        {url}
      </p>
    </div>
  );
}
