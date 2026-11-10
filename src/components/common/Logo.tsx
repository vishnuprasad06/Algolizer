import type { SVGProps } from "react";

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export default function Logo({
  size = 36,
  showText = true,
  className = "",
}: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Algolizer"
      >
        <path
          d="M10 10L30 10L20 30Z"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="10" r="4" fill="#2563EB" />
        <circle cx="30" cy="10" r="4" fill="#2563EB" />
        <circle cx="20" cy="30" r="4" fill="#2563EB" />
      </svg>
      {showText && (
        <span className="text-xl font-bold tracking-tight text-neutral-900">
          algolizer
        </span>
      )}
    </div>
  );
}
