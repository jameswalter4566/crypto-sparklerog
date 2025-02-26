import { useState, useCallback } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import type { IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';

export const useLocalAudio = (microphoneId?: string) => {
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const createLocalAudioTrack = useCallback(async () => {
    try {
      console.log("[Local Audio] Creating audio track with device:", microphoneId);
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
        microphoneId: microphoneId
      });
      console.log("[Local Audio] Created audio track:", audioTrack);

      const enabled = audioTrack.enabled;
      const muted = audioTrack.muted;
      console.log("[Local Audio] Track state - Enabled:", enabled, "Muted:", muted);

      setLocalAudioTrack(audioTrack);
      return audioTrack;
    } catch (error) {
      console.error("[Local Audio] Error creating audio track:", error);
      throw error;
    }
  }, [microphoneId]);

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
      console.log("[Local Audio] Cleaning up local audio track");
      localAudioTrack.close();
      setLocalAudioTrack(null);
    }
  }, [localAudioTrack]);

  // Return the actual track for publishing
  const getTrackForPublishing = useCallback(() => {
    console.log("[Local Audio] Getting track for publishing:", localAudioTrack ? [localAudioTrack] : []);
    return localAudioTrack ? [localAudioTrack] : [];
  }, [localAudioTrack]);

  return {
    localAudioTrack,
    isMuted,
    createLocalAudioTrack,
    toggleMute,
    cleanup,
    getTrackForPublishing
  };
};
