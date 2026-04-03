# IPAS-Master

ITパスポート試験対策Webアプリ — ストラテジ・マネジメント・テクノロジ完全攻略プラットフォーム

## Changelog

| Version | Date | Changes |
| --- | --- | --- |
| V6 | 2026-04-03 | UD（ユニバーサルデザイン）対応、モバイル・タブレットレスポンシブ強化、QRコード追加、アクセシビリティ改善（スキップリンク・ARIA・フォーカス・高コントラスト・reduced-motion） |
| V5 | 2026-04-03 | 問題バンクを **500問** に拡充（100問×5バッチ）、100問単位の出題モード追加（第1回〜第5回）、14分野別フィルタモード追加、シャッフル機能追加、プログレスバー・完了画面を実装 |
| V4 | 2026-04-02 | 計算問題ドリル（30問）実装、カテゴリ別フィルタ（基数変換・論理演算・損益分岐点・稼働率・ネットワーク・アーンドバリュー・その他）、正答率・連続正解数のスコア表示 |
| V3 | 2026-04-02 | 用語フラッシュ（45用語）実装、ストラテジ系・マネジメント系・テクノロジ系の3分野+サブカテゴリ対応、たとえ話（メタファー）付き解説 |
| V2 | 2026-04-01 | 損益分岐点シミュレーター実装、2進数⇔10進数⇔16進数変換ツール実装 |
| V1 | 2026-04-01 | Next.js + Tailwind CSS でプロジェクト初期構築、GameContainer によるタブ切り替えUI |

## Tech Stack

| Category | Technology | Version | Purpose |
| --- | --- | --- | --- |
| Framework | Next.js (App Router) | 16.2.2 | SSG/SSR対応のReactフレームワーク |
| UI Library | React | 19.2.4 | コンポーネントベースのUI構築 |
| Styling | Tailwind CSS | 4.x | ユーティリティファーストCSS |
| Chart | Recharts | 3.8.1 | 損益分岐点グラフなどの可視化 |
| QR Code | qrcode.react | 4.x | SVGベースQRコード生成 |
| Language | TypeScript | 5.x | 型安全な開発 |
| Linter | ESLint | 9.x | コード品質の維持 |
| Build | Turbopack | (built-in) | 高速ビルド・HMR |
| Deploy | Vercel | — | ホスティング・CI/CD |

## UD・アクセシビリティ対応

| Feature | Detail |
| --- | --- |
| フォント | BIZ UDPGothic優先（ユニバーサルデザイン書体） |
| タッチ操作 | 最小タッチターゲット44px以上（coarseポインタ時48px） |
| キーボード操作 | スキップリンク、フォーカスインジケータ（青枠3px） |
| 色覚多様性 | 色+アイコン併用（✓/✗、▲/▼）で色だけに依存しないUI |
| 高コントラスト | `forced-colors` メディアクエリ対応 |
| モーション配慮 | `prefers-reduced-motion` でアニメーション無効化 |
| レスポンシブ | モバイル / タブレット / PC 3段階ブレイクポイント |
| ノッチ端末 | `viewport-fit: cover` + `safe-area-inset` 対応 |
| QRコード | フッターにSVGベースQRコードを配置（モバイルアクセス用） |

## Getting Started

```bash
npm install
npm run dev
```

`http://localhost:3000` で起動します。

## Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)
