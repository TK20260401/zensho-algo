import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 戻るリンク */}
        <Link
          href="/"
          className="inline-block text-white text-sm mb-6 hover:text-white transition-colors"
        >
          ← クイズに戻る
        </Link>

        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          なぜ「待ち牌当て」で<br />アルゴリズム的思考が身につくのか？
        </h1>

        {/* 導入 */}
        <div className="bg-white/10 backdrop-blur rounded-xl p-6 mb-6 text-white leading-relaxed">
          <p>
            麻雀の待ち牌を見つける作業は、一見するとただのゲームの知識に思えます。
            しかし実は、その裏にはプログラミングやアルゴリズムの重要な概念がそのまま詰まっています。
          </p>
        </div>

        {/* 4つの観点 */}
        <div className="space-y-4 mb-8">
          <div className="bg-white/15 backdrop-blur rounded-xl p-5">
            <h2 className="text-lg font-bold text-amber-300 mb-2">1. 全探索（ループ処理）</h2>
            <p className="text-white text-sm leading-relaxed">
              待ち牌を見つけるには「34種の牌を1枚ずつ手牌に加えて、アガリになるか判定する」必要があります。
              これはプログラミングの<span className="font-semibold text-white">for文による全探索</span>そのものです。
              「全てのパターンを漏れなく調べる」という発想が自然と身につきます。
            </p>
            <div className="mt-3 bg-black/30 rounded-lg p-3 font-mono text-xs text-green-400">
              for (全34種の牌) &#123; 手牌に加えて判定 &#125;
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur rounded-xl p-5">
            <h2 className="text-lg font-bold text-amber-300 mb-2">2. 条件分岐（if文）</h2>
            <p className="text-white text-sm leading-relaxed">
              アガリの判定は「4面子1雀頭に分解できるか？」「七対子か？」「国士無双か？」と
              複数の条件を場合分けします。これは<span className="font-semibold text-white">if-else文による条件分岐</span>の実践です。
              複雑な条件を整理して正しく判定する力が養われます。
            </p>
            <div className="mt-3 bg-black/30 rounded-lg p-3 font-mono text-xs text-green-400">
              if (通常形) ... else if (七対子) ... else if (国士) ...
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur rounded-xl p-5">
            <h2 className="text-lg font-bold text-amber-300 mb-2">3. 再帰とバックトラック</h2>
            <p className="text-white text-sm leading-relaxed">
              面子の分解は「刻子を取り除いてみる → ダメなら戻して順子を試す」という試行錯誤です。
              これは<span className="font-semibold text-white">再帰・バックトラッキング</span>のアルゴリズムと同じ構造です。
              迷路の探索やパズルの解法と同じ思考パターンを、牌を並べながら体験できます。
            </p>
            <div className="mt-3 bg-black/30 rounded-lg p-3 font-mono text-xs text-green-400">
              刻子を試す → 失敗 → 元に戻す → 順子を試す → ...
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur rounded-xl p-5">
            <h2 className="text-lg font-bold text-amber-300 mb-2">4. データ構造の理解</h2>
            <p className="text-white text-sm leading-relaxed">
              手牌を「種類ごとの配列」で管理し、枚数を数える。
              これは<span className="font-semibold text-white">多次元配列・ハッシュマップ</span>の基礎です。
              「情報をどう整理すれば効率的に処理できるか」を考える力が自然と鍛えられます。
            </p>
            <div className="mt-3 bg-black/30 rounded-lg p-3 font-mono text-xs text-green-400">
              萬子: [0,2,1,0,0,3,0,0,1,0] ← 各牌の枚数
            </div>
          </div>
        </div>

        {/* 学習との接続 */}
        <div className="bg-white/10 backdrop-blur rounded-xl p-6 mb-8 text-white leading-relaxed">
          <h2 className="text-lg font-bold text-white mb-3">情報I・資格試験との接続</h2>
          <p className="text-sm mb-3">
            これらの概念は、以下の学習内容に直結しています:
          </p>
          <ul className="text-sm space-y-2">
            <li className="flex gap-2">
              <span className="text-amber-300 font-bold shrink-0">情報I:</span>
              <span>「アルゴリズムとプログラミング」の単元で扱う、ループ・条件分岐・配列の基礎</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-300 font-bold shrink-0">応用情報(AP):</span>
              <span>午後問題のアルゴリズム分野で出題される、探索・再帰・データ構造の考え方</span>
            </li>
          </ul>
          <p className="text-sm mt-3 text-white">
            ゲーム感覚で繰り返し問題を解くことで、これらの思考パターンを自然に身につけることができます。
          </p>
        </div>

        {/* クイズへのリンク */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-white text-indigo-600 rounded-xl font-bold text-lg
                       hover:bg-white/90 active:scale-95 transition-all shadow-lg"
          >
            クイズを始める
          </Link>
        </div>
      </div>
    </div>
  );
}
