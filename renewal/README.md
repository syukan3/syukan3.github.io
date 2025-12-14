# Portfolio Site - Renewal

トイカメラ Noir をテーマにした個人ポートフォリオサイトのリニューアル版です。

## 🎯 コンセプト

**Toy Camera × Darkroom × Noir**

黒基調の上質なデザインに、トイカメラの要素を控えめに取り入れた、採用・案件獲得・技術発信を目的としたポートフォリオサイトです。

## 🛠️ 技術スタック

- **Pure HTML/CSS/JavaScript** - ビルドツール不使用の完全静的サイト
- **CSS Variables** - デザイントークンによる一貫したスタイル管理
- **JSON-based Content Management** - 手動更新しやすいコンテンツ管理
- **GitHub Pages** - ホスティング

## 📁 ディレクトリ構成

```
renewal/
├── index.html              # Homeページ
├── work/                   # Workページ（ケーススタディ）
├── projects/               # Projectsページ
├── writing/                # Writing & Talksページ
├── about/                  # Aboutページ
├── photo/                  # Photoページ
├── contact/                # Contactページ
├── css/                    # スタイルシート
│   ├── reset.css
│   ├── variables.css
│   ├── base.css
│   └── components.css
├── js/                     # JavaScript
│   ├── main.js
│   └── components.js
├── data/                   # コンテンツデータ（JSON）
│   ├── works.json
│   ├── projects.json
│   ├── writing.json
│   └── profile.json
├── images/                 # 画像ファイル
└── favicon.svg             # ファビコン
```

## 🚀 ローカル開発

### 1. リポジトリをクローン

```bash
git clone https://github.com/syukan3/syukan3.github.io.git
cd syukan3.github.io/renewal
```

### 2. ローカルサーバーを起動

```bash
# Python 3
python3 -m http.server 8000

# または Node.js
npx http-server -p 8000
```

### 3. ブラウザで開く

```
http://localhost:8000
```

## 📝 コンテンツの更新方法

コンテンツは `data/` ディレクトリ内のJSONファイルを編集することで更新できます。

詳しくは [CONTENT_MANAGEMENT_GUIDE.md](../CONTENT_MANAGEMENT_GUIDE.md) を参照してください。

### クイックガイド

#### Work（ケーススタディ）を追加

`data/works.json` を編集：

```json
{
  "works": [
    {
      "id": "work-new",
      "title": "プロジェクト名",
      "slug": "project-slug",
      "featured": true,
      "summary": "1行での概要",
      "thumbnail": "/renewal/images/work-thumb.jpg",
      "background": "課題背景",
      "constraints": ["制約1", "制約2"],
      "approach": "アプローチ",
      "implementation": "実装詳細",
      "results": ["成果1", "成果2"],
      "learnings": "学び",
      "tags": ["React", "TypeScript"],
      "year": "2024"
    }
  ]
}
```

#### 記事・登壇を追加

`data/writing.json` を編集：

```json
{
  "writing": [
    {
      "id": "article-new",
      "title": "記事タイトル",
      "pinned": true,
      "date": "2024-12-14",
      "summary": "読むべき理由",
      "url": "https://example.com/article",
      "type": "article"
    }
  ]
}
```

## 🎨 デザインシステム

### カラーパレット

```css
/* Base Colors */
--color-noir-black: #0a0a0a;
--color-charcoal: #1a1a1a;
--color-smoke: #2a2a2a;
--color-white: #f5f5f5;

/* Accent Colors (Light Leak) */
--color-amber-leak: rgba(255, 191, 105, 0.15);
--color-cyan-leak: rgba(105, 191, 255, 0.12);
```

### タイポグラフィ

- **Font Family**: システムフォント（-apple-system, BlinkMacSystemFont, 等）
- **Font Sizes**: 12px 〜 60px（レスポンシブ対応）
- **Line Heights**: 1.2（タイトル）、1.6（本文）、1.8（リラックス）

### トイカメラ要素

- **Viewfinder Frame**: Hero セクションなど要所のみ
- **Film Grain**: 全体に薄く（opacity: 0.03）
- **Light Leak**: ホバー時の控えめなエフェクト
- **Film Perforation**: セクション区切り

## 📱 レスポンシブ対応

- **Desktop**: 1920px, 1440px, 1280px
- **Tablet**: 1024px, 768px
- **Mobile**: 414px, 390px, 375px

## ♿ アクセシビリティ

- キーボードナビゲーション対応
- フォーカス可視化
- コントラスト比確保（WCAG AA準拠）
- `prefers-reduced-motion` 対応

## 🔍 SEO

- ページごとの title/description
- OGP タグ設定
- Twitter Card 対応
- セマンティックHTML

## 📦 本番デプロイ

デプロイ方法は [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) を参照してください。

### 概要

1. 検収完了後、現行サイトを `/legacy/` に移動
2. `/renewal/` の内容をルートに移動
3. パスを `/renewal/` から `/` に変更
4. `main` ブランチにマージしてデプロイ

## 🐛 トラブルシューティング

### JSONが読み込めない

- ブラウザのコンソールでエラーを確認
- JSON Validator（https://jsonlint.com/）で検証

### CSSが適用されない

- パスが `/renewal/` になっているか確認
- ブラウザのキャッシュをクリア

### 画像が表示されない

- 画像ファイルが正しい場所にあるか確認
- ファイル名の大文字小文字を確認

## 📄 ライセンス

このプロジェクトは個人利用を目的としています。

## 🙏 クレジット

- Design: Toy Camera Noir コンセプト
- Development: Pure HTML/CSS/JavaScript
- Hosting: GitHub Pages

---

**Last Updated**: 2024-12-14
