'use client';
import { useState } from 'react';
import type { Insight, Topic } from '@/content/types';
import type { Locale } from '@/lib/i18n';
import { PostCard } from './PostCard';

export default function InsightsGrid({ lang, posts, topics, minRead }: {
  lang: Locale; posts: Insight[]; topics: Record<Topic | 'all', string>; minRead: string;
}) {
  const [filter, setFilter] = useState<Topic | 'all'>('all');
  const keys: (Topic | 'all')[] = ['all', 'visibility', 'conversion', 'strategy'];
  return (
    <>
      <div className="filters" role="group">
        {keys.map(k => (
          <button key={k} type="button" className={`chip${filter === k ? ' is-on' : ''}`} aria-pressed={filter === k} onClick={() => setFilter(k)}>{topics[k]}</button>
        ))}
      </div>
      <div className="posts">
        {posts.filter(p => filter === 'all' || p.topic === filter).map(a => (
          <PostCard key={a.slug} lang={lang} a={a} topicLabel={topics[a.topic]} minRead={minRead} />
        ))}
      </div>
    </>
  );
}
