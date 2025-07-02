import React from "react";
import { LucideProps } from "lucide-react";

export const NairaSign = ({ size = 24, strokeWidth = 2, className, ...props }: LucideProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      strokeWidth={strokeWidth}
      stroke="currentColor"
      className={className}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 4v16" />
      <path d="M18 4v16" />
      <path d="M18 9l-12 6" />
      <path d="M18 15l-12 -6" />
      <path d="M3 9h18" />
      <path d="M3 15h18" />
    </svg>
  );
};

export default NairaSign;