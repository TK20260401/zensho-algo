"use client";

import { useState } from "react";
import { Difficulty } from "@/lib/mahjong";
import { AlgoQuiz, getAlgoQuiz } from "@/lib/algorithmQuiz";
import { saveScore } from "@/lib/supabase";

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

// テキスト内の漢字にルビを自動付与するヘルパー
const RUBY_MAP: [string, string][] = [
  ["手牌", "てはい"], ["待ち牌", "まちはい"], ["牌", "はい"],
  ["枚数", "まいすう"], ["枚", "まい"], ["数", "かず"],
  ["全探索", "ぜんたんさく"], ["探索", "たんさく"],
  ["種類", "しゅるい"], ["配列", "はいれつ"], ["追加", "ついか"],
  ["条件分岐", "じょうけんぶんき"], ["条件", "じょうけん"],
  ["判定", "はんてい"], ["判", "はん"],
  ["面子", "メンツ"], ["雀頭", "ジャントウ"],
  ["刻子", "コーツ"], ["順子", "シュンツ"], ["七対子", "チートイツ"],
  ["正", "ただ"], ["選", "えら"], ["埋", "う"],
  ["空欄", "くうらん"], ["入力", "にゅうりょく"],
  ["連続", "れんぞく"], ["番号", "ばんごう"],
  ["末尾", "まつび"], ["先頭", "せんとう"],
  ["命令", "めいれい"], ["管理", "かんり"], ["変換", "へんかん"],
  ["全体", "ぜんたい"], ["構造", "こうぞう"],
  ["再帰的", "さいきてき"], ["再帰", "さいき"],
  ["自分", "じぶん"], ["考", "かんが"],
  ["取り除", "とりのぞ"], ["取", "と"],
  ["調", "しら"], ["加", "くわ"], ["見", "み"],
  ["完成", "かんせい"], ["計算", "けいさん"],
];

