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

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    if (!hasSeenWelcome) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("hasSeenWelcome", "true");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md rounded-xl bg-card border-2 border-primary/50 animate-laser-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center animate-text-glow">
            How it works
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 text-lg">
          <div className="flex items-start gap-3">
            <span className="font-bold text-primary">1.</span>
            <p>Search your favorite meme Coin</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-bold text-primary">2.</span>
            <p>Buy and sell your favorite Coin</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-bold text-primary">3.</span>
            <p>Join Voice chat to instantly connect with other holders of the coin</p>
          </div>
        </div>
        <div className="flex justify-center pt-4">
          <Button 
            onClick={handleClose}
            className="w-32 animate-glow-pulse"
          >
            Let's go!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};