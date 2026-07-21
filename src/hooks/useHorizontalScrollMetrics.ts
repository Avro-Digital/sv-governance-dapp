// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/sv/frontend/src/hooks/useHorizontalScrollMetrics.ts
// at canton-network/splice main (July 2026 governance redesign). Original: Apache 2.0 (c) Digital Asset

import { useLayoutEffect, useState, type RefObject } from 'react';

export interface ScrollMetrics {
  readonly canScroll: boolean;
  readonly thumbWidthPercent: number;
  readonly thumbLeftPercent: number;
}

const emptyMetrics: ScrollMetrics = {
  canScroll: false,
  thumbWidthPercent: 100,
  thumbLeftPercent: 0,
};

export function computeScrollMetrics(el: HTMLElement): ScrollMetrics {
  const { scrollLeft, scrollWidth, clientWidth } = el;
  if (scrollWidth <= clientWidth + 1) {
    return emptyMetrics;
  }

  const thumbWidthPercent = Math.max((clientWidth / scrollWidth) * 100, 8);
  const maxLeft = 100 - thumbWidthPercent;
  const scrollableDistance = scrollWidth - clientWidth;
  const thumbLeftPercent = scrollableDistance > 0 ? (scrollLeft / scrollableDistance) * maxLeft : 0;

  return { canScroll: true, thumbWidthPercent, thumbLeftPercent };
}

export function useHorizontalScrollMetrics(
  scrollRef: RefObject<HTMLElement | null>,
  deps: readonly unknown[] = [],
): ScrollMetrics {
  const [metrics, setMetrics] = useState<ScrollMetrics>(emptyMetrics);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el === null) {
      return undefined;
    }

    const update = () => {
      setMetrics(computeScrollMetrics(el));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    el.addEventListener('scroll', update, { passive: true });

    return () => {
      observer.disconnect();
      el.removeEventListener('scroll', update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return metrics;
}
