import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AskAgentButtonProps {
  onAnalysisComplete: (analysis: {
    devAnalysis: string;
    launchAnalysis: string;
    socialMediaStatus: string;
    rugScore: number;
  }) => void;
  coinData: {
    devHoldings: string;
    launchHistory: string;
    socialMedia: string;
  };
}

export const AskAgentButton = ({ onAnalysisComplete, coinData }: AskAgentButtonProps) => {
  const [isListening, setIsListening] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('file', audioBlob, 'voice.webm');

        try {
          // Convert audio to text using Whisper API
          const { data: transcriptionData, error: transcriptionError } = await supabase.functions.invoke(
            'transcribe-audio',
            {
              body: formData,
            }
          );

          if (transcriptionError) throw transcriptionError;

          // Get rug analysis based on transcription
          const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
            'analyze-rug',
            {
              body: { 
                coinData,
                userMessage: transcriptionData.text 
              },
            }
          );

          if (analysisError) throw analysisError;

          onAnalysisComplete(analysisData);
          toast.success("Analysis complete!");
        } catch (error) {
          console.error('Error processing voice input:', error);
          toast.error("Failed to process voice input");
        }
      };

      mediaRecorderRef.current.start();
      setIsListening(true);
      toast.success("Listening... Click again to stop.");
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error("Failed to access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsListening(false);
    }
  };

  const handleClick = () => {
    if (!isListening) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={`gap-2 bg-primary/10 hover:bg-primary/20 transition-all duration-300 ${
        isListening ? "animate-pulse" : ""
      }`}
      onClick={handleClick}
    >
      <Mic className={`h-4 w-4 ${isListening ? "text-red-500" : ""}`} />
      {isListening ? "Listening..." : "Ask Agent"}
    </Button>
  );
};