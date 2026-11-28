# Sourav Mahato · personal site

Astro + Three.js + GSAP + Lenis. Static site, deploys to GitHub Pages.

## Run locally

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
```

## Where things live

| What | File / folder |
|---|---|
| Name, email, links, status pill, nav | `src/lib/site.ts` |
| Research projects | `src/content/research/*.md` |
| Builds / hardware projects | `src/content/projects/*.md` |
| Photo albums (astro, photography, 3D printing) | `src/content/albums/*.md` |
| Notes / blog posts (Markdown or MDX, math with `$...$`) | `src/content/notes/` |
| Journey timeline | `src/content/timeline.json` |
| Publications, talks, fellowships | `src/content/publications.json` |
| Résumé PDF | `public/cv/Sourav-Mahato-Resume.pdf` |
| Colours, fonts, spacing | `src/styles/global.css` (tokens at the top) |
| Hero Moon/Ceres shader | `src/lib/globe.ts` |
| Play page toys (Hapke model, spectrum explorer) | `src/components/toys/` |

## Adding photos

1. Put the image in the matching folder, e.g. `src/assets/images/astrophotography/m42.jpg`.
2. In the album or project Markdown, add `src:` to the item (paths are relative to the `.md` file):

```yaml
items:
  - title: Orion Nebula (M42)
    src: ../../assets/images/astrophotography/m42.jpg
    ratio: portrait            # portrait | landscape | square
    meta: { Integration: "3 h", Exposure: "120 s × 90" }
```

For a project cover: `cover: ../../assets/images/projects/goniometer/cover.jpg`.
For the home-page portrait, replace the `<Media alt="Portrait..." />` in `src/pages/index.astro` with an imported image.

Astro resizes and compresses images automatically. Items without `src` show a styled placeholder.

## Deploy (GitHub Pages)

1. Create a repo named `mahatosourav00.github.io` (or any name; if it's not the user-site repo, set `base: '/<repo>'` in `astro.config.mjs`).
2. Push this folder to the `main` branch.
3. In the repo, go to Settings → Pages → Source and choose **GitHub Actions**. The workflow in `.github/workflows/deploy.yml` builds and publishes on every push.
4. Custom domain later: add it in Settings → Pages and update `site` in `astro.config.mjs`.
