// 麻雀牌の型定義と待ち牌計算アルゴリズム

export type Suit = "m" | "p" | "s" | "z"; // 萬子, 筒子, 索子, 字牌
export type TileId = string; // e.g. "1m", "5p", "7s", "1z"

export interface Tile {
  suit: Suit;
  number: number; // 1-9 (字牌は 1-7: 東南西北白發中)
}

export const SUIT_NAMES: Record<Suit, string> = {
  m: "萬子",
  p: "筒子",
  s: "索子",
  z: "字牌",
};

export const JIHAI_NAMES: Record<number, string> = {
  1: "東",
  2: "南",
  3: "西",
  4: "北",
  5: "白",
  6: "發",
  7: "中",
};

export function tileToId(tile: Tile): TileId {
  return `${tile.number}${tile.suit}`;
}

export function idToTile(id: TileId): Tile {
  const number = parseInt(id[0]);
  const suit = id[1] as Suit;
  return { suit, number };
}

export function tileName(tile: Tile): string {
  if (tile.suit === "z") {
    return JIHAI_NAMES[tile.number] || `${tile.number}z`;
  }
  const suitKanji = { m: "萬", p: "筒", s: "索" }[tile.suit];
  const numKanji = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];
  return `${numKanji[tile.number - 1]}${suitKanji}`;
}

// 全ての牌種 (34種)
export function allTileTypes(): Tile[] {
  const tiles: Tile[] = [];
  for (const suit of ["m", "p", "s"] as Suit[]) {
    for (let n = 1; n <= 9; n++) {
      tiles.push({ suit, number: n });
    }
  }
  for (let n = 1; n <= 7; n++) {
    tiles.push({ suit: "z", number: n });
  }
  return tiles;
}

// 牌の配列を数量マップに変換 (suit -> number[] で各牌の枚数)
export type TileCount = Record<Suit, number[]>;

export function createEmptyCount(): TileCount {
  return {
    m: new Array(10).fill(0),
    p: new Array(10).fill(0),
    s: new Array(10).fill(0),
    z: new Array(10).fill(0),
  };
}

export function tilesToCount(tiles: Tile[]): TileCount {
  const count = createEmptyCount();
  for (const t of tiles) {
    count[t.suit][t.number]++;
  }
  return count;
}

export function countToTiles(count: TileCount): Tile[] {
  const tiles: Tile[] = [];
  for (const suit of ["m", "p", "s", "z"] as Suit[]) {
    const max = suit === "z" ? 7 : 9;
    for (let n = 1; n <= max; n++) {
      for (let i = 0; i < count[suit][n]; i++) {
        tiles.push({ suit, number: n });
      }
    }
  }
  return tiles;
}

function totalCount(count: TileCount): number {
  let total = 0;
  for (const suit of ["m", "p", "s", "z"] as Suit[]) {
    for (let n = 1; n <= 9; n++) {
      total += count[suit][n];
    }
  }
  return total;
}

function cloneCount(count: TileCount): TileCount {
  return {
    m: [...count.m],
    p: [...count.p],
    s: [...count.s],
    z: [...count.z],
  };
}

// 面子(メンツ)を取り除けるか再帰的にチェック
function removeMentsu(counts: number[], isJihai: boolean): boolean {
  // 最小の牌を探す
  let minIdx = -1;
  for (let i = 1; i <= (isJihai ? 7 : 9); i++) {
    if (counts[i] > 0) {
      minIdx = i;
      break;
    }
  }
  if (minIdx === -1) return true; // 全て取り除けた

  // 刻子(同じ牌3枚)で取り除く
  if (counts[minIdx] >= 3) {
    const next = [...counts];
    next[minIdx] -= 3;
    if (removeMentsu(next, isJihai)) return true;
  }

  // 順子(連続3枚)で取り除く - 字牌は順子なし
  if (!isJihai && minIdx <= 7 && counts[minIdx + 1] > 0 && counts[minIdx + 2] > 0) {
    const next = [...counts];
    next[minIdx]--;
    next[minIdx + 1]--;
    next[minIdx + 2]--;
    if (removeMentsu(next, isJihai)) return true;
  }

  return false;
}

// 通常形のアガリ判定 (4面子1雀頭)
function isRegularWin(count: TileCount): boolean {
  // 雀頭を1つ選ぶ
  for (const suit of ["m", "p", "s", "z"] as Suit[]) {
    const max = suit === "z" ? 7 : 9;
    for (let n = 1; n <= max; n++) {
      if (count[suit][n] >= 2) {
        const c = cloneCount(count);
        c[suit][n] -= 2;
        // 残り全てが面子で構成できるか
        const isJihai = (s: Suit) => s === "z";
        let ok = true;
        for (const s of ["m", "p", "s", "z"] as Suit[]) {
          if (!removeMentsu(c[s], isJihai(s))) {
            ok = false;
            break;
          }
        }
        if (ok) return true;
      }
    }
  }
  return false;
}

