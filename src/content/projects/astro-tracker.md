---
title: "Automated GoTo astro-tracker"
kind: "Independent"
year: "2025"
order: 3
featured: true
summary: "A 3D-printed, PC-controlled equatorial mount with auto polar alignment and guide-camera error correction for long exposures."
tags: ["Astrophotography", "3D printing", "Stepper control", "Autoguiding"]
specs:
  - { k: "Based on", v: "OpenAstroTracker" }
  - { k: "Mount", v: "Equatorial, 3D-printed" }
  - { k: "Control", v: "PC GoTo + LCD hand controller" }
  - { k: "Alignment", v: "Auto polar calibration" }
  - { k: "Guiding", v: "Secondary guide-scope camera" }
  - { k: "Also built", v: "RA-axis star tracker (OG Star Tracker)" }
cover: ../../assets/images/projects/astro-tracker/goto-tracker.jpg
gallery:
  - { src: ../../assets/images/projects/astro-tracker/v-goto-test.jpg, video: /videos/astro-tracker/goto-test.mp4, caption: "GoTo test: the PC drives the mount", group: "GoTo tracker" }
  - { src: ../../assets/images/projects/astro-tracker/goto-front.jpg, caption: "Front view with the LCD hand controller", group: "GoTo tracker" }
  - { src: ../../assets/images/projects/astro-tracker/goto-night.jpg, caption: "Out under the night sky with a telephoto lens", group: "GoTo tracker" }
  - { src: ../../assets/images/projects/astro-tracker/sky-tracker-early.jpg, caption: "First version, on a camera tripod (Feb 2025)", group: "RA-axis star tracker" }
  - { src: ../../assets/images/projects/astro-tracker/sky-tracker-a.jpg, caption: "Driver board on perfboard", group: "RA-axis star tracker" }
---

## Why

Long-exposure astrophotography needs a mount that cancels Earth's rotation precisely. Good ones are expensive, so I built my own, based on the open-source [OpenAstroTracker](https://openastrotech.com) design.

## Features

- **3D-printed equatorial mount** driven from a PC, with GoTo slewing to targets. The two curved arcs and gears are printed, and a small LCD hand controller shows the mount's coordinates in the field.
- **Auto polar calibration** to align the mount with the celestial pole.
- A **secondary guide-scope camera** that measures tracking drift and corrects it in real time during long exposures.

## Two trackers, two jobs

Before the GoTo mount, I built a simpler **RA-axis star tracker** based on the OG Star Tracker. It has one motorized axis that turns at the sidereal rate. It is light, quick to set up and enough for wide-field shots such as the Milky Way. The GoTo mount adds a second axis, a PC and a guide camera, so it can point at a chosen object and hold it for longer exposures with a telephoto lens.

The photos in my [astrophotography gallery](/hobbies/astrophotography) were taken with a Canon R10 and a 55–250 mm lens on one of these two trackers.
