import { useEffect, useState } from 'react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1').replace(/\/$/, '');

// Process-wide cache so two pages mounting the same content don't double-fetch.
// Short TTL so admin edits surface on the public site within a few seconds.
const cache = new Map(); // page -> { ts, content }
const TTL = 10_000;

async function fetchContent(page) {
  const now = Date.now();
  const hit = cache.get(page);
  if (hit && now - hit.ts < TTL) return hit.content;

  try {
    const r = await fetch(`${API_URL}/content/${encodeURIComponent(page)}`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const j = await r.json();
    cache.set(page, { ts: now, content: j.content || {} });
    return j.content || {};
  } catch {
    return {};
  }
}

/**
 * Fetch CMS overrides for a page and merge with hardcoded defaults.
 * Returns the same shape as `defaults` so component code stays simple:
 *   const t = useSiteContent('home', { hero_title: 'Default' });
 *   <h1>{t.hero_title}</h1>
 */
export function useSiteContent(page, defaults = {}) {
  const [content, setContent] = useState(() => ({ ...defaults }));

  useEffect(() => {
    let cancelled = false;
    fetchContent(page).then((cms) => {
      if (cancelled) return;
      // Only override defaults when the CMS actually has a non-empty value.
      const merged = { ...defaults };
      for (const [k, v] of Object.entries(cms)) {
        if (v != null && v !== '') merged[k] = v;
      }
      setContent(merged);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return content;
}

// Manually invalidate cache (used after admin saves a content block in dev).
export function clearSiteContentCache() {
  cache.clear();
}
