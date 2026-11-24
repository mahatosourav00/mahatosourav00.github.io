// The Hobbies page opens with these tiles: one best frame from each world.
// The first tile is the big one. Swap a tile by changing its import and link.
import type { ImageMetadata } from 'astro';
import fpvPoster from '../assets/images/fpv-cinematics/campus-flyover.jpg';
import orion from '../assets/images/astrophotography/orion-nebula-m42.jpg';
import fpvBuild from '../assets/images/projects/fpv-drone/lineup.jpg';
import moonLamp from '../assets/images/3d-printing/lithophane-moon-lit.jpg';
import chhau from '../assets/images/festivals-and-rituals/chhau-pink-headdress.jpg';
import tracker from '../assets/images/projects/astro-tracker/goto-night.jpg';
import mosaic from '../assets/images/projects/mosaic-studio/v-vermeer-fireworks.jpg';

export interface Tile {
  img: ImageMetadata;
  video?: string; // path under /public; plays muted while on screen
  label: string; // the world it belongs to
  title: string;
  href: string;
}

export const showreel: Tile[] = [
  { img: fpvPoster, video: '/videos/fpv/campus-flyover.mp4', label: 'FPV cinematics', title: 'Flying low over campus', href: '/hobbies/fpv-cinematics' },
  { img: orion, label: 'Astrophotography', title: 'Orion Nebula (M42)', href: '/hobbies/astrophotography' },
  { img: fpvBuild, label: 'Build', title: 'My scratch-built FPV drone', href: '/projects/fpv-drone' },
  { img: moonLamp, label: '3D printing', title: 'A printed Moon lamp', href: '/hobbies/3d-printing/lithophanes' },
  { img: chhau, label: 'Photography', title: 'Chhau dancer', href: '/hobbies/photography/festivals-and-rituals' },
  { img: tracker, label: 'Build', title: 'My astro-tracker at night', href: '/projects/astro-tracker' },
  { img: mosaic, video: '/videos/mosaic-studio/vermeer-fireworks.mp4', label: 'App', title: 'Photos that build a painting', href: '/projects/mosaic-studio' },
];
