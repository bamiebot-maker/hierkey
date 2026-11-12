import { useState } from "react";

const HierkeyLogoFallback = ({
  className = "w-6 h-6",
}: {
  className?: string;
}) => (
  <svg viewBox="0 0 512 512" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="hk-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0B0F17" />
        <stop offset="100%" stopColor="#111827" />
      </linearGradient>
      <linearGradient id="hk-green" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00EC97" />
        <stop offset="100%" stopColor="#00A86B" />
      </linearGradient>
    </defs>
    <path
      d="M 256,36 C 354,36 438,78 456,108 C 456,276 398,398 256,476 C 114,398 56,276 56,108 C 74,78 158,36 256,36 Z"
      fill="url(#hk-bg)"
      stroke="url(#hk-green)"
      strokeWidth="10"
    />
    <circle cx="256" cy="180" r="50" fill="none" stroke="url(#hk-green)" strokeWidth="16" />
    <circle cx="256" cy="180" r="20" fill="#00EC97" />
    <path
      d="M 256,230 L 256,360"
      stroke="url(#hk-green)"
      strokeWidth="16"
      strokeLinecap="round"
    />
    <path d="M 256,290 L 296,290 L 296,316 L 256,316" fill="url(#hk-green)" />
    <path d="M 256,334 L 310,334 L 310,360 L 256,360" fill="url(#hk-green)" />
    <circle cx="256" cy="404" r="10" fill="#00EC97" />
  </svg>
);

const BrandLogo = ({
  className = "w-6 h-6",
  alt = "Hierkey logo",
}: {
  className?: string;
  alt?: string;
}) => {
  const [src] = useState("/hierkey-logo.svg");
  const [useFallback, setUseFallback] = useState(false);

  if (!useFallback) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${className} object-contain`}
        decoding="async"
        onError={() => {
          setUseFallback(true);
        }}
      />
    );
  }

  return <HierkeyLogoFallback className={className} />;
};

export default BrandLogo;
