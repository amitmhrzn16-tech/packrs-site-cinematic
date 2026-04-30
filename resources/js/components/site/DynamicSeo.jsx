import { useEffect } from 'react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1').replace(/\/$/, '');

/**
 * Pulls SeoSetting for the given page slug and applies it to <head> via direct
 * DOM mutation. No external dep; React StrictMode-safe (idempotent updates).
 *
 * Falls back to the values supplied as props if the CMS row is absent.
 */
export default function DynamicSeo({
  page,
  title: defaultTitle,
  description: defaultDescription,
  image: defaultImage,
}) {
  useEffect(() => {
    const apply = (seo = {}) => {
      const title       = seo.meta_title       || defaultTitle;
      const description = seo.meta_description || defaultDescription;
      const ogTitle     = seo.og_title         || title;
      const ogDesc      = seo.og_description   || description;
      const ogImage     = seo.og_image         || defaultImage;
      const ogType      = seo.og_type          || 'website';
      const tCard       = seo.twitter_card     || 'summary_large_image';
      const canonical   = seo.canonical_url    || (typeof window !== 'undefined' ? window.location.href : '');
      const robots = [
        seo.robots_index === false ? 'noindex' : 'index',
        seo.robots_follow === false ? 'nofollow' : 'follow',
      ].join(',');

      if (title) document.title = title;
      setMeta('name',     'description',     description);
      setMeta('name',     'robots',          robots);
      setMeta('name',     'keywords',        Array.isArray(seo.keywords) ? seo.keywords.join(', ') : null);
      setMeta('property', 'og:title',        ogTitle);
      setMeta('property', 'og:description',  ogDesc);
      setMeta('property', 'og:image',        ogImage);
      setMeta('property', 'og:type',         ogType);
      setMeta('property', 'og:url',          canonical);
      setMeta('name',     'twitter:card',    tCard);
      setMeta('name',     'twitter:title',   ogTitle);
      setMeta('name',     'twitter:description', ogDesc);
      setMeta('name',     'twitter:image',   ogImage);
      setLink('canonical', canonical);
    };

    // Apply defaults first so the page never shows the previous route's title.
    apply({});

    fetch(`${API_URL}/seo/${encodeURIComponent(page)}`)
      .then((r) => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then((j) => apply(j.seo || {}))
      .catch(() => {});
  }, [page, defaultTitle, defaultDescription, defaultImage]);

  return null;
}

function setMeta(attr, key, value) {
  if (!value) {
    document.head.querySelector(`meta[${attr}="${key}"]`)?.remove();
    return;
  }
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

function setLink(rel, href) {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}
