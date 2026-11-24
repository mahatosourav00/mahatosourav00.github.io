import { getCollection, type CollectionEntry } from 'astro:content';

// Drafts are visible in `astro dev` and in builds made with SHOW_DRAFTS=1 (for review), never on the live site.
export const showDrafts = import.meta.env.DEV || process.env.SHOW_DRAFTS === '1';

export const SERIES = ['Story', 'Build log', 'Explainer', 'How-to', 'This site'] as const;

/** Notes that should appear on this build, newest first; notes from the same day in title order. */
export async function getNotes(filter: (n: CollectionEntry<'notes'>) => boolean = () => true) {
  const notes = await getCollection('notes', (n) => (showDrafts || !n.data.draft) && filter(n));
  return notes.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf() || a.data.title.localeCompare(b.data.title));
}
