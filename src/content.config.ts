import { defineCollection } from 'astro:content';
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
      kind: z.enum(['Research instrument', 'Independent', 'Club / Team', 'Outreach', 'Academic']),
      year: z.string(),
      order: z.number(),
      summary: z.string(),
      tags: z.array(z.string()).default([]),
      featured: z.boolean().default(false),
      specs: z.array(z.object({ k: z.string(), v: z.string() })).default([]),
      cover: image().optional(),
      // `video` is a path under /public (e.g. /videos/iot/ambilight.mp4); `src` then acts as its poster frame.
      // `group` becomes a small heading above the tiles that share it (keep groups to 2-4 tiles).
      gallery: z.array(z.object({ src: image().optional(), video: z.string().optional(), caption: z.string(), group: z.string().optional() })).default([]),
      // Optional downloadable write-up (path under /public)
      report: z.object({ href: z.string(), label: z.string() }).optional(),
    }),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
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
    venue: z.string(),
    year: z.string(),
    type: z.enum(['paper', 'talk', 'workshop', 'fellowship']),
    url: z.string().optional(),
  }),
});

export const collections = { research, projects, notes, albums, timeline, publications };
