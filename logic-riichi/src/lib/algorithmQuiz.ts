// アルゴリズム実装クイズの問題定義
//
// 再認法と再生法（心理学の記憶想起の2大測定法）に基づく難易度設計:
// Easy:     選択肢 + ガイドあり（再認法 - 選択肢から正解を見つける）
// Standard: 虫食い入力 + ガイドあり（再認法 - ガイドを手がかりに記憶を再認して入力）
// Hard:     自由記述 + ガイドなし（再生法 - ヒントなしで自ら記憶を再生して記述）

import { Difficulty } from "./mahjong";

export interface AlgoQuizEasy {
  type: "choice";
  title: string;
  description: string;
  codeLines: string[];
  blankIndices: number[];
  choices: string[][];
  correctAnswers: string[];
  guide: string;
}

export interface AlgoQuizMedium {
  type: "fillblank";
  title: string;
  description: string;
  codeLines: string[];
  blankIndices: number[];
  correctAnswers: string[];
  guide: string;
}

export interface AlgoQuizHard {
  type: "freeform";
  title: string;
  description: string;
  codeLines: string[];
  blankIndices: number[];
  correctAnswers: string[];
  acceptablePatterns: string[][];
}

export type AlgoQuiz = AlgoQuizEasy | AlgoQuizMedium | AlgoQuizHard;

// ============================================================
// Easy: 選択肢 + ガイドあり（再認法）
// 基礎概念を選択肢から「見つける」ことで定着させる
// ============================================================
const easyQuizzes: AlgoQuizEasy[] = [
  {
    type: "choice",
    title: "牌の枚数を数える（カウント）",
    description: "手牌の中に、ある牌が何枚あるか数えるプログラムです。正しいコードを選んでください。",
    codeLines: [
      "let count = 0;",
      "for (let i = 0; i < hand.length; i++) {",
      "  if (hand[i] === ___) {",
      "    count = count + ___;",
      "  }",
      "}",
    ],
    blankIndices: [2, 3],
    choices: [
      ["target", "count", "hand", "i"],
      ["1", "2", "i", "target"],
    ],
    correctAnswers: ["target", "1"],
    guide: "1つ目: 「探している牌」を表す変数名を選びます。hand[i] と「何」を比べる？\n2つ目: 1枚見つかるたびに、カウンターを「いくつ」増やす？",
  },
  {
    type: "choice",
    title: "全ての牌を1つずつ調べる（全探索）",
    description: "34種類ある牌を最初から最後まで1つずつ調べるループです。正しいコードを選んでください。",
    codeLines: [
      "const allTiles = [1,2,3,...,34];",
      "for (let i = ___; i < allTiles.length; i++) {",
      "  const tile = allTiles[___];",
      "  checkTile(tile);",
      "}",
    ],
    blankIndices: [1, 2],
    choices: [
      ["0", "1", "-1", "34"],
      ["i", "0", "tile", "length"],
    ],
    correctAnswers: ["0", "i"],
    guide: "1つ目: プログラムの配列は何番目からスタート？ 0番目です。\n2つ目: ループのたびに変わる変数 i を使って、配列から牌を取り出します。",
  },
  {
    type: "choice",
    title: "アガリの条件を判定する（条件分岐）",
    description: "面子の数と雀頭の有無でアガリを判定します。正しいコードを選んでください。",
    codeLines: [
      "function isAgari(mentsuCount, hasJantou) {",
      "  if (mentsuCount === ___ && hasJantou === ___) {",
      "    return true;  // アガリ！",
      "  }",
      "  return false;   // まだアガリではない",
      "}",
    ],
    blankIndices: [1, 1],
    choices: [
      ["4", "3", "5", "14"],
      ["true", "false", "1", "null"],
    ],
    correctAnswers: ["4", "true"],
    guide: "1つ目: アガリ = 面子×□個 + 雀頭1組 = 14枚。面子は3枚なので 3×□+2=14。\n2つ目: 雀頭が「ある」ことをプログラムで表す値は？ true/false のどちら？",
  },
  {
    type: "choice",
    title: "配列の末尾に牌を追加する",
    description: "手牌（配列）に新しい牌を1枚追加するプログラムです。正しい命令を選んでください。",
    codeLines: [
      "const hand = [1, 2, 3, 4, 5];",
      "const newTile = 6;",
      "hand.___(newTile);",
      "// hand は [1, 2, 3, 4, 5, 6] になる",
    ],
    blankIndices: [2],
    choices: [
      ["push", "pop", "shift", "slice"],
    ],
    correctAnswers: ["push"],
    guide: "push=末尾に追加、pop=末尾を取り出す、shift=先頭を取り出す、slice=一部を切り出す。「追加」はどれ？",
  },
  {
    type: "choice",
    title: "配列の末尾から牌を取り除く",
    description: "手牌に追加した牌を元に戻す（取り除く）プログラムです。正しい命令を選んでください。",
    codeLines: [
      "hand.push(tile);       // 牌を追加",
      "if (isAgari(hand)) {",
      "  result.push(tile);   // アガリなら記録",
      "}",
      "hand.___();            // 追加した牌を戻す",
    ],
    blankIndices: [4],
    choices: [
      ["pop", "push", "shift", "reverse"],
    ],
    correctAnswers: ["pop"],
    guide: "push で末尾に追加した牌を、元に戻すには末尾から取り除きます。push の逆は？",
  },
  {
    type: "choice",
    title: "ループを途中でスキップする",
    description: "条件に合わない牌をスキップして次の牌へ進むコードです。正しいキーワードを選んでください。",
    codeLines: [
      "for (const tile of allTiles) {",
      "  if (alreadyUsed(tile)) {",
      "    ___;  // この牌はスキップ",
      "  }",
      "  check(tile);",
      "}",
    ],
    blankIndices: [2],
    choices: [
      ["continue", "break", "return", "pass"],
    ],
    correctAnswers: ["continue"],
    guide: "continue=今の回をスキップして次へ、break=ループ自体を終了。スキップはどっち？",
  },
];

// ============================================================
// Standard: 虫食い入力 + ガイドあり（再認法）
// 待ち牌計算の核心をガイドの手がかりで「再認」しながら入力
// ============================================================
const mediumQuizzes: AlgoQuizMedium[] = [
  {
    type: "fillblank",
    title: "待ち牌を全探索で見つける",
    description: "13枚の手牌に1枚加えてアガリ判定する全探索のコードです。空欄を埋めてください。",
    codeLines: [
      "for (const tile of allTiles) {",
      "  if (countInHand(tile) >= ___) continue;",
      "  hand.push(tile);",
      "  if (___) {",
      "    waits.push(tile);",
      "  }",
      "  hand.pop();",
      "}",
    ],
    blankIndices: [1, 3],
    correctAnswers: ["4", "isAgari(hand)"],
    guide: "1つ目: 麻雀の牌は各種類につき何枚まで？ 4枚です。既に4枚あったらスキップ。\n2つ目: 牌を1枚追加した後、アガリかどうかを確認する関数は？",
  },
  {
    type: "fillblank",
    title: "刻子（同じ牌3枚）の判定",
    description: "ある牌が3枚あるか（刻子かどうか）を判定するコードです。空欄を埋めてください。",
    codeLines: [
      "function isKotsu(hand, tile) {",
      "  let count = 0;",
      "  for (const t of hand) {",
      "    if (t === tile) count___;",
      "  }",
      "  return count >= ___;",
      "}",
    ],
    blankIndices: [3, 5],
    correctAnswers: ["++", "3"],
    guide: "1つ目: 牌が見つかるたびに1つ増やす演算子。count = count + 1 を短く書くと？\n2つ目: 刻子（コーツ）は同じ牌が何枚で成立する？",
  },
  {
    type: "fillblank",
    title: "順子（連続3枚）の判定",
    description: "連続する3つの番号の牌（順子）があるか判定するコードです。空欄を埋めてください。",
    codeLines: [
      "function hasShuntsu(counts, n) {",
      "  // counts[n] = n番の牌の枚数",
      "  if (counts[n] > 0",
      "    && counts[n + ___] > 0",
      "    && counts[n + ___] > 0) {",
      "    return true;",
      "  }",
      "  return false;",
      "}",
    ],
    blankIndices: [3, 4],
    correctAnswers: ["1", "2"],
    guide: "順子は連続する3つの番号。n, n+1, n+2 です。?に入る数を考えましょう。",
  },
  {
    type: "fillblank",
    title: "牌の枚数を配列で管理する",
    description: "手牌を「各番号が何枚あるか」の配列に変換するコードです。空欄を埋めてください。",
    codeLines: [
      "function tilesToCounts(hand) {",
      "  const counts = new Array(10).fill(___);",
      "  for (const tile of hand) {",
      "    counts[tile]___;",
      "  }",
      "  return counts;",
      "}",
    ],
    blankIndices: [1, 3],
    correctAnswers: ["0", "++"],
    guide: "1つ目: 最初は全ての枚数が何枚？ まだ数えていないので…\n2つ目: 牌が出てくるたびに、その番号の枚数を1つ増やします。",
  },
  {
    type: "fillblank",
    title: "アガリ判定の全体構造",
    description: "雀頭を1つ選んで、残りが面子に分解できるか調べるコードです。空欄を埋めてください。",
    codeLines: [
      "function isWinning(counts) {",
      "  for (let n = 1; n <= 9; n++) {",
      "    if (counts[n] >= ___) {   // 雀頭候補",
      "      counts[n] -= 2;",
      "      if (canSplitMentsu(counts)) return ___;",
      "      counts[n] += 2;        // 元に戻す",
      "    }",
      "  }",
      "  return false;",
      "}",
    ],
    blankIndices: [2, 4],
    correctAnswers: ["2", "true"],
    guide: "1つ目: 雀頭（ペア）は同じ牌が何枚？\n2つ目: 面子に分解できたらアガリ成立。成立を表す値は？",
  },
];

// ============================================================
// Hard: 自由記述 + ガイドなし（再生法）
// ヒントなしで自ら記憶を再生し、正しいコードを記述する
// ============================================================
const hardQuizzes: AlgoQuizHard[] = [
  {
    type: "freeform",
    title: "バックトラック: 面子を再帰的に取り除く",
    description: "刻子を取り除いて残りを再帰的にチェックするコードです。空欄を自分で考えて入力してください。",
    codeLines: [
      "function removeMentsu(counts, index) {",
      "  if (index > 9) return true; // 全て取り除けた",
      "  if (counts[index] === 0)",
      "    return removeMentsu(counts, index + ___);",
      "  if (counts[index] >= 3) {",
      "    counts[index] -= ___;",
      "    if (removeMentsu(counts, index))",
      "      return true;",
      "    counts[index] += 3; // 元に戻す",
      "  }",
      "  return false;",
      "}",
    ],
    blankIndices: [3, 5],
    correctAnswers: ["1", "3"],
    acceptablePatterns: [["1"], ["3"]],
  },
  {
    type: "freeform",
    title: "七対子（7ペア）の判定",
    description: "7つのペア（七対子）でアガリか判定するコードです。空欄を自分で考えて入力してください。",
    codeLines: [
      "function isChitoitsu(counts) {",
      "  let pairs = 0;",
      "  for (let n = 1; n <= 9; n++) {",
      "    if (counts[n] === ___) pairs++;",
      "    else if (counts[n] !== 0) return false;",
      "  }",
      "  return pairs === ___;",
      "}",
    ],
    blankIndices: [3, 6],
    correctAnswers: ["2", "7"],
    acceptablePatterns: [["2"], ["7"]],
  },
  {
    type: "freeform",
    title: "雀頭を探して面子分解を試す",
    description: "全ての牌種から雀頭（ペア）を探し、残りが面子に分解できるか調べるコードです。空欄を自分で考えてください。",
    codeLines: [
      "function findJantou(counts) {",
      "  for (let n = 1; n <= 9; n++) {",
      "    if (counts[n] >= ___) {",
      "      counts[n] -= 2;",
      "      if (removeMentsu(counts, ___)) {",
      "        counts[n] += 2;",
      "        return true;",
      "      }",
      "      counts[n] += 2; // 元に戻す",
      "    }",
      "  }",
      "  return false;",
      "}",
    ],
    blankIndices: [2, 4],
    correctAnswers: ["2", "1"],
    acceptablePatterns: [["2"], ["1"]],
  },
  {
    type: "freeform",
    title: "待ち牌の全探索を完成させる",
    description: "手牌13枚から待ち牌を全て見つけるコードです。空欄を自分で考えてください。",
    codeLines: [
      "function findWaits(hand) {",
      "  const waits = [];",
      "  for (const tile of allTiles) {",
      "    if (count(hand, tile) >= ___) continue;",
      "    hand.push(tile);",
      "    if (isWinning(hand)) waits.___(tile);",
      "    hand.pop();",
      "  }",
      "  return waits;",
      "}",
    ],
    blankIndices: [3, 5],
    correctAnswers: ["4", "push"],
    acceptablePatterns: [["4"], ["push"]],
  },
];

export function getAlgoQuiz(difficulty: Difficulty): AlgoQuiz {
  switch (difficulty) {
    case "easy": {
      const idx = Math.floor(Math.random() * easyQuizzes.length);
      return easyQuizzes[idx];
    }
    case "medium": {
      const idx = Math.floor(Math.random() * mediumQuizzes.length);
      return mediumQuizzes[idx];
    }
    case "hard": {
      const idx = Math.floor(Math.random() * hardQuizzes.length);
      return hardQuizzes[idx];
    }
  }
}
