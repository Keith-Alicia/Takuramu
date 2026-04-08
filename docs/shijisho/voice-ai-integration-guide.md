# 音声入力とAI生成連携の実装指示書

## 1. 概要と目的
本ドキュメントは、「飲食店ポートフォリオアプリ（仮）」のコア体験となる、ユーザーの「独り言（音声データ）」をAIを用いてエモーショナルな紹介記事へ自動生成する機能の実装手順を定義します。

**実現するユースケース：**
1. ユーザーがスマホ等のマイクからお店の感想（独り言）を録音する。
2. 録音した音声と、食べログのURL等の情報をサーバーへ送信する。
3. Whisper APIによる音声の文字起こしと、GPT-4o miniによる洗練された記事生成をシームレスに行う。
4. 生成された紹介記事をプレビュー画面に表示する。

---

## 2. システム連携フロー
処理はフロントエンド（Client Components）とバックエンド（Next.js API Route）に分かれます。

### 【ステップ全体図】
- [x] 1. **[Front] 音声録音**: `MediaRecorder API` を使い、ブラウザで音声を録音（Blob化）。
- [x] 2. **[Front] フォーム送信**: 音声Blob、写真ファイル群、食べログURLを `FormData` にまとめ、`/api/generate-article` へ `POST`。
- [x] 3. **[Back] データ受取**: `POST` リクエストを受け取り、`FormData` からファイルとURLを取り出す。
- [ ] 4. **[Back] Whisperで文字起こし**: OpenAI `whisper-1` モデルへ音声ファイルを送り、テキスト化。
- [ ] 5. **[Back] GPTで記事生成**: OpenAI `gpt-4o-mini` モデルへ、文字起こし結果・URL・システムプロンプトを送り、Takram風のエモーショナルな記事を生成。
- [ ] 6. **[Front] 結果表示**: APIのレスポンス（生成テキスト）を受け取り、プレビュー画面に表示。

---

## 3. 実装手順：フロントエンド (Client Component)

### 3.1 マイク録音の実装 (`AudioRecorder.tsx` 等)
ブラウザ標準の `MediaRecorder API` を用いて音声を録音します。

- [x] `navigator.mediaDevices.getUserMedia({ audio: true })` でマイク権限を取得。
- [x] `MediaRecorder` インスタンスを作成し、`dataavailable` イベントで音声チャンクを取得。
- [x] `stop` イベント発火時にチャンクを結合して `Blob` を作成（MIMEタイプは `audio/webm` や `audio/mp4` などブラウザに合わせる）。
- [x] 録音中、停止中、録音完了のステート（`useState`）を持ち、UI（マイクボタンの点滅や録音時間の表示など）を制御する。

### 3.2 データ送信処理の実装
録音が完了し、ユーザーが「生成する」ボタンを押した際の処理です。

- [x] `new FormData()` を作成し、以下をアペンドする：
  - `formData.append('audio_file', audioBlob, 'recording.webm')`
  - `formData.append('tabelog_url', tabelogUrl)`
  - ※写真がある場合は写真ファイル群も同様にアペンド。
- [x] `fetch('/api/generate-article', { method: 'POST', body: formData })` を実行。
- [x] 通信中はローディング表示（スピナーなど）にし、5〜10秒程度かかる可能性があることをUIでカバーする。

---

## 4. 実装手順：バックエンド (Next.js API Route)

### 4.1 エンドポイントの準備 (`app/api/generate-article/route.ts`)
Next.js App Router を用いてAPIを構築します。

- [x] `export async function POST(request: Request)` を定義。
- [x] `const formData = await request.formData()` で送信されたデータを受け取る。
- [x] `formData.get('audio_file')` として音声の `Blob`（または `File`）を取得する。

### 4.2 OpenAI APIの呼び出し（2段階）

Next.js上でOpenAI公式の `openai` パッケージを使用します。
- [x] 事前に `.env.local` に `OPENAI_API_KEY` を設定する。

#### ① Whisper APIによる文字起こし
```typescript
import OpenAI from 'openai';
const openai = new OpenAI();

// FormDataから取得した File を直接渡す（Next.js環境で動作可能）
const audioFile = formData.get('audio_file') as File;

const transcription = await openai.audio.transcriptions.create({
  file: audioFile,
  model: 'whisper-1',
  language: 'ja', // 日本語指定により精度向上と処理速度アップ
});

const transcriptText = transcription.text;
```

#### ② GPT APIによる紹介記事の自動生成
- [x] ```typescript
const tabelogUrl = formData.get('tabelog_url') as string;

const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini', // 安価で十分な性能
  messages: [
    {
      role: 'system',
      content: `あなたはプロのエッセイストであり、洗練されたWebマガジンのライターです。
ユーザーの独り言のメモから、飲食店の魅力を伝えるエモーショナルで温かみのある紹介記事を作成してください。
トーン＆マナー：上質で落ち着きがあり、知的な表現。余白を感じさせるような文章構成。
です・ます調を使用し、読み手の心を動かすストーリーに仕上げてください。`
    },
    {
      role: 'user',
      content: `以下の独り言と参考URLを元に、紹介記事を生成してください。
【独り言メモ】
${transcriptText}

【参考URL】
${tabelogUrl}`
    }
  ],
  temperature: 0.7, // 創造性を適度に持たせる
});

const generatedArticle = completion.choices[0].message.content;

// フロントエンドへJSONを返す
return Response.json({ success: true, generatedText: generatedArticle });
```

---

## 5. エラーハンドリングと注意点

- [x] 1. **Vercelのタイムアウト制限 (Serverless Function)**
   - Vercelの無料枠（Hobbyプラン）では、API Routeのタイムアウト上限が初期設定で10秒（最大15秒など設定による）となっています。Whisper + GPTの両方を呼ぶと10秒を超える可能性があるため、`export const maxDuration = 30;` （一部有料プラン等で有効）を設定するか、**Edge Runtime** への移行を検討する必要があります（ただし、Edge環境でのFormDataのFile処理やWhisper対応には制限がある場合があるため要検証）。
- [x] 2. **無音・短すぎる音声の対策**
   - クライアント側で、録音時間が短すぎる場合（例：2秒未満）はAPIへ送信せずアラートを出してください。
   - Whisper APIが空文字を返した場合は、GPTに処理を流さず即座にエラー（「声が聞き取れませんでした」等）をクライアントへ返却します。
- [x] 3. **ファイル形式の互換性**
   - SafariとChromeで録音される `MediaRecorder` のフォーマットが異なる場合があります（Safariは `mp4`、Chromeは `webm` など）。Whisper APIは複数フォーマットに対応しているため大抵は問題ありませんが、MIMEタイプの指定に留意してください。
- [x] 4. **APIコストの管理**
   - フロントエンドから直接OpenAIのAPIを叩くのはセキュリティ上NGです（必ずサーバーサイド＝API Routeを介すること）。