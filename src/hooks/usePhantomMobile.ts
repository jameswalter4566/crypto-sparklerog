import { toast } from "sonner";

export const usePhantomMobile = () => {
  const isMobileDevice = () => {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  };

  const openPhantomApp = async () => {
    try {
      // Create a deep link URL that includes the current URL for callback
      const currentURL = encodeURIComponent(window.location.href);
      // Use the connect flow specific deep link
      const phantomDeepLink = `https://phantom.app/ul/v1/connect?app_url=${currentURL}&dapp_encryption_public_key=${currentURL}`;
      
      // If Phantom is installed, use it directly
      // @ts-ignore
      if (window.solana?.isPhantom) {
        // @ts-ignore
        const response = await window.solana.connect();
        return response;
      } else {
        // If not installed, open deep link to app store/phantom app
        window.location.href = phantomDeepLink;
      }
    } catch (error) {
      console.error("Error connecting to Phantom mobile:", error);
      toast.error("Failed to connect to Phantom. Please try again.");
      throw error;
    }
  };

  return {
    isMobileDevice,
    openPhantomApp
  };
};