function autoRuby(text: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    let matched = false;
    for (const [kanji, reading] of RUBY_MAP) {
      if (remaining.startsWith(kanji)) {
        result.push(<R key={key++} b={kanji} r={reading} />);
        remaining = remaining.slice(kanji.length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      // 次のマッチまでのプレーンテキストを追加
      let nextMatch = remaining.length;
      for (const [kanji] of RUBY_MAP) {
        const idx = remaining.indexOf(kanji, 1);
        if (idx > 0 && idx < nextMatch) nextMatch = idx;
      }
      result.push(<span key={key++}>{remaining.slice(0, nextMatch)}</span>);
      remaining = remaining.slice(nextMatch);
    }
  }
  return result;
}

type AlgoState = "answering" | "correct" | "wrong";

interface AlgorithmQuizProps {
  difficulty: Difficulty;
  onBack: () => void;
}

const ALGO_DIFFICULTY_CONFIG: Record<Difficulty, { label: string; method: string; format: string }> = {
  easy:   { label: "Easy",     method: "再認法", format: "選択肢" },
  medium: { label: "Standard", method: "再認法", format: "虫食い" },
  hard:   { label: "Hard",     method: "再生法", format: "自由記述" },
};

export function AlgorithmQuiz({ difficulty: initialDifficulty, onBack }: AlgorithmQuizProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);
  const [quiz, setQuiz] = useState<AlgoQuiz>(() => getAlgoQuiz(initialDifficulty));
  const [answers, setAnswers] = useState<string[]>(() => quiz.correctAnswers.map(() => ""));
  const [state, setState] = useState<AlgoState>("answering");
  const [showGuide, setShowGuide] = useState(false);
  const [stats, setStats] = useState({ total: 0, correct: 0, streak: 0, bestStreak: 0 });

  const newQuiz = (diff?: Difficulty) => {
    const d = diff ?? difficulty;
    const q = getAlgoQuiz(d);
    setQuiz(q);
    setAnswers(q.blankIndices.map(() => ""));
    setState("answering");
    setShowGuide(false);
  };

  const changeDifficulty = (diff: Difficulty) => {
    setDifficulty(diff);
    newQuiz(diff);
  };

  const checkAnswer = () => {
    const totalBlanks = quiz.correctAnswers.length;

    if (answers.every((a) => a.trim() === "")) {
      setState("wrong");
      setStats((prev) => ({ ...prev, total: prev.total + totalBlanks, streak: 0 }));
      saveScore({ difficulty, quizType: "algorithm", isCorrect: false });
      return;
    }

    const correctAnswers = quiz.correctAnswers;
    let correctCount = 0;

    for (let i = 0; i < correctAnswers.length; i++) {
      const userAnswer = answers[i].trim();
      if (quiz.type === "freeform") {
        const patterns = (quiz as { acceptablePatterns: string[][] }).acceptablePatterns[i];
        if (patterns.some((p) => userAnswer === p)) correctCount++;
      } else {
        if (userAnswer === correctAnswers[i]) correctCount++;
      }
    }

    const allCorrect = correctCount === totalBlanks;
    setState(allCorrect ? "correct" : "wrong");
    setStats((prev) => ({
      total: prev.total + totalBlanks,
      correct: prev.correct + correctCount,
      streak: allCorrect ? prev.streak + 1 : 0,
      bestStreak: allCorrect ? Math.max(prev.bestStreak, prev.streak + 1) : prev.bestStreak,
    }));
    saveScore({ difficulty, quizType: "algorithm", isCorrect: allCorrect });
  };

  const setAnswer = (index: number, value: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  // コードを空欄付きで描画
  // blankIndicesの順番で空欄カウンターを管理
  const renderCodeLines = () => {
    let globalBlankIdx = 0; // 全体の空欄インデックス

    return quiz.codeLines.map((line, lineIdx) => {
      if (!line.includes("___")) {
        return (
          <div key={lineIdx} className="flex items-center min-h-[2.5rem]">
            <span className="text-gray-500 w-8 text-right mr-3 shrink-0 text-sm select-none">{lineIdx + 1}</span>
            <code className="text-green-300 whitespace-pre">{line}</code>
          </div>
        );
      }

      // ___を分割して各空欄を描画
      const parts = line.split("___");
      const blankElements = parts.map((part, pi) => {
        const blankIdx = globalBlankIdx;
        const isLastPart = pi === parts.length - 1;
        if (!isLastPart) globalBlankIdx++;

        return (
          <span key={pi} className="flex items-center">
            <code className="text-green-300 whitespace-pre">{part}</code>
            {!isLastPart && (
              state === "answering" ? (
                quiz.type === "choice" ? (
                  <select
                    value={answers[blankIdx]}
                    onChange={(e) => setAnswer(blankIdx, e.target.value)}
                    className="mx-1 px-3 py-1.5 bg-gray-700 text-yellow-300 border-2 border-yellow-500 rounded-lg
                               text-base font-mono focus-visible:ring-4 focus-visible:ring-blue-500
                               min-w-[140px]"
                    aria-label={`空欄${blankIdx + 1}の選択`}
                  >
                    <option value="">-- <R b="選" r="えら" />ぶ --</option>
                    {(quiz as { choices: string[][] }).choices[blankIdx]?.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={answers[blankIdx]}
                    onChange={(e) => setAnswer(blankIdx, e.target.value)}
                    placeholder={quiz.type === "fillblank" ? "ここに入力" : "自分で考えて入力"}
                    className="mx-1 px-3 py-1.5 bg-gray-700 text-yellow-300 border-2 border-yellow-500 rounded-lg
                               text-base font-mono placeholder-gray-500
                               focus-visible:ring-4 focus-visible:ring-blue-500
                               w-[160px]"
                    aria-label={`空欄${blankIdx + 1}の入力`}
                  />
                )
              ) : (
                <span className={`mx-1 px-3 py-1 rounded-lg font-mono text-base font-bold inline-block
                  ${answers[blankIdx]?.trim() === quiz.correctAnswers[blankIdx]
                    ? "bg-green-700 text-green-100 border-2 border-green-400"
                    : "bg-red-700 text-red-100 border-2 border-red-400"
                  }`}>
                  {answers[blankIdx]?.trim() || "（未入力）"}
                  {answers[blankIdx]?.trim() !== quiz.correctAnswers[blankIdx] && (
                    <span className="ml-2 text-yellow-300">→ {quiz.correctAnswers[blankIdx]}</span>
                  )}
                </span>
              )
            )}
          </span>
        );
      });

      return (
        <div key={lineIdx} className="flex items-center min-h-[2.5rem] flex-wrap">
          <span className="text-gray-500 w-8 text-right mr-3 shrink-0 text-sm select-none">{lineIdx + 1}</span>
          {blankElements}
        </div>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto mt-8">
      {/* スコア */}
      <div className="flex gap-3 justify-center mb-4 text-base flex-wrap" aria-label="アルゴリズム問題スコア">
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

      {/* 難易度選択 */}
      <div className="flex gap-3 justify-center mb-5" role="radiogroup" aria-label="アルゴリズム問題の難易度選択">
        {(["easy", "medium", "hard"] as Difficulty[]).map((d) => {
          const cfg = ALGO_DIFFICULTY_CONFIG[d];
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
              <span className="block text-xs mt-0.5">{cfg.format}</span>
            </button>
          );
        })}
      </div>

      {/* セクションヘッダー */}
      <div className="bg-gray-900 rounded-t-2xl px-6 py-4 border-b-2 border-yellow-500">
        <h2 className="text-xl font-bold text-white">
          アルゴリズム<R b="問題" r="もんだい" />
          <span className="ml-2 text-sm text-yellow-300 font-normal">
            {{
              easy: <><R b="選択肢" r="せんたくし" /></>,
              medium: <><R b="虫食" r="むしく" />い</>,
              hard: <><R b="自由記述" r="じゆうきじゅつ" /></>,
            }[difficulty]}
          </span>
        </h2>
      </div>

      {/* 問題パネル */}
      <div className="bg-white rounded-b-2xl shadow-lg border border-gray-200 border-t-0">
        {/* 問題タイトル・説明 */}
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{autoRuby(quiz.title)}</h3>
          <p className="text-base text-gray-700 leading-relaxed">{autoRuby(quiz.description)}</p>
        </div>

        {/* コードエリア */}
        <div className="bg-gray-900 px-6 py-5 font-mono text-sm leading-loose overflow-x-auto">
          {renderCodeLines()}
        </div>

        {/* ガイド / ヒント */}
        {state === "answering" && (
          <div className="px-6 py-4 border-t border-gray-200">
            {(quiz.type === "choice" || quiz.type === "fillblank") && (
              <>
                {!showGuide ? (
                  <button
                    onClick={() => setShowGuide(true)}
                    className="px-5 py-2.5 bg-amber-100 text-amber-900 rounded-xl text-base font-bold
                               border-2 border-amber-300 hover:bg-amber-200 active:scale-95 transition-all
                               focus-visible:ring-4 focus-visible:ring-blue-500"
                  >
                    ガイドを<R b="見" r="み" />る
                  </button>
                ) : (
                  <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5 text-base text-amber-900 leading-relaxed whitespace-pre-line">
                    <span className="font-bold">ガイド: </span>{quiz.guide}
                  </div>
                )}
              </>
            )}
            {quiz.type === "freeform" && (
              <p className="text-sm text-gray-600">
                ガイドなし。<R b="空欄" r="くうらん" />のまま<R b="回答" r="かいとう" />すると<R b="答" r="こた" />えが<R b="見" r="み" />られます。
                わからない<R b="場合" r="ばあい" />は<R b="空欄" r="くうらん" />のまま<R b="回答" r="かいとう" />すれば<R b="答" r="こた" />えが<R b="表示" r="ひょうじ" />されます。
              </p>
            )}

            {/* アルゴリズム解説 */}
            <details className="mt-3">
              <summary className="text-base text-indigo-800 font-bold cursor-pointer hover:text-indigo-900 transition-colors
                                  focus-visible:ring-4 focus-visible:ring-blue-500 rounded-lg px-2 py-1">
                <R b="解説" r="かいせつ" />を<R b="見" r="み" />る（<R b="待" r="ま" />ち<R b="牌" r="はい" /><R b="計算" r="けいさん" />アルゴリズムとは）
              </summary>
              <div className="mt-3 bg-gray-900 text-green-400 rounded-xl p-5 font-mono text-sm leading-relaxed">
                <h4 className="text-white font-bold mb-3 text-base font-sans">
                  <R b="待" r="ま" />ち<R b="牌" r="はい" /><R b="計算" r="けいさん" />アルゴリズムの<R b="全体像" r="ぜんたいぞう" />
                </h4>
                <pre className="whitespace-pre-wrap text-base">{`// 1. 全探索: 全34種の牌を1つずつ試す
for (全34種の牌 tile) {
  if (手牌に tile が4枚あれば) continue;

  手牌に tile を1枚追加 → 14枚

  if (isWinningHand(14枚)) {
    tile は待ち牌!
  }
}

// 2. アガリ判定: 4面子1雀頭に分解
function isWinningHand(hand[14]) {
  for (全牌種 head) {
    if (head が2枚以上) {
      head を2枚取り除く (雀頭)
      残り12枚が面子に分解できれば
        → アガリ!
    }
  }
}

// 3. 面子分解: 再帰+バックトラック
function removeMentsu(counts, index) {
  if (全て0) return true;
  // 刻子を試す → ダメなら戻す
  // 順子を試す → ダメなら戻す
}`}</pre>
                <p className="text-gray-300 mt-3 text-xs font-sans">
                  <R b="上" r="うえ" />のコードが<R b="問題" r="もんだい" />の<R b="元" r="もと" />になっています。<R b="全探索" r="ぜんたんさく" />→<R b="条件分岐" r="じょうけんぶんき" />→<R b="再帰" r="さいき" />の<R b="流" r="なが" />れを<R b="理解" r="りかい" />すると<R b="解" r="と" />きやすくなります。
                </p>
              </div>
            </details>
          </div>
        )}

        {/* 結果 */}
        {state !== "answering" && (
          <div className="px-6 py-5 border-t border-gray-200">
            {state === "correct" ? (
              <p className="text-2xl font-bold text-green-700 mb-3"><R b="正解" r="せいかい" />!</p>
            ) : (
              <p className="text-2xl font-bold text-red-700 mb-3">
                {answers.every((a) => a.trim() === "")
                  ? <><R b="答" r="こた" />えを<R b="表示" r="ひょうじ" />します</>
                  : <><R b="不正解" r="ふせいかい" />...</>
                }
              </p>
            )}

            {/* 正解の説明 */}
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 space-y-2">
              <p className="font-bold text-gray-900 text-base"><R b="正解" r="せいかい" />のコード:</p>
              {quiz.correctAnswers.map((answer, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500"><R b="空欄" r="くうらん" />{i + 1}:</span>
                  <code className="bg-green-100 text-green-900 px-3 py-1 rounded-lg font-bold text-base">
                    {answer}
                  </code>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ボタンエリア */}
        <div className="px-6 py-5 flex flex-wrap gap-3 justify-center border-t border-gray-200">
          {state === "answering" ? (
            <button
              onClick={checkAnswer}
              className="px-8 py-3 bg-indigo-700 text-white rounded-2xl font-bold text-lg
                         hover:bg-indigo-800 active:scale-95 transition-all shadow-lg
                         focus-visible:ring-4 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <R b="回答" r="かいとう" />する
            </button>
          ) : (
            <>
              <button
                onClick={() => newQuiz()}
                className="px-8 py-3 bg-indigo-700 text-white rounded-2xl font-bold text-lg
                           hover:bg-indigo-800 active:scale-95 transition-all shadow-lg
                           focus-visible:ring-4 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <R b="次" r="つぎ" />のアルゴリズム<R b="問題" r="もんだい" />
              </button>
              <button
                onClick={onBack}
                className="px-8 py-3 bg-gray-200 text-gray-800 rounded-2xl font-bold text-lg
                           hover:bg-gray-300 active:scale-95 transition-all
                           border-2 border-gray-300
                           focus-visible:ring-4 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <R b="待" r="ま" />ち<R b="牌" r="はい" />クイズに<R b="戻" r="もど" />る
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
