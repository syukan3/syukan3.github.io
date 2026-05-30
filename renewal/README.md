# Portfolio Site — Renewal (Toy Camera Noir)

栄 俊介 / Sakae Shunsuke の個人ポートフォリオ（リニューアル版）。
**Toy Camera × Darkroom × Noir** をテーマにした、ダーク基調・アンバーの光漏れ・フィルム/ファインダー演出の静的サイトです。

## 🛠️ 技術スタック

- **Pure HTML/CSS/JavaScript**（ビルドツール不使用の完全静的サイト）
- **CSS Variables** によるデザイントークン管理
- **JSON ベースのコンテンツ管理**（`data/*.json` を編集するだけ）
- **GitHub Pages** ホスティング

## 📁 ディレクトリ構成

```
renewal/
├── index.html              # Home
├── work/                   # Work（ケーススタディ）
├── projects/               # Projects
├── writing/                # Writing & Talks
├── about/                  # About
├── photo/                  # Photo（Toy Camera Gallery）
├── contact/                # Contact（問い合わせフォーム）
├── 404.html                # 404
├── css/
│   ├── reset.css
│   ├── variables.css       # デザイントークン（色・フォント・余白）
│   ├── base.css            # 背景の光漏れ・タイポ・noir-frame
│   └── components.css      # 各UIコンポーネント
├── js/
│   ├── main.js             # Site（共通ヘッダ/フッタ注入）・DataLoader・ScrollAnimation
│   └── components.js       # カード/ケーススタディ/写真フレームのレンダラ（純関数）
├── data/
│   ├── profile.json        # プロフィール・スキル・略歴・資格・価値観
│   ├── works.json          # ケーススタディ
│   ├── projects.json       # プロジェクト
│   ├── writing.json        # 記事・登壇
│   └── photos.json         # Photo ギャラリー（実写真は後日差し替え）
├── images/                 # 画像（webp）/ og-image.png
└── favicon.svg
```

## 🧱 アーキテクチャ要点

- **共通ヘッダ/フッタは JS で一元注入**：各ページは `<div id="site-header"></div>` / `<div id="site-footer"></div>` のプレースホルダと `<body data-page="...">` だけを持ち、`main.js` の `Site.renderChrome()` がナビ・フッタを生成（active 判定は `data-page`）。ナビ項目の変更は `main.js` の `Site.nav` 一箇所のみ。
- **コンポーネントは純関数**：`components.js` の各 `createXxxCard()` は `this` に依存せず `Array.map` に直接渡せる。
- **スクロール表示**：`[data-reveal]` 要素をフェードイン。ファーストビュー内の要素は即時表示（暗転防止）。`prefers-reduced-motion` 対応。

## 🚀 ローカル開発

```bash
# リポジトリのルートで（/renewal を含むパスで配信する必要があるため）
cd syukan3.github.io
python3 -m http.server 8000
# → http://localhost:8000/renewal/
```

> 注意: 絶対パス `/renewal/...` を使用しているため、`renewal/` ではなく**リポジトリのルート**で配信してください。

## 📝 コンテンツの更新方法

`data/` 内の JSON を編集するだけで反映されます。

### Work（ケーススタディ）— `data/works.json`
```json
{
  "id": "work-new", "title": "プロジェクト名", "slug": "project-slug",
  "featured": true, "summary": "1行概要",
  "thumbnail": "/renewal/images/xxx.webp",
  "background": "背景", "constraints": ["制約1"], "approach": "打ち手",
  "implementation": "実装", "results": ["成果1"], "learnings": "学び",
  "tags": ["Ruby on Rails", "AWS"], "year": "2024"
}
```

### Projects — `data/projects.json`
`thumbnail`・`links.{github,demo,article}`・`tags`・`role`・`featured` を設定。

### 記事・登壇 — `data/writing.json`
`type` は `"article"` か `"talk"`、`pinned: true` で上部固定。

### Photo — `data/photos.json`
実写真を `renewal/images/` に置き、各エントリの `src` を設定して `placeholder` を `false`（または削除）にすると差し替わります。未設定の間はフィルム額のプレースホルダ表示。

## 🎨 デザインシステム

### カラー（`variables.css`）
```css
--color-noir-black:#0a0a0a;        /* 背景 */
--color-cream:#f3ecdc;             /* 見出し */
--color-ember:#e0a45a;             /* アクセント（アンバー） */
--color-ember-bright:#f6cf86;
```

### タイポグラフィ
- **見出し（display）**: `Fraunces`（欧文）+ `Shippori Mincho`（和文・明朝）→ シネマティックな印象
- **本文**: `Inter` + `Noto Sans JP`
- 明朝見出しは字間ほぼ0・ウェイト 600–700 で調整

### Toy Camera 演出
- Viewfinder（四隅ブラケット＋クロスヘア）／Film grain（薄く）／Light leak（アンバーのグロー）／Filmstrip（パーフォレーション区切り）

## ✉️ Contact フォーム

メールアドレスは公開しません。フォーム送信は既存の本番と同じ仕組みを使用：

- **reCAPTCHA Enterprise v3** でトークン取得
- **AWS Lambda Function URL** へ `FormData`（+`recaptcha_response`）を POST

サイトキー・エンドポイントは `contact/index.html` 内に定義（旧ルートサイト `js/script.js` と同一）。

## ♿ / 🔍 アクセシビリティ・SEO

- キーボード操作・フォーカス可視化・`prefers-reduced-motion` 対応
- ページごとの title/description、OGP / Twitter Card（`images/og-image.png`）、セマンティック HTML

## 📦 本番デプロイ（未実施）

現状は `/renewal/` 配下で運用。ルート（本番URL）への昇格は別タスク：
1. 現行ルートサイトを退避
2. `/renewal/` の内容をルートへ移動し、絶対パスを `/renewal/` → `/` に置換
3. `sitemap.xml` / `robots.txt` を新構成に更新（現状の sitemap は旧サイト用・`example.com` のまま）
4. `main` にマージしてデプロイ

---

**Last Updated**: 2026-05-30
