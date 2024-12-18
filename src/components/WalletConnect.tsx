import { useState, useEffect } from "react";
import { toast } from "sonner";

export const WalletConnect = () => {
  const [connected, setConnected] = useState(false);

  const connectWallet = async () => {
    try {
      // @ts-ignore
      const { solana } = window;

      if (!solana?.isPhantom) {
        toast.error("Please install Phantom wallet");
        window.open("https://phantom.app/", "_blank");
        return;
      }

      const response = await solana.connect();
      setConnected(true);
      toast.success("Wallet connected!");
      console.log("Connected with Public Key:", response.publicKey.toString());
    } catch (error) {
      console.error(error);
      toast.error("Error connecting wallet");
    }
  };

  useEffect(() => {
    // @ts-ignore
    const { solana } = window;
    if (solana?.isPhantom && solana.isConnected) {
      setConnected(true);
    }
  }, []);

  return (
    <button
      onClick={connectWallet}
      className="fixed top-4 right-4 hover:opacity-80 transition-opacity"
    >
      <img
        src="/1200x1200.png"
        alt="Phantom Wallet"
        className="w-10 h-10 rounded-full"
      />
      <span className="sr-only">Connect Phantom Wallet</span>
    </button>
  );
};