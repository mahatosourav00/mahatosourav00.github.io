import { defineCollection, reference } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const research = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/research' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      short: z.string(),
      role: z.string(),
      org: z.string(),
      period: z.string(),
      order: z.number(),
      summary: z.string(),
      tags: z.array(z.string()).default([]),
      featured: z.boolean().default(false),
      cover: image().optional(),
      mission: z.string().optional(),
    }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      kind: z.enum(['Research instrument', 'Independent', 'Club / Team', 'Outreach', 'Academic', 'Software']),
      year: z.string(),
      order: z.number(),
      summary: z.string(),
      tags: z.array(z.string()).default([]),
      featured: z.boolean().default(false),
      specs: z.array(z.object({ k: z.string(), v: z.string() })).default([]),
      cover: image().optional(),
      // Crop focus for the 4:5 build card (CSS object-position), e.g. "30% center" keeps the left-of-centre part of a wide photo.
      coverFocus: z.string().optional(),
      // `video` is a path under /public (e.g. /videos/iot/ambilight.mp4); `src` then acts as its poster frame.
      // `group` becomes a small heading above the tiles that share it (keep groups to 2-4 tiles).
      gallery: z.array(z.object({ src: image().optional(), video: z.string().optional(), caption: z.string(), group: z.string().optional() })).default([]),
      // 'in-progress' shows a badge on the card and a Status line on the page.
      status: z.enum(['done', 'in-progress']).default('done'),
      // Two or three headline facts for the typographic card used when there's no cover photo,
      // e.g. { v: "41", k: "music-reactive effects" }. Falls back to the first spec lines.
      facts: z.array(z.object({ v: z.string(), k: z.string() })).max(3).default([]),
      // Action buttons under the title, e.g. "Try it", "Download", "Source". The first is drawn as the primary button.
      links: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
      // Optional downloadable write-up (path under /public)
      report: z.object({ href: z.string(), label: z.string() }).optional(),
    }),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notes' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    // Story: personal · Build log: behind a build · Explainer: science for non-experts · How-to: steps to follow · This site: building this website
    series: z.enum(['Story', 'Build log', 'Explainer', 'How-to', 'This site']),
    cover: image().optional(),
    tags: z.array(z.string()).default([]),
    // Pinned notes sit in a 'Start here' card above the list on the Notes page.
    pinned: z.boolean().default(false),
    // Drafts show only in `astro dev` (and SHOW_DRAFTS=1 builds), with a Draft badge.
    draft: z.boolean().default(false),
    // Builds this note is about (ids from src/content/projects). The build page links back automatically.
    builds: z.array(reference('projects')).default([]),
  }),
});

const albums = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/albums' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      kicker: z.string(),
      parent: z.string().optional(),
      order: z.number(),
      intro: z.string(),
      cover: image().optional(),
      gear: z.array(z.string()).default([]),
      items: z
        .array(
          z.object({
            src: image().optional(),
            video: z.string().optional(), // path under /public; `src` is then the poster frame
            title: z.string(),
            caption: z.string().optional(),
            ratio: z.enum(['portrait', 'landscape', 'square']).default('landscape'),
            meta: z.record(z.string(), z.string()).default({}),
          }),
        )
        .default([]),
    }),
});

// The making chain: how each build, tool and hobby grew out of the ones before it.
// Shown as a thread on the Hobbies page; build pages read their "Lineage" card from here.
const making = defineCollection({
  loader: file('./src/content/making.json'),
  schema: z.object({
    order: z.number(),
    year: z.string().optional(),
    kind: z.enum(['build', 'tool', 'hobby', 'research']),
    title: z.string(),
    short: z.string(), // name used in links, e.g. "FPV drone"
    // [column, row] on the Hobbies-page map (row 1 is the main line). Placed by hand so lines don't cross.
    map: z.tuple([z.number(), z.number()]),
    text: z.string(),
    project: reference('projects').optional(),
    album: reference('albums').optional(),
    research: reference('research').optional(),
    note: reference('notes').optional(), // the long read about this step, linked as 'Read the story'
    learned: z.array(z.string()).default([]),
    // Earlier steps this one grew out of (ids in this file), and what carried over.
    // onMap: false hides a long-range link on the map (it still shows in the full story).
    from: z.array(z.object({ id: z.string(), via: z.string(), onMap: z.boolean().default(true) })).default([]),
  }),
});

const timeline = defineCollection({
  loader: file('./src/content/timeline.json'),
  schema: z.object({
    order: z.number(),
    year: z.string(),
    title: z.string(),
    place: z.string(),
    text: z.string(),
    kind: z.enum(['education', 'research', 'award', 'milestone']),
  }),
});

const publications = defineCollection({
  loader: file('./src/content/publications.json'),
  schema: z.object({
    title: z.string(),
    authors: z.string(),
    // Journal or event. Leave out for papers that don't have a journal yet.
    venue: z.string().optional(),
    year: z.string(),
    type: z.enum(['paper', 'talk', 'workshop', 'fellowship']),
    // Papers only: where the manuscript stands. Shown as a badge.
    status: z.enum(['in-preparation', 'submitted', 'in-review', 'accepted', 'published']).optional(),
    url: z.string().optional(),
  }),
});

export const collections = { research, projects, notes, albums, making, timeline, publications };
