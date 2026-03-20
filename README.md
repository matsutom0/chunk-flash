# ⚡ Chunk Flash

チャンク処理速度を鍛える英語トレーニングアプリ。

Versantリスニング対策として、英文をチャンク（意味のかたまり）単位でフラッシュ表示し、リアルタイムの意味処理速度を段階的に鍛える。

## 機能

- **チャンクフラッシュ**: 英文をチャンク単位で時間制限付き表示（500ms〜1800ms）
- **構造理解型の質問**: 単語記憶ではなく、文全体の意味構造を問う
- **ドリル分解**: 間違えた文をチャンクごとに分解して確認
- **再テスト**: ドリル後に同じスピードで再出題
- **もう一回見る**: 回答後にフラッシュ再生
- **音声読み上げ**: Web Speech APIによるTTS（ON/OFF切替可）
- **学習ログ**: localStorage に永続保存、JSON書き出し可能
- **AI分析**: Anthropic APIでログを分析（APIキー要）
- **PWA対応**: ホーム画面に追加してアプリとして使用可能

## セットアップ

```bash
npm install
npm run dev
```

http://localhost:3000 で開く。

## デプロイ（Vercel）

1. このフォルダをGitHubリポジトリにpush
2. [vercel.com](https://vercel.com) でリポジトリをインポート
3. Framework Preset: **Next.js** を選択
4. Deploy

デプロイ後のURLをAndroidの「ホーム画面に追加」でPWAとして使える。

## AI分析機能

学習ログ画面の「AIに分析してもらう」ボタンを押すと、Anthropic APIを使ってログを分析する。
初回使用時にAPIキー（`sk-ant-...`）の入力を求められる。キーはlocalStorageにのみ保存される。

APIキーが不要な場合は「ログをJSONで書き出す」からデータをエクスポートし、
Claude等に直接貼り付けて分析してもらうこともできる。

## PWA（ホーム画面追加）

- **Android**: Chrome → メニュー → 「ホーム画面に追加」
- **iOS**: Safari → 共有 → 「ホーム画面に追加」

`public/manifest.json` が設定済み。アイコン画像（icon-192.png, icon-512.png）は
`public/` に配置してください。

## 問題の追加

`app/ChunkFlash.js` の `SENTENCES` 配列に追加：

```js
{
  chunks: ["The CEO", "announced that", "the company will", "expand overseas."],
  q: "CEOは何を発表した？",
  options: ["海外展開すること", "本社を移転すること", "社員を削減すること"],
  answer: 0,
}
```

## 理論的背景

- **Chunk-and-Pass処理** (Christiansen & Chater, 2016): 脳はリアルタイムでチャンキングと圧縮を行う
- **CRST研究** (2024): 日本人学習者でチャンク単位提示訓練が処理速度向上に有効
- **ワーキングメモリ拡張**: チャンク処理の自動化によりWM負荷が軽減される
