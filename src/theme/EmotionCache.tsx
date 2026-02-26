'use client';

import { useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';

export default function EmotionCacheProvider({ children }: { children: React.ReactNode }) {
  const [registry] = useState(() => {
    const cache = createCache({ key: 'mui' });
    cache.compat = true;
    const prevInsert = cache.insert;
    let inserted: { name: string; isGlobal: boolean }[] = [];
    cache.insert = (...args) => {
      const [selector, serialized] = args;
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push({ name: serialized.name, isGlobal: !selector });
      }
      return prevInsert(...args);
    };
    const flush = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };
    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = registry.flush();
    if (names.length === 0) return null;
    let styles = '';
    let globalStyles = '';
    for (const { name, isGlobal } of names) {
      const style = registry.cache.inserted[name];
      if (typeof style === 'string') {
        if (isGlobal) {
          globalStyles += style;
        } else {
          styles += `.${registry.cache.key}-${name}{${style}}`;
        }
      }
    }
    return (
      <>
        {globalStyles && (
          <style
            key="emotion-global"
            data-emotion={`${registry.cache.key}-global`}
            dangerouslySetInnerHTML={{ __html: globalStyles }}
          />
        )}
        {styles && (
          <style
            key="emotion-css"
            data-emotion={registry.cache.key}
            dangerouslySetInnerHTML={{ __html: styles }}
          />
        )}
      </>
    );
  });

  return <CacheProvider value={registry.cache}>{children}</CacheProvider>;
}
