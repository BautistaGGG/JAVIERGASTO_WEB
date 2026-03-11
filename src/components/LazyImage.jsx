import { useState, useRef, useEffect } from 'react';

/**
 * LazyImage — Renders <img> with loading="lazy" + fade-in on load.
 * Also uses IntersectionObserver to only set src when near viewport.
 */
export default function LazyImage({ src, alt, className = '', fallbackText = '', ...props }) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    // If IntersectionObserver is not supported, show immediately
    if (!('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const fallback = fallbackText
    ? `https://placehold.co/400x300/1e40af/ffffff?text=${encodeURIComponent(fallbackText)}`
    : `https://placehold.co/400x300/1e40af/ffffff?text=IP`;

  return (
    <div ref={imgRef} className="relative w-full h-full">
      {/* Placeholder shimmer shown while image loads */}
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 rounded">
          <div className="absolute inset-0 skeleton-shimmer rounded" />
        </div>
      )}
      {inView && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={`${className} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          onError={(e) => {
            e.target.src = fallback;
            setLoaded(true);
          }}
          {...props}
        />
      )}
    </div>
  );
}
