import { useEffect, useState } from 'react';
import { getHomeContent, getInitialHomeContent } from '../services/homeService';
import type { HomeContent } from '../services/homeService';

/**
 * Home page data. Returns something renderable on the very first frame (spec copy, plus the demo
 * catalog when Shopify isn't connected), then swaps in the live Shopify content when it arrives.
 * `loading` is true only while that request is in flight — use it for skeletons, not for blanking the page.
 */
export function useHomeContent(): { content: HomeContent; loading: boolean } {
  const [content, setContent] = useState<HomeContent>(getInitialHomeContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getHomeContent().then((next) => {
      if (cancelled) return;
      setContent(next);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { content, loading };
}