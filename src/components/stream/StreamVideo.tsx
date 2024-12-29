import { useEffect, useRef } from "react";
import { Video, User } from "lucide-react";
import AgoraRTC, { ICameraVideoTrack, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng";
import { toast } from "sonner";

interface StreamVideoProps {
  username: string;
  isStreamer: boolean;
  channelName: string;
  onError?: (error: Error) => void;
}

export function StreamVideo({ username, isStreamer, channelName, onError }: StreamVideoProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const localTracks = useRef<{
    videoTrack?: ICameraVideoTrack;
    audioTrack?: IMicrophoneAudioTrack;
  }>({});

  useEffect(() => {
    const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    const appId = "c6f7a2828b774baebabd8ece87268954"; // Your Agora App ID

    const setupLocalVideo = async () => {
      if (!isStreamer) return;

      try {
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        localTracks.current = { audioTrack, videoTrack };

        if (videoRef.current) {
          videoTrack.play(videoRef.current);
        }

        await client.join(appId, channelName, null, null);
        await client.publish([audioTrack, videoTrack]);

        toast.success("Started streaming successfully!");
      } catch (error) {
        console.error("Error setting up local video:", error);
        toast.error("Failed to start streaming. Please check your camera and microphone permissions.");
        onError?.(error as Error);
      }
    };

    const setupRemoteVideo = async () => {
      if (isStreamer) return;

      try {
        await client.join(appId, channelName, null, null);

        client.on("user-published", async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          
          if (mediaType === "video" && videoRef.current) {
            user.videoTrack?.play(videoRef.current);
          }
          if (mediaType === "audio") {
            user.audioTrack?.play();
          }
        });

        client.on("user-unpublished", (user, mediaType) => {
          if (mediaType === "video") {
            user.videoTrack?.stop();
          }
          if (mediaType === "audio") {
            user.audioTrack?.stop();
          }
        });

      } catch (error) {
        console.error("Error setting up remote video:", error);
        toast.error("Failed to join the stream. Please try again.");
        onError?.(error as Error);
      }
    };

    if (isStreamer) {
      setupLocalVideo();
    } else {
      setupRemoteVideo();
    }

    return () => {
      if (localTracks.current.videoTrack) {
        localTracks.current.videoTrack.close();
      }
      if (localTracks.current.audioTrack) {
        localTracks.current.audioTrack.close();
      }
      client.leave();
    };
  }, [channelName, isStreamer, onError]);

  return (
    <div className="flex-1 bg-card p-4">
      <div 
        ref={videoRef}
        className="aspect-video bg-black/90 w-full h-full flex flex-col items-center justify-center rounded-lg relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
        {!isStreamer && (
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
      </div>
    </div>
  );
}