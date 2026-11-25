---
title: "Motorized goniometer"
kind: "Research instrument"
year: "2026"
order: 1
featured: true
status: "in-progress"
facts:
  - { v: "0.1125°", k: "smallest commanded step" }
  - { v: "Wi-Fi", k: "controlled from a phone" }
summary: "A stepper-driven arm that will carry a spectral sensor around a sample at any angle. The first single-axis prototype already moves, holds and reports its angle from a web page."
tags: ["ESP32", "TMC2209", "AS7341", "3D printing", "Optics"]
specs:
  - { k: "Stage", v: "Single-axis prototype (target: incidence · emission · azimuth)" }
  - { k: "Travel", v: "0–180°, with a saved rest angle" }
  - { k: "Motor", v: "NEMA 17, 1.8°/step, rated 1.8 A" }
  - { k: "Driver", v: "TMC2209, current and microstepping set over UART (1/16 default)" }
  - { k: "Controller", v: "ESP32 (WEMOS D1 R32) with its own Wi-Fi access point" }
  - { k: "Detector", v: "AS7341 multichannel spectral sensor" }
  - { k: "Structure", v: "3D-printed brackets on V-slot rail, mounted on an optical breadboard" }
  - { k: "Purpose", v: "Lab-grounded photometric correction for Chandrayaan-2 IIRS" }
  - { k: "Status", v: "Prototype working; accuracy not yet measured" }
cover: ../../assets/images/projects/goniometer/side.jpg
gallery:
  - { src: ../../assets/images/projects/goniometer/overview.jpg, caption: "The prototype: motor, V-slot arm and the sensor board at its tip", group: "The prototype" }
  - { src: ../../assets/images/projects/goniometer/side-level.jpg, caption: "Arm level, seen from the side, next to a test rock", group: "The prototype" }
  - { src: ../../assets/images/projects/goniometer/front.jpg, caption: "Front view: the arm stands over the sample", group: "The prototype" }
  - { src: ../../assets/images/projects/goniometer/v-sweep.jpg, video: /videos/goniometer/sweep.mp4, caption: "The arm sweeping over the sample", group: "In motion" }
  - { src: ../../assets/images/projects/goniometer/v-control.jpg, video: /videos/goniometer/control.mp4, caption: "Control page and a spectrum plot side by side on the laptop", group: "In motion" }
  - { src: ../../assets/images/projects/goniometer/v-front.jpg, video: /videos/goniometer/front.mp4, caption: "Front view of a move", group: "In motion" }
  - { src: ../../assets/images/projects/goniometer/wiring.png, caption: "Wiring: ESP32, CNC shield, TMC2209 and motor", group: "Design" }
  - { src: ../../assets/images/projects/goniometer/architecture.png, caption: "Firmware: web server on one core, stepping on the other", group: "Design" }
  - { src: ../../assets/images/projects/goniometer/ui-main.png, caption: "The control page: dial, target, presets, jog, speed", group: "Design" }
  - { src: ../../assets/images/projects/goniometer/ui-advanced.png, caption: "Advanced settings: limits, rest angle, ramp, driver", group: "Design" }
---

## Why build one

Photometric models such as Hapke's describe how a surface's brightness changes with lighting and viewing geometry. Those models need to be checked against reality. A goniometer lets me measure real samples (regolith simulants, powders, rough surfaces) across the angles an orbiting spectrometer sees, so the photometric correction of Chandrayaan-2 IIRS data can rest on lab measurements and not on model assumptions alone.

## Where it stands

The full instrument will have three motorized axes (incidence, emission and azimuth). What exists today is the **first axis**, built as a prototype to settle the hard parts before copying them: a NEMA 17 stepper turns a 3D-printed arm through 0–180°, and a small **AS7341 multichannel spectral sensor** rides at the tip. Everything the arm does is tested on the real hardware. What is *not* done yet is measuring how close the real angle is to the commanded one, so I do not quote an accuracy figure.

## How it moves

- A **TMC2209** driver turns step pulses into smooth motion. Over a single UART wire the firmware sets its run current, hold current, microstepping (1/4 to 1/128) and the quiet StealthChop mode, so no jumpers or trimmer pots are needed.
- At the default 1/16 microstepping the smallest step is **0.1125°**. The control page shows the real resolution, because finer steps than the hardware can make would be a promise it cannot keep.
- Position is an **absolute step count**, so rounding never accumulates.
- Moves ramp up and down at constant acceleration, at a chosen speed in °/s (0.1 to 90), slow enough not to shake the sensor.
- A saved **rest angle** and a **Park** button lower the arm gently before power-off, so it does not drop when the motor releases.

## How it is controlled

The ESP32 makes its own Wi-Fi network. Join it from a phone or laptop and open one page: a live dial, a target slider, presets, jog buttons, speed, Stop, Set zero and Park. No router, internet or app is needed. The web server runs on one processor core and the stepping on the other, so network traffic can never disturb step timing.

## Build log

1. Requirements and pin check
2. Microstepping choice
3. ESP32 boot-loop fix
4. Shield pin fix (GPIO12)
5. Serial control, exact half turns
6. Wi-Fi access point and web page
7. Slow speeds and Advanced tab
8. Rest angle and Home
9. Torque, current and a broken printed shaft
10. Smooth acceleration
11. UART driver control
12. Fine steps, StealthChop and Park

The problems that cost the most time are written up in [Four things that broke my goniometer](/notes/four-things-that-broke-my-goniometer).

## What's next

1. **Repeatable homing** with an endstop, so zero comes from hardware and not from the power-up position.
2. **Measure the accuracy** against a reference angle, including backlash.
3. **Torque and heat tests** on the real load.
4. **Mechanics:** a gear reduction for finer angles, a stronger coupling than a printed one, and a counterweight for the arm.
5. **Two more axes**, then automated sweeps that log a spectrum at every geometry.
