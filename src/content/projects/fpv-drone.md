---
title: "High-performance custom FPV system"
kind: "Independent"
year: "2019 – now"
order: 4
featured: true
summary: "A scratch-built FPV drone with a 6:1 power-to-weight ratio, digital low-latency video and a 30 km+ radio link."
tags: ["Drones", "RF", "OpenTX", "Embedded"]
specs:
  - { k: "Power : weight", v: "6 : 1" }
  - { k: "Video", v: "Digital, low latency" }
  - { k: "Radio range", v: "30 km+" }
  - { k: "Camera", v: "De-cased \"naked\" GoPro, board-powered" }
  - { k: "Printed parts", v: "Camera mount, arm guards, Li-ion module" }
cover: ../../assets/images/projects/fpv-drone/lineup.jpg
gallery:
  - { src: ../../assets/images/projects/fpv-drone/lineup.jpg, caption: "The current quad with its radio and digital goggles", group: "The setup" }
  - { src: ../../assets/images/projects/fpv-drone/current-gopro.jpg, caption: "The naked GoPro on its printed mount", group: "The quad today" }
  - { src: ../../assets/images/projects/fpv-drone/current-front.jpg, caption: "Printed yellow camera cage and arm guards", group: "The quad today" }
  - { src: ../../assets/images/projects/fpv-drone/current-top.jpg, caption: "Top view: battery strap, ESC and XT60 lead", group: "The quad today" }
  - { src: ../../assets/images/projects/fpv-drone/build-2020-top.jpg, caption: "The first carbon-fibre build, mid-assembly", group: "Where it started (2020)" }
  - { src: ../../assets/images/projects/fpv-drone/build-2020-flightready.jpg, caption: "Flight-ready, with camera and green props", group: "Where it started (2020)" }
  - { src: ../../assets/images/projects/fpv-drone/radio-liion-module.jpg, caption: "Custom Li-ion module on the back of the radio", group: "Radio & goggles" }
  - { src: ../../assets/images/projects/fpv-drone/goggles-strap.jpg, caption: "Goggles with a printed head-strap mount", group: "Radio & goggles" }
  - { src: ../../assets/images/fpv-cinematics/ajodhya.jpg, video: /videos/fpv/ajodhya.mp4, caption: "Forest and hills at Ajodhya", group: "In the air" }
  - { src: ../../assets/images/fpv-cinematics/campus-flyover.jpg, video: /videos/fpv/campus-flyover.mp4, caption: "Campus flyover", group: "In the air" }
---

## How it started

An FPV drone had been a dream since I was a child. When I finally started in 2019, my only income was a ₹5,000-a-month scholarship. So I planned the whole build on paper first, then saved for months at a time to buy one part, and then the next. It first flew in 2020.

Building it taught me the FPV world from the inside: **Betaflight** and **INAV** flight firmware, **OpenTX** on the radio, **ExpressLRS** links and motor protocols. It has been upgraded ever since: analog video to digital, a basic camera to a GoPro and then a de-cased one, and a radio modded to run on Li-ion cells and take an external transmitter module.

## Build

- Scratch-built frame and power system reaching a **6:1 power-to-weight ratio**.
- **Digital low-latency** video transmission.
- A **30 km+ long-range radio link**.
- A **"naked" GoPro**, stripped of its case and powered straight from the flight board to save weight.

## Radio & power

- Radio controllers flashed with open-source **OpenTX** firmware.
- 3D-printed **Li-ion power modules** with onboard charging.

## Then and now

The first quad (2020) was a black carbon-fibre frame with red motors and standoffs. The current one is lighter and tougher: 3D-printed yellow camera cage and arm guards take the crashes, and the GoPro is stripped to its bare board. Even the goggles and radio have been modified, with a printed strap mount and a battery module.

I also fly it for fun. The best clips are in my [FPV cinematics album](/hobbies/fpv-cinematics).
