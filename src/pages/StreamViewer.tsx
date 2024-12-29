import { useParams } from "react-router-dom";
import { StreamView } from "@/components/stream/StreamView";

// This would normally come from an API
const getMockStreamData = (streamId: string) => ({
  username: "CryptoTrader",
  title: "Live Trading Session - Market Analysis",
  viewerCount: 156,
  avatarUrl: "/player1.png",
});

const StreamViewer = () => {
  const { streamId } = useParams();
  const streamData = getMockStreamData(streamId || "");

  return <StreamView {...streamData} />;
};

export default StreamViewer;