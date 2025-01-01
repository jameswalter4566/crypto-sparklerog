import { toast } from "sonner";

export const usePhantomMobile = () => {
  const isMobileDevice = () => {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  };

  const openPhantomApp = async () => {
    try {
      // @ts-ignore
      if (window.solana?.isPhantom) {
        // @ts-ignore
        const response = await window.solana.connect();
        return response;
      }

      // If Phantom is not installed, create a deep link to the app store
      const encodedUrl = encodeURIComponent(window.location.href);
      // We're using a basic deep link since we can't generate an encryption key on the client
      const phantomDeepLink = `https://phantom.app/ul/browse/${encodedUrl}`;
      
      window.location.href = phantomDeepLink;
      
      // Return a promise that resolves when the deep link is opened
      return new Promise<void>((resolve) => {
        resolve();
      });
    } catch (error) {
      console.error("Error connecting to Phantom mobile:", error);
      toast.error("Failed to connect to Phantom. Please try again.");
      return Promise.reject(error);
    }
  };

  return {
    isMobileDevice,
    openPhantomApp
  };
};