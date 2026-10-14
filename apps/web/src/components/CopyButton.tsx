import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
  iconSize?: number;
}

/**
 * Reusable accessible CopyButton with feedback toast
 * Supports mobile touch and desktop click with clipboard fallbacks
 */
export default function CopyButton({
  value,
  label = 'Copy to clipboard',
  className = '',
  iconSize = 14,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
      } else {
        // Fallback for older browsers / insecure contexts
        const textArea = document.createElement('textarea');
        textArea.value = value;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Failed to copy text: ', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label}
      title={label}
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
        copied
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-[#0b1a42] border border-slate-200/80'
      } ${className}`}
    >
      {copied ? (
        <>
          <Check size={iconSize} className="text-emerald-600 shrink-0" />
          <span className="text-[10px] font-bold">Copied</span>
        </>
      ) : (
        <>
          <Copy size={iconSize} className="text-slate-400 hover:text-slate-600 shrink-0" />
          <span className="sr-only sm:not-sr-only text-[10px] font-semibold">Copy</span>
        </>
      )}
    </button>
  );
}
