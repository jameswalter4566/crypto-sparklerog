import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DeviceSelectProps {
  audioDevices: MediaDeviceInfo[];
  videoDevices: MediaDeviceInfo[];
  selectedMicrophoneId: string;
  selectedCameraId: string;
  setSelectedMicrophoneId: (id: string) => void;
  setSelectedCameraId: (id: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeviceSelect = ({
  audioDevices,
  videoDevices,
  selectedMicrophoneId,
  selectedCameraId,
  setSelectedMicrophoneId,
  setSelectedCameraId,
  onConfirm,
  onCancel
}: DeviceSelectProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Select Audio & Video Devices</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Microphone</label>
          <Select
            value={selectedMicrophoneId}
            onValueChange={setSelectedMicrophoneId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select microphone..." />
            </SelectTrigger>
            <SelectContent>
              {audioDevices.map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microphone ${device.deviceId.slice(0, 5)}...`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Camera</label>
          <Select
            value={selectedCameraId}
            onValueChange={setSelectedCameraId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select camera..." />
            </SelectTrigger>
            <SelectContent>
              {videoDevices.map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${device.deviceId.slice(0, 5)}...`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!selectedMicrophoneId}
          >
            Join Voice Chat
          </Button>
        </div>
      </div>
    </Card>
  );
};