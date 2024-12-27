import { useState, useEffect } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { toast } from 'sonner';

export const useDeviceSetup = () => {
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicrophoneId, setSelectedMicrophoneId] = useState<string>(() => {
    return localStorage.getItem('selectedMicrophoneId') || "";
  });
  const [selectedCameraId, setSelectedCameraId] = useState<string>(() => {
    return localStorage.getItem('selectedCameraId') || "";
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getDevices = async () => {
      console.log("[DeviceSetup] Requesting media permissions and listing devices...");
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        const audioDevs = await AgoraRTC.getMicrophones();
        const videoDevs = await AgoraRTC.getCameras();
        
        console.log("[DeviceSetup] Available audio devices:", audioDevs);
        console.log("[DeviceSetup] Available video devices:", videoDevs);
        
        setAudioDevices(audioDevs);
        setVideoDevices(videoDevs);
        
        // Handle audio device selection
        const savedAudioId = localStorage.getItem('selectedMicrophoneId');
        if (savedAudioId && audioDevs.some(device => device.deviceId === savedAudioId)) {
          setSelectedMicrophoneId(savedAudioId);
        } else if (audioDevs.length > 0) {
          setSelectedMicrophoneId(audioDevs[0].deviceId);
        }

        // Handle video device selection
        const savedVideoId = localStorage.getItem('selectedCameraId');
        if (savedVideoId && videoDevs.some(device => device.deviceId === savedVideoId)) {
          setSelectedCameraId(savedVideoId);
        } else if (videoDevs.length > 0) {
          setSelectedCameraId(videoDevs[0].deviceId);
        }

        if (audioDevs.length === 0) {
          throw new Error("No audio input devices found. Please plug in a microphone.");
        }
      } catch (err) {
        console.error('[DeviceSetup] Failed to get media devices:', err);
        const errorMsg = err instanceof Error ? err.message : "Failed to access media devices. Please check your browser permissions.";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    getDevices();

    const handleDeviceChange = async () => {
      console.log("[DeviceSetup] Media devices changed");
      const audioDevs = await AgoraRTC.getMicrophones();
      const videoDevs = await AgoraRTC.getCameras();
      setAudioDevices(audioDevs);
      setVideoDevices(videoDevs);
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, []);

  return {
    audioDevices,
    videoDevices,
    selectedMicrophoneId,
    selectedCameraId,
    setSelectedMicrophoneId,
    setSelectedCameraId,
    isLoading,
    error
  };
};