import { getCollection, type CollectionEntry } from 'astro:content';

export type Step = CollectionEntry<'making'> & { href?: string; image?: ImageMetadata; label: string };

/** The making chain in order, with each step's link, thumbnail and display label resolved. */
export async function getMaking(): Promise<Step[]> {
  const [steps, projects, albums, research] = await Promise.all([getCollection('making'), getCollection('projects'), getCollection('albums'), getCollection('research')]);
  const ids = new Set(steps.map((s) => s.id));
  for (const s of steps) {
    for (const f of s.data.from) if (!ids.has(f.id)) throw new Error(`making.json: step "${s.id}" grows from unknown step "${f.id}"`);
  }
  return steps
    .sort((a, b) => a.data.order - b.data.order)
    .map((s) => {
      const p = s.data.project && projects.find((x) => x.id === s.data.project!.id);
      const a = s.data.album && albums.find((x) => x.id === s.data.album!.id);
      const r = s.data.research && research.find((x) => x.id === s.data.research!.id);
      const href = p ? `/projects/${p.id}` : r ? `/research/${r.id}` : a ? (a.data.parent ? `/hobbies/${a.data.parent}/${a.id}` : `/hobbies/${a.id}`) : undefined;
      const image = p ? p.data.cover : r ? r.data.cover : a ? (a.data.cover ?? a.data.items.find((i) => i.src)?.src) : undefined;
      const label = p ? p.data.title : r ? r.data.title : a ? a.data.title : s.data.title;
      return Object.assign(s, { href, image, label });
    });
}
