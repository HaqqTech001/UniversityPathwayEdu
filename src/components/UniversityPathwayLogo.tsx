import React, { useState } from 'react';

export type LogoVariant = 'header' | 'footer' | 'compact' | 'icon' | 'watermark';

interface LogoProps {
  variant?: LogoVariant;
  className?: string;
}

/**
 * University Pathway Institutional Logo Component
 * Supports official horizontal PNG assets with automatic fallback to high-fidelity SVG vector lockup.
 * Structure: Winged academic emblem on the left, institution name on the right side-by-side.
 */
export default function UniversityPathwayLogo({
  variant = 'header',
  className = '',
}: LogoProps) {
  const isFooter = variant === 'footer';
  const isCompact = variant === 'compact';
  const isIcon = variant === 'icon';
  const isWatermark = variant === 'watermark';

  const [imgError, setImgError] = useState(false);

  // Determine image asset path based on variant
  const imagePath = isFooter
    ? '/images/upec_official_horizontal_white.png'
    : '/images/upec_official_horizontal_dark.png';

  // 1. Watermark Variant
  if (isWatermark) {
    return (
      <svg
        viewBox="0 0 140 105"
        className={`w-full h-full select-none pointer-events-none opacity-[0.06] ${className}`}
        aria-hidden="true"
        fill="currentColor"
      >
        <path d="M70 18 C88 18 96 28 96 54 C96 76 70 88 70 88 C70 88 44 76 44 54 C44 28 52 18 70 18 Z" />
        <path d="M50 42 C30 20 12 18 -2 24 C4 38 18 50 36 56 C20 54 8 58 0 68 C12 78 28 78 44 72 C32 78 22 86 16 96 C30 98 44 90 52 82 Z" />
        <path d="M90 42 C110 20 128 18 142 24 C136 38 122 50 104 56 C120 54 132 58 140 68 C128 78 112 78 96 72 C108 78 118 86 124 96 C110 98 96 90 88 82 Z" />
      </svg>
    );
  }

  // 2. Icon-only Variant
  if (isIcon) {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <svg
          viewBox="0 0 140 105"
          className="w-9 h-7 sm:w-11 sm:h-9"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="University Pathway Crest"
        >
          {/* Wings */}
          <path
            d="M50 42 C30 20 12 18 -2 24 C4 38 18 50 36 56 C20 54 8 58 0 68 C12 78 28 78 44 72 C32 78 22 86 16 96 C30 98 44 90 52 82 Z"
            fill="#0b1a42"
          />
          <path
            d="M90 42 C110 20 128 18 142 24 C136 38 122 50 104 56 C120 54 132 58 140 68 C128 78 112 78 96 72 C108 78 118 86 124 96 C110 98 96 90 88 82 Z"
            fill="#0b1a42"
          />
          {/* Shield */}
          <path
            d="M70 18 C88 18 96 28 96 54 C96 76 70 88 70 88 C70 88 44 76 44 54 C44 28 52 18 70 18 Z"
            fill="#ffffff"
            stroke="#0b1a42"
            strokeWidth="3.5"
          />
          {/* Golden Laurel Wreath */}
          <path
            d="M38 65 C34 78 40 88 52 94 C60 98 68 99 70 99 C72 99 80 98 88 94 C100 88 106 78 102 65"
            stroke="#d5a75b"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="44" cy="80" r="2.5" fill="#d5a75b" />
          <circle cx="56" cy="91" r="2.5" fill="#d5a75b" />
          <circle cx="84" cy="91" r="2.5" fill="#d5a75b" />
          <circle cx="96" cy="80" r="2.5" fill="#d5a75b" />
          {/* Book */}
          <path
            d="M52 46 Q70 41 70 50 Q70 41 88 46 L88 66 Q70 61 70 70 Q70 61 52 66 Z"
            fill="#0b1a42"
            stroke="#0b1a42"
            strokeWidth="1.5"
          />
          <line x1="70" y1="48" x2="70" y2="70" stroke="#ffffff" strokeWidth="2" />
          {/* Torch Star */}
          <circle cx="70" cy="30" r="4.5" fill="#d5a75b" />
          <path d="M70 21 L70 24 M61 25 L63 28 M79 25 L77 28" stroke="#d5a75b" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 3. Compact Mobile Navigation Variant
  if (isCompact) {
    return (
      <div className={`flex items-center gap-2.5 select-none ${className}`}>
        {!imgError ? (
          <img
            src={imagePath}
            alt="University Pathway Logo"
            onError={() => setImgError(true)}
            className="h-8 sm:h-9 w-auto object-contain max-h-[40px]"
          />
        ) : (
          <div className="flex items-center gap-2">
            <svg
              viewBox="0 0 140 105"
              className="w-9 h-7 sm:w-11 sm:h-9 shrink-0"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M50 42 C30 20 12 18 -2 24 C4 38 18 50 36 56 C20 54 8 58 0 68 C12 78 28 78 44 72 C32 78 22 86 16 96 C30 98 44 90 52 82 Z"
                fill="#0b1a42"
              />
              <path
                d="M90 42 C110 20 128 18 142 24 C136 38 122 50 104 56 C120 54 132 58 140 68 C128 78 112 78 96 72 C108 78 118 86 124 96 C110 98 96 90 88 82 Z"
                fill="#0b1a42"
              />
              <path
                d="M70 18 C88 18 96 28 96 54 C96 76 70 88 70 88 C70 88 44 76 44 54 C44 28 52 18 70 18 Z"
                fill="#ffffff"
                stroke="#0b1a42"
                strokeWidth="3.5"
              />
              <circle cx="70" cy="30" r="4.5" fill="#d5a75b" />
              <path
                d="M52 46 Q70 41 70 50 Q70 41 88 46 L88 66 Q70 61 70 70 Q70 61 52 66 Z"
                fill="#0b1a42"
              />
            </svg>
            <div className="flex flex-col leading-tight">
              <span className="font-serif font-black tracking-tight text-[13px] sm:text-[14px] text-[#0b1a42]">
                UNIVERSITY <span className="text-[#c62839]">PATHWAY</span>
              </span>
              <span className="font-sans font-extrabold uppercase tracking-[0.14em] text-[7.5px] sm:text-[8px] text-[#0b1a42]">
                EDUCATIONAL CONSULT
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 4. Header & Footer Standard Horizontal Lockup
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {!imgError ? (
        <img
          src={imagePath}
          alt="University Pathway Educational Consult"
          onError={() => setImgError(true)}
          className={`w-auto object-contain ${
            isFooter
              ? 'h-12 sm:h-14 md:h-16 max-h-[64px]'
              : 'h-9 xs:h-10 sm:h-12 md:h-14 max-h-[56px]'
          }`}
        />
      ) : (
        /* Fallback SVG Vector Lockup */
        <div className="flex items-center gap-3">
          <div className="relative shrink-0 flex items-center justify-center">
            <svg
              viewBox="0 0 140 105"
              className={
                isFooter
                  ? 'w-13 h-10 sm:w-16 sm:h-12 md:w-18 md:h-14'
                  : 'w-9 h-7 xs:w-11 xs:h-9 sm:w-13 sm:h-10 md:w-15 md:h-12'
              }
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M50 42 C30 20 12 18 -2 24 C4 38 18 50 36 56 C20 54 8 58 0 68 C12 78 28 78 44 72 C32 78 22 86 16 96 C30 98 44 90 52 82 Z"
                fill={isFooter ? '#ffffff' : '#0b1a42'}
              />
              <path
                d="M90 42 C110 20 128 18 142 24 C136 38 122 50 104 56 C120 54 132 58 140 68 C128 78 112 78 96 72 C108 78 118 86 124 96 C110 98 96 90 88 82 Z"
                fill={isFooter ? '#ffffff' : '#0b1a42'}
              />
              <path
                d="M70 18 C88 18 96 28 96 54 C96 76 70 88 70 88 C70 88 44 76 44 54 C44 28 52 18 70 18 Z"
                fill={isFooter ? '#08163b' : '#ffffff'}
                stroke={isFooter ? '#ffffff' : '#0b1a42'}
                strokeWidth="3.5"
              />
              <path
                d="M38 65 C34 78 40 88 52 94 C60 98 68 99 70 99 C72 99 80 98 88 94 C100 88 106 78 102 65"
                stroke="#d5a75b"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="44" cy="80" r="2.5" fill="#d5a75b" />
              <circle cx="56" cy="91" r="2.5" fill="#d5a75b" />
              <circle cx="84" cy="91" r="2.5" fill="#d5a75b" />
              <circle cx="96" cy="80" r="2.5" fill="#d5a75b" />
              <path
                d="M52 46 Q70 41 70 50 Q70 41 88 46 L88 66 Q70 61 70 70 Q70 61 52 66 Z"
                fill={isFooter ? '#ffffff' : '#0b1a42'}
                stroke={isFooter ? '#ffffff' : '#0b1a42'}
                strokeWidth="1.5"
              />
              <line
                x1="70"
                y1="48"
                x2="70"
                y2="70"
                stroke={isFooter ? '#08163b' : '#ffffff'}
                strokeWidth="2"
              />
              <circle cx="70" cy="30" r="4.5" fill="#d5a75b" />
              <path
                d="M70 21 L70 24 M61 25 L63 28 M79 25 L77 28"
                stroke="#d5a75b"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <span
              className={`font-serif font-black tracking-tight leading-none ${
                isFooter
                  ? 'text-white text-[15px] sm:text-[18px]'
                  : 'text-[#0b1a42] text-[13px] xs:text-[14px] sm:text-[16px] md:text-[18px]'
              } truncate`}
            >
              UNIVERSITY <span className={isFooter ? 'text-[#f0bb5b]' : 'text-[#c62839]'}>PATHWAY</span>
            </span>
            <span
              className={`font-sans font-extrabold uppercase tracking-[0.12em] text-[7px] xs:text-[7.5px] sm:text-[8.5px] md:text-[9.5px] mt-0.5 leading-tight ${
                isFooter ? 'text-slate-300' : 'text-[#0b1a42]'
              } truncate`}
            >
              EDUCATIONAL CONSULT
            </span>
            <span
              className={`hidden sm:inline font-serif italic text-[8.5px] md:text-[10px] leading-tight mt-0.5 ${
                isFooter ? 'text-[#efbc63]' : 'text-slate-500'
              }`}
            >
              ....the fastest route to university
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
