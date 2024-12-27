import { useState, useCallback } from 'react';
import AgoraRTC, { ICameraVideoTrack } from 'agora-rtc-sdk-ng';

export const useLocalVideo = (deviceId?: string) => {
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);

  const createLocalVideoTrack = useCallback(async () => {
    try {
      console.log("[Local Video] Creating video track with device:", deviceId);
      const videoTrack = await AgoraRTC.createCameraVideoTrack({
        encoderConfig: {
          width: 640,
          height: 360,
          frameRate: 15,
          bitrateMin: 400,
          bitrateMax: 800,
        },
        ...(deviceId ? { cameraId: deviceId } : {}),
      });
      
      console.log("[Local Video] Video track created successfully");
      setLocalVideoTrack(videoTrack);
      setIsVideoEnabled(true);
      return videoTrack;
    } catch (error) {
      console.error("[Local Video] Failed to create video track:", error);
      throw error;
    }
  }, [deviceId]);

  const stopVideoTrack = useCallback(() => {
    if (localVideoTrack) {
      console.log("[Local Video] Stopping video track");
      localVideoTrack.stop();
      localVideoTrack.close();
      setLocalVideoTrack(null);
      setIsVideoEnabled(false);
    }
  }, [localVideoTrack]);

  const toggleVideo = useCallback(async () => {
    if (isVideoEnabled) {
      stopVideoTrack();
    } else {
      await createLocalVideoTrack();
    }
  }, [isVideoEnabled, createLocalVideoTrack, stopVideoTrack]);

  return {
    localVideoTrack,
    isVideoEnabled,
    createLocalVideoTrack,
    stopVideoTrack,
    toggleVideo,
  };
};