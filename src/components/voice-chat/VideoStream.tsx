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

    console.log("[VideoStream] Playing video track");
    videoTrack.play(videoRef.current);

    return () => {
      console.log("[VideoStream] Stopping video track");
      videoTrack.stop();
    };
  }, [videoTrack]);

  return (
    <div 
      ref={videoRef} 
      className={`relative w-full h-full rounded-lg overflow-hidden bg-black ${className}`}
    />
  );
};