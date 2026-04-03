"use client";

import { useState } from "react";
import { QuizGame } from "./QuizGame";
import { AlgorithmQuiz } from "./AlgorithmQuiz";
import { Difficulty } from "@/lib/mahjong";

function R({ b, r }: { b: string; r: string }) {
  return (
    <ruby>
      {b}
      <rp>(</rp>
      <rt className="text-[0.6em]">{r}</rt>
      <rp>)</rp>
    </ruby>
  );
}

type Mode = "tile" | "algorithm";

export function GameContainer() {
  const [mode, setMode] = useState<Mode>("tile");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");

  return (
    <>
      {/* モード切替タブ */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex rounded-2xl overflow-hidden shadow-lg border-2 border-white/20" role="tablist" aria-label="クイズモードの切り替え">
          <button
            role="tab"
            aria-selected={mode === "tile"}
            onClick={() => setMode("tile")}
            className={`flex-1 py-3 text-sm sm:text-base font-bold transition-all focus-visible:ring-4 focus-visible:ring-blue-500 ${
              mode === "tile"
                ? "bg-white text-indigo-800"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            <R b="待" r="ま" />ち<R b="牌" r="はい" />クイズ
          </button>
          <button
            role="tab"
            aria-selected={mode === "algorithm"}
            onClick={() => setMode("algorithm")}
            className={`flex-1 py-3 text-sm sm:text-base font-bold transition-all focus-visible:ring-4 focus-visible:ring-blue-500 ${
              mode === "algorithm"
                ? "bg-white text-indigo-800"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            アルゴリズム<R b="問題" r="もんだい" />
          </button>
        </div>
      </div>

      {mode === "tile" && (
        <QuizGame onSwitchToAlgorithm={(diff) => { setDifficulty(diff); setMode("algorithm"); }} />
      )}
      {mode === "algorithm" && (
        <AlgorithmQuiz difficulty={difficulty} onBack={() => setMode("tile")} />
      )}
    </>
  );
}
