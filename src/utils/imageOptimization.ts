interface ImageConfig {
  sizes: number[];
  formats: ('webp' | 'avif' | 'png' | 'jpg')[];
  quality: number;
  breakpoints: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

export const imageConfig: ImageConfig = {
  sizes: [320, 640, 768, 1024, 1280, 1536],
  formats: ['webp', 'avif', 'jpg'],
  quality: 80,
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280
  }
};

export function generateSrcSet(
  basePath: string,
  alt: string,
  sizes?: string
): string {
  const srcSet = imageConfig.sizes
    .map(size => `${basePath}-${size}.webp ${size}w`)
    .join(', ');

  return `
    <picture>
      ${imageConfig.formats.map(format => `
        <source
          type="image/${format}"
          srcset="${basePath}-${format}.${format}"
          sizes="${sizes || '100vw'}"
        />
      `).join('\n')}
      <img
        src="${basePath}.jpg"
        srcset="${srcSet}"
        sizes="${sizes || '100vw'}"
        alt="${alt}"
        loading="lazy"
        decoding="async"
      />
    </picture>
  `;
}

export function preloadCriticalImages(images: string[]) {
  images.forEach(image => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = image;
    document.head.appendChild(link);
  });
}