"use client";

import { useState } from "react";

function R({ b, r }: { b: string; r: string }) {
  return (
    <ruby>
      {b}
      <rp>(</rp>
      <rt>{r}</rt>
      <rp>)</rp>
    </ruby>
  );
}

export default function BinaryConverter() {
  const [bits, setBits] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);

  const toggleBit = (index: number) => {
    setBits((prev) => {
      const next = [...prev];
      next[index] = next[index] === 0 ? 1 : 0;
      return next;
    });
  };

  const decimalValue = bits.reduce(
    (acc, bit, i) => acc + bit * Math.pow(2, 7 - i),
    0
  );

  const hexValue = decimalValue.toString(16).toUpperCase().padStart(2, "0");

  const isPrintable = decimalValue >= 32 && decimalValue <= 126;
  const asciiChar = isPrintable ? String.fromCharCode(decimalValue) : null;

  const grayHex = decimalValue.toString(16).padStart(2, "0");
  const grayColor = `#${grayHex}${grayHex}${grayHex}`;

  const resetBits = () => setBits([0, 0, 0, 0, 0, 0, 0, 0]);
  const setAllOnes = () => setBits([1, 1, 1, 1, 1, 1, 1, 1]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-emerald-800 text-center">
        2<R b="進数" r="しんすう" />
        <R b="変換" r="へんかん" />
        ツール
      </h2>

      <p className="text-center text-gray-600 text-xs sm:text-sm md:text-base">
        ビットをタップして ON/OFF を
        <R b="切" r="き" />
        り
        <R b="替" r="か" />
        えよう
      </p>

      {/* Bit toggles */}
      <div className="flex justify-center overflow-x-auto">
        <div className="grid grid-cols-8 gap-1 sm:gap-2">
          {/* Bit position labels */}
          {bits.map((_, i) => (
            <div
              key={`label-${i}`}
              className="text-center text-[10px] sm:text-xs md:text-sm text-gray-500 font-mono"
            >
              2<sup>{7 - i}</sup>
            </div>
          ))}

          {/* Bit buttons */}
          {bits.map((bit, i) => (
            <button
              key={`bit-${i}`}
              onClick={() => toggleBit(i)}
              aria-label={`ビット${7 - i}: 現在${bit}。タップで切り替え`}
              aria-pressed={bit === 1}
              className={`w-9 h-12 sm:w-12 sm:h-16 md:w-14 md:h-18 rounded-lg sm:rounded-xl
                text-lg sm:text-xl md:text-2xl font-bold font-mono
                transition-all duration-200 border-2
                ${
                  bit === 1
                    ? "bg-emerald-500 text-white border-emerald-600 shadow-md"
                    : "bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200"
                }`}
            >
              {bit}
            </button>
          ))}

          {/* Bit weight values */}
          {bits.map((_, i) => (
            <div
              key={`weight-${i}`}
              className="text-center text-[10px] sm:text-xs text-gray-400 font-mono"
            >
              {Math.pow(2, 7 - i)}
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex justify-center gap-3">
        <button
          onClick={resetBits}
          aria-label="すべてのビットを0にリセット"
          className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors text-xs sm:text-sm md:text-base"
        >
          <R b="全" r="ぜん" />
          リセット
        </button>
        <button
          onClick={setAllOnes}
          aria-label="すべてのビットを1にセット"
          className="px-5 sm:px-6 py-2.5 sm:py-3 bg-emerald-100 text-emerald-700 rounded-xl font-bold hover:bg-emerald-200 transition-colors text-xs sm:text-sm md:text-base"
        >
          <R b="全" r="ぜん" />
          て1
        </button>
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-emerald-50 rounded-xl p-3 sm:p-4 text-center">
          <div className="text-xs sm:text-sm text-emerald-700 font-bold mb-1">
            2<R b="進数" r="しんすう" />
          </div>
          <div className="text-lg sm:text-2xl md:text-3xl font-mono font-bold text-emerald-800 break-all">
            {bits.join("")}
          </div>
        </div>

        <div className="bg-teal-50 rounded-xl p-3 sm:p-4 text-center">
          <div className="text-xs sm:text-sm text-teal-700 font-bold mb-1">
            10<R b="進数" r="しんすう" />
          </div>
          <div className="text-lg sm:text-2xl md:text-3xl font-mono font-bold text-teal-800">
            {decimalValue}
          </div>
        </div>

        <div className="bg-cyan-50 rounded-xl p-3 sm:p-4 text-center">
          <div className="text-xs sm:text-sm text-cyan-700 font-bold mb-1">
            16<R b="進数" r="しんすう" />
          </div>
          <div className="text-lg sm:text-2xl md:text-3xl font-mono font-bold text-cyan-800">
            0x{hexValue}
          </div>
        </div>

        <div className="bg-sky-50 rounded-xl p-3 sm:p-4 text-center">
          <div className="text-xs sm:text-sm text-sky-700 font-bold mb-1">
            ASCII<R b="文字" r="もじ" />
          </div>
          <div className="text-lg sm:text-2xl md:text-3xl font-mono font-bold text-sky-800">
            {asciiChar ? (
              <span>&apos;{asciiChar}&apos;</span>
            ) : (
              <span className="text-gray-400 text-xs sm:text-sm">
                (<R b="非表示" r="ひひょうじ" />)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Color preview */}
      <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
        <div className="text-xs sm:text-sm text-gray-600 font-bold mb-2 text-center">
          <R b="色" r="いろ" />
          プレビュー（グレースケール）
        </div>
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl border-2 border-gray-200 shadow-inner flex-shrink-0"
            style={{ backgroundColor: grayColor }}
            role="img"
            aria-label={`グレースケール色: RGB(${decimalValue}, ${decimalValue}, ${decimalValue})`}
          />
          <div className="text-xs sm:text-sm text-gray-600 font-mono">
            <div>
              R: {decimalValue}, G: {decimalValue}, B: {decimalValue}
            </div>
            <div>HEX: #{grayHex}{grayHex}{grayHex}</div>
            <div>
              <R b="明" r="あか" />
              るさ: {Math.round((decimalValue / 255) * 100)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
