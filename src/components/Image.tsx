import React, { ImgHTMLAttributes } from 'react';
import { generateSrcSet } from '../utils/imageOptimization';

interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  src: string;
  alt: string;
  sizes?: string;
  preload?: boolean;
}

export function Image({ src, alt, sizes, preload = false, ...props }: ImageProps) {
  return (
    <div dangerouslySetInnerHTML={{ 
      __html: generateSrcSet(src, alt, sizes)
    }} />
  );
}