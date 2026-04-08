"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mic, Square, ImagePlus, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export function AddPlaceForm({ portfolioId }: { portfolioId: string }) {
  const router = useRouter();
  
  // State for form
  const [tabelogUrl, setTabelogUrl] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  // State for recording
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  // State for submission
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Simple timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
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
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tabelogUrl) {
      toast.error("食べログのURLを入力してください");
      return;
    }
    if (!audioBlob) {
      toast.error("録音データがありません");
      return;
    }

    setIsSubmitting(true);
    
    // Fake submission delay to mimic AI generation
    try {
      // Create FormData (in a real app, send this to the Next.js API Route)
      const formData = new FormData();
      formData.append("tabelog_url", tabelogUrl);
      formData.append("portfolio_id", portfolioId);
      formData.append("audio_file", audioBlob);
      photos.forEach((photo, i) => formData.append(`photo_${i}`, photo));

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast.success("記事が生成されました！");
      router.push(`/dashboard/p/${portfolioId}`);
      router.refresh();
    } catch (error) {
      toast.error("エラーが発生しました");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
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

        <div className="flex flex-col items-center justify-center gap-4">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="w-24 h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-xl"
            >
              <Mic className="w-8 h-8" />
            </button>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="text-2xl font-mono text-primary animate-pulse">
                {formatTime(recordingTime)}
              </div>
              <button
                type="button"
                onClick={stopRecording}
                className="w-24 h-24 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-all hover:scale-105 active:scale-95 shadow-xl relative"
              >
                <span className="absolute inset-0 rounded-full border-[3px] border-destructive animate-ping opacity-75"></span>
                <Square className="w-8 h-8 fill-current" />
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
          disabled={!tabelogUrl || !audioBlob || isSubmitting}
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