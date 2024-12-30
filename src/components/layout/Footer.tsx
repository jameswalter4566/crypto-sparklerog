import React from 'react';
import { Link } from 'react-router-dom';
import { Separator } from "@/components/ui/separator";

export const Footer = () => {
  return (
    <footer className="w-full bg-[#000000e6] mt-auto">
      <div className="w-full">
        <Separator className="h-[2px] bg-gradient-to-r from-primary/20 via-primary to-primary/20 animate-glow-pulse" />
      </div>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
            <Link to="/privacy" className="text-gray-400 hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-primary transition-colors">
              Terms & Conditions
            </Link>
            <Link to="/risk" className="text-gray-400 hover:text-primary transition-colors">
              Risk Disclosures
            </Link>
          </div>
          <div className="text-gray-400 text-sm">
            © 2024 Smart Trade Technologies. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};