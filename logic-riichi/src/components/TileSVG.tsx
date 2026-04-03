"use client";

import { Tile } from "@/lib/mahjong";

// 萬子の漢数字
const MAN_KANJI = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];

// 字牌の漢字と色
const JIHAI_INFO: Record<number, { label: string; color: string }> = {
  1: { label: "東", color: "#1a1a1a" },
  2: { label: "南", color: "#1a1a1a" },
  3: { label: "西", color: "#1a1a1a" },
  4: { label: "北", color: "#1a1a1a" },
  5: { label: "白", color: "#888888" },
  6: { label: "發", color: "#16a34a" },
  7: { label: "中", color: "#dc2626" },
};

// 筒子(ピンズ): 丸を配置
function PinzuPattern({ n, cx, cy, scale }: { n: number; cx: number; cy: number; scale: number }) {
  const r = 4 * scale;
  const gap = 10 * scale;
  const positions = getCirclePositions(n, cx, cy, gap);

  return (
    <>
      {positions.map((pos, i) => (
        <g key={i}>
          <circle cx={pos.x} cy={pos.y} r={r} fill="#1d4ed8" stroke="#1e3a8a" strokeWidth={0.8} />
          <circle cx={pos.x} cy={pos.y} r={r * 0.5} fill="#dbeafe" />
        </g>
      ))}
    </>
  );
}

function getCirclePositions(n: number, cx: number, cy: number, gap: number) {
  const positions: { x: number; y: number }[] = [];
  switch (n) {
    case 1:
      positions.push({ x: cx, y: cy });
      break;
    case 2:
      positions.push({ x: cx, y: cy - gap * 0.5 }, { x: cx, y: cy + gap * 0.5 });
      break;
    case 3:
      positions.push({ x: cx - gap * 0.4, y: cy - gap * 0.5 }, { x: cx + gap * 0.4, y: cy }, { x: cx - gap * 0.4, y: cy + gap * 0.5 });
      break;
    case 4:
      positions.push({ x: cx - gap * 0.4, y: cy - gap * 0.4 }, { x: cx + gap * 0.4, y: cy - gap * 0.4 }, { x: cx - gap * 0.4, y: cy + gap * 0.4 }, { x: cx + gap * 0.4, y: cy + gap * 0.4 });
      break;
    case 5:
      positions.push({ x: cx, y: cy }, { x: cx - gap * 0.5, y: cy - gap * 0.5 }, { x: cx + gap * 0.5, y: cy - gap * 0.5 }, { x: cx - gap * 0.5, y: cy + gap * 0.5 }, { x: cx + gap * 0.5, y: cy + gap * 0.5 });
      break;
    case 6:
      for (let row = 0; row < 3; row++) {
        positions.push({ x: cx - gap * 0.35, y: cy + (row - 1) * gap * 0.55 });
        positions.push({ x: cx + gap * 0.35, y: cy + (row - 1) * gap * 0.55 });
      }
      break;
    case 7:
      positions.push({ x: cx, y: cy - gap * 0.7 });
      for (let row = 0; row < 3; row++) {
        positions.push({ x: cx - gap * 0.35, y: cy + (row - 0.5) * gap * 0.5 });
        positions.push({ x: cx + gap * 0.35, y: cy + (row - 0.5) * gap * 0.5 });
      }
      break;
    case 8:
      for (let row = 0; row < 4; row++) {
        positions.push({ x: cx - gap * 0.3, y: cy + (row - 1.5) * gap * 0.42 });
        positions.push({ x: cx + gap * 0.3, y: cy + (row - 1.5) * gap * 0.42 });
      }
      break;
    case 9:
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          positions.push({ x: cx + (col - 1) * gap * 0.4, y: cy + (row - 1) * gap * 0.45 });
        }
      }
      break;
  }
  return positions;
}

// 索子(ソーズ): 竹棒を配置
function SouzuPattern({ n, cx, cy, scale }: { n: number; cx: number; cy: number; scale: number }) {
  if (n === 1) {
    // 一索は鳥のような丸
    return (
      <g>
        <circle cx={cx} cy={cy} r={8 * scale} fill="#16a34a" />
        <circle cx={cx} cy={cy} r={5 * scale} fill="#bbf7d0" />
        <circle cx={cx} cy={cy} r={2.5 * scale} fill="#16a34a" />
      </g>
    );
  }

  const gap = 7 * scale;
  const barW = 3.5 * scale;
  const barH = 14 * scale;
  const positions = getBambooPositions(n, cx, cy, gap);

  return (
    <>
      {positions.map((pos, i) => (
        <g key={i}>
          <rect
            x={pos.x - barW / 2}
            y={pos.y - barH / 2}
            width={barW}
            height={barH}
            rx={barW / 2}
            fill={i % 2 === 0 ? "#16a34a" : "#15803d"}
            stroke="#14532d"
            strokeWidth={0.5}
          />
          <line x1={pos.x - barW / 2 + 0.5} y1={pos.y} x2={pos.x + barW / 2 - 0.5} y2={pos.y} stroke="#14532d" strokeWidth={0.5} />
        </g>
      ))}
    </>
  );
}

