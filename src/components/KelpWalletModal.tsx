
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Wallet, Sparkle, ShoppingBag, X } from "lucide-react";

const ENCOURAGING_MESSAGES = [
  "Nice streak going! Redeem your Kelp Points for discounts 🌱",
  "Keep up the green work! 🏆",
  "Invite friends and earn even more points 🌿",
  "Level up your planet-saving streak! 🚀",
  "You're making a real difference 👏"
];

function getRandomMessage() {
  const i = Math.floor(Math.random() * ENCOURAGING_MESSAGES.length);
  return ENCOURAGING_MESSAGES[i];
}

const KelpWalletModal = ({
  open,
  setOpen,
  points
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  points: number;
}) => {
  const handleClose = () => {
    console.log('Closing kelp wallet modal');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-6 h-6 text-green-600" />
              <DialogTitle>Kelp Wallet</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 rounded-full hover:bg-muted/30 touch-manipulation active:scale-95"
              onClick={handleClose}
              type="button"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <DialogDescription>
            Your eco-points for making green choices. Use them for rewards!
          </DialogDescription>
        </DialogHeader>
        <div className="text-3xl mb-2 font-bold text-green-800 flex items-end gap-2">
          {points} <span className="text-base font-normal text-green-600 mb-0.5">Kelp Points</span>
        </div>
        <div className="rounded bg-green-50 border border-green-100 p-3 mb-2 text-green-900 flex items-center gap-2">
          <Sparkle className="w-5 h-5 text-green-400" />
          <span>{getRandomMessage()}</span>
        </div>
        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            className="bg-gradient-to-r from-green-600/90 to-sky-500/80 text-white font-semibold text-base flex items-center gap-2 hover:from-green-700 hover:to-sky-600 transition"
            disabled
          >
            <ShoppingBag className="w-5 h-5" />
            Buy Kelp Points
          </Button>
          <span className="text-xs text-center text-muted-foreground">(Purchase coming soon!)</span>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default KelpWalletModal;
