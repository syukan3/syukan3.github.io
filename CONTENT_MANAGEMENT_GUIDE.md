# コンテンツ運用ガイド

このガイドでは、リニューアル後のサイトでコンテンツを更新する方法を説明します。

## 目次

1. [概要](#概要)
2. [JSONファイルの編集方法](#jsonファイルの編集方法)
3. [各コンテンツの更新方法](#各コンテンツの更新方法)
4. [画像の追加・更新](#画像の追加更新)
5. [トラブルシューティング](#トラブルシューティング)

---

## 概要

### コンテンツ管理の仕組み

新サイトでは、すべてのコンテンツ（Work、Projects、Writing、プロフィール情報）を **JSONファイル** で管理しています。

JSONファイルを編集することで、サイトの内容を簡単に更新できます。

### JSONファイルの場所

```
data/
├── works.json      # Workのケーススタディ
├── projects.json   # Projects一覧
├── writing.json    # 記事・登壇一覧
└── profile.json    # プロフィール情報
```

---

## JSONファイルの編集方法

### 基本ルール

1. **文法を守る**: JSON は厳密な文法があります
   - ダブルクォート `"` を使う（シングルクォート `'` は使えない）
   - 最後の項目の後にカンマ `,` を付けない
   - 波括弧 `{}` と角括弧 `[]` を正しく閉じる

2. **バックアップを取る**: 編集前に必ずファイルをコピーしておく

3. **検証する**: 編集後、JSON Validator（オンラインツール）で検証する
   - https://jsonlint.com/

### 編集手順

1. JSONファイルをテキストエディタで開く（VSCode、Sublime Text 等）
2. 内容を編集する
3. ファイルを保存する
4. ブラウザでページを開いて確認する

---

## 各コンテンツの更新方法

### 1. Work（ケーススタディ）の追加・編集

**ファイル**: `data/works.json`

#### 新しいWorkを追加する

```json
{
  "works": [
    {
      "id": "work-4",
      "title": "新しいプロジェクト名",
      "slug": "new-project",
      "featured": true,
      "summary": "1行での概要説明",
      "thumbnail": "/images/work-4-thumb.jpg",
      "background": "課題の背景を記述",
      "constraints": [
        "制約1",
        "制約2",
        "制約3"
      ],
      "approach": "設計・技術選定の理由",
      "implementation": "実装の詳細",
      "results": [
        "成果1",
        "成果2"
      ],
      "learnings": "学びの内容",
      "tags": ["React", "TypeScript", "AWS"],
      "year": "2024"
    },
    // 既存の項目...
  ]
}
```

#### Featuredに表示するWorkを変更する

`featured` の値を `true` にするとHomeページに表示されます。
最大3件まで表示されます（4件以上を `true` にした場合、最初の3件が表示されます）。

#### 既存のWorkを編集する

該当する項目を見つけて、値を変更します。

```json
{
  "id": "work-1",
  "title": "変更後のタイトル",  // ← ここを変更
  "summary": "変更後の説明",    // ← ここを変更
  // ...
}
```

---

### 2. Projects の追加・編集

**ファイル**: `data/projects.json`

#### 新しいProjectを追加する

```json
{
  "projects": [
    {
      "id": "proj-9",
      "title": "新しいプロジェクト",
      "featured": false,
      "summary": "プロジェクトの1行説明",
      "role": "設計/実装",
      "tags": ["Python", "FastAPI", "Docker"],
      "links": {
        "github": "https://github.com/username/repo",
        "demo": "https://demo.example.com",
        "article": "https://blog.example.com/article"
      },
      "year": "2024"
    },
    // 既存の項目...
  ]
}
```

#### Featured Projectsを変更する

`featured: true` にすると、Featuredセクションに表示されます。
最大6件まで表示されます。

---

### 3. Writing（記事・登壇）の追加・編集

**ファイル**: `data/writing.json`

#### 新しい記事を追加する

```json
{
  "writing": [
    {
      "id": "article-6",
      "title": "新しい記事タイトル",
      "pinned": false,
      "date": "2024-12-14",
      "summary": "記事を読むべき理由（1行）",
      "url": "https://blog.example.com/new-article",
      "type": "article"
    },
    // 既存の項目...
  ]
}
```

#### 新しい登壇を追加する

```json
{
  "id": "talk-3",
  "title": "登壇タイトル",
  "pinned": true,
  "date": "2024-12-01",
  "summary": "登壇内容の価値",
  "url": "https://speakerdeck.com/username/slide",
  "type": "talk"  // ← "talk" にする
}
```

#### Pinnedを変更する

`pinned: true` にすると、Homeページと Writing ページの Pinned セクションに表示されます。
最大3件まで表示されます。

---

### 4. プロフィール情報の編集

**ファイル**: `data/profile.json`

#### 基本情報を変更する

```json
{
  "profile": {
    "name": "あなたの名前",
    "title": "ソフトウェアエンジニア",
    "tagline": "技術で価値を創造する",
    "description": "より詳しい説明（2-3行）",
    "email": "your.email@example.com",
    "social": {
      "github": "https://github.com/yourusername",
      "twitter": "https://twitter.com/yourusername",
      "linkedin": "https://linkedin.com/in/yourusername"
    }
  },
  // ...
}
```

#### 価値観を変更する

```json
{
  "values": [
    {
      "title": "価値観1",
      "description": "説明文"
    },
    {
      "title": "価値観2",
      "description": "説明文"
    }
    // 3〜5個推奨
  ]
}
```

#### 得意領域を変更する

```json
{
  "expertise": [
    {
      "area": "バックエンド開発",
      "description": "Python/Go を用いた API 設計・実装"
    },
    // ...
  ]
}
```

#### 略歴を変更する

```json
{
  "timeline": [
    {
      "year": "2024",
      "title": "現職の会社名",
      "description": "役割と成果"
    },
    {
      "year": "2022-2024",
      "title": "前職の会社名",
      "description": "役割と成果"
    }
    // 時系列順（新しい順）
  ]
}
```

---

## 画像の追加・更新

### 画像の配置場所

```
images/
├── work-1-thumb.jpg     # Workのサムネイル
├── work-2-thumb.jpg
├── photo-1.jpg          # Photo ページの写真
├── og-image.jpg         # OGP画像
└── ...
```

### 画像の推奨サイズ

- **Workサムネイル**: 800x600px（4:3）
- **OGP画像**: 1200x630px
- **Photo**: 1200x1200px（1:1）

### 画像の最適化

画像は必ず最適化してから追加してください：

- **オンラインツール**: TinyPNG (https://tinypng.com/)
- **コマンドライン**: ImageMagick, WebP など

### 画像のパス指定

JSONファイルで画像を指定する際は、ルートからの絶対パスを使用します：

```json
{
  "thumbnail": "/images/work-new-thumb.jpg"
}
```

---

## 更新の流れ（Git を使用する場合）

### 1. ブランチを作成

```bash
git checkout -b update-content-YYYYMMDD
```

### 2. JSONファイルを編集

該当するファイルを編集します。

### 3. ローカルで確認

```bash
# 簡易サーバーを起動
python3 -m http.server 8000

# ブラウザで http://localhost:8000 を開く
```

### 4. コミット＆プッシュ

```bash
git add data/
git commit -m "Update: 新しいWorkを追加"
git push origin update-content-YYYYMMDD
```

### 5. プルリクエスト作成

GitHub でプルリクエストを作成し、`main` ブランチにマージします。

### 6. デプロイ確認

GitHub Pages が自動でデプロイされるので、数分待ってから本番サイトで確認します。

---

## トラブルシューティング

### Q1: JSONを編集したのに反映されない

**原因**: ブラウザのキャッシュが残っている可能性があります。

**解決方法**:
1. ブラウザでスーパーリロード（Ctrl+Shift+R / Cmd+Shift+R）
2. シークレットモードで開く
3. ブラウザのキャッシュをクリア

### Q2: ページが真っ白になった

**原因**: JSON の文法エラーの可能性があります。

**解決方法**:
1. ブラウザの DevTools (F12) を開く
2. Console タブでエラーメッセージを確認
3. JSONファイルを JSON Validator で検証（https://jsonlint.com/）
4. エラー箇所を修正

### Q3: 画像が表示されない

**原因**: 画像のパスが間違っているか、ファイルが存在しない可能性があります。

**解決方法**:
1. 画像ファイルが正しい場所にあるか確認
2. JSONで指定したパスが正しいか確認
3. ファイル名の大文字小文字が一致しているか確認

### Q4: Featured に表示したいのに表示されない

**原因**:
- `featured: true` が正しく設定されていない
- すでに上限数に達している（Work: 3件、Projects: 6件、Writing: 3件）

**解決方法**:
1. JSON で `"featured": true` になっているか確認（カンマやクォートを忘れていないか）
2. 他の項目の `featured` を `false` にして上限以下にする

---

## よくある編集パターン

### パターン1: 新しい記事を追加してPinnedに表示

1. `data/writing.json` を開く
2. 配列の最初に新しい項目を追加
3. `"pinned": true` に設定
4. 既存のPinnedが3件を超える場合、古い項目の `pinned` を `false` にする

### パターン2: Workの成果指標を更新

1. `data/works.json` を開く
2. 該当するWorkの `results` 配列を編集
3. 数値や成果を追記・更新

### パターン3: プロフィールの SNS リンクを変更

1. `data/profile.json` を開く
2. `profile.social` の該当するURLを変更
3. ついでにフッターの SNS リンクも更新したい場合は、各HTMLファイルのフッター部分を編集

---

## 定期的なメンテナンス

### 月次

- [ ] 古いWritingをRecentに移動（`pinned: false` にする）
- [ ] 新しいWritingを追加

### 四半期

- [ ] Featured Works を見直し
- [ ] Featured Projects を見直し
- [ ] 略歴（Timeline）を更新

### 年次

- [ ] すべてのコンテンツを見直し
- [ ] 古い情報を削除または更新
- [ ] OGP画像を更新（必要に応じて）

---

以上で運用ガイドは完了です。質問や問題があれば、GitHub Issues で報告してください。
