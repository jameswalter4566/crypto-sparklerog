import { useEffect, useRef } from 'react';
import { IRemoteVideoTrack, ICameraVideoTrack } from 'agora-rtc-sdk-ng';

interface VideoStreamProps {
  videoTrack: ICameraVideoTrack | IRemoteVideoTrack;
  className?: string;
}

export const VideoStream = ({ videoTrack, className = "" }: VideoStreamProps) => {
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!videoRef.current || !videoTrack) {
      console.log("[VideoStream] Missing video ref or track");
      return;
    }

    try {
      console.log("[VideoStream] Playing video track");
      videoTrack.play(videoRef.current);

      return () => {
        console.log("[VideoStream] Stopping video track");
        try {
          videoTrack.stop();
        } catch (error) {
          console.error("[VideoStream] Error stopping video track:", error);
        }
      };
    } catch (error) {
      console.error("[VideoStream] Error playing video track:", error);
    }
  }, [videoTrack]);

  return (
    <div 
      ref={videoRef} 
      className={`relative w-full h-full ${className}`}
    />
  );
};