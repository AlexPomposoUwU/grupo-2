import React from "react";

/**
 * Custom vector of a hanging leaf branch with glowing bioluminescent neon colors.
 */
export const HangingVine: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = "", style }) => {
  return (
    <svg
      viewBox="0 0 100 300"
      className={`pointer-events-none select-none animate-sway animate-glow-pulse ${className}`}
      style={{ width: "80px", height: "240px", ...style }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main branch line */}
      <path
        d="M50 0 C52 40, 45 100, 55 160 C60 200, 40 250, 48 300"
        stroke="#39ff14"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.85"
      />
      {/* Branch glow */}
      <path
        d="M50 0 C52 40, 45 100, 55 160 C60 200, 40 250, 48 300"
        stroke="#00f3ff"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.4"
      />

      {/* Tender tendrils and leaves */}
      {/* Leaf 1 Left */}
      <path
        d="M49 40 C35 38, 20 45, 12 55 C22 60, 38 52, 48 45 Z"
        fill="#39ff14"
        fillOpacity="0.85"
        stroke="#000"
        strokeWidth="0.5"
      />
      <path d="M49 40 Q30 50 12 55" stroke="#00f3ff" strokeWidth="0.8" opacity="0.9" />

      {/* Leaf 2 Right */}
      <path
        d="M51 70 C65 65, 80 75, 88 88 C76 92, 60 85, 50 75 Z"
        fill="#10b981"
        fillOpacity="0.8"
        stroke="#000"
        strokeWidth="0.5"
      />
      <path d="M51 70 Q70 80 88 88" stroke="#39ff14" strokeWidth="0.8" opacity="0.9" />

      {/* Leaf 3 Left */}
      <path
        d="M48 110 C30 110, 15 120, 8 135 C20 140, 35 130, 47 115 Z"
        fill="#39ff14"
        fillOpacity="0.9"
        stroke="#000"
        strokeWidth="0.5"
      />
      <path d="M48 110 Q28 125 8 135" stroke="#ff00ff" strokeWidth="0.8" opacity="0.7" />

      {/* Leaf 4 Right */}
      <path
        d="M53 145 C68 145, 82 155, 90 170 C78 175, 62 168, 52 150 Z"
        fill="#10b981"
        fillOpacity="0.85"
        stroke="#000"
        strokeWidth="0.5"
      />
      <path d="M53 145 Q72 160 90 170" stroke="#39ff14" strokeWidth="0.8" opacity="0.9" />

      {/* Leaf 5 Left */}
      <path
        d="M51 190 C38 195, 25 210, 18 225 C26 228, 42 218, 50 200 Z"
        fill="#39ff14"
        fillOpacity="0.85"
        stroke="#000"
        strokeWidth="0.5"
      />
      <path d="M51 190 Q35 210 18 225" stroke="#00f3ff" strokeWidth="0.8" opacity="0.9" />

      {/* Leaf 6 Right */}
      <path
        d="M54 220 C68 220, 78 235, 84 250 C72 252, 60 242, 52 225 Z"
        fill="#10b981"
        fillOpacity="0.8"
        stroke="#000"
        strokeWidth="0.5"
      />
      <path d="M54 220 Q68 238 84 250" stroke="#39ff14" strokeWidth="0.8" opacity="0.9" />

      {/* Leaf 7 Tip */}
      <path
        d="M48 270 C40 280, 42 295, 48 300 C54 295, 56 280, 48 270 Z"
        fill="#39ff14"
        fillOpacity="0.9"
        stroke="#000"
        strokeWidth="0.5"
      />
      <path d="M48 270 Q48 285 48 300" stroke="#00f3ff" strokeWidth="0.8" opacity="0.9" />
    </svg>
  );
};

/**
 * Corner vine component that frames containers elegantly.
 */
export const CornerVine: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = "", style }) => {
  return (
    <svg
      viewBox="0 0 150 150"
      className={`pointer-events-none select-none ${className}`}
      style={{ width: "120px", height: "120px", ...style }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Arching corner stalk */}
      <path
        d="M0 0 Q40 10 70 40 T110 110 T120 150"
        stroke="#39ff14"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M0 0 Q40 10 70 40 T110 110 T120 150"
        stroke="#00f3ff"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* Foliage clustering along the stalk */}
      {/* Leaf 1 (Near corner 20,20) */}
      <path
        d="M30 12 C18 5, 5 12, 2 24 C14 26, 26 20, 30 12 Z"
        fill="#10b981"
        fillOpacity="0.85"
        stroke="#000"
        strokeWidth="0.5"
      />
      <path d="M30 12 Q16 18 2 24" stroke="#39ff14" strokeWidth="0.8" />

      {/* Leaf 2 */}
      <path
        d="M48 25 C58 12, 72 8, 80 18 C72 28, 58 30, 48 25 Z"
        fill="#39ff14"
        fillOpacity="0.9"
        stroke="#000"
        strokeWidth="0.5"
      />
      <path d="M48 25 Q64 18 80 18" stroke="#ff00ff" strokeWidth="0.8" opacity="0.8" />

      {/* Leaf 3 */}
      <path
        d="M65 42 C52 48, 45 62, 40 75 C52 72, 62 60, 65 42 Z"
        fill="#39ff14"
        fillOpacity="0.85"
        stroke="#000"
        strokeWidth="0.5"
      />
      <path d="M65 42 Q52 58 40 75" stroke="#00f3ff" strokeWidth="0.8" />

      {/* Leaf 4 */}
      <path
        d="M90 75 C102 65, 115 65, 125 78 C112 85, 100 85, 90 75 Z"
        fill="#10b981"
        fillOpacity="0.8"
        stroke="#000"
        strokeWidth="0.5"
      />
      <path d="M90 75 Q108 75 125 78" stroke="#39ff14" strokeWidth="0.8" />

      {/* Leaf 5 */}
      <path
        d="M105 105 C95 118, 92 132, 95 145 C105 135, 112 120, 105 105 Z"
        fill="#39ff14"
        fillOpacity="0.9"
        stroke="#000"
        strokeWidth="0.5"
      />
      <path d="M105 105 Q98 125 95 145" stroke="#00f3ff" strokeWidth="0.8" />
    </svg>
  );
};

/**
 * Exquisite glowing leaf that can be attached to any border line.
 */
export const GlowLeaf: React.FC<{ 
  className?: string; 
  style?: React.CSSProperties;
  rotation?: string; 
  size?: number;
}> = ({ className = "", style, rotation = "0deg", size = 24 }) => {
  return (
    <div 
      className={`pointer-events-none select-none transition-all duration-500 hover:scale-125 ${className}`}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`, 
        transform: `rotate(${rotation})`,
        display: "inline-block",
        ...style 
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full filter drop-shadow-[0_0_4px_rgba(57,255,20,0.6)]"
      >
        <path
          d="M2 22C2 22 6 14 14 12C14 12 16 6 22 2C22 2 18 10 12 12C12 12 8 16 2 22Z"
          fill="#39ff14"
          fillOpacity="0.9"
        />
        <path
          d="M2 22C4 18 8 14 12 12"
          stroke="#00f3ff"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
