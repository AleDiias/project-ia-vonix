
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Pause, StopCircle, SendHorizonal, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onSpeechToText: () => void;
  isLoading?: boolean;
  isRecording?: boolean;
  recordedAudio?: Blob | null;
  onStopRecording: () => void;
  onPauseRecording: () => void;
  setRecordedAudio: (audio: Blob | null) => void;
}

export function ChatInput({ 
  onSendMessage, 
  onSpeechToText, 
  isLoading,
  isRecording,
  recordedAudio,
  onStopRecording,
  onPauseRecording,
  setRecordedAudio
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    if (recordedAudio) {
      const url = URL.createObjectURL(recordedAudio);
      setAudioUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [recordedAudio]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((message.trim() || recordedAudio) && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
      setRecordedAudio(null);
      setAudioUrl(null);
    }
  };

  const handleCancelAudio = () => {
    setRecordedAudio(null);
    setAudioUrl(null);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2">
      {audioUrl && (
        <div className="flex items-center gap-2 rounded-md border p-2">
          <audio src={audioUrl} controls className="h-8 flex-1" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleCancelAudio}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <div className="relative flex-1">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="resize-none pr-10"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
        </div>
        <div className="flex gap-2">
          {!isRecording ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onSpeechToText}
              disabled={isLoading}
            >
              <Mic className="h-4 w-4" />
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={onPauseRecording}
                className="bg-yellow-100 hover:bg-yellow-200"
              >
                <Pause className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={onStopRecording}
                className="bg-red-100 hover:bg-red-200"
              >
                <StopCircle className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || (!message.trim() && !recordedAudio)}
          >
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}
