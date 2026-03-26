import { useEffect } from 'react';

const ensureMeta = (name, attr = 'name') => {
  let tag = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  return tag;
};

const ensureCanonical = () => {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  return link;
};

const ensureJsonLdScript = (id) => {
  let script = document.head.querySelector(`script[data-seo-jsonld="${id}"]`);
  if (!script) {
    script = document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('data-seo-jsonld', id);
    document.head.appendChild(script);
  }
  return script;
};

export function useSeo({ title, description, image, path, structuredData, structuredDataId = 'page' }) {
  useEffect(() => {
    if (title) document.title = title;
    if (description) ensureMeta('description').setAttribute('content', description);

    const canonicalPath = path || window.location.pathname;
    const canonicalUrl = `${window.location.origin}${canonicalPath}`;
    ensureCanonical().setAttribute('href', canonicalUrl);

    ensureMeta('og:title', 'property').setAttribute('content', title || document.title);
    ensureMeta('og:description', 'property').setAttribute('content', description || '');
    ensureMeta('og:type', 'property').setAttribute('content', 'website');
    ensureMeta('og:url', 'property').setAttribute('content', canonicalUrl);
    if (image) ensureMeta('og:image', 'property').setAttribute('content', image);

    if (structuredData && typeof structuredData === 'object') {
      const script = ensureJsonLdScript(structuredDataId);
      script.textContent = JSON.stringify(structuredData);
    }

    return () => {
      if (!structuredData) return;
      const script = document.head.querySelector(`script[data-seo-jsonld="${structuredDataId}"]`);
      script?.remove();
    };
  }, [title, description, image, path, structuredData, structuredDataId]);
}
