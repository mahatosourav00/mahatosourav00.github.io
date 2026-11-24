---
title: "Motorized goniometer"
kind: "Research instrument"
year: "2026"
order: 1
featured: true
status: "in-progress"
facts:
  - { v: "3 axes", k: "incidence · emission · azimuth" }
  - { v: "Chandrayaan-2", k: "IIRS photometric correction" }
summary: "A computer-controlled rig that measures how light scatters from a surface at any incidence, emission and azimuth angle."
tags: ["Stepper motors", "Python", "3D printing", "Optics"]
specs:
  - { k: "Axes", v: "Incidence · Emission · Azimuth" }
  - { k: "Control", v: "PC / Python" }
  - { k: "Purpose", v: "Lab-grounded photometric correction" }
  - { k: "Status", v: "In development" }
# Add photos: put files in src/assets/images/projects/goniometer/ and reference them, e.g.
# cover: ../../assets/images/projects/goniometer/cover.jpg
gallery:
  - { caption: "Mechanical layout" }   # add  src: ../../assets/images/projects/goniometer/xxx.jpg
  - { caption: "Detector arm" }   # add  src: ../../assets/images/projects/goniometer/xxx.jpg
  - { caption: "First light" }   # add  src: ../../assets/images/projects/goniometer/xxx.jpg
---

## Why build one

Photometric models such as Hapke's describe how a surface's brightness changes with lighting and viewing geometry. Those models need to be checked against reality. This goniometer lets me measure real samples (regolith simulants, powders, rough surfaces) across the full range of angles that orbiting spectrometers see.

## How it works

- Three motorized axes set the light source and detector positions independently.
- A Python controller sweeps through geometry grids and logs spectra automatically.
- Structural parts are 3D printed, which keeps the build cheap and easy to modify.

The data will feed directly into the Chandrayaan-2 IIRS photometric correction.
