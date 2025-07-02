import React from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

export function Logo({ className = "", showText = false, textClassName = "" }: LogoProps) {
  // Use the exact image URL provided by the user
  const logoUrl = "https://i.postimg.cc/bNpHxp4V/Jam4me.png";
  
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <img 
        src={logoUrl} 
        alt="Jam4me Logo" 
        className="h-full w-auto"
      />
      {showText && (
        <span className={`gradient-text font-bold ${textClassName}`}>
          Jam4me
        </span>
      )}
    </div>
  );
}