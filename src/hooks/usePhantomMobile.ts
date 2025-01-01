import { toast } from "sonner";

export const usePhantomMobile = () => {
  const isMobileDevice = () => {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  };

  const openPhantomApp = async () => {
    try {
      // Check if Phantom is already installed
      // @ts-ignore
      if (window.solana?.isPhantom) {
        try {
          // @ts-ignore
          const response = await window.solana.connect();
          console.log("Direct connection successful:", response);
          return response;
        } catch (connError) {
          console.log("Direct connection failed, trying deep link...");
        }
      }

      const dappUrl = encodeURIComponent(window.location.href);
      const phantomDeepLink = `https://phantom.app/ul/connect?app_url=${dappUrl}&redirect_link=${dappUrl}`;
      
      console.log("Opening Phantom deep link:", phantomDeepLink);
      
      // For iOS, we need to use window.location.href
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        window.location.href = phantomDeepLink;
      } else {
        // For Android, try to open in a new window first
        const newWindow = window.open(phantomDeepLink, '_blank');
        if (!newWindow) {
          // If blocked by popup blocker, fallback to location.href
          window.location.href = phantomDeepLink;
        }
      }
      
      toast.info("Opening Phantom wallet...");
      return Promise.resolve();
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