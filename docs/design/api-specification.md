# API仕様書

## 1. 概要と設計原則

本システムでは、フロントエンド（Next.js Client Components）とバックエンド（Next.js Server Actions / API Routes）間の通信、および外部サービスとの連携を行います。

基本的には、Next.js App Routerの **Server Actions** を多用してRPC（Remote Procedure Call）ライクにDB操作や処理を隠蔽しますが、クライアントから複雑なFormData（音声ファイル＋画像等）を送信するコア機能（AI記事生成）については、明確なAPIエンドポイントとして定義します。

### 認証・認可
- 本アプリのプライベートなAPIエンドポイントは、Clerkによる認証セッションを必要とします。
- リクエストヘッダーのCookieやAuthorizationヘッダー（Bearer Token）を通じてClerkのミドルウェアがユーザーを検証します。未認証の場合は `401 Unauthorized` を返します。

## 2. エンドポイント一覧

### 2.1 AI記事自動生成API

本システムのコア機能であり、音声データの文字起こしとLLMによる記事生成をワンストップで行うエンドポイントです。

- **エンドポイント**: `POST /api/generate-article`
- **目的**: アップロードされた音声ファイルをテキスト化し、それを元にプロンプトを適用して紹介記事を生成する。
- **認証**: 必須

#### リクエスト
- **Content-Type**: `multipart/form-data`
- **パラメータ**:

| フィールド名 | 型 | 必須 | 説明 |
| :--- | :--- | :--- | :--- |
| `audio_file` | File (Blob) | Yes | ユーザーが録音した音声ファイル（WebM, MP3, MP4などWhisper対応形式） |
| `tabelog_url` | String | Yes | お店の食べログURL |
| `portfolio_id` | String (UUID) | Yes | 追加対象のポートフォリオID |
| `photos` | File[] (Blobs) | No | 画像ファイル（最大3枚）。将来的なマルチモーダルAI解析拡張用の予備パラメータ。現在はSupabase Storageへのアップロード処理を並行して行うための識別用等に利用可能。 |

#### レスポンス
- **ステータス**: `200 OK`
- **Content-Type**: `application/json`
- **ボディ例**:

```json
{
  "success": true,
  "data": {
    "generated_text": "老若男女に愛される、居心地の良い止まり木のような空間。多様なカルチャーが交差し、気高き友人たちとの刺激的な時間が流れる。",
    "place_id": "123e4567-e89b-12d3-a456-426614174000"
  }
}
```

- **エラーレスポンス例**:
  - `400 Bad Request`: 音声ファイルが存在しない、URLが不正など
  - `500 Internal Server Error`: AI APIの呼び出し失敗、DB保存失敗など

```json
{
  "success": false,
  "error": "音声データの認識に失敗しました。もう少し長く、はっきりと話して再度お試しください。"
}
```

### 2.2 その他の操作 (Server Actionsの仕様イメージ)

CRUD（作成・読み取り・更新・削除）操作の多くは、Next.jsのServer Actionsとして実装され、専用のAPI Routeを持たずに直接関数として呼び出されます。

- **`createPortfolio(title: string)`**:
  - 新規ポートフォリオを作成し、自動でランダムな `share_id` を生成して保存する。
- **`savePlacePhotos(placeId: string, photos: File[])`**:
  - クライアント側から直接Supabase Storageにアップロードされた画像のパス（Storage URL）を受け取り、`PHOTOS` テーブルにメタデータとして保存・紐付けを行う。

## 3. 外部サービス連携（アウトバウンドAPI通信）

バックエンドから以下の外部SaaSのAPIを呼び出します。

### 3.1 OpenAI API - Whisper (音声認識)
- **エンドポイント**: `POST https://api.openai.com/v1/audio/transcriptions`
- **用途**: `audio_file` をテキストに変換。
- **設定**: モデルは `whisper-1` を使用。

### 3.2 OpenAI API - GPT (テキスト生成)
- **エンドポイント**: `POST https://api.openai.com/v1/chat/completions`
- **用途**: Whisperで文字起こしされたテキストと、システム要件で定義された「洗練されたモダンなトーン」を指定するシステムプロンプトを合成し、エモーショナルな紹介記事を生成する。
- **設定**: コストと速度のバランスから、モデルは `gpt-4o-mini` を第一候補として検証する。