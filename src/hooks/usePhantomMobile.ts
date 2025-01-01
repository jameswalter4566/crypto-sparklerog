import { toast } from "sonner";

export const usePhantomMobile = () => {
  const isMobileDevice = () => {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  };

  const openPhantomApp = async () => {
    try {
      // If Phantom is not installed, create a deep link
      const location = window.location.href;
      const encodedUrl = encodeURIComponent(location);
      
      // Create a deep link URL that includes the dapp URL
      const phantomDeepLink = `https://phantom.app/ul/v1/connect?app_url=${encodedUrl}&redirect_url=${encodedUrl}`;
      
      console.log("Opening Phantom deep link:", phantomDeepLink);
      window.location.href = phantomDeepLink;
      
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