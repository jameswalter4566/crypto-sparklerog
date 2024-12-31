import React from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { SmartLogo } from './SmartLogo';
import { NavigationMenu } from './NavigationMenu';

export const MobileMenu = ({ isOpen, setIsOpen }: { 
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-black border-r border-primary/20">
        <nav className="flex flex-col gap-4 mt-8">
          <Button
            variant="ghost"
            size="lg"
            className="w-full justify-start gap-2 font-bold tracking-wide text-lg"
          >
            <SmartLogo />
          </Button>
          <NavigationMenu onClose={() => setIsOpen(false)} />
        </nav>
      </SheetContent>
    </Sheet>
  );
};