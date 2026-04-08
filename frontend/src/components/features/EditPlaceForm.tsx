"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mic, Square, ImagePlus, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { updatePlace } from "@/app/actions/places";

type PlaceData = {
  id: string;
  name: string | null;
  tabelog_url: string;
  ai_generated_text: string | null;
  photos: { id: string; storage_url: string; order_index: number }[];
};

export function EditPlaceForm({ portfolioId, place }: { portfolioId: string; place: PlaceData }) {
  const router = useRouter();
  
  // State for form
  const [name, setName] = useState(place.name || "");
  const [tabelogUrl, setTabelogUrl] = useState(place.tabelog_url || "");
  
  // Photos
  const [existingPhotos, setExistingPhotos] = useState(place.photos || []);
  const [deletedPhotoIds, setDeletedPhotoIds] = useState<string[]>([]);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [newPreviewUrls, setNewPreviewUrls] = useState<string[]>([]);
  
  // State for recording
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  // State for submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [generatedText, setGeneratedText] = useState(place.ai_generated_text || "");
  const [isSaving, setIsSaving] = useState(false);

  const totalPhotosCount = existingPhotos.length + newPhotos.length;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const newFiles = Array.from(e.target.files);
    if (totalPhotosCount + newFiles.length > 3) {
      toast.error("写真は合計3枚までです");
      return;
    }

    const updatedPhotos = [...newPhotos, ...newFiles];
    setNewPhotos(updatedPhotos);

    // Create preview URLs
    const createdUrls = newFiles.map(file => URL.createObjectURL(file));
    setNewPreviewUrls(prev => [...prev, ...createdUrls]);
  };

  const removeExistingPhoto = (id: string) => {
    setExistingPhotos(prev => prev.filter(p => p.id !== id));
    setDeletedPhotoIds(prev => [...prev, id]);
  };

  const removeNewPhoto = (index: number) => {
    URL.revokeObjectURL(newPreviewUrls[index]);
    setNewPhotos(prev => prev.filter((_, i) => i !== index));
    setNewPreviewUrls(prev => prev.filter((_, i) => i !== index));
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

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error("店名を入力してください");
      return;
    }
    if (!audioBlob) {
      toast.error("録音データがありません");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append("audio_file", audioBlob, "recording.webm");
      formData.append("tabelog_url", tabelogUrl);

      const response = await fetch('/api/generate-article', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        setGeneratedText(result.generatedText);
        setIsPreviewMode(true);
        toast.success("記事が再生成されました！内容を確認してください。");
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

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name) {
      toast.error("店名を入力してください");
      return;
    }

    setIsSaving(true);
    
    try {
      const formData = new FormData();
      formData.append("id", place.id);
      formData.append("portfolio_id", portfolioId);
      formData.append("name", name);
      formData.append("tabelog_url", tabelogUrl);
      formData.append("deleted_photos", JSON.stringify(deletedPhotoIds));
      formData.append("ai_generated_text", generatedText);
      
      newPhotos.forEach((photo, i) => formData.append(`photo_${i}`, photo));

      const result = await updatePlace(formData);
      
      if (result.success) {
        toast.success("お店の情報が更新されました！");
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
          <Label className="text-lg font-medium text-foreground">再生成された記事プレビュー</Label>
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
            onClick={() => handleSave()}
            disabled={isSaving}
            className="flex-[2] h-12 rounded-xl text-base"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                保存中...
              </>
            ) : (
              "この内容で上書き保存する"
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-10">
      {/* Name Input */}
      <div className="space-y-3">
        <Label htmlFor="name" className="text-sm text-muted-foreground font-light">店名 *</Label>
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
        <Label htmlFor="url" className="text-sm text-muted-foreground font-light">食べログURL *</Label>
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
          <Label className="text-sm text-muted-foreground font-light">写真 (合計最大3枚)</Label>
          <span className="text-xs text-muted-foreground font-light">{totalPhotosCount}/3</span>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {existingPhotos.map((photo) => (
            <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden bg-muted/50 border border-border/50 group">
              <Image src={photo.storage_url} alt="Existing photo" fill className="object-cover" />
              <button 
                type="button" 
                onClick={() => removeExistingPhoto(photo.id)}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {newPreviewUrls.map((url, index) => (
            <div key={url} className="relative aspect-square rounded-xl overflow-hidden bg-muted/50 border border-border/50 group">
              <Image src={url} alt={`New Preview ${index}`} fill className="object-cover" />
              <button 
                type="button" 
                onClick={() => removeNewPhoto(index)}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          
          {totalPhotosCount < 3 && (
            <label className="relative aspect-square rounded-xl border border-dashed border-border/60 hover:bg-muted/20 hover:border-foreground/30 transition-colors cursor-pointer flex flex-col items-center justify-center text-muted-foreground">
              <ImagePlus className="w-6 h-6 mb-2" strokeWidth={1.5} />
              <span className="text-xs font-light">写真を追加</span>
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

      {/* Audio Recording (Optional for edit) */}
      <div className="space-y-3 pt-6 border-t border-border/50">
        <div className="text-center mb-6">
          <Label className="text-sm text-muted-foreground font-light mb-2 block">
            記事を再生成する（任意）
          </Label>
          <p className="text-xs text-muted-foreground/70 font-light mb-4">
            現在の記事:<br/>
            <span className="italic">{place.ai_generated_text}</span>
          </p>
          <p className="text-xs text-muted-foreground/70 font-light">
            新たに音声を録音して再生成すると、記事が上書きされます。
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
            <div className="flex flex-col items-center gap-4 mt-2">
              <div className="text-sm font-light text-primary flex items-center bg-primary/10 px-4 py-2 rounded-full">
                <Mic className="w-4 h-4 mr-2" />
                {formatTime(recordingTime)} の音声が録音されました
                <button 
                  type="button" 
                  onClick={() => { setAudioBlob(null); setRecordingTime(0); }}
                  className="ml-3 text-muted-foreground hover:text-foreground underline underline-offset-2 text-xs"
                >
                  キャンセル
                </button>
              </div>
              <Button 
                type="button"
                onClick={handleGenerate}
                disabled={isSubmitting}
                className="rounded-full shadow-none"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />再生成中...</>
                ) : (
                  "この音声で記事を再生成する"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="pt-8">
        <Button 
          type="submit" 
          disabled={!name || isSaving}
          className="w-full h-14 rounded-full text-base font-sans font-light tracking-wide"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              更新中...
            </>
          ) : (
            "変更を保存する"
          )}
        </Button>
      </div>
    </form>
  );
}