# IT-Skills Learning OS (ISLOS)

**「情報I・ITパスポート・基本情報」を最短で攻略する、実践型アルゴリズム学習基盤**

16年間の教育知見をシステム化。<Br> 
単なる暗記ではなく、シミュレーションとゲーミフィケーションを通じて「ITリテラシー」と「計算機科学」の核心を体得するプラットフォーム。

## プロジェクト一覧

| Project | Description | URL | Status |
| --- | --- | --- | --- |
| [IPAS-Master](./ipas-master/) | ITパスポート試験対策アプリ（500問ドリル・シミュレーター・用語フラッシュ・認証・学習履歴） | https://ipas-master.vercel.app | v8 |
| [Logic-Riichi](./logic-riichi/) | 麻雀アルゴリズム学習アプリ（待ち牌クイズ・コード実装問題・認証・統計） | https://logic-riichi.vercel.app | v30 |
| [Zensho-Algo](https://github.com/TK20260401/zensho-algo) | 全商情報処理検定 プログラミング部門 アルゴリズム・トレーナー | — | 構築中 |
| [todo-app](./todo-app/) | シンプルTODO Webアプリ（HTML/CSS/JS） | — | v1 |
| [Blueprint](./20260401-Project-Blueprint%201st/) | プロジェクト設計書・構想ドキュメント | — | — |

## 目的

- **資格・試験の完全攻略**: 情報I（共通テスト）、ITパスポート、基本情報技術者（FE）のシラバスを横断的にカバー
- **自走自律学習（SDL）**: AI伴走により「なぜその答えになるのか」のプロセスを重視
- **教育DXの推進**: 学習ログを解析し、個々の理解度に応じた個別最適な学びを提供
- **ユニバーサルデザイン**: 全漢字ルビ・WCAG AA準拠・タッチ操作最適化で誰もが使える設計

## IPAS-Master — ITパスポート試験対策

| 機能 | 内容 |
| --- | --- |
| 問題ドリル | 500問、30/50/100問単位モード、14分野別フィルタ、シャッフル、スキップ問題一覧・復帰 |
| カウントアップタイマー | 学習時間の可視化 |
| GitHub認証 | NextAuth.js v5、ログイン時に学習履歴をDB保存 |
| 学習履歴ダッシュボード | レーダーチャート（3系統/14分野切替）、ログインユーザーは全体平均と比較可能 |
| 訪問者カウンター | 本日/累計のゲスト数をヘッダーに表示 |
| 用語フラッシュ | 45用語、3分野+サブカテゴリ、たとえ話（メタファー）付き解説 |
| 損益分岐点シミュレーター | スライダーで固定費・変動費率・売上高を操作、リアルタイムグラフ描画 |
| 2進数変換ツール | 8ビットトグル、2進/10進/16進/ASCII/グレースケール同時表示 |
| UD対応 | BIZ UDPGothicフォント、スキップリンク、フォーカスインジケータ、safe-area対応 |
| QRコード | フッターにSVGベースQRコードを配置 |

### 技術スタック

| Technology | Version | Purpose |
| --- | --- | --- |
| Next.js (App Router) | 16.2.2 | フレームワーク |
| React | 19.2.4 | UI構築 |
| Tailwind CSS | 4.x | スタイリング |
| Recharts | 3.8.1 | グラフ・レーダーチャート |
| NextAuth.js | 5.x (beta) | GitHub OAuth認証 |
| Supabase | 2.x | 学習履歴・訪問者DB |
| qrcode.react | 4.x | QRコード生成 |
| TypeScript | 5.x | 型安全 |
| Vercel | — | ホスティング |

## Logic-Riichi — 麻雀アルゴリズム学習

| 機能 | 内容 |
| --- | --- |
| 待ち牌クイズ | 13枚の手牌から待ち牌を当てる（Easy/Standard/Hard、制限時間・ヒント付き） |
| アルゴリズム実装問題 | 待ち牌計算コードの読解（選択式→虫食い→自由記述の段階的難易度） |
| 認証システム | Supabase Auth（メール/パスワード）、ゲストモード対応 |
| 訪問者カウンター | 本日/通算のゲスト数をヘッダーに表示 |
| マイページ | 学習履歴（日別棒グラフ）、理解度レーダーチャート（6軸）、ユーザー間ランキング（上位N%） |
| スコア管理 | Supabase（PostgreSQL + RLS）に全回答結果を永続化、user_id紐付け |
| UD/アクセシビリティ | 全漢字ルビ、牌画像alt属性（WCAG AA+）、レスポンシブ、キーボード操作対応 |

### 技術スタック

| Technology | Version | Purpose |
| --- | --- | --- |
| Next.js (App Router) | 16.2.2 | フレームワーク |
| React | 19.2.4 | UI構築 |
| Tailwind CSS | 4.x | スタイリング |
| Supabase | 2.x | 認証・DB（PostgreSQL + RLS） |
| Recharts | 3.x | レーダーチャート・棒グラフ |
| qrcode.react | 4.x | QRコード生成 |
| TypeScript | 5.x | 型安全 |
| Vercel | — | ホスティング |

## 共通設計方針

### 教育メソッド

| メソッド | 適用 |
| --- | --- |
| ゲーミフィケーション | 正解率・連続正解・最高記録のリアルタイム表示、難易度段階による達成感設計 |
| SDL（自己主導型学習） | 答えではなくヒント・ガイドを提供し、学習者が自ら思考するプロセスを重視 |
| 再認法→再生法 | 選択肢→虫食い→自由記述の段階的な足場外しで自走力を育成 |
| シミュレーション | 数値を操作して結果を視覚的に確認、体験的理解を促進 |

### ユニバーサルデザイン

| Feature | Detail |
| --- | --- |
| フォント | BIZ UDPGothic優先（ユニバーサルデザイン書体） |
| ルビ | 全漢字にふりがな付き（rt inherit方式でコントラスト自動調整） |
| タッチ操作 | 最小タッチターゲット44px以上 |
| キーボード | スキップリンク、フォーカスインジケータ（青枠3px） |
| 色覚多様性 | 色+アイコン併用（✓/✗、▲/▼） |
| モーション配慮 | `prefers-reduced-motion` 対応 |
| レスポンシブ | モバイル/タブレット/PC 3段階ブレイクポイント |

## リポジトリ構成

```
20260401/
├── README.md                          ← このファイル
├── .gitignore
├── 20260401-Project-Blueprint 1st/    ← 設計書・構想ドキュメント
│   ├── IPASMaster.md
│   ├── Logic-Riichi.md
│   ├── FE_LogicRunner.md
│   └── ...
├── ipas-master/                       ← ITパスポート試験対策アプリ（v8）
│   ├── src/app/
│   ├── src/components/
│   ├── src/lib/
│   └── package.json
├── logic-riichi/                      ← 麻雀アルゴリズム学習アプリ（v30）
│   ├── src/app/
│   ├── src/components/
│   ├── src/lib/
│   └── package.json
├── zensho-algo/                       ← 全商検定アルゴリズム・トレーナー（構築中）
│   ├── src/app/
│   ├── src/components/
│   └── package.json
└── todo-app/                          ← シンプルTODOアプリ
    ├── index.html
    ├── styles.css
    └── script.js
```

## 開発履歴

| Date | Project | Version | Milestone |
| --- | --- | --- | --- |
| Date | Project | Version | Milestone |
| --- | --- | --- | --- |
| 2026-04-01 | — | — | 開発環境構築（Node.js, Git, VS Code, Cursor, Claude Code, Vercel CLI, GitHub CLI） |
| 2026-04-01 | — | — | 設計書作成、統合リポジトリ・個別リポジトリの初期化 |
| 2026-04-02 | IPAS-Master | v1-v4 | 初期構築、損益分岐点シミュレーター、2進数変換ツール、用語フラッシュ（45語）、計算問題ドリル（30問） |
| 2026-04-02 | Logic-Riichi | v1-v28 | 初期構築、牌ビジュアル、クイズ機能、UD全面改修、アルゴリズム問題、Supabase連携、レスポンシブ |
| 2026-04-03 | IPAS-Master | v5-v8 | 500問拡充、UD/QRコード、GitHub OAuth認証、Supabase学習履歴、レーダーチャート（3系統/14分野）、訪問者カウンター、30/50/100問モード、タイマー、スキップ復帰機能 |
| 2026-04-03 | Logic-Riichi | v29-v30 | Supabase Auth認証UI、訪問者カウンター、学習履歴、レーダーチャート、ユーザーランキング |
| 2026-04-03 | Zensho-Algo | — | リポジトリ作成、Next.jsプロジェクト初期化 |

## インフラ

| Service | Project | Purpose |
| --- | --- | --- |
| Vercel | ipas-master | IPAS-Masterのホスティング・CI/CD |
| Vercel | logic-riichi | Logic-Riichiのホスティング・CI/CD |
| Supabase | TK20260401's Project | 認証・スコアDB・訪問者DB（PostgreSQL + RLS + Auth） |
| GitHub | TK20260401/20260401-Project-Blueprint | 統合リポジトリ |
| GitHub | TK20260401/ipas-master | IPAS-Master単体リポジトリ |
| GitHub | TK20260401/zensho-algo | Zensho-Algo単体リポジトリ |

## 環境構築（2026-04-01実施）

### 1. 基盤ツールのインストール

```bash
# Homebrew（macOS パッケージマネージャー）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.js（JavaScript実行環境）
brew install node

# Git（バージョン管理）
brew install git
git config --global user.name "YourName"
git config --global user.email "your@email.com"
```

### 2. GitHub CLI・Vercel CLI

```bash
# GitHub CLI — リポジトリ作成・PR操作をターミナルから実行
brew install gh
gh auth login

# Vercel CLI — デプロイ・環境変数管理
npm install -g vercel
vercel login
```

### 3. エディタ・AI開発ツール

| Tool | Purpose | Install |
| --- | --- | --- |
| VS Code | コードエディタ | https://code.visualstudio.com |
| Cursor | AI統合エディタ | https://cursor.com |
| Claude Code | AIペアプログラミングCLI | `npm install -g @anthropic-ai/claude-code` |

### 4. プロジェクト作成テンプレート

```bash
# Next.js + TypeScript + Tailwind CSS でプロジェクトを作成
npx create-next-app@latest project-name --typescript --tailwind --eslint --app --src-dir

# Vercelにリンク
cd project-name && vercel link

# GitHubリポジトリ作成 & 初回プッシュ
gh repo create TK20260401/project-name --public
git remote add origin https://github.com/TK20260401/project-name.git
git push -u origin main
```

### 5. 外部サービス

| Service | Purpose | URL |
| --- | --- | --- |
| GitHub | ソースコード管理 | https://github.com |
| Vercel | ホスティング・CI/CD | https://vercel.com |
| Supabase | PostgreSQL DB・認証 | https://supabase.com |

## Getting Started

```bash
# IPAS-Master（.env.localにNextAuth・Supabase認証情報が必要）
cd ipas-master && npm install && npm run dev

# Logic-Riichi（.env.localにSupabase認証情報が必要）
cd logic-riichi && npm install && npm run dev

# Zensho-Algo
cd zensho-algo && npm install && npm run dev
```

## ライセンス

- 牌画像: CC0 (Public Domain) - FluffyStuff/riichi-mahjong-tiles
