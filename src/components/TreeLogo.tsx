interface TreeLogoProps {
  className?: string;
  size?: number;
}

export function TreeLogo({ className = "", size = 24 }: TreeLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Lighter blue square background with rounded corners */}
      <rect width="48" height="48" rx="8" fill="#60A5FA" />
      
      {/* Tree trunk */}
      <path
        d="M24 38V24"
        stroke="#8B4513"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      
      {/* Branch structure - more detailed */}
      {/* Main branches */}
      <path
        d="M24 30L18 26M24 30L30 26"
        stroke="#8B4513"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      
      {/* Secondary branches */}
      <path
        d="M24 28L20 25M24 28L28 25"
        stroke="#8B4513"
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Tertiary branches */}
      <path
        d="M24 26L21 24M24 26L27 24M18 26L15 24M30 26L33 24"
        stroke="#8B4513"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      
      {/* Small twigs */}
      <path
        d="M20 25L18 23M28 25L30 23M21 24L19 22M27 24L29 22"
        stroke="#8B4513"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      
      {/* Additional branches for more detail */}
      <path
        d="M24 25L22 23M24 25L26 23M15 24L13 22M33 24L35 22"
        stroke="#8B4513"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      
      <path
        d="M18 23L16 21M30 23L32 21"
        stroke="#8B4513"
        strokeWidth="1"
        strokeLinecap="round"
      />
      
      {/* Yellow foliage clusters */}
      <circle cx="24" cy="15" r="5.5" fill="#FCD535" />
      <circle cx="16" cy="20" r="5" fill="#FCD535" />
      <circle cx="32" cy="20" r="5" fill="#FCD535" />
      <circle cx="20" cy="18" r="4.5" fill="#FCD535" />
      <circle cx="28" cy="18" r="4.5" fill="#FCD535" />
      <circle cx="24" cy="21" r="5" fill="#FCD535" />
      <circle cx="13" cy="24" r="4" fill="#FCD535" />
      <circle cx="35" cy="24" r="4" fill="#FCD535" />
      <circle cx="18" cy="22" r="3.5" fill="#FCD535" opacity="0.9" />
      <circle cx="30" cy="22" r="3.5" fill="#FCD535" opacity="0.9" />
      
      {/* White highlights for depth */}
      <circle cx="25" cy="14" r="1.2" fill="white" opacity="0.5" />
      <circle cx="17" cy="19" r="1" fill="white" opacity="0.5" />
      <circle cx="31" cy="19" r="1" fill="white" opacity="0.5" />
      <circle cx="24" cy="20" r="1" fill="white" opacity="0.4" />
      <circle cx="19" cy="23" r="0.8" fill="white" opacity="0.4" />
      <circle cx="29" cy="23" r="0.8" fill="white" opacity="0.4" />
      
      {/* Ground/roots indication */}
      <ellipse cx="24" cy="39" rx="7" ry="1.5" fill="#8B4513" opacity="0.3" />
    </svg>
  );
}