function getBambooPositions(n: number, cx: number, cy: number, gap: number) {
  const positions: { x: number; y: number }[] = [];
  switch (n) {
    case 2:
      positions.push({ x: cx - gap * 0.5, y: cy }, { x: cx + gap * 0.5, y: cy });
      break;
    case 3:
      positions.push({ x: cx - gap * 0.6, y: cy + gap * 0.3 }, { x: cx, y: cy - gap * 0.3 }, { x: cx + gap * 0.6, y: cy + gap * 0.3 });
      break;
    case 4:
      positions.push({ x: cx - gap * 0.5, y: cy - gap * 0.5 }, { x: cx + gap * 0.5, y: cy - gap * 0.5 }, { x: cx - gap * 0.5, y: cy + gap * 0.5 }, { x: cx + gap * 0.5, y: cy + gap * 0.5 });
      break;
    case 5:
      positions.push({ x: cx, y: cy }, { x: cx - gap * 0.6, y: cy - gap * 0.55 }, { x: cx + gap * 0.6, y: cy - gap * 0.55 }, { x: cx - gap * 0.6, y: cy + gap * 0.55 }, { x: cx + gap * 0.6, y: cy + gap * 0.55 });
      break;
    case 6:
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 3; col++) {
          positions.push({ x: cx + (col - 1) * gap * 0.6, y: cy + (row === 0 ? -1 : 1) * gap * 0.45 });
        }
      }
      break;
    case 7:
      positions.push({ x: cx, y: cy - gap * 0.8 });
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 3; col++) {
          positions.push({ x: cx + (col - 1) * gap * 0.55, y: cy + (row === 0 ? 0 : 1) * gap * 0.6 });
        }
      }
      break;
    case 8:
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 4; col++) {
          positions.push({ x: cx + (col - 1.5) * gap * 0.48, y: cy + (row === 0 ? -1 : 1) * gap * 0.45 });
        }
      }
      break;
    case 9:
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          positions.push({ x: cx + (col - 1) * gap * 0.55, y: cy + (row - 1) * gap * 0.55 });
        }
      }
      break;
  }
  return positions;
}

// 萬子(マンズ): 漢数字 + 萬
function ManzuContent({ n, cx, cy, scale }: { n: number; cx: number; cy: number; scale: number }) {
  return (
    <g>
      <text
        x={cx}
        y={cy - 3 * scale}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#dc2626"
        fontSize={16 * scale}
        fontWeight="bold"
        fontFamily="serif"
      >
        {MAN_KANJI[n - 1]}
      </text>
      <text
        x={cx}
        y={cy + 12 * scale}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#dc2626"
        fontSize={10 * scale}
        fontWeight="bold"
        fontFamily="serif"
      >
        萬
      </text>
    </g>
  );
}

// 字牌
function JihaiContent({ n, cx, cy, scale }: { n: number; cx: number; cy: number; scale: number }) {
  const info = JIHAI_INFO[n];
  if (n === 5) {
    // 白: 枠だけ
    return (
      <rect
        x={cx - 10 * scale}
        y={cy - 10 * scale}
        width={20 * scale}
        height={20 * scale}
        rx={2}
        fill="none"
        stroke="#aaa"
        strokeWidth={1.5}
      />
    );
  }
  return (
    <text
      x={cx}
      y={cy + 1 * scale}
      textAnchor="middle"
      dominantBaseline="central"
      fill={info.color}
      fontSize={22 * scale}
      fontWeight="bold"
      fontFamily="serif"
    >
      {info.label}
    </text>
  );
}

interface TileSVGProps {
  tile: Tile;
  size?: "normal" | "small";
}

export function TileSVG({ tile, size = "normal" }: TileSVGProps) {
  const w = size === "small" ? 32 : 44;
  const h = size === "small" ? 46 : 62;
  const scale = size === "small" ? 0.7 : 1;
  const cx = w / 2;
  const cy = h / 2 + 2;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg">
      {/* 牌の背景 */}
      <rect
        x={1}
        y={1}
        width={w - 2}
        height={h - 2}
        rx={4}
        ry={4}
        fill="url(#tileGradient)"
        stroke="#b8a88a"
        strokeWidth={1.5}
      />
      {/* 牌の光沢 */}
      <rect
        x={2}
        y={2}
        width={w - 4}
        height={(h - 4) * 0.4}
        rx={3}
        fill="rgba(255,255,255,0.15)"
      />
      <defs>
        <linearGradient id="tileGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fefce8" />
          <stop offset="100%" stopColor="#f5f0dc" />
        </linearGradient>
      </defs>

      {/* 牌面 */}
      {tile.suit === "p" && <PinzuPattern n={tile.number} cx={cx} cy={cy} scale={scale} />}
      {tile.suit === "s" && <SouzuPattern n={tile.number} cx={cx} cy={cy} scale={scale} />}
      {tile.suit === "m" && <ManzuContent n={tile.number} cx={cx} cy={cy} scale={scale} />}
      {tile.suit === "z" && <JihaiContent n={tile.number} cx={cx} cy={cy} scale={scale} />}
    </svg>
  );
}
