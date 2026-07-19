import * as React from "react";

// Logo BCA (representasi merek: biru khas BCA #003D8C dengan teks BCA bold).
// Menggunakan SVG inline agar tidak bergantung pada asset eksternal.
export function BcaLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 40"
      className={className}
      role="img"
      aria-label="BCA"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="120" height="40" rx="6" fill="#003D8C" />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fontFamily="'Helvetica Neue', Arial, sans-serif"
        fontWeight="800"
        fontSize="22"
        fill="#FFFFFF"
        letterSpacing="1"
      >
        BCA
      </text>
    </svg>
  );
}
