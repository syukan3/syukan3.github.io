# ソフトウェアエンジニアポートフォリオ

## 概要

このウェブサイトは、私のソフトウェアエンジニアとしてのスキル、経験、プロジェクトを紹介するポートフォリオサイトです。

## 🆕 リニューアル版について

現在、新デザインのポートフォリオサイトを開発中です。

- **デザインコンセプト**: Toy Camera Noir
- **新サイトURL**: https://syukan3.github.io/renewal/
- **状態**: 検収中

詳細は以下のドキュメントを参照してください：

- [リニューアル仕様書](./RENEWAL_SPECIFICATION.md)
- [デプロイ・切替手順](./DEPLOYMENT_GUIDE.md)
- [コンテンツ運用ガイド](./CONTENT_MANAGEMENT_GUIDE.md)
- [新サイトREADME](./renewal/README.md)

## 内容

### 現行サイト（Legacy）
- 自己紹介
- 経歴
- スキルセット
- 主要プロジェクト
- ブログ記事
- お問い合わせフォーム

### 新サイト（Renewal）
- Home（全体要約＋CTA）
- Work（ケーススタディ）
- Projects（プロジェクト一覧）
- Writing & Talks（記事・登壇）
- About（価値観・略歴・得意領域）
- Photo（トイカメラ写真）
- Contact（お問い合わせ）

## 技術スタック

### 現行サイト
- HTML5
- CSS3
- JavaScript (ES6+)

### 新サイト
- Pure HTML/CSS/JavaScript（ビルドツール不使用）
- CSS Variables（デザイントークン）
- JSON-based Content Management
- GitHub Pages

## ディレクトリ構成

```
syukan3.github.io/
├── renewal/                    # 新サイト（検収中）
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
├── index.html                  # 現行サイト（本番稼働中）
├── blogs.html
├── contact.html
├── projects.html
├── css/
├── js/
├── images/
├── RENEWAL_SPECIFICATION.md    # リニューアル仕様書
├── DEPLOYMENT_GUIDE.md         # デプロイ手順書
└── CONTENT_MANAGEMENT_GUIDE.md # 運用ガイド
```

## 連絡先

詳細な情報や協業のご相談は、サイト内のお問い合わせフォームからご連絡ください。

---

© 2024 syukan3. All rights reserved.