// 七対子判定
function isSevenPairs(count: TileCount): boolean {
  let pairs = 0;
  for (const suit of ["m", "p", "s", "z"] as Suit[]) {
    const max = suit === "z" ? 7 : 9;
    for (let n = 1; n <= max; n++) {
      if (count[suit][n] === 2) pairs++;
      else if (count[suit][n] !== 0) return false;
    }
  }
  return pairs === 7;
}

// 国士無双判定
function isThirteenOrphans(count: TileCount): boolean {
  const terminals = [
    { s: "m" as Suit, n: 1 }, { s: "m" as Suit, n: 9 },
    { s: "p" as Suit, n: 1 }, { s: "p" as Suit, n: 9 },
    { s: "s" as Suit, n: 1 }, { s: "s" as Suit, n: 9 },
    { s: "z" as Suit, n: 1 }, { s: "z" as Suit, n: 2 },
    { s: "z" as Suit, n: 3 }, { s: "z" as Suit, n: 4 },
    { s: "z" as Suit, n: 5 }, { s: "z" as Suit, n: 6 },
    { s: "z" as Suit, n: 7 },
  ];
  let hasPair = false;
  for (const { s, n } of terminals) {
    if (count[s][n] === 0) return false;
    if (count[s][n] === 2) hasPair = true;
  }
  return hasPair && totalCount(count) === 14;
}

// アガリ判定
export function isWinningHand(count: TileCount): boolean {
  return isRegularWin(count) || isSevenPairs(count) || isThirteenOrphans(count);
}

// 待ち牌の計算 (13枚のテンパイ手牌から)
export function calculateWaits(hand: Tile[]): Tile[] {
  if (hand.length !== 13) return [];

  const count = tilesToCount(hand);
  const waits: Tile[] = [];

  for (const suit of ["m", "p", "s", "z"] as Suit[]) {
    const max = suit === "z" ? 7 : 9;
    for (let n = 1; n <= max; n++) {
      if (count[suit][n] >= 4) continue; // 既に4枚使用済み
      const c = cloneCount(count);
      c[suit][n]++;
      if (isWinningHand(c)) {
        waits.push({ suit, number: n });
      }
    }
  }
  return waits;
}

// クイズ用: ランダムなテンパイ手牌を生成
export function generateTenpaiHand(): { hand: Tile[]; waits: Tile[] } {
  // ランダムに14枚のアガリ形を作り、1枚抜いてテンパイにする
  for (let attempt = 0; attempt < 1000; attempt++) {
    const hand = generateRandomWinningHand();
    if (!hand) continue;

    // ランダムに1枚抜く
    const removeIdx = Math.floor(Math.random() * 14);
    const removed = hand.splice(removeIdx, 1);
    const waits = calculateWaits(hand);

    if (waits.length > 0 && waits.length <= 6) {
      return { hand, waits };
    }
  }

  // フォールバック: 固定のテンパイ手牌
  const fallbackHand: Tile[] = [
    { suit: "m", number: 1 }, { suit: "m", number: 2 }, { suit: "m", number: 3 },
    { suit: "p", number: 4 }, { suit: "p", number: 5 }, { suit: "p", number: 6 },
    { suit: "s", number: 7 }, { suit: "s", number: 8 }, { suit: "s", number: 9 },
    { suit: "z", number: 1 }, { suit: "z", number: 1 }, { suit: "z", number: 1 },
    { suit: "m", number: 5 },
  ];
  return { hand: fallbackHand, waits: calculateWaits(fallbackHand) };
}

function generateRandomWinningHand(): Tile[] | null {
  const count = createEmptyCount();

  // 雀頭を選ぶ
  const allTypes = allTileTypes();
  const head = allTypes[Math.floor(Math.random() * allTypes.length)];
  count[head.suit][head.number] += 2;

  // 4つの面子を作る
  for (let i = 0; i < 4; i++) {
    const mentsuType = Math.random();

    if (mentsuType < 0.4) {
      // 順子
      const suit = (["m", "p", "s"] as Suit[])[Math.floor(Math.random() * 3)];
      const start = Math.floor(Math.random() * 7) + 1;
      if (
        count[suit][start] < 4 &&
        count[suit][start + 1] < 4 &&
        count[suit][start + 2] < 4
      ) {
        count[suit][start]++;
        count[suit][start + 1]++;
        count[suit][start + 2]++;
      } else {
        return null;
      }
    } else {
      // 刻子
      const tile = allTypes[Math.floor(Math.random() * allTypes.length)];
      if (count[tile.suit][tile.number] <= 1) {
        count[tile.suit][tile.number] += 3;
      } else {
        return null;
      }
    }
  }

  // 各牌が4枚以下かチェック
  for (const suit of ["m", "p", "s", "z"] as Suit[]) {
    const max = suit === "z" ? 7 : 9;
    for (let n = 1; n <= max; n++) {
      if (count[suit][n] > 4) return null;
    }
  }

  if (totalCount(count) !== 14) return null;
  if (!isWinningHand(count)) return null;

  return countToTiles(count);
}

// 待ち牌ごとにアガリ形の解説を生成
export function explainWait(hand: Tile[], waitTile: Tile): string {
  const count = tilesToCount(hand);
  count[waitTile.suit][waitTile.number]++;

  const suitNames: Record<Suit, string> = { m: "萬子", p: "筒子", s: "索子", z: "字牌" };

  // 通常形: 雀頭を探して面子分解を試みる
  for (const suit of ["m", "p", "s", "z"] as Suit[]) {
    const max = suit === "z" ? 7 : 9;
    for (let n = 1; n <= max; n++) {
      if (count[suit][n] >= 2) {
        const c = cloneCount(count);
        c[suit][n] -= 2;
        const isJihai = (s: Suit) => s === "z";
        let ok = true;
        for (const s of ["m", "p", "s", "z"] as Suit[]) {
          if (!removeMentsu(c[s], isJihai(s))) {
            ok = false;
            break;
          }
        }
        if (ok) {
          const headName = suit === "z"
            ? JIHAI_NAMES[n]
            : `${n}${suitNames[suit]}`;
          const mentsuList = describeMentsu(c, count, suit, n);
          return `雀頭: ${headName}×2　面子: ${mentsuList}`;
        }
      }
    }
  }

  // 七対子
  if (isSevenPairs(count)) {
    const pairs: string[] = [];
    for (const suit of ["m", "p", "s", "z"] as Suit[]) {
      const max = suit === "z" ? 7 : 9;
      for (let n = 1; n <= max; n++) {
        if (count[suit][n] === 2) {
          const name = suit === "z" ? JIHAI_NAMES[n] : `${n}${suitNames[suit]}`;
          pairs.push(`${name}×2`);
        }
      }
    }
    return `七対子: ${pairs.join(", ")}`;
  }

  return "アガリ形を構成します";
}

function describeMentsu(
  remaining: TileCount,
  original: TileCount,
  headSuit: Suit,
  headNum: number,
): string {
  // original から雀頭を引いた14枚→残り12枚の面子を特定
  const count = cloneCount(original);
  count[headSuit][headNum] -= 2;

  const suitNames: Record<Suit, string> = { m: "萬", p: "筒", s: "索", z: "" };
  const parts: string[] = [];

  for (const suit of ["m", "p", "s", "z"] as Suit[]) {
    const max = suit === "z" ? 7 : 9;
    const arr = [...count[suit]];

    // 刻子を抽出
    for (let n = 1; n <= max; n++) {
      if (arr[n] >= 3) {
        arr[n] -= 3;
        const name = suit === "z"
          ? `${JIHAI_NAMES[n]}×3`
          : `${n}${suitNames[suit]}×3`;
        parts.push(name);
      }
    }
    // 順子を抽出
    if (suit !== "z") {
      for (let n = 1; n <= max - 2; n++) {
        while (arr[n] > 0 && arr[n + 1] > 0 && arr[n + 2] > 0) {
          arr[n]--;
          arr[n + 1]--;
          arr[n + 2]--;
          parts.push(`${n}-${n + 1}-${n + 2}${suitNames[suit]}`);
        }
      }
    }
  }

  return parts.join(", ");
}

// 難易度レベル
export type Difficulty = "easy" | "medium" | "hard";

export function generateQuiz(difficulty: Difficulty): { hand: Tile[]; waits: Tile[] } {
  for (let i = 0; i < 100; i++) {
    const { hand, waits } = generateTenpaiHand();
    const suits = new Set(hand.map((t) => t.suit));

    switch (difficulty) {
      case "easy":
        // 1種類の数牌のみ、待ちが少ない
        if (suits.size === 1 && !suits.has("z") && waits.length <= 2) {
          return { hand, waits };
        }
        break;
      case "medium":
        // 2種類以下
        if (suits.size <= 2 && waits.length <= 4) {
          return { hand, waits };
        }
        break;
      case "hard":
        // 制限なし
        if (waits.length >= 2) {
          return { hand, waits };
        }
        break;
    }
  }
  return generateTenpaiHand();
}

// 手牌13枚の構造を分析し、各牌にグループラベルを割り当てる
// "mentsu1"~"mentsu4" = 完成した面子, "jantou" = 雀頭候補, "incomplete" = 未完成部分(待ちに関係)
export type TileGroup = "mentsu1" | "mentsu2" | "mentsu3" | "mentsu4" | "jantou" | "incomplete";

