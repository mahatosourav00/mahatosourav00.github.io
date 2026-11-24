---
title: "Mosaic Studio"
kind: "Software"
year: "2026"
order: 13
featured: true
summary: "Turn a pile of photos into one big picture made of tiny photos, then watch it build itself as a film. Free, private, and it runs in any browser, on a phone or a computer."
tags: ["Rust", "WebAssembly", "WebGPU", "Python", "OpenGL"]
specs:
  - { k: "Web app", v: "Rust + wgpu, compiled to WebAssembly" }
  - { k: "Graphics", v: "WebGPU, with WebGL2 fallback" }
  - { k: "Runs on", v: "Any modern browser; installs as an app and works offline" }
  - { k: "Windows app", v: "Python, PySide6, OpenCV, OpenGL, FFmpeg" }
  - { k: "Animations", v: "Swarm, Vortex, Wave, Zoom" }
  - { k: "Video out", v: "MP4 (H.264 / H.265), WebM or GIF, 720p to 4K (Windows app)" }
  - { k: "Privacy", v: "Photos never leave your device" }
  - { k: "Price", v: "Free, open source" }
cover: ../../assets/images/projects/mosaic-studio/vermeer-fine.jpg
links:
  - { label: "Try it in your browser", href: "https://mahatosourav00.github.io/mosaic-studio-web/" }
  - { label: "Web app source", href: "https://github.com/mahatosourav00/mosaic-studio-web" }
  - { label: "Windows app", href: "https://github.com/mahatosourav00/mosaic-video" }
  - { label: "Birthday-film plugin", href: "https://github.com/mahatosourav00/mosaic-birthday-plugin" }
gallery:
  - { src: ../../assets/images/projects/mosaic-studio/v-vermeer-fireworks.jpg, video: /videos/mosaic-studio/vermeer-fireworks.mp4, caption: "Thousands of tiny photos fly in and become a painting", group: "It builds itself" }
  - { src: ../../assets/images/projects/mosaic-studio/v-vermeer-rain.jpg, video: /videos/mosaic-studio/vermeer-rain.mp4, caption: "The same mosaic, with a different look", group: "It builds itself" }
  - { src: ../../assets/images/projects/mosaic-studio/v-windows-vortex.jpg, video: /videos/mosaic-studio/windows-vortex.mp4, caption: "The Vortex style, from the Windows app", group: "It builds itself" }
  - { src: ../../assets/images/projects/mosaic-studio/vermeer-source.jpg, caption: "The main picture: Vermeer's Girl with a Pearl Earring", group: "One picture, different settings" }
  - { src: ../../assets/images/projects/mosaic-studio/vermeer-fine.jpg, caption: "Best quality: about 3,000 NASA photos plus small tiles", group: "One picture, different settings" }
  - { src: ../../assets/images/projects/mosaic-studio/vermeer-bw.jpg, caption: "Black and white: built from light and shade alone", group: "One picture, different settings" }
  - { src: ../../assets/images/projects/mosaic-studio/web-home.jpg, caption: "Home screen", group: "The web app, on a phone" }
  - { src: ../../assets/images/projects/mosaic-studio/web-prepare.jpg, caption: "Preparing the photos", group: "The web app, on a phone" }
  - { src: ../../assets/images/projects/mosaic-studio/web-design.jpg, caption: "Designing the mosaic", group: "The web app, on a phone" }
  - { src: ../../assets/images/projects/mosaic-studio/windows-home.png, caption: "Home screen, with a plugin under 'Made for a purpose'", group: "The Windows app" }
  - { src: ../../assets/images/projects/mosaic-studio/windows-design-video.png, caption: "Designing the animation", group: "The Windows app" }
  - { src: ../../assets/images/projects/mosaic-studio/windows-plugin-form.png, caption: "The birthday-film plugin's form", group: "The Windows app" }
---

## Why I made it

A mosaic of a friend, made from hundreds of photos of them, is one of the most personal gifts I can think of. For still mosaics there are one or two good free Windows programs ([AndreaMosaic](https://www.andreaplanet.com/andreamosaic/) is really good). But a **video** of the mosaic assembling itself was a different story: the websites that make one charge a hefty price and offer only a few fixed animations. So I built my own, with as many settings as I wanted.

## From Windows to everywhere

The first version was a **Windows app** in Python, with OpenCV for the mosaic and OpenGL for the animation. It worked, but not everyone uses a PC. So I rebuilt it as a **web app**, and moved development there completely. The engine is now written in **Rust** and compiled to **WebAssembly**, drawing with **WebGPU** (WebGL2 on older devices). It installs like a normal app, works offline, and anyone can use it on any system, without downloading anything and for free. The photos never leave the device.

## How it works

Pick your photos (they become the tiles) and one main picture. The app compares the colours of every photo with every patch of the main picture and places the best match in each spot, avoiding repeats. Every option has a **?** button that explains it in plain words. Turn on the animation, and you get a film of the mosaic building itself: the tiles fly, swirl or rain into place.

## The birthday film

The Windows app takes plugins: ready-made flows for one purpose. The first is a **birthday film**. The person's name draws itself as a gold constellation, their photos gather into a mosaic portrait, your message plays over it with framed photos lifting out, and it ends on "Happy Birthday". Music throughout.

*The sample mosaics are made from public-domain NASA photos and Vermeer's* Girl with a Pearl Earring *(c. 1665, public domain).*
