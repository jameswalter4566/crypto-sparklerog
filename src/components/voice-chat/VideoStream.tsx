import { useEffect, useRef } from 'react';
import { IRemoteVideoTrack, ICameraVideoTrack } from 'agora-rtc-sdk-ng';

interface VideoStreamProps {
  videoTrack: ICameraVideoTrack | IRemoteVideoTrack;
  className?: string;
}

export const VideoStream = ({ videoTrack, className = "" }: VideoStreamProps) => {
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = videoRef.current;
    if (!container) {
      console.log("[VideoStream] Missing video container ref");
      return;
    }

    if (!videoTrack) {
      console.log("[VideoStream] Missing video track");
      return;
    }

    try {
      console.log("[VideoStream] Playing video track in container");
      // Clear any existing content
      container.innerHTML = '';
      
      // Create a dedicated video element
      const videoElement = document.createElement('video');
      videoElement.style.width = '100%';
      videoElement.style.height = '100%';
      videoElement.style.objectFit = 'cover';
      container.appendChild(videoElement);
      
      // Play the video track
      videoTrack.play(container, { 
        fit: 'cover',
        mirror: true 
      });

      return () => {
        console.log("[VideoStream] Cleaning up video track");
        try {
          videoTrack.stop();
          // Clear the container on cleanup
          if (container) {
            container.innerHTML = '';
          }
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
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{ 
        minHeight: '100%', 
        minWidth: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'inherit'
      }}
    />
  );
};