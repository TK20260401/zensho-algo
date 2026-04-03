"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

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

export default function BreakEvenSimulator() {
  const [fixedCost, setFixedCost] = useState(500);
  const [variableRatio, setVariableRatio] = useState(60);
  const [sales, setSales] = useState(2000);

  const breakEvenPoint = useMemo(() => {
    if (variableRatio >= 100) return Infinity;
    return Math.round(fixedCost / (1 - variableRatio / 100));
  }, [fixedCost, variableRatio]);

  const chartData = useMemo(() => {
    const maxX = Math.max(sales, breakEvenPoint === Infinity ? sales : breakEvenPoint) * 1.5;
    const step = Math.max(Math.round(maxX / 20), 1);
    const data = [];
    for (let x = 0; x <= maxX; x += step) {
      data.push({
        sales: x,
        salesLine: x,
        totalCost: fixedCost + x * (variableRatio / 100),
      });
    }
    return data;
  }, [fixedCost, variableRatio, sales, breakEvenPoint]);

  const profit = sales - (fixedCost + sales * (variableRatio / 100));

  const formatYen = (v: number) => {
    if (v >= 10000) return `${(v / 10000).toFixed(1)}億`;
    return `${v}万`;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-emerald-800 text-center">
        <R b="損益" r="そんえき" />
        <R b="分岐点" r="ぶんきてん" />
        シミュレーター
      </h2>

      {/* Sliders */}
      <div className="space-y-4 sm:space-y-5">
        <div>
          <label
            htmlFor="fixedCost"
            className="flex justify-between items-center mb-2 font-bold text-gray-700 text-sm sm:text-base"
          >
            <span>
              <R b="固定費" r="こていひ" />
            </span>
            <span className="text-emerald-700 font-mono text-base sm:text-lg">
              {fixedCost}
              <R b="万円" r="まんえん" />
            </span>
          </label>
          <input
            id="fixedCost"
            type="range"
            min={100}
            max={3000}
            step={50}
            value={fixedCost}
            onChange={(e) => setFixedCost(Number(e.target.value))}
            aria-label={`固定費: ${fixedCost}万円`}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] sm:text-xs text-gray-400 mt-1">
            <span>100<R b="万" r="まん" /></span>
            <span>3,000<R b="万" r="まん" /></span>
          </div>
        </div>

        <div>
          <label
            htmlFor="variableRatio"
            className="flex justify-between items-center mb-2 font-bold text-gray-700 text-sm sm:text-base"
          >
            <span>
              <R b="変動費" r="へんどうひ" />
              <R b="率" r="りつ" />
            </span>
            <span className="text-emerald-700 font-mono text-base sm:text-lg">
              {variableRatio}%
            </span>
          </label>
          <input
            id="variableRatio"
            type="range"
            min={10}
            max={95}
            step={5}
            value={variableRatio}
            onChange={(e) => setVariableRatio(Number(e.target.value))}
            aria-label={`変動費率: ${variableRatio}%`}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] sm:text-xs text-gray-400 mt-1">
            <span>10%</span>
            <span>95%</span>
          </div>
        </div>

        <div>
          <label
            htmlFor="sales"
            className="flex justify-between items-center mb-2 font-bold text-gray-700 text-sm sm:text-base"
          >
            <span>
              <R b="売上高" r="うりあげだか" />
            </span>
            <span className="text-emerald-700 font-mono text-base sm:text-lg">
              {sales}
              <R b="万円" r="まんえん" />
            </span>
          </label>
          <input
            id="sales"
            type="range"
            min={100}
            max={5000}
            step={100}
            value={sales}
            onChange={(e) => setSales(Number(e.target.value))}
            aria-label={`売上高: ${sales}万円`}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] sm:text-xs text-gray-400 mt-1">
            <span>100<R b="万" r="まん" /></span>
            <span>5,000<R b="万" r="まん" /></span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-emerald-50 rounded-xl p-3 sm:p-4 text-center">
          <div className="text-xs sm:text-sm text-emerald-700 font-bold">
            <R b="損益" r="そんえき" />
            <R b="分岐点" r="ぶんきてん" />
          </div>
          <div className="text-lg sm:text-xl md:text-2xl font-bold text-emerald-800 font-mono mt-1">
            {breakEvenPoint === Infinity
              ? "---"
              : `${formatYen(breakEvenPoint)}`}
          </div>
        </div>
        <div className="bg-teal-50 rounded-xl p-3 sm:p-4 text-center">
          <div className="text-xs sm:text-sm text-teal-700 font-bold">
            <R b="現在" r="げんざい" />
            の
            <R b="売上" r="うりあげ" />
          </div>
          <div className="text-lg sm:text-xl md:text-2xl font-bold text-teal-800 font-mono mt-1">
            {formatYen(sales)}
          </div>
        </div>
        <div
          className={`rounded-xl p-3 sm:p-4 text-center ${
            profit >= 0 ? "bg-blue-50" : "bg-red-50"
          }`}
        >
          <div
            className={`text-xs sm:text-sm font-bold ${
              profit >= 0 ? "text-blue-700" : "text-red-700"
            }`}
          >
            {profit >= 0 ? "&#9650; " : "&#9660; "}
            <R b="利益" r="りえき" /> / <R b="損失" r="そんしつ" />
          </div>
          <div
            className={`text-lg sm:text-xl md:text-2xl font-bold font-mono mt-1 ${
              profit >= 0 ? "text-blue-800" : "text-red-700"
            }`}
          >
            {profit >= 0 ? "+" : ""}
            {formatYen(Math.round(profit))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-50 rounded-xl p-2 sm:p-4">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="sales"
              tickFormatter={(v) => `${v}`}
              tick={{ fontSize: 11 }}
              label={{
                value: "売上高（万円）",
                position: "insideBottomRight",
                offset: -5,
                style: { fontSize: 11 },
              }}
            />
            <YAxis
              tickFormatter={(v) => `${v}`}
              tick={{ fontSize: 11 }}
              width={50}
              label={{
                value: "金額（万円）",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 11 },
              }}
            />
            <Tooltip
              formatter={(value) => [`${Math.round(Number(value))}万円`]}
              labelFormatter={(label) => `売上: ${label}万円`}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="salesLine"
              name="売上線"
              stroke="#0d9488"
              strokeWidth={3}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="totalCost"
              name="総費用線"
              stroke="#e11d48"
              strokeWidth={3}
              strokeDasharray="8 4"
              dot={false}
            />
            {breakEvenPoint !== Infinity && (
              <ReferenceLine
                x={breakEvenPoint}
                stroke="#6366f1"
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{
                  value: `BEP: ${formatYen(breakEvenPoint)}`,
                  position: "top",
                  style: { fontSize: 11, fill: "#6366f1", fontWeight: "bold" },
                }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Explanation */}
      <div className="bg-emerald-50 rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-gray-700 leading-relaxed">
        <p className="font-bold text-emerald-700 mb-1">
          <R b="損益" r="そんえき" />
          <R b="分岐点" r="ぶんきてん" />
          とは？
        </p>
        <p>
          <R b="売上高" r="うりあげだか" />と<R b="総費用" r="そうひよう" />
          が<R b="等" r="ひと" />しくなる<R b="点" r="てん" />のこと。
          この<R b="点" r="てん" />を<R b="超" r="こ" />えると
          <R b="利益" r="りえき" />が<R b="出" r="で" />
          て、<R b="下回" r="したまわ" />ると<R b="損失" r="そんしつ" />
          になります。
        </p>
        <p className="mt-1 font-mono text-[10px] sm:text-xs bg-white rounded p-2">
          <R b="損益" r="そんえき" />
          <R b="分岐点" r="ぶんきてん" /> = <R b="固定費" r="こていひ" /> &divide; (1 - <R b="変動費" r="へんどうひ" />
          <R b="率" r="りつ" />)
        </p>
      </div>
    </div>
  );
}
