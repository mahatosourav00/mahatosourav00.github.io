---
title: "IoT smart lighting"
kind: "Independent"
year: "2022–25"
order: 8
featured: false
summary: "ESP32 and WLED ambient TV lighting and smart lamps with real-time audio visualization, integrated with Home Assistant."
tags: ["ESP32", "WLED", "Home Assistant"]
specs:
  - { k: "MCU", v: "ESP32" }
  - { k: "Firmware", v: "WLED" }
  - { k: "LEDs", v: "Addressable RGB strips" }
  - { k: "Integration", v: "Home Assistant" }
  - { k: "Extras", v: "Audio-reactive" }
cover: ../../assets/images/projects/iot-lighting/desk-setup.jpg
gallery:
  - { src: ../../assets/images/projects/iot-lighting/desk-setup.jpg, caption: "Ambient TV light and a lamp on my desk", group: "Ambilight" }
  - { src: ../../assets/images/projects/iot-lighting/v-ambilight.jpg, video: /videos/iot/ambilight.mp4, caption: "The wall behind the screen follows the picture", group: "Ambilight" }
  - { src: ../../assets/images/projects/iot-lighting/v-skyline-lamp.jpg, video: /videos/iot/skyline-lamp.mp4, caption: "Running colour effects", group: "Skyline lamp" }
  - { src: ../../assets/images/projects/iot-lighting/skyline-lamp.jpg, caption: "Printed white towers on an orange base", group: "Skyline lamp" }
  - { src: ../../assets/images/projects/iot-lighting/skyline-strips.jpg, caption: "Four LED strips in the printed tray", group: "Skyline lamp" }
  - { src: ../../assets/images/projects/iot-lighting/v-cylinder-lamp.jpg, video: /videos/iot/cylinder-lamp.mp4, caption: "Gradient effect", group: "Cylinder lamp" }
  - { src: ../../assets/images/projects/iot-lighting/cylinder-lamp-glow.jpg, caption: "First prototype on the bench", group: "Cylinder lamp" }
  - { src: ../../assets/images/projects/iot-lighting/cylinder-lamp-core.jpg, caption: "The LED core wrapped in strips", group: "Cylinder lamp" }
  - { src: ../../assets/images/projects/iot-lighting/v-app-control.jpg, video: /videos/iot/app-control.mp4, caption: "Changing effects live from the phone", group: "Early tests & phone control" }
  - { src: ../../assets/images/projects/iot-lighting/v-led-ring.jpg, video: /videos/iot/led-ring.mp4, caption: "A ring of addressable LEDs", group: "Early tests & phone control" }
---

Wi-Fi ambient TV lighting (a DIY Ambilight alternative) and smart lamps built on **ESP32 + WLED**, with real-time audio visualization and **Home Assistant** integration.

## How it started

In late 2022 I began with a strip of addressable LEDs on the bench: first chasing colours along a desk, then wrapped into a ring and a long smart tube. The firmware is **WLED** on an **ESP32**, so every effect, palette and brightness setting can be changed from a phone or from Home Assistant, with no re-flashing.

## The builds

- **Ambilight.** LEDs behind the monitor that follow the colours on screen and spill them onto the wall, which makes the screen look bigger and easier on the eyes at night.
- **Skyline lamp.** Four strips sit in a printed tray under a cluster of white printed towers of different heights. They light up as a city skyline and react to music.
- **Cylinder lamp.** A tall column of LED strips inside a printed diffuser shell. Its colour gradients look like a smooth rainbow with no visible dots.
- **Audio-reactive mode.** The lamps pulse and sweep with whatever is playing.

## What I learned

Light diffusion matters as much as the electronics: wall thickness, print colour and the distance between LEDs and shell decide whether you see a smooth glow or a row of dots.
