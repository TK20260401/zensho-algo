"use client";

import { useState, useCallback } from "react";
import { terms, type Term } from "@/lib/terms";

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

const categoryColors: Record<string, { bg: string; text: string; badge: string }> = {
  "ストラテジ系": {
    bg: "bg-amber-50",
    text: "text-amber-900",
    badge: "bg-amber-200 text-amber-900",
  },
  "マネジメント系": {
    bg: "bg-violet-50",
    text: "text-violet-900",
    badge: "bg-violet-200 text-violet-900",
  },
  "テクノロジ系": {
    bg: "bg-sky-50",
    text: "text-sky-900",
    badge: "bg-sky-200 text-sky-900",
  },
};

export default function TermFlash() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [unknownCount, setUnknownCount] = useState(0);

  const currentTerm: Term = terms[currentIndex];
  const colors = categoryColors[currentTerm.category] || categoryColors["テクノロジ系"];

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % terms.length);
    setShowAnswer(false);
  }, []);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + terms.length) % terms.length);
    setShowAnswer(false);
  }, []);

  const goRandom = useCallback(() => {
    let next: number;
    do {
      next = Math.floor(Math.random() * terms.length);
    } while (next === currentIndex && terms.length > 1);
    setCurrentIndex(next);
    setShowAnswer(false);
  }, [currentIndex]);

  const markKnown = useCallback(() => {
    setKnownCount((c) => c + 1);
    goNext();
  }, [goNext]);

  const markUnknown = useCallback(() => {
    setUnknownCount((c) => c + 1);
    goNext();
  }, [goNext]);

  const resetScore = useCallback(() => {
    setKnownCount(0);
    setUnknownCount(0);
  }, []);

  const total = knownCount + unknownCount;
  const accuracy = total > 0 ? Math.round((knownCount / total) * 100) : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-emerald-800 text-center">
        <R b="用語" r="ようご" />
        フラッシュカード
      </h2>

      {/* Progress & Score */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
        <div className="bg-gray-100 rounded-lg px-3 sm:px-4 py-2 font-bold text-gray-600">
          {currentIndex + 1} / {terms.length}
        </div>
        <div className="bg-emerald-100 rounded-lg px-3 sm:px-4 py-2 font-bold text-emerald-700">
          <R b="正解" r="せいかい" />: {knownCount}
        </div>
        <div className="bg-red-100 rounded-lg px-3 sm:px-4 py-2 font-bold text-red-700">
          <R b="不正解" r="ふせいかい" />: {unknownCount}
        </div>
        {total > 0 && (
          <div className="bg-blue-100 rounded-lg px-3 sm:px-4 py-2 font-bold text-blue-700">
            {accuracy}%
          </div>
        )}
        {total > 0 && (
          <button
            onClick={resetScore}
            aria-label="スコアをリセット"
            className="bg-gray-200 rounded-lg px-3 sm:px-4 py-2 font-bold text-gray-600 hover:bg-gray-300 transition-colors"
          >
            リセット
          </button>
        )}
      </div>

      {/* Flash Card */}
      <div
        className={`rounded-2xl p-4 sm:p-6 md:p-8 ${colors.bg} min-h-[180px] sm:min-h-[200px] transition-all duration-300`}
      >
        {/* Category badge */}
        <div className="flex justify-center gap-2 mb-4 flex-wrap">
          <span className={`px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-bold ${colors.badge}`}>
            {currentTerm.category}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-700">
            {currentTerm.subCategory}
          </span>
          {currentTerm.syllabus && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-200 text-rose-800">
              {currentTerm.syllabus}
            </span>
          )}
        </div>

        {/* Term */}
        <div className={`text-xl sm:text-2xl md:text-3xl font-bold text-center ${colors.text} mb-4`}>
          {currentTerm.term}
        </div>

        {/* Reveal button or answer */}
        {!showAnswer ? (
          <div className="text-center">
            <button
              onClick={() => setShowAnswer(true)}
              aria-label="答えを表示"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white rounded-xl font-bold text-gray-700 shadow-md hover:shadow-lg transition-all text-base sm:text-lg"
            >
              <R b="答" r="こた" />
              えを
              <R b="見" r="み" />る
            </button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4 animate-[fadeIn_0.3s_ease-in]">
            <div className="bg-white/80 rounded-xl p-3 sm:p-4">
              <div className="text-xs sm:text-sm font-bold text-gray-500 mb-1">
                <R b="定義" r="ていぎ" />
              </div>
              <p className={`text-sm sm:text-base md:text-lg ${colors.text} leading-relaxed`}>
                {currentTerm.definition}
              </p>
            </div>

            <div className="bg-white/60 rounded-xl p-3 sm:p-4">
              <div className="text-xs sm:text-sm font-bold text-gray-500 mb-1">
                <R b="例" r="たと" />
                え
                <R b="話" r="ばなし" />
              </div>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                {currentTerm.metaphor}
              </p>
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={markKnown}
                aria-label="知っていた"
                className="flex-1 max-w-[180px] px-4 sm:px-8 py-3 sm:py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-md hover:bg-emerald-700 transition-colors text-sm sm:text-base"
              >
                &#9675; <R b="知" r="し" />っていた
              </button>
              <button
                onClick={markUnknown}
                aria-label="知らなかった"
                className="flex-1 max-w-[180px] px-4 sm:px-8 py-3 sm:py-4 bg-red-500 text-white rounded-xl font-bold shadow-md hover:bg-red-600 transition-colors text-sm sm:text-base"
              >
                &#10005; <R b="知" r="し" />らなかった
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-center gap-2 sm:gap-3">
        <button
          onClick={goPrev}
          aria-label="前の用語"
          className="px-5 sm:px-8 py-3 sm:py-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors text-sm sm:text-base"
        >
          &larr; <R b="前" r="まえ" />
        </button>
        <button
          onClick={goRandom}
          aria-label="ランダムに表示"
          className="px-5 sm:px-8 py-3 sm:py-4 bg-teal-100 text-teal-700 rounded-xl font-bold hover:bg-teal-200 transition-colors text-sm sm:text-base"
        >
          ランダム
        </button>
        <button
          onClick={goNext}
          aria-label="次の用語"
          className="px-5 sm:px-8 py-3 sm:py-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors text-sm sm:text-base"
        >
          <R b="次" r="つぎ" /> &rarr;
        </button>
      </div>
    </div>
  );
}
