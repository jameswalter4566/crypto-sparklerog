import { useEffect, useRef } from 'react';
import { IRemoteVideoTrack, ICameraVideoTrack } from 'agora-rtc-sdk-ng';

interface VideoStreamProps {
  videoTrack: ICameraVideoTrack | IRemoteVideoTrack;
  className?: string;
}

export const VideoStream = ({ videoTrack, className = "" }: VideoStreamProps) => {
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (videoRef.current && videoTrack) {
      videoTrack.play(videoRef.current);
      return () => {
        videoTrack.stop();
      };
    }
  }, [videoTrack]);

  return (
    <div 
      ref={videoRef} 
      className={`relative w-full h-full rounded-lg overflow-hidden bg-black ${className}`}
    />
  );
};