'use client';

import { useEffect } from 'react';

export default function SolutionsSnapScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)');
    if (mq.matches) {
      document.body.classList.add('home-snap-scroll');
    }
    return () => {
      document.body.classList.remove('home-snap-scroll');
    };
  }, []);

  return <>{children}</>;
}
