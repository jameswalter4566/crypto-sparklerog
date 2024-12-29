import { useEffect, useRef, useState } from "react";
import { Video, User, Mic, Camera } from "lucide-react";
import AgoraRTC, { ICameraVideoTrack, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface StreamVideoProps {
  username: string;
  isStreamer: boolean;
  channelName: string;
  isPreview?: boolean;
  onError?: (error: Error) => void;
}

export function StreamVideo({ 
  username, 
  isStreamer, 
  channelName,
  isPreview = false,
  onError 
}: StreamVideoProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const [hasVideo, setHasVideo] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const clientRef = useRef(AgoraRTC.createClient({ mode: "rtc", codec: "vp8" }));
  const localTracks = useRef<{
    videoTrack?: ICameraVideoTrack;
    audioTrack?: IMicrophoneAudioTrack;
  }>({});

  const setupLocalVideo = async () => {
    if (!isStreamer) return;

    try {
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      localTracks.current = { audioTrack, videoTrack };

      if (videoRef.current) {
        videoTrack.play(videoRef.current);
        setHasVideo(true);
        setHasAudio(true);
      }

      if (!isPreview) {
        const appId = "c6f7a2828b774baebabd8ece87268954";
        
        await clientRef.current.join(appId, channelName, null, null);
        await clientRef.current.publish([audioTrack, videoTrack]);

        toast.success("Started streaming successfully!");
      }
    } catch (error) {
      console.error("Error setting up local video:", error);
      toast.error("Failed to start streaming. Please check your camera and microphone permissions.");
      onError?.(error as Error);
    }
  };

  useEffect(() => {
    if (isStreamer) {
      setupLocalVideo();
    } else if (!isPreview) {
      const client = clientRef.current;
      const appId = "c6f7a2828b774baebabd8ece87268954";

      const setupRemoteVideo = async () => {
        try {
          await client.join(appId, channelName, null, null);
          console.log("[StreamVideo] Joined channel as viewer:", channelName);

          client.on("user-published", async (user, mediaType) => {
            await client.subscribe(user, mediaType);
            console.log("[StreamVideo] Subscribed to remote user:", user.uid, mediaType);
            
            if (mediaType === "video" && videoRef.current) {
              user.videoTrack?.play(videoRef.current);
            }
            if (mediaType === "audio") {
              user.audioTrack?.play();
            }
          });

        } catch (error) {
          console.error("Error setting up remote video:", error);
          toast.error("Failed to join the stream. Please try again.");
          onError?.(error as Error);
        }
      };

      setupRemoteVideo();
    }

    // Cleanup function
    return () => {
      console.log("[StreamVideo] Cleaning up stream resources");
      const cleanup = async () => {
        try {
          // Stop and close local tracks
          if (localTracks.current.videoTrack) {
            localTracks.current.videoTrack.stop();
            localTracks.current.videoTrack.close();
          }
          if (localTracks.current.audioTrack) {
            localTracks.current.audioTrack.stop();
            localTracks.current.audioTrack.close();
          }

          // Leave the channel and remove all event listeners
          if (clientRef.current) {
            clientRef.current.removeAllListeners();
            await clientRef.current.leave();
            console.log("[StreamVideo] Successfully left the channel");
          }

          setHasVideo(false);
          setHasAudio(false);
        } catch (error) {
          console.error("[StreamVideo] Error during cleanup:", error);
        }
      };

      cleanup();
    };
  }, [channelName, isStreamer, isPreview, onError]);

  return (
    <div className="h-full p-4">
      <div 
        ref={videoRef}
        className="w-full h-full bg-black/90 rounded-lg relative overflow-hidden flex items-center justify-center"
      >
        {!hasVideo && isStreamer && (
          <div className="flex flex-col items-center gap-4">
            <Video className="w-16 h-16 text-primary mb-4 animate-pulse" />
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={setupLocalVideo}
              >
                <Camera className="w-4 h-4" />
                Enable Camera
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={setupLocalVideo}
              >
                <Mic className="w-4 h-4" />
                Enable Microphone
              </Button>
            </div>
          </div>
        )}
        {!isStreamer && !hasVideo && (
          <>
            <Video className="w-16 h-16 text-primary mb-4 animate-pulse" />
            <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-medium">LIVE</span>
            </div>
          </>
        )}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full">
          <User className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium">{username} is streaming</span>
        </div>
        {hasVideo && hasAudio && isStreamer && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs font-medium">Live</span>
          </div>
        )}
      </div>
    </div>
  );
}