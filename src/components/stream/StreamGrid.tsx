import { StreamTile } from "./StreamTile";
import type { Stream } from "@/hooks/useActiveStreams";

interface StreamGridProps {
  streams: Stream[];
  onWatch: (stream: Stream) => void;
}

export const StreamGrid = ({ streams, onWatch }: StreamGridProps) => {
  console.log('[StreamGrid] Rendering with streams:', streams);

  if (streams.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No active streams at the moment
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {streams.map((stream) => (
        <StreamTile
          key={stream.id}
          username={stream.username}
          avatarUrl={stream.avatarUrl}
          viewerCount={stream.viewerCount}
          title={stream.title}
          onWatch={() => onWatch(stream)}
        />
      ))}
    </div>
  );
};