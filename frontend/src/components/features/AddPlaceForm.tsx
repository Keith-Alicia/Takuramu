"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mic, Square, ImagePlus, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { createPlace } from "@/app/actions/places";

export function AddPlaceForm({ portfolioId }: { portfolioId: string }) {
  const router = useRouter();
  
  // State for form
  const [name, setName] = useState("");
  const [tabelogUrl, setTabelogUrl] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  // State for recording
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [volume, setVolume] = useState(0); // 追加: 音量レベル
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null); // 追加: 音量取得用
  const analyserRef = useRef<AnalyserNode | null>(null); // 追加: 音量取得用
  const animationFrameRef = useRef<number | null>(null); // 追加: 音量取得ループ用

  // State for submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [generatedText, setGeneratedText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const newFiles = Array.from(e.target.files);
    if (photos.length + newFiles.length > 3) {
      toast.error("写真は最大3枚までです");
      return;
    }

    const updatedPhotos = [...photos, ...newFiles];
    setPhotos(updatedPhotos);

    // Create preview URLs
    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // --- 音量取得のためのAudioContext設定 ---
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // 配列から平均音量を計算 (0〜255)
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setVolume(average);
        
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      
      updateVolume();
      // ----------------------------------------

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        
        // 音量取得のクリーンアップ
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (audioContextRef.current?.state !== 'closed') {
          audioContextRef.current?.close();
        }
        setVolume(0);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // 正確なタイマー（setIntervalではなく、開始時間を記録して更新）
      setRecordingTime(0);
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        const secondsPassed = Math.floor((Date.now() - startTime) / 1000);
        setRecordingTime(secondsPassed);
      }, 500); // UI更新は500msごとだが、計算自体はDate.now()から行うため正確
      
    } catch (err) {
      console.error("マイクへのアクセスに失敗しました", err);
      toast.error("マイクへのアクセスが許可されていません");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name && !tabelogUrl) {
      toast.error("店名か食べログURLのどちらかを入力してください");
      return;
    }
    // 食べログURLの必須チェックを削除
    if (!audioBlob) {
      toast.error("録音データがありません");
      return;
    }
    if (recordingTime < 2) {
      toast.error("録音時間が短すぎます（2秒以上話してください）");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append("audio_file", audioBlob, "recording.webm");
      formData.append("tabelog_url", tabelogUrl);
      // Optional: Send photos if AI needs to analyze them (future scope)
      // photos.forEach((photo, i) => formData.append(`photo_${i}`, photo));

      const response = await fetch('/api/generate-article', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        setGeneratedText(result.generatedText);
        setIsPreviewMode(true);
        toast.success("記事が生成されました！内容を確認してください。");
      } else {
        toast.error(result.error || "記事の生成に失敗しました");
      }
    } catch (error) {
      toast.error("通信エラーが発生しました");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("tabelog_url", tabelogUrl);
      formData.append("portfolio_id", portfolioId);
      formData.append("ai_generated_text", generatedText);
      photos.forEach((photo, i) => formData.append(`photo_${i}`, photo));

      const result = await createPlace(formData);
      
      if (result.success) {
        toast.success("ポートフォリオに保存しました！");
        router.push(`/dashboard/p/${portfolioId}`);
        router.refresh();
      } else {
        toast.error(result.error || "エラーが発生しました");
      }
    } catch (error) {
      toast.error("エラーが発生しました");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isPreviewMode) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="space-y-4">
          <Label className="text-lg font-medium text-foreground">生成された記事プレビュー</Label>
          <div className="p-6 bg-muted/30 rounded-2xl border border-border/50 text-foreground font-serif leading-relaxed whitespace-pre-wrap">
            {generatedText}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setIsPreviewMode(false)}
            className="flex-1 h-12 rounded-xl"
            disabled={isSaving}
          >
            やり直す
          </Button>
          <Button 
            type="button" 
            onClick={handleSave}
            disabled={isSaving}
            className="flex-[2] h-12 rounded-xl text-base"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                保存中...
              </>
            ) : (
              "この内容で保存する"
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleGenerate} className="space-y-10">
      {/* Name Input */}
      <div className="space-y-3">
        <Label htmlFor="name" className="text-sm text-muted-foreground font-light">店名</Label>
        <Input 
          id="name"
          type="text" 
          placeholder="お店の名前を入力" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="font-sans font-light bg-muted/20 border-border/50 h-12 px-4 rounded-xl shadow-none"
        />
      </div>

      {/* URL Input */}
      <div className="space-y-3">
        <Label htmlFor="url" className="text-sm text-muted-foreground font-light">食べログURL</Label>
        <Input 
          id="url"
          type="url" 
          placeholder="https://tabelog.com/..." 
          value={tabelogUrl}
          onChange={(e) => setTabelogUrl(e.target.value)}
          className="font-sans font-light bg-muted/20 border-border/50 h-12 px-4 rounded-xl shadow-none"
        />
      </div>

      {/* Photo Upload */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-sm text-muted-foreground font-light">写真 (最大3枚)</Label>
          <span className="text-xs text-muted-foreground font-light">{photos.length}/3</span>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {previewUrls.map((url, index) => (
            <div key={url} className="relative aspect-square rounded-xl overflow-hidden bg-muted/50 border border-border/50 group">
              <Image src={url} alt={`Preview ${index}`} fill className="object-cover" />
              <button 
                type="button" 
                onClick={() => removePhoto(index)}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          
          {photos.length < 3 && (
            <label className="relative aspect-square rounded-xl border border-dashed border-border/60 hover:bg-muted/20 hover:border-foreground/30 transition-colors cursor-pointer flex flex-col items-center justify-center text-muted-foreground">
              <ImagePlus className="w-6 h-6 mb-2" strokeWidth={1.5} />
              <span className="text-xs font-light">写真を選択</span>
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                className="hidden" 
                onChange={handlePhotoUpload}
              />
            </label>
          )}
        </div>
      </div>

      {/* Audio Recording */}
      <div className="space-y-3 pt-6 border-t border-border/50">
        <div className="text-center mb-6">
          <Label className="text-sm text-muted-foreground font-light mb-2 block">
            ここが良かった！を独り言でどうぞ
          </Label>
          <p className="text-xs text-muted-foreground/70 font-light">
            「えーっと」「あのー」などのノイズはAIが綺麗に整えます
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-6">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="w-24 h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-xl relative"
            >
              <Mic className="w-8 h-8" />
            </button>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center justify-center gap-2">
                <span className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
                <div className="text-2xl font-mono font-medium text-foreground tracking-wider">
                  {formatTime(recordingTime)}
                </div>
              </div>

              {/* 音量インジケーター */}
              <div className="flex items-center gap-1 h-8 px-4">
                {[...Array(10)].map((_, i) => {
                  // volume (0-255) に基づいて、各バーの高さを計算
                  const threshold = (i / 10) * 100;
                  const isActive = (volume / 2.5) > threshold;
                  const height = isActive ? Math.max(12, (volume / 255) * 32) : 4;
                  
                  return (
                    <div
                      key={i}
                      className={`w-1.5 rounded-full transition-all duration-75 ${
                        isActive ? 'bg-primary' : 'bg-muted-foreground/20'
                      }`}
                      style={{ 
                        height: `${height}px`,
                        opacity: isActive ? 1 : 0.5
                      }}
                    />
                  );
                })}
              </div>

              <button
                type="button"
                onClick={stopRecording}
                className="w-20 h-20 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-all hover:scale-105 active:scale-95 shadow-xl relative group"
              >
                <span className="absolute inset-0 rounded-full border-[3px] border-destructive animate-ping opacity-50 group-hover:opacity-20" />
                <Square className="w-6 h-6 fill-current" />
              </button>
            </div>
          )}

          {audioBlob && !isRecording && (
            <div className="text-sm font-light text-primary flex items-center mt-2 bg-primary/10 px-4 py-2 rounded-full">
              <Mic className="w-4 h-4 mr-2" />
              {formatTime(recordingTime)} の音声が録音されました
              <button 
                type="button" 
                onClick={() => { setAudioBlob(null); setRecordingTime(0); }}
                className="ml-3 text-muted-foreground hover:text-foreground underline underline-offset-2 text-xs"
              >
                録り直す
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="pt-8">
        <Button 
          type="submit" 
          disabled={(!name && !tabelogUrl) || !audioBlob || isSubmitting}
          className="w-full h-14 rounded-full text-base font-sans font-light tracking-wide"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              AIで記事を生成中...
            </>
          ) : (
            "AIで記事を生成する"
          )}
        </Button>
      </div>
    </form>
  );
}