---
title: "Automated GoTo astro-tracker"
kind: "Independent"
year: "2025"
order: 3
featured: true
summary: "A 3D-printed, PC-controlled equatorial mount with auto polar alignment and guide-camera error correction for long exposures."
tags: ["Astrophotography", "3D printing", "Stepper control", "Autoguiding"]
specs:
  - { k: "Mount", v: "Equatorial, 3D-printed" }
  - { k: "Control", v: "PC GoTo" }
  - { k: "Alignment", v: "Auto polar calibration" }
  - { k: "Guiding", v: "Secondary guide-scope camera" }
# Add photos: put files in src/assets/images/projects/astro-tracker/ and reference them, e.g.
# cover: ../../assets/images/projects/astro-tracker/cover.jpg
gallery:
  - { caption: "Mount assembly" }   # add  src: ../../assets/images/projects/astro-tracker/xxx.jpg
  - { caption: "Guide scope" }   # add  src: ../../assets/images/projects/astro-tracker/xxx.jpg
  - { caption: "Tracked exposure" }   # add  src: ../../assets/images/projects/astro-tracker/xxx.jpg
---

## Why

Long-exposure astrophotography needs a mount that cancels Earth's rotation precisely. Good ones are expensive, so I built my own.

## Features

- **3D-printed equatorial mount** driven from a PC, with GoTo slewing to targets.
- **Auto polar calibration** to align the mount with the celestial pole.
- A **secondary guide-scope camera** that measures tracking drift and corrects it in real time during long exposures.

Some of the photos in my [astrophotography gallery](/hobbies/astrophotography) were taken on this mount.
