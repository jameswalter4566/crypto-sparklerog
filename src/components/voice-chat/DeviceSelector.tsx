import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DeviceSelectorProps {
  audioDevices: MediaDeviceInfo[];
  selectedMicrophoneId: string;
  onDeviceSelect: (deviceId: string) => void;
  onJoin: () => void;
  onCancel: () => void;
}

export const DeviceSelector = ({
  audioDevices,
  selectedMicrophoneId,
  onDeviceSelect,
  onJoin,
  onCancel
}: DeviceSelectorProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Select Audio Device</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Microphone</label>
          <Select
            value={selectedMicrophoneId}
            onValueChange={onDeviceSelect}
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
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={onJoin}
            disabled={!selectedMicrophoneId}
          >
            Join Voice Chat
          </Button>
        </div>
      </div>
    </Card>
  );
};