export function analyzeHandStructure(hand: Tile[]): (TileGroup | null)[] {
  if (hand.length !== 13) return hand.map(() => null);

  const labels: (TileGroup | null)[] = hand.map(() => null);

  // 最善のグループ分けを探す: 各待ち牌を加えてアガリ形を分解し、
  // 1枚抜いた部分を "incomplete" にする
  const waits = calculateWaits(hand);
  if (waits.length === 0) return labels;

  // 最初の待ち牌でアガリ形を構築
  const waitTile = waits[0];
  const fullHand = [...hand, waitTile];
  const count = tilesToCount(fullHand);

  // 雀頭と面子を特定する
  for (const suit of ["m", "p", "s", "z"] as Suit[]) {
    const max = suit === "z" ? 7 : 9;
    for (let n = 1; n <= max; n++) {
      if (count[suit][n] >= 2) {
        const c = cloneCount(count);
        c[suit][n] -= 2;
        const isJ = (s: Suit) => s === "z";
        let ok = true;
        for (const s of ["m", "p", "s", "z"] as Suit[]) {
          if (!removeMentsu(c[s], isJ(s))) { ok = false; break; }
        }
        if (ok) {
          // この雀頭+面子分解で各牌にラベルを付ける
          return assignLabels(hand, waitTile, { suit, number: n }, count);
        }
      }
    }
  }

  return labels;
}

function assignLabels(
  hand: Tile[],
  waitTile: Tile,
  jantouTile: { suit: Suit; number: number },
  _fullCount: TileCount,
): (TileGroup | null)[] {
  const labels: (TileGroup | null)[] = hand.map(() => null);
  const used = hand.map(() => false);

  // 雀頭をマーク
  let jantouCount = 0;
  for (let i = 0; i < hand.length && jantouCount < 2; i++) {
    if (!used[i] && hand[i].suit === jantouTile.suit && hand[i].number === jantouTile.number) {
      labels[i] = "jantou";
      used[i] = true;
      jantouCount++;
    }
  }

  // 残りの牌で面子を構成
  // まずソート済みインデックスリストを作る
  const remaining = hand
    .map((t, i) => ({ tile: t, idx: i }))
    .filter((_, i) => !used[i]);

  // suit+numberでソート
  remaining.sort((a, b) => {
    if (a.tile.suit !== b.tile.suit) return a.tile.suit.localeCompare(b.tile.suit);
    return a.tile.number - b.tile.number;
  });

  let mentsuNum = 0;
  const mentsuLabels: TileGroup[] = ["mentsu1", "mentsu2", "mentsu3", "mentsu4"];

  // 刻子を探す
  let i = 0;
  while (i < remaining.length && mentsuNum < 4) {
    if (i + 2 < remaining.length &&
        remaining[i].tile.suit === remaining[i + 1].tile.suit &&
        remaining[i].tile.suit === remaining[i + 2].tile.suit &&
        remaining[i].tile.number === remaining[i + 1].tile.number &&
        remaining[i].tile.number === remaining[i + 2].tile.number) {
      const label = mentsuLabels[mentsuNum];
      labels[remaining[i].idx] = label;
      labels[remaining[i + 1].idx] = label;
      labels[remaining[i + 2].idx] = label;
      remaining.splice(i, 3);
      mentsuNum++;
    } else {
      i++;
    }
  }

  // 順子を探す
  let changed = true;
  while (changed && mentsuNum < 4) {
    changed = false;
    for (let a = 0; a < remaining.length && mentsuNum < 4; a++) {
      const t1 = remaining[a].tile;
      if (t1.suit === "z") continue;
      // t1.number+1 と t1.number+2 を探す
      const bIdx = remaining.findIndex((r, ri) => ri > a && r.tile.suit === t1.suit && r.tile.number === t1.number + 1);
      if (bIdx === -1) continue;
      const cIdx = remaining.findIndex((r, ri) => ri > bIdx && r.tile.suit === t1.suit && r.tile.number === t1.number + 2);
      if (cIdx === -1) continue;

      const label = mentsuLabels[mentsuNum];
      labels[remaining[a].idx] = label;
      labels[remaining[bIdx].idx] = label;
      labels[remaining[cIdx].idx] = label;
      // 大きいインデックスから削除
      remaining.splice(cIdx, 1);
      remaining.splice(bIdx, 1);
      remaining.splice(a, 1);
      mentsuNum++;
      changed = true;
      break;
    }
  }

  // 残った牌(未完成部分)を "incomplete" にする
  for (const r of remaining) {
    labels[r.idx] = "incomplete";
  }

  return labels;
}
