import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getNotes } from '../lib/notes';
import { site } from '../lib/site';

// Feed of published notes (drafts are left out by getNotes on the live site).
export async function GET(context: APIContext) {
  const notes = await getNotes();
  return rss({
    title: `${site.name} · Notes`,
    description: 'Stories, build logs, planetary-science explainers and how-tos.',
    site: context.site!,
    items: notes.map((n) => ({
      title: n.data.title,
      description: n.data.description,
      pubDate: n.data.date,
      link: `/notes/${n.id}/`,
      categories: [n.data.series, ...n.data.tags],
    })),
    customData: '<language>en-in</language>',
  });
}
