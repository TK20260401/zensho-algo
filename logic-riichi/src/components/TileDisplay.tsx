"use client";

import { Tile, tileName, Suit } from "@/lib/mahjong";
import Image from "next/image";

// 牌のファイル名マッピング
const TILE_FILES: Record<Suit, (n: number) => string> = {
  m: (n) => `Man${n}`,
  p: (n) => `Pin${n}`,
  s: (n) => `Sou${n}`,
  z: (n) => ["Ton", "Nan", "Shaa", "Pei", "Haku", "Hatsu", "Chun"][n - 1],
};

// 詳細なalt用テキスト
const TILE_ALT: Record<Suit, (n: number) => string> = {
  m: (n) => `萬子（マンズ）の${n}。漢数字と萬の文字が描かれた赤い牌`,
  p: (n) => `筒子（ピンズ）の${n}。丸い模様が${n}個描かれた青い牌`,
  s: (n) => `索子（ソーズ）の${n}。竹の模様が${n}本描かれた緑の牌`,
  z: (n) => {
    const names = [
      "東（トン）。東の風を表す字牌",
      "南（ナン）。南の風を表す字牌",
      "西（シャー）。西の風を表す字牌",
      "北（ペー）。北の風を表す字牌",
      "白（ハク）。何も描かれていない白い三元牌",
      "發（ハツ）。緑色の文字が描かれた三元牌",
      "中（チュン）。赤い文字が描かれた三元牌",
    ];
    return names[n - 1];
  },
};

// ハイライト色の定義
export type TileHighlight = "mentsu1" | "mentsu2" | "mentsu3" | "mentsu4" | "jantou" | "incomplete" | null;

const HIGHLIGHT_STYLES: Record<string, string> = {
  mentsu1:    "border-blue-500 ring-2 ring-blue-400 shadow-blue-200/50 shadow-lg",
  mentsu2:    "border-emerald-500 ring-2 ring-emerald-400 shadow-emerald-200/50 shadow-lg",
  mentsu3:    "border-purple-500 ring-2 ring-purple-400 shadow-purple-200/50 shadow-lg",
  mentsu4:    "border-orange-500 ring-2 ring-orange-400 shadow-orange-200/50 shadow-lg",
  jantou:     "border-pink-500 ring-2 ring-pink-400 shadow-pink-200/50 shadow-lg",
  incomplete: "border-yellow-500 ring-2 ring-yellow-400 shadow-yellow-200/50 shadow-lg animate-pulse",
};

interface TileDisplayProps {
  tile: Tile;
  onClick?: () => void;
  selected?: boolean;
  small?: boolean;
  disabled?: boolean;
  highlight?: TileHighlight;
}

export function TileDisplay({ tile, onClick, selected, small, disabled, highlight }: TileDisplayProps) {
  const fileName = TILE_FILES[tile.suit](tile.number);
  const altText = TILE_ALT[tile.suit](tile.number);
  // レスポンシブ: モバイルは小さめ、タブレット以上で大きく
  const w = small ? 36 : 44;
  const h = small ? 50 : 62;
  const sizeClass = small
    ? "w-[36px] h-[50px] sm:w-[44px] sm:h-[60px]"
    : "w-[44px] h-[62px] sm:w-[56px] sm:h-[78px]";

  const highlightClass = highlight ? HIGHLIGHT_STYLES[highlight] : "";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`${tileName(tile)}${selected ? "（選択中）" : ""}${disabled ? "（選択不可）" : ""}`}
      aria-pressed={selected}
      role="checkbox"
      aria-checked={selected}
      className={`
        ${sizeClass}
        inline-flex items-center justify-center
        rounded-lg
        border-2 sm:border-3 ${highlight ? "" : "border-stone-500"}
        bg-gradient-to-b from-amber-50 to-amber-100
        shadow-md
        focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500 focus-visible:ring-offset-2
        ${selected ? "ring-4 ring-yellow-400 shadow-yellow-300/50 shadow-lg border-yellow-500" : ""}
        ${highlightClass}
        ${onClick && !disabled ? "cursor-pointer hover:scale-105 hover:-translate-y-1 hover:shadow-lg active:scale-95" : "cursor-default"}
        ${disabled ? "opacity-40" : ""}
        transition-all duration-150
        select-none
        p-1
      `}
    >
      <Image
        src={`/tiles/${fileName}.svg`}
        alt={altText}
        width={w}
        height={h}
        className="pointer-events-none rounded w-full h-full"
        draggable={false}
      />
    </button>
  );
}

interface HandDisplayProps {
  tiles: Tile[];
  onTileClick?: (tile: Tile, index: number) => void;
  selectedIndices?: Set<number>;
  small?: boolean;
  highlights?: (TileHighlight)[];
}

export function HandDisplay({ tiles, onTileClick, selectedIndices, small, highlights }: HandDisplayProps) {
  return (
    <div className="flex flex-wrap gap-1.5 justify-center" role="group" aria-label="手牌（てはい）の一覧">
      {tiles.map((tile, i) => (
        <TileDisplay
          key={i}
          tile={tile}
          small={small}
          selected={selectedIndices?.has(i)}
          highlight={highlights?.[i] ?? null}
          onClick={onTileClick ? () => onTileClick(tile, i) : undefined}
        />
      ))}
    </div>
  );
}
