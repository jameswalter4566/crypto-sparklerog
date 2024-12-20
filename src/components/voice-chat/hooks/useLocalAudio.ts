import { useState, useCallback } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import type { IMicrophoneAudioTrack, ILocalTrack } from 'agora-rtc-sdk-ng';

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
      
      // Test the audio track
      const enabled = audioTrack.enabled;
      const muted = audioTrack.muted;
      console.log("[Local Audio] Track state - Enabled:", enabled, "Muted:", muted);
      
      setLocalAudioTrack(audioTrack as IMicrophoneAudioTrack);
      return audioTrack;
    } catch (error) {
      console.error("[Local Audio] Error creating audio track:", error);
      throw error;
    }
  }, [microphoneId]);

  const toggleMute = useCallback(() => {
    if (localAudioTrack) {
      console.log("[Local Audio] Toggling mute state from:", isMuted);
      if (isMuted) {
        localAudioTrack.setEnabled(true);
      } else {
        localAudioTrack.setEnabled(false);
      }
      setIsMuted(!isMuted);
      console.log("[Local Audio] New mute state:", !isMuted);
    }
  }, [localAudioTrack, isMuted]);

  const cleanup = useCallback(() => {
    if (localAudioTrack) {
      console.log("[Local Audio] Cleaning up audio track");
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
    getTrackForPublishing: useCallback(() => {
      const tracks = localAudioTrack ? [localAudioTrack as unknown as ILocalTrack] : [];
      console.log("[Local Audio] Getting tracks for publishing:", tracks);
      return tracks;
    }, [localAudioTrack])
  };
};