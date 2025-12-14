# デプロイ・切替手順書

このドキュメントでは、新サイト（`renewal`）の並行公開から本番切替、そしてロールバックまでの手順を説明します。

## 目次

1. [現在の状態](#現在の状態)
2. [並行公開（検収用）](#並行公開検収用)
3. [本番切替](#本番切替)
4. [ロールバック手順](#ロールバック手順)
5. [注意事項](#注意事項)

---

## 現在の状態

### ディレクトリ構成

```
syukan3.github.io/
├── renewal/          # 新サイト（検収中）
│   ├── index.html
│   ├── work/
│   ├── projects/
│   ├── writing/
│   ├── about/
│   ├── photo/
│   ├── contact/
│   ├── css/
│   ├── js/
│   ├── data/
│   └── images/
├── index.html        # 現行サイト（本番稼働中）
├── blogs.html
├── contact.html
├── projects.html
├── css/
├── js/
└── images/
```

### アクセスURL

- **現行サイト（本番）**: `https://syukan3.github.io/`
- **新サイト（検収用）**: `https://syukan3.github.io/renewal/`

---

## 並行公開（検収用）

新サイトは既に `/renewal/` 配下で公開されています。

### 検収チェックリスト

#### 1. 動作確認

- [ ] すべてのページが正常に表示される
  - [ ] Home (`/renewal/`)
  - [ ] Work (`/renewal/work/`)
  - [ ] Projects (`/renewal/projects/`)
  - [ ] Writing (`/renewal/writing/`)
  - [ ] About (`/renewal/about/`)
  - [ ] Photo (`/renewal/photo/`)
  - [ ] Contact (`/renewal/contact/`)

- [ ] JSONデータが正しく読み込まれる
  - [ ] Featured Works が表示される
  - [ ] Featured Projects が表示される
  - [ ] Pinned Writing が表示される
  - [ ] About の情報が表示される

- [ ] ナビゲーションが正しく動作する
  - [ ] デスクトップメニュー
  - [ ] モバイルメニュー（ハンバーガーメニュー）
  - [ ] ページ遷移

#### 2. レスポンシブ確認

- [ ] デスクトップ（1920px, 1440px, 1280px）
- [ ] タブレット（768px, 1024px）
- [ ] モバイル（375px, 414px, 390px）

#### 3. ブラウザ互換性

- [ ] Chrome（最新版）
- [ ] Safari（最新版）
- [ ] Firefox（最新版）
- [ ] Edge（最新版）

#### 4. パフォーマンス

- [ ] 画像の読み込み速度
- [ ] ページ遷移の速度
- [ ] データ読み込みの速度

#### 5. アクセシビリティ

- [ ] キーボードナビゲーション
- [ ] フォーカス表示
- [ ] コントラスト（黒背景での可読性）

---

## 本番切替

検収が完了したら、以下の手順で本番切替を行います。

### 準備

#### 1. バックアップブランチの作成

```bash
# 現在の main ブランチをバックアップ
git checkout main
git branch backup-legacy-$(date +%Y%m%d)
git push origin backup-legacy-$(date +%Y%m%d)
```

#### 2. 作業ブランチの作成

```bash
# 切替用ブランチを作成
git checkout -b deployment-renewal
```

### 切替作業

#### ステップ1: 現行サイトを legacy に移動

```bash
# 既存ファイルを legacy フォルダに移動
mkdir -p legacy

# 現行サイトのファイルを移動（renewal フォルダは除外）
mv index.html legacy/
mv index_en.html legacy/
mv blogs.html legacy/
mv contact.html legacy/
mv projects.html legacy/
mv projects_en.html legacy/
mv mobile-block.html legacy/
mv -n css legacy/
mv -n js legacy/
mv -n images legacy/

# 不要なファイルは legacy に移動
mv robots.txt legacy/
mv sitemap.xml legacy/
```

#### ステップ2: 新サイトをルートに移動

```bash
# renewal の内容をルートに移動
mv renewal/* ./
mv renewal/.* ./ 2>/dev/null || true

# 空の renewal ディレクトリを削除
rmdir renewal
```

#### ステップ3: パスの修正

新サイトのすべてのHTMLファイルで、`/renewal/` を `/` に置換します。

```bash
# macOS の場合
find . -name "*.html" -type f -exec sed -i '' 's|/renewal/|/|g' {} +

# Linux の場合
find . -name "*.html" -type f -exec sed -i 's|/renewal/|/|g' {} +
```

#### ステップ4: 動作確認

ローカルで確認する場合：

```bash
# Python で簡易サーバーを起動
python3 -m http.server 8000

# ブラウザで http://localhost:8000 を開く
```

確認項目：
- [ ] すべてのページが開ける
- [ ] 内部リンクが正しく動作する
- [ ] CSS/JSが正しく読み込まれる
- [ ] 画像が表示される
- [ ] JSONデータが読み込まれる

#### ステップ5: コミット＆プッシュ

```bash
git add .
git commit -m "Deploy renewal site to production

- Move legacy site to /legacy/
- Move renewal site to root
- Update all paths from /renewal/ to /
"

git push origin deployment-renewal
```

#### ステップ6: プルリクエスト作成＆マージ

1. GitHub でプルリクエストを作成
2. 最終確認
3. `main` ブランチにマージ

#### ステップ7: GitHub Pages の再デプロイ確認

- GitHub Actions が自動でデプロイを開始します
- 数分待ってから `https://syukan3.github.io/` にアクセスし、新サイトが表示されることを確認

---

## ロールバック手順

問題が発生した場合、以下の手順でロールバックします。

### 方法1: バックアップブランチに戻す（推奨）

```bash
# バックアップブランチを確認
git branch -a | grep backup-legacy

# バックアップブランチにチェックアウト
git checkout backup-legacy-YYYYMMDD

# main に強制プッシュ（注意！）
git push origin HEAD:main --force
```

### 方法2: legacy フォルダから復元

```bash
# 作業ブランチを作成
git checkout -b rollback-to-legacy

# 現在のファイルを一時退避
mkdir -p temp-renewal
mv * temp-renewal/ 2>/dev/null || true

# legacy から復元
mv legacy/* ./
mv legacy/.* ./ 2>/dev/null || true
rmdir legacy

# renewal フォルダに新サイトを戻す
mkdir -p renewal
mv temp-renewal/* renewal/
rmdir temp-renewal

# パスを /renewal/ に戻す
find renewal -name "*.html" -type f -exec sed -i '' 's|="/|="/renewal/|g' {} +

# コミット＆プッシュ
git add .
git commit -m "Rollback to legacy site"
git push origin rollback-to-legacy
```

その後、GitHub でプルリクエストを作成し、main にマージします。

---

## 注意事項

### 1. GitHub Pages の設定

- **Branch**: `main`
- **Folder**: `/` (root)

これらの設定が正しいことを確認してください。

### 2. カスタムドメイン

カスタムドメインを使用している場合：
- ルートに `CNAME` ファイルがあることを確認
- 切替後も CNAME ファイルが残っていることを確認

### 3. robots.txt と sitemap.xml

新サイト用の `robots.txt` と `sitemap.xml` を作成する必要があります。

```bash
# robots.txt を作成
cat > robots.txt << 'EOF'
User-agent: *
Allow: /

Sitemap: https://syukan3.github.io/sitemap.xml
EOF

# sitemap.xml を作成（必要に応じてURLを追加）
cat > sitemap.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://syukan3.github.io/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://syukan3.github.io/work/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://syukan3.github.io/projects/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://syukan3.github.io/writing/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://syukan3.github.io/about/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://syukan3.github.io/contact/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>
EOF
```

### 4. OGP 画像

OGP 画像を `/images/og-image.jpg` に配置してください。
推奨サイズ: 1200x630px

### 5. favicon

favicon を `/favicon.svg` に配置してください。

---

## チェックリスト（切替前の最終確認）

- [ ] バックアップブランチを作成した
- [ ] ローカルで動作確認を完了した
- [ ] robots.txt を作成した
- [ ] sitemap.xml を作成した
- [ ] OGP 画像を配置した
- [ ] favicon を配置した
- [ ] すべてのパスが `/renewal/` から `/` に変更されている
- [ ] JSONデータが正しい場所にある
- [ ] CSS/JS/画像のパスが正しい
- [ ] ロールバック手順を理解した

---

## トラブルシューティング

### 問題: GitHub Pages がデプロイされない

- Actions タブで GitHub Pages のビルドログを確認
- Settings > Pages でブランチとフォルダが正しいか確認

### 問題: CSSが適用されない

- ブラウザのキャッシュをクリア
- DevTools の Network タブで CSS が正しく読み込まれているか確認
- パスが `/renewal/` のままになっていないか確認

### 問題: 画像が表示されない

- 画像のパスが正しいか確認
- 画像ファイルが正しい場所にあるか確認
- ファイル名の大文字小文字が一致しているか確認

### 問題: JSONデータが読み込めない

- ブラウザの Console でエラーを確認
- JSONファイルのパスが正しいか確認
- JSONファイルの構文エラーがないか確認

---

以上で切替手順は完了です。問題が発生した場合は、ロールバック手順に従って元に戻してください。
