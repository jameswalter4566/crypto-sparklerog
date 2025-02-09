import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const WelcomeDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Add a small delay to prevent flash on initial load
    const timeout = setTimeout(() => {
      const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
      setIsLoaded(true);
      if (!hasSeenWelcome) {
        setIsOpen(true);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  const handleClose = () => {
    localStorage.setItem("hasSeenWelcome", "true");
    setIsOpen(false);
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-lg border-2 border-primary/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            How it works
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 text-center">
          <p className="text-lg">
            1. Search your favorite meme Coin
          </p>
          <p className="text-lg">
            2. Buy and sell your favorite Coin
          </p>
          <p className="text-lg">
            3. Join Voice chat to instantly connect with other holders of the coin
          </p>
        </div>
        <div className="flex justify-center mt-4">
          <Button
            onClick={handleClose}
            className="w-32"
          >
            Let's go!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};