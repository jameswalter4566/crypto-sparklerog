import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import AgoraRTC from 'agora-rtc-sdk-ng';

export const useAudioDevices = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicrophoneId, setSelectedMicrophoneId] = useState<string>(() => {
    return localStorage.getItem('selectedMicrophoneId') || '';
  });

  useEffect(() => {
    const getDevices = async () => {
      console.log("[Audio Devices] Requesting audio permission and listing devices...");
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const devices = await AgoraRTC.getMicrophones();
        console.log("[Audio Devices] Available audio devices:", devices);
        setAudioDevices(devices);
        
        const savedDeviceId = localStorage.getItem('selectedMicrophoneId');
        if (savedDeviceId && devices.some(device => device.deviceId === savedDeviceId)) {
          setSelectedMicrophoneId(savedDeviceId);
        } else if (devices.length > 0) {
          setSelectedMicrophoneId(devices[0].deviceId);
        } else {
          setError("No audio input devices found");
        }
      } catch (err) {
        console.error('[Audio Devices] Failed to get audio devices:', err);
        const errorMsg = err instanceof Error ? err.message : "Failed to access microphone";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    getDevices();

    const handleDeviceChange = async () => {
      console.log("[Audio Devices] Audio devices changed");
      const devices = await AgoraRTC.getMicrophones();
      setAudioDevices(devices);
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, []);

  return {
    isLoading,
    error,
    audioDevices,
    selectedMicrophoneId,
    setSelectedMicrophoneId
  };
};