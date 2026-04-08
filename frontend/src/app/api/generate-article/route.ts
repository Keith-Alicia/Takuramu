import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// OpenAI クライアントの初期化（サーバーサイドでのみ実行されます）
// .env.local に OPENAI_API_KEY が設定されていることを前提としています
const openai = new OpenAI();

// Vercel のタイムアウト制限を延長する設定（Hobbyプランでも可能な範囲で延長、Proならより長く設定可能）
export const maxDuration = 30; // 30秒まで許可

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // フォームデータからファイルやURLを取得する
    const audioFile = formData.get('audio_file') as File | null;
    const tabelogUrl = formData.get('tabelog_url') as string | null;

    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: '音声ファイルがありません' },
        { status: 400 }
      );
    }

    console.log("音声ファイルの文字起こしを開始します...");

    // Whisper APIによる文字起こし
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'ja', // 日本語指定により精度向上と処理速度アップ
    });

    const transcriptText = transcription.text;
    console.log("文字起こし結果:", transcriptText);

    if (!transcriptText || transcriptText.trim() === '') {
      return NextResponse.json(
        { success: false, error: '音声が正しく聞き取れませんでした。もう一度録音をお試しください。' },
        { status: 400 }
      );
    }

    // GPT APIによる紹介記事の自動生成
    console.log("GPTによる記事生成を開始します...");
    
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

【参考URL（食べログ等）】
${tabelogUrl || '（なし）'}`
        }
      ],
      temperature: 0.7, // 創造性を適度に持たせる
    });

    const generatedArticle = completion.choices[0].message.content;
    console.log("記事生成完了");

    return NextResponse.json({
      success: true,
      generatedText: generatedArticle
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'サーバーでエラーが発生しました' },
      { status: 500 }
    );
  }
}
