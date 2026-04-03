"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Tile,
  Difficulty,
  generateQuiz,
  allTileTypes,
  tileToId,
  tileName,
  explainWait,
  analyzeHandStructure,
} from "@/lib/mahjong";
import { saveScore } from "@/lib/supabase";
import { HandDisplay, TileDisplay, TileHighlight } from "./TileDisplay";

// ルビ付きテキストのヘルパー
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

type QuizState = "answering" | "correct" | "wrong" | "timeout";

interface Stats {
  total: number;
  correct: number;
  streak: number;
  bestStreak: number;
}

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; timeLimit: number; hint: "full" | "partial" | "none" }> = {
  easy:   { label: "Easy",     timeLimit: 180, hint: "full" },
  medium: { label: "Standard", timeLimit: 120, hint: "partial" },
  hard:   { label: "Hard",     timeLimit: 60,  hint: "none" },
};

// ルビ付き牌種名
function SuitNameRuby({ suit }: { suit: string }) {
  switch (suit) {
    case "m": return <><R b="萬子" r="マンズ" /></>;
    case "p": return <><R b="筒子" r="ピンズ" /></>;
    case "s": return <><R b="索子" r="ソーズ" /></>;
    case "z": return <><R b="字牌" r="ツーハイ" /></>;
    default: return <>{suit}</>;
  }
}

// ヒント生成（JSX要素を返す）
function generateHint(
  hand: Tile[],
  correctWaits: Tile[],
  difficulty: Difficulty,
): React.ReactNode | null {
  const config = DIFFICULTY_CONFIG[difficulty];
  if (config.hint === "none") return null;

  if (config.hint === "full") {
    const suits = [...new Set(correctWaits.map((t) => t.suit))];

    const groups: Record<string, number[]> = {};
    hand.forEach((t) => {
      if (!groups[t.suit]) groups[t.suit] = [];
      groups[t.suit].push(t.number);
    });

    let structureHint: React.ReactNode = null;
    for (const [suit, nums] of Object.entries(groups)) {
      nums.sort((a, b) => a - b);
      for (let i = 0; i < nums.length - 1; i++) {
        if (nums[i] === nums[i + 1]) {
          structureHint = <><SuitNameRuby suit={suit} />の{nums[i]}が2<R b="枚" r="まい" />あります（<R b="雀頭" r="ジャントウ" />の<R b="候補" r="こうほ" />です）</>;
          break;
        }
      }
      if (structureHint) break;
      for (let i = 0; i < nums.length - 1; i++) {
        if (nums[i + 1] - nums[i] === 1) {
          structureHint = <><SuitNameRuby suit={suit} />の{nums[i]}と{nums[i + 1]}が<R b="連続" r="れんぞく" />しています</>;
          break;
        } else if (nums[i + 1] - nums[i] === 2) {
          structureHint = <><SuitNameRuby suit={suit} />の{nums[i]}と{nums[i + 1]}の<R b="間" r="あいだ" />が1つ<R b="空" r="あ" />いています</>;
          break;
        }
      }
      if (structureHint) break;
    }

    return (
      <>
        <R b="待" r="ま" />ち<R b="牌" r="はい" />は{correctWaits.length}<R b="種類" r="しゅるい" />あり、
        {suits.map((s, i) => (
          <span key={s}>{i > 0 && "・"}<SuitNameRuby suit={s} /></span>
        ))}
        の<R b="中" r="なか" />にあります。
        {structureHint && <>{structureHint}</>}
      </>
    );
  }

  if (config.hint === "partial") {
    const suits = new Set(correctWaits.map((t) => t.suit));
    return (
      <>
        {suits.size === 1
          ? <><R b="待" r="ま" />ち<R b="牌" r="はい" />は1<R b="種類" r="しゅるい" />の<R b="牌種" r="はいしゅ" />に<R b="集中" r="しゅうちゅう" />しています</>
          : <><R b="待" r="ま" />ち<R b="牌" r="はい" />は{suits.size}<R b="種類" r="しゅるい" />の<R b="牌種" r="はいしゅ" />にまたがっています</>
        }
        。
        {correctWaits.length === 1 && <><R b="単騎待" r="タンキま" />ちかもしれません</>}
        {correctWaits.length === 2 && <><R b="両面" r="リャンメン" />・<R b="嵌張" r="カンチャン" />・<R b="双碰" r="シャンポン" />のいずれかです</>}
      </>
    );
  }

  return null;
}

interface QuizGameProps {
  onSwitchToAlgorithm?: (difficulty: Difficulty) => void;
}

export function QuizGame({ onSwitchToAlgorithm }: QuizGameProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [hand, setHand] = useState<Tile[]>([]);
  const [correctWaits, setCorrectWaits] = useState<Tile[]>([]);
  const [selectedWaits, setSelectedWaits] = useState<Set<string>>(new Set());
  const [quizState, setQuizState] = useState<QuizState>("answering");
  const [stats, setStats] = useState<Stats>({ total: 0, correct: 0, streak: 0, bestStreak: 0 });
  const [showAlgorithm, setShowAlgorithm] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimerRunning(false);
  }, []);

  const startTimer = useCallback((seconds: number) => {
    stopTimer();
    setTimeLeft(seconds);
    setTimerRunning(true);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [stopTimer]);

  useEffect(() => {
    if (timeLeft === 0 && quizState === "answering") {
      setQuizState("timeout");
      const totalAnswers = correctWaits.length;
      setStats((prev) => ({ ...prev, total: prev.total + totalAnswers, streak: 0 }));
      saveScore({ difficulty, quizType: "tile", isCorrect: false, timeLeft: 0 });
    }
  }, [timeLeft, quizState]);

  // 難易度変更時: 問題だけ出してタイマーは止めておく
  const newQuiz = useCallback((diff: Difficulty) => {
    stopTimer();
    const quiz = generateQuiz(diff);
    setHand(quiz.hand);
    setCorrectWaits(quiz.waits);
    setSelectedWaits(new Set());
    setQuizState("answering");
    setShowAlgorithm(false);
    setShowHint(false);
    setTimeLeft(DIFFICULTY_CONFIG[diff].timeLimit);
    setTimerRunning(false);
  }, [stopTimer]);

  useEffect(() => {
    setMounted(true);
    newQuiz(difficulty);
    return () => stopTimer();
  }, []);

  // 難易度ボタン押下でカウントダウン開始
  const changeDifficulty = (diff: Difficulty) => {
    setDifficulty(diff);
    stopTimer();
    const quiz = generateQuiz(diff);
    setHand(quiz.hand);
    setCorrectWaits(quiz.waits);
    setSelectedWaits(new Set());
    setQuizState("answering");
    setShowAlgorithm(false);
    setShowHint(false);
    startTimer(DIFFICULTY_CONFIG[diff].timeLimit);
  };

  const toggleWait = (tile: Tile) => {
    if (quizState !== "answering") return;
    // 初回タッチでタイマー開始（まだ動いていなければ）
    if (!timerRunning) {
      startTimer(timeLeft);
    }
    const id = tileToId(tile);
    setSelectedWaits((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submitAnswer = () => {
    stopTimer();

    const correctSet = new Set(correctWaits.map(tileToId));
    const totalAnswers = correctSet.size; // 正解の待ち牌数が問題数

    if (selectedWaits.size === 0) {
      // 未選択: 0/N で加算
      setStats((prev) => ({
        ...prev,
        total: prev.total + totalAnswers,
        streak: 0,
      }));
      setQuizState("wrong");
      saveScore({ difficulty, quizType: "tile", isCorrect: false, timeLeft });
      return;
    }

    // 正解した個数 = 選んだ中で正解に含まれるもの
    const correctCount = [...selectedWaits].filter((id) => correctSet.has(id)).length;
    const allCorrect = correctCount === correctSet.size && selectedWaits.size === correctSet.size;

    setStats((prev) => ({
      total: prev.total + totalAnswers,
      correct: prev.correct + correctCount,
      streak: allCorrect ? prev.streak + 1 : 0,
      bestStreak: allCorrect ? Math.max(prev.bestStreak, prev.streak + 1) : prev.bestStreak,
    }));
    setQuizState(allCorrect ? "correct" : "wrong");
    saveScore({ difficulty, quizType: "tile", isCorrect: allCorrect, timeLeft });
  };

  if (!mounted) {
    return (
      <div className="text-center py-20 text-2xl text-white" role="status" aria-live="polite">
        <R b="読" r="よ" />み<R b="込" r="こ" />み<R b="中" r="ちゅう" />...
      </div>
    );
  }

  const allTypes = allTileTypes();
  const suitGroups = {
    m: allTypes.filter((t) => t.suit === "m"),
    p: allTypes.filter((t) => t.suit === "p"),
    s: allTypes.filter((t) => t.suit === "s"),
    z: allTypes.filter((t) => t.suit === "z"),
  };

  const correctSet = new Set(correctWaits.map(tileToId));
  const handTileCount: Record<string, number> = {};
  hand.forEach((t) => {
    const id = tileToId(t);
    handTileCount[id] = (handTileCount[id] || 0) + 1;
  });

  const config = DIFFICULTY_CONFIG[difficulty];
  const timerPercent = (timeLeft / config.timeLimit) * 100;
  const timerColor = timeLeft <= 10 ? "bg-red-600" : timeLeft <= 30 ? "bg-amber-500" : "bg-green-600";
  const hint = generateHint(hand, correctWaits, difficulty);

  // ヒント表示時に手牌をグループ分けしてハイライト（Easyのみ）
  const handHighlights: (TileHighlight)[] | undefined = (showHint && quizState === "answering" && difficulty === "easy")
    ? analyzeHandStructure(hand) as (TileHighlight)[]
    : undefined;

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  // サンプル牌(ビジュアライゼーション用)
  const sampleShuntsu: Tile[] = [
    { suit: "p", number: 2 }, { suit: "p", number: 3 }, { suit: "p", number: 4 },
  ];
  const sampleKotsu: Tile[] = [
    { suit: "z", number: 7 }, { suit: "z", number: 7 }, { suit: "z", number: 7 },
  ];
  const sampleJantou: Tile[] = [
    { suit: "s", number: 1 }, { suit: "s", number: 1 },
  ];
  const sampleAgari: Tile[] = [
    { suit: "m", number: 1 }, { suit: "m", number: 2 }, { suit: "m", number: 3 },
    { suit: "p", number: 4 }, { suit: "p", number: 5 }, { suit: "p", number: 6 },
    { suit: "s", number: 7 }, { suit: "s", number: 8 }, { suit: "s", number: 9 },
    { suit: "z", number: 1 }, { suit: "z", number: 1 }, { suit: "z", number: 1 },
    { suit: "m", number: 5 }, { suit: "m", number: 5 },
  ];

  return (
    <div className="max-w-4xl mx-auto">

      {/* アガリとは？ ビジュアル説明パネル */}
      <details className="mb-6 bg-white rounded-2xl shadow-lg">
        <summary className="px-6 py-4 cursor-pointer text-lg font-bold text-gray-800 hover:bg-gray-50 rounded-2xl focus-visible:ring-4 focus-visible:ring-blue-500">
          <R b="麻雀" r="マージャン" />の<R b="上" r="あ" />がり（ゴール）とは？ ─ はじめての<R b="方" r="かた" />はここを<R b="読" r="よ" />んでください
        </summary>
        <div className="px-6 pb-6 pt-2 space-y-5 text-base leading-loose text-gray-800">
          <p>
            <R b="麻雀" r="マージャン" />は、<strong>14<R b="枚" r="まい" />の<R b="牌" r="はい" /></strong>（タイルのようなコマ）を<R b="使" r="つか" />って
            <strong>「きまった<R b="形" r="かたち" />」</strong>を<R b="作" r="つく" />るゲームです。
          </p>

          {/* ゴールの形（ビジュアル） */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
            <p className="font-bold text-xl text-blue-900 mb-3">
              ゴールの<R b="形" r="かたち" />（<R b="上" r="あ" />がり）
            </p>
            <p className="text-lg mb-4">
              <strong className="text-blue-800 text-xl">
                3<R b="枚" r="まい" />のグループ × 4つ ＋ 2<R b="枚" r="まい" />のペア × 1つ ＝ 14<R b="枚" r="まい" />
              </strong>
            </p>

            {/* 実際の牌で完成形を表示 */}
            <div className="bg-green-900 rounded-xl p-4 mb-3">
              <p className="text-white text-sm mb-2 text-center font-bold"><R b="上" r="あ" />がりの<R b="例" r="れい" />（14<R b="枚" r="まい" />）</p>
              <div className="flex flex-wrap gap-1 justify-center items-end">
                {/* グループ1 */}
                <div className="flex gap-0.5 border-b-4 border-yellow-400 pb-1 mx-1">
                  {sampleAgari.slice(0, 3).map((t, i) => <TileDisplay key={`a${i}`} tile={t} small />)}
                </div>
                {/* グループ2 */}
                <div className="flex gap-0.5 border-b-4 border-yellow-400 pb-1 mx-1">
                  {sampleAgari.slice(3, 6).map((t, i) => <TileDisplay key={`b${i}`} tile={t} small />)}
                </div>
                {/* グループ3 */}
                <div className="flex gap-0.5 border-b-4 border-yellow-400 pb-1 mx-1">
                  {sampleAgari.slice(6, 9).map((t, i) => <TileDisplay key={`c${i}`} tile={t} small />)}
                </div>
                {/* グループ4 */}
                <div className="flex gap-0.5 border-b-4 border-yellow-400 pb-1 mx-1">
                  {sampleAgari.slice(9, 12).map((t, i) => <TileDisplay key={`d${i}`} tile={t} small />)}
                </div>
                {/* ペア */}
                <div className="flex gap-0.5 border-b-4 border-pink-400 pb-1 mx-1">
                  {sampleAgari.slice(12, 14).map((t, i) => <TileDisplay key={`e${i}`} tile={t} small />)}
                </div>
              </div>
              <div className="flex justify-center gap-4 mt-2 text-sm">
                <span className="flex items-center gap-1">
                  <span className="w-6 h-1.5 bg-yellow-400 rounded" aria-hidden="true" />
                  <span className="text-white">3<R b="枚" r="まい" />グループ×4</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-6 h-1.5 bg-pink-400 rounded" aria-hidden="true" />
                  <span className="text-white">2<R b="枚" r="まい" />ペア×1</span>
                </span>
              </div>
            </div>
          </div>

          {/* 順子（ビジュアル） */}
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5">
            <p className="font-bold text-lg text-green-900 mb-3">
              3<R b="枚" r="まい" />のグループには2<R b="種類" r="しゅるい" />あります
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="bg-green-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center shrink-0 text-sm" aria-hidden="true">1</span>
                <div>
                  <p className="font-bold text-base mb-2">
                    <R b="順子" r="シュンツ" /> ＝ <R b="番号" r="ばんごう" />が<R b="続" r="つづ" />く3<R b="枚" r="まい" />
                  </p>
                  <div className="bg-green-900 rounded-lg p-3 inline-flex gap-0.5">
                    {sampleShuntsu.map((t, i) => <TileDisplay key={i} tile={t} small />)}
                  </div>
                  <p className="text-gray-600 mt-1 text-sm">
                    ↑ <R b="筒子" r="ピンズ" />の 2→3→4 で「<R b="順子" r="シュンツ" />」
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="bg-green-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center shrink-0 text-sm" aria-hidden="true">2</span>
                <div>
                  <p className="font-bold text-base mb-2">
                    <R b="刻子" r="コーツ" /> ＝ <R b="同" r="おな" />じ<R b="牌" r="はい" />が3<R b="枚" r="まい" />
                  </p>
                  <div className="bg-green-900 rounded-lg p-3 inline-flex gap-0.5">
                    {sampleKotsu.map((t, i) => <TileDisplay key={i} tile={t} small />)}
                  </div>
                  <p className="text-gray-600 mt-1 text-sm">
                    ↑ <R b="中" r="チュン" />が3<R b="枚" r="まい" />で「<R b="刻子" r="コーツ" />」
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 雀頭（ビジュアル） */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5">
            <p className="font-bold text-lg text-amber-900 mb-3">
              2<R b="枚" r="まい" />のペア（<R b="雀頭" r="ジャントウ" />）
            </p>
            <div className="bg-green-900 rounded-lg p-3 inline-flex gap-0.5">
              {sampleJantou.map((t, i) => <TileDisplay key={i} tile={t} small />)}
            </div>
            <p className="text-gray-600 mt-2 text-sm">
              ↑ <R b="索子" r="ソーズ" />の1が2<R b="枚" r="まい" />で「<R b="雀頭" r="ジャントウ" />」（ペア）
            </p>
          </div>

          {/* 手牌と待ち牌 */}
          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-5">
            <p className="font-bold text-lg text-purple-900 mb-2">
              <R b="手牌" r="てはい" />と<R b="待" r="ま" />ち<R b="牌" r="はい" />
            </p>
            <p>
              ゲーム<R b="中" r="ちゅう" />は<strong>13<R b="枚" r="まい" /></strong>を<R b="手" r="て" />に<R b="持" r="も" />ちます。
              あと<strong>1<R b="枚" r="まい" /></strong>で<R b="上" r="あ" />がりが<R b="完成" r="かんせい" />する
              <R b="状態" r="じょうたい" />を「<strong><R b="聴牌" r="テンパイ" /></strong>」と<R b="呼" r="よ" />びます。
            </p>
            <p className="mt-2">
              そのとき、<R b="加" r="くわ" />えれば<R b="上" r="あ" />がりになる<R b="牌" r="はい" />のことを
              「<strong><R b="待" r="ま" />ち<R b="牌" r="はい" /></strong>」と<R b="呼" r="よ" />びます。
            </p>
          </div>

          {/* このクイズでやること */}
          <div className="bg-gray-100 border-2 border-gray-300 rounded-xl p-5">
            <p className="font-bold text-lg text-gray-900 mb-2">
              このクイズでやること
            </p>
            <p className="text-lg">
              <R b="画面" r="がめん" />に<R b="表示" r="ひょうじ" />された<strong>13<R b="枚" r="まい" />の<R b="手牌" r="てはい" /></strong>を<R b="見" r="み" />て、
              あと<strong>どの<R b="牌" r="はい" />が<R b="来" r="く" />れば<R b="上" r="あ" />がりになるか</strong>を<R b="当" r="あ" />ててください。
            </p>
            <p className="mt-2 text-gray-700">
              わからなくても<R b="大丈夫" r="だいじょうぶ" />です。「<R b="回答" r="かいとう" />する」ボタンを<R b="押" r="お" />せば<R b="答" r="こた" />えと<R b="解説" r="かいせつ" />が<R b="表示" r="ひょうじ" />されます。
            </p>
          </div>
        </div>
      </details>

      {/* 難易度選択 */}
      <div className="flex gap-2 sm:gap-3 justify-center mb-5 flex-wrap" role="radiogroup" aria-label="難易度（なんいど）の選択">
        {(["easy", "medium", "hard"] as Difficulty[]).map((d) => {
          const cfg = DIFFICULTY_CONFIG[d];
          return (
            <button
              key={d}
              onClick={() => changeDifficulty(d)}
              role="radio"
              aria-checked={difficulty === d}
              className={`px-5 py-3 rounded-xl font-bold transition-all text-base ${
                difficulty === d
                  ? "bg-indigo-700 text-white shadow-lg ring-2 ring-indigo-300"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200 border-2 border-gray-300"
              }`}
            >
              <span className="block text-base">{cfg.label}</span>
              <span className="block text-xs mt-0.5">
                {Math.floor(cfg.timeLimit / 60)}<R b="分" r="ふん" /> ／{" "}
                {{ full: "ヒントあり", partial: <><R b="少" r="すこ" />しヒント</>, none: "ヒントなし" }[cfg.hint]}
              </span>
            </button>
          );
        })}
      </div>

      {/* タイマー */}
      <div className="mb-5" role="timer" aria-live="polite" aria-label={`残り時間 ${formatTime(timeLeft)}`}>
        <div className="flex items-center justify-between mb-1.5">
          <span className={`text-lg font-bold ${!timerRunning ? "text-gray-700" : timeLeft <= 10 ? "text-red-700 animate-pulse" : "text-gray-900"}`}>
            {!timerRunning && quizState === "answering"
              ? <><R b="難易度" r="なんいど" />ボタンを<R b="押" r="お" />すとカウントダウン<R b="開始" r="かいし" /></>
              : <><R b="残" r="のこ" />り {formatTime(timeLeft)}</>
            }
          </span>
          <span className="text-sm text-gray-700">
            <R b="制限時間" r="せいげんじかん" /> {Math.floor(config.timeLimit / 60)}<R b="分" r="ふん" />
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden" role="progressbar" aria-valuenow={timeLeft} aria-valuemin={0} aria-valuemax={config.timeLimit}>
          <div
            className={`h-full rounded-full transition-all duration-1000 ${timerRunning ? timerColor : "bg-gray-400"}`}
            style={{ width: `${timerPercent}%` }}
          />
        </div>
      </div>

      {/* スコア */}
      <div className="flex gap-2 sm:gap-3 justify-center mb-6 text-sm sm:text-base flex-wrap" aria-label="スコア">
        <span className="bg-white rounded-xl px-4 py-2 shadow border border-gray-200">
          <R b="正解率" r="せいかいりつ" />:{" "}
          <strong className="text-indigo-700 text-xl">
            {stats.total}<R b="問中" r="もんちゅう" />{stats.correct}<R b="問正解" r="もんせいかい" />：{stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%
          </strong>
        </span>
        <span className="bg-white rounded-xl px-4 py-2 shadow border border-gray-200">
          <R b="連続正解" r="れんぞくせいかい" />: <strong className="text-amber-700 text-xl">{stats.streak}</strong>
        </span>
        <span className="bg-white rounded-xl px-4 py-2 shadow border border-gray-200">
          <R b="最高記録" r="さいこうきろく" />: <strong className="text-red-700 text-xl">{stats.streak > stats.bestStreak ? stats.streak : stats.bestStreak}<R b="連続" r="れんぞく" /></strong>
        </span>
      </div>

      {/* 手牌表示 */}
      <div className="bg-green-900 rounded-2xl p-6 mb-6 shadow-lg" aria-label="手牌の表示エリア">
        <p className="text-white text-lg font-bold mb-4 text-center">
          <R b="手牌" r="てはい" />（13<R b="枚" r="まい" />）
        </p>
        <HandDisplay tiles={hand} highlights={handHighlights} />
        <p className="text-white text-sm mt-4 text-center leading-relaxed">
          <R b="手牌" r="てはい" /> ＝ <R b="自分" r="じぶん" />が<R b="持" r="も" />っている<R b="牌" r="はい" />のことです。
          あと1<R b="枚" r="まい" />で<R b="上" r="あ" />がり（<R b="完成" r="かんせい" />）になる<R b="状態" r="じょうたい" />を
          「<R b="聴牌" r="テンパイ" />」と<R b="呼" r="よ" />びます。
        </p>
      </div>

      {/* ヒントエリア */}
      {hint && quizState === "answering" && (
        <div className="mb-5 text-center">
          {!showHint ? (
            <button
              onClick={() => setShowHint(true)}
              className="px-6 py-3 bg-amber-100 text-amber-900 rounded-xl text-base font-bold
                         border-2 border-amber-300
                         hover:bg-amber-200 active:scale-95 transition-all
                         focus-visible:ring-4 focus-visible:ring-blue-500"
            >
              {difficulty === "easy"
                ? <><R b="ヒント" r="" />を<R b="見" r="み" />る</>
                : <><R b="ヒント" r="" />を<R b="見" r="み" />る</>
              }
            </button>
          ) : (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5 text-base text-amber-900 leading-relaxed text-left space-y-3">
              <p><span className="font-bold">ヒント: </span>{hint}</p>
              {/* 手牌ハイライトの凡例 */}
              <div className="flex flex-wrap gap-3 text-sm text-gray-700 pt-2 border-t border-amber-200">
                <span className="font-bold text-gray-900"><R b="手牌" r="てはい" />の<R b="色分" r="いろわ" />け：</span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-4 rounded border-2 border-blue-500 bg-blue-100" aria-hidden="true" />
                  <span className="inline-block w-4 h-4 rounded border-2 border-emerald-500 bg-emerald-100" aria-hidden="true" />
                  <span className="inline-block w-4 h-4 rounded border-2 border-purple-500 bg-purple-100" aria-hidden="true" />
                  <span className="inline-block w-4 h-4 rounded border-2 border-orange-500 bg-orange-100" aria-hidden="true" />
                  <R b="完成" r="かんせい" />した3<R b="枚" r="まい" />グループ
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-4 rounded border-2 border-pink-500 bg-pink-100" aria-hidden="true" />
                  <R b="雀頭" r="ジャントウ" />（ペア）
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-4 rounded border-2 border-yellow-500 bg-yellow-100 animate-pulse" aria-hidden="true" />
                  <R b="未完成" r="みかんせい" />（ここに<R b="待" r="ま" />ち<R b="牌" r="はい" />が<R b="入" r="はい" />る）
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 問題文 */}
      <div className="text-center mb-5">
        <p className="text-xl font-bold text-gray-900">
          この<R b="手牌" r="てはい" />の<R b="待" r="ま" />ち<R b="牌" r="はい" />を<R b="全" r="すべ" />て<R b="選" r="えら" />んでください
        </p>
        <p className="text-base text-gray-700 mt-2">
          <R b="待" r="ま" />ち<R b="牌" r="はい" />は <strong className="text-indigo-800 text-xl">{correctWaits.length}<R b="種類" r="しゅるい" /></strong> あります
        </p>
        <p className="text-sm text-gray-600 mt-2 leading-relaxed max-w-lg mx-auto">
          <R b="待" r="ま" />ち<R b="牌" r="はい" /> ＝ <R b="手牌" r="てはい" />に<R b="加" r="くわ" />えると<R b="上" r="あ" />がりが<R b="完成" r="かんせい" />する<R b="牌" r="はい" />のことです。
          わからない<R b="場合" r="ばあい" />は、<R b="何" r="なに" />も<R b="選" r="えら" />ばずに「<R b="回答" r="かいとう" />する」を<R b="押" r="お" />すと<R b="答" r="こた" />えが<R b="見" r="み" />られます。
        </p>
      </div>

      {/* 回答エリア */}
      <div className="bg-white rounded-2xl p-5 mb-6 shadow-lg space-y-5 border border-gray-200" role="group" aria-label="待ち牌の選択エリア">
        {(["m", "p", "s", "z"] as const).map((suit) => (
          <div key={suit}>
            <div className="flex items-start gap-3 mb-2">
              <span className="text-base font-bold text-gray-800 w-14 text-right shrink-0 leading-snug pt-0.5">
                {{
                  m: <><R b="萬子" r="マンズ" /></>,
                  p: <><R b="筒子" r="ピンズ" /></>,
                  s: <><R b="索子" r="ソーズ" /></>,
                  z: <><R b="字牌" r="ツーハイ" /></>,
                }[suit]}
              </span>
              <span className="text-sm text-gray-700 leading-relaxed">
                {{
                  m: <>
                    <R b="漢数字" r="かんすうじ" />と「<R b="萬" r="まん" />」が<R b="描" r="えが" />かれた<R b="赤" r="あか" />い<R b="牌" r="はい" />。
                    1〜9の<R b="数牌" r="かずはい" />で、<R b="順子" r="シュンツ" />にも<R b="刻子" r="コーツ" />にもできます。
                  </>,
                  p: <>
                    <R b="丸" r="まる" />い<R b="模様" r="もよう" />の<R b="牌" r="はい" />。
                    1〜9の<R b="数牌" r="かずはい" />で、<R b="順子" r="シュンツ" />にも<R b="刻子" r="コーツ" />にもできます。
                  </>,
                  s: <>
                    <R b="竹" r="たけ" />の<R b="模様" r="もよう" />の<R b="牌" r="はい" />。
                    1〜9の<R b="数牌" r="かずはい" />で、<R b="順子" r="シュンツ" />にも<R b="刻子" r="コーツ" />にもできます。
                  </>,
                  z: <>
                    <R b="風牌" r="かぜはい" />（<R b="東南西北" r="トンナンシャーペー" />）と<R b="三元牌" r="さんげんぱい" />（<R b="白發中" r="ハクハツチュン" />）。
                    <R b="刻子" r="コーツ" />のみで、<R b="順子" r="シュンツ" />は<R b="作" r="つく" />れません。
                  </>,
                }[suit]}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-14 shrink-0" aria-hidden="true" />
              <div className="flex gap-1.5 flex-wrap" role="group" aria-label={`${
                { m: "萬子", p: "筒子", s: "索子", z: "字牌" }[suit]
              }の牌を選ぶ`}>
                {suitGroups[suit].map((tile) => {
                  const id = tileToId(tile);
                  const isSelected = selectedWaits.has(id);
                  const isCorrectTile = correctSet.has(id);
                  const isAnswered = quizState !== "answering";
                  const usedCount = handTileCount[id] || 0;
                  const isDisabled = usedCount >= 4;

                  let borderOverride = "";
                  if (isAnswered) {
                    if (isCorrectTile && isSelected) borderOverride = "ring-4 ring-green-600 border-green-600";
                    else if (isCorrectTile && !isSelected) borderOverride = "ring-4 ring-blue-600 border-blue-600";
                    else if (!isCorrectTile && isSelected) borderOverride = "ring-4 ring-red-600 border-red-600";
                  }

                  return (
                    <div key={id} className={`relative ${borderOverride ? borderOverride + " rounded-lg" : ""}`}>
                      <TileDisplay
                        tile={tile}
                        small
                        selected={isSelected && !isAnswered}
                        disabled={isDisabled || isAnswered}
                        onClick={() => toggleWait(tile)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        {/* 用語の補足 */}
        <div className="border-t-2 border-gray-200 pt-4 mt-3">
          <p className="text-sm text-gray-700 leading-loose">
            <strong className="text-gray-900"><R b="順子" r="シュンツ" /></strong> ＝ <R b="同" r="おな" />じ<R b="種類" r="しゅるい" />の<R b="連続" r="れんぞく" />3<R b="枚" r="まい" />（<R b="例" r="れい" />: 1→2→3）
            <span className="mx-2 text-gray-400" aria-hidden="true">│</span>
            <strong className="text-gray-900"><R b="刻子" r="コーツ" /></strong> ＝ <R b="同" r="おな" />じ<R b="牌" r="はい" />が3<R b="枚" r="まい" />（<R b="例" r="れい" />: 5が3つ）
            <span className="mx-2 text-gray-400" aria-hidden="true">│</span>
            <strong className="text-gray-900"><R b="雀頭" r="ジャントウ" /></strong> ＝ <R b="同" r="おな" />じ<R b="牌" r="はい" />が2<R b="枚" r="まい" />のペア
          </p>
        </div>
      </div>

      {/* ボタン & 結果 */}
      <div className="flex flex-col items-center gap-4">
        {quizState === "answering" && (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={submitAnswer}
              className="px-10 py-4 bg-indigo-700 text-white rounded-2xl font-bold text-xl
                         hover:bg-indigo-800 active:scale-95 transition-all shadow-lg
                         focus-visible:ring-4 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              aria-label={selectedWaits.size === 0 ? "回答する（未選択のため答えを表示します）" : "回答する"}
            >
              <R b="回答" r="かいとう" />する
            </button>
            {selectedWaits.size === 0 && (
              <p className="text-sm text-gray-600">
                <R b="選" r="えら" />ばずに<R b="押" r="お" />すと、<R b="答" r="こた" />えと<R b="解説" r="かいせつ" />が<R b="表示" r="ひょうじ" />されます
              </p>
            )}
          </div>
        )}

        {quizState !== "answering" && (
          <>
            {/* 結果ヘッダー */}
            <div className="text-center" role="status" aria-live="polite">
              {quizState === "correct" && (
                <>
                  <p className="text-3xl font-bold text-green-700 mb-1"><R b="正解" r="せいかい" />!</p>
                  <p className="text-base text-gray-700"><R b="残" r="のこ" />り {formatTime(timeLeft)} でクリア</p>
                </>
              )}
              {quizState === "wrong" && (
                <>
                  <p className="text-3xl font-bold text-red-700 mb-2">
                    {selectedWaits.size === 0
                      ? <><R b="答" r="こた" />えを<R b="表示" r="ひょうじ" />します</>
                      : <><R b="不正解" r="ふせいかい" />...</>
                    }
                  </p>
                  {selectedWaits.size > 0 && (
                    <div className="flex gap-4 justify-center text-sm text-gray-700 flex-wrap">
                      <span className="flex items-center gap-1">
                        <span className="inline-block w-4 h-4 rounded border-3 border-green-600 bg-green-100" aria-hidden="true" />
                        <R b="正解" r="せいかい" />&amp;<R b="選択済" r="せんたくずみ" />
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="inline-block w-4 h-4 rounded border-3 border-blue-600 bg-blue-100" aria-hidden="true" />
                        <R b="正解" r="せいかい" />（<R b="未選択" r="みせんたく" />）
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="inline-block w-4 h-4 rounded border-3 border-red-600 bg-red-100" aria-hidden="true" />
                        <R b="誤選択" r="ごせんたく" />
                      </span>
                    </div>
                  )}
                </>
              )}
              {quizState === "timeout" && (
                <>
                  <p className="text-3xl font-bold text-orange-700 mb-1">タイムアップ!</p>
                  <p className="text-base text-gray-700">
                    <R b="制限時間" r="せいげんじかん" /> {Math.floor(config.timeLimit / 60)}<R b="分" r="ふん" />を<R b="超" r="こ" />えました
                  </p>
                </>
              )}
            </div>

            {/* 解答 & 解説パネル */}
            <div className="w-full bg-white rounded-2xl shadow-lg p-6 mt-2 space-y-5 border border-gray-200">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  <R b="正解" r="せいかい" />の<R b="待" r="ま" />ち<R b="牌" r="はい" />
                </h3>
                <div className="flex gap-3 flex-wrap items-center">
                  {correctWaits.map((t) => (
                    <div key={tileToId(t)} className="flex flex-col items-center gap-1">
                      <TileDisplay tile={t} />
                      <span className="text-sm text-gray-800 font-semibold">{tileName(t)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  <R b="上" r="あ" />がりの<R b="形" r="かたち" />（<R b="解説" r="かいせつ" />）
                </h3>
                <div className="space-y-3">
                  {correctWaits.map((t) => {
                    const explanation = explainWait(hand, t);
                    return (
                      <div key={tileToId(t)} className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <TileDisplay tile={t} small />
                          <span className="font-bold text-gray-900 text-base">
                            {tileName(t)} が<R b="来" r="き" />たら…
                          </span>
                        </div>
                        <p className="text-gray-800 text-sm leading-loose ml-1">
                          {explanation}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            <div className="flex flex-wrap gap-3 justify-center mt-2">
              <button
                onClick={() => newQuiz(difficulty)}
                className="px-8 py-4 bg-indigo-700 text-white rounded-2xl font-bold text-lg
                           hover:bg-indigo-800 active:scale-95 transition-all shadow-lg
                           focus-visible:ring-4 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <R b="次" r="つぎ" />の<R b="待" r="ま" />ち<R b="牌" r="はい" /><R b="問題" r="もんだい" />
              </button>
              {onSwitchToAlgorithm && (
                <button
                  onClick={() => onSwitchToAlgorithm(difficulty)}
                  className="px-8 py-4 bg-gray-900 text-green-400 rounded-2xl font-bold text-lg
                             hover:bg-gray-800 active:scale-95 transition-all shadow-lg
                             border-2 border-green-500
                             focus-visible:ring-4 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  アルゴリズム<R b="問題" r="もんだい" />に<R b="挑戦" r="ちょうせん" />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
