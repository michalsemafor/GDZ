import React from 'react';
import { SignData } from '../types/signs';

interface SignSvgPreviewProps {
  sign: SignData;
  className?: string;
  maxHeight?: number | string;
}

export const SignSvgPreview: React.FC<SignSvgPreviewProps> = ({
  sign,
  className = '',
  maxHeight = '100%'
}) => {
  // If we have raw SVG content, sanitize and inject it
  const rawSvg = sign.customSvgContent || sign.svgContent;

  if (rawSvg) {
    return (
      <div
        className={`flex items-center justify-center select-none ${className}`}
        style={{ maxHeight }}
        dangerouslySetInnerHTML={{ __html: rawSvg }}
      />
    );
  }

  // Fallback to static SVG path
  return (
    <img
      src={`./signs/${sign.code}.svg`}
      alt={sign.name}
      className={`object-contain select-none pointer-events-none ${className}`}
      style={{ maxHeight }}
      loading="lazy"
    />
  );
};
