import * as React from "react";
import { cn } from "@/lib/utils";

interface ArrowIconProps extends React.SVGAttributes<SVGSVGElement> {
  className?: string;
}

export function ArrowIcon({ className, ...props }: ArrowIconProps) {
  return (
    <svg
      width="16"
      height="12"
      viewBox="0 0 16 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
      {...props}
    >
      <path
        d="M7.5249 9.96004L4.2649 6.70004C3.8799 6.31504 3.8799 5.68504 4.2649 5.30004L7.5249 2.04004"
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.501 9.96004L8.24098 6.70004C7.85598 6.31504 7.85598 5.68504 8.24098 5.30004L11.501 2.04004"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
