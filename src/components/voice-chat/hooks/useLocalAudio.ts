import { useState, useCallback } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import type { IMicrophoneAudioTrack, ILocalTrack } from 'agora-rtc-sdk-ng';

export const useLocalAudio = () => {
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const createLocalAudioTrack = useCallback(async () => {
    try {
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      setLocalAudioTrack(audioTrack as IMicrophoneAudioTrack);
      return audioTrack;
    } catch (error) {
      console.error("Error creating local audio track:", error);
      throw error;
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (localAudioTrack) {
      if (isMuted) {
        localAudioTrack.setEnabled(true);
      } else {
        localAudioTrack.setEnabled(false);
      }
      setIsMuted(!isMuted);
    }
  }, [localAudioTrack, isMuted]);

  const cleanup = useCallback(() => {
    if (localAudioTrack) {
      localAudioTrack.close();
      setLocalAudioTrack(null);
    }
  }, [localAudioTrack]);

  return {
    localAudioTrack,
    isMuted,
    createLocalAudioTrack,
    toggleMute,
    cleanup,
    getTrackForPublishing: useCallback(() => 
      localAudioTrack ? [localAudioTrack as unknown as ILocalTrack] : [], 
    [localAudioTrack])
  };
};