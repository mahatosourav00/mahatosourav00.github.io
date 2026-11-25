---
title: "LedFx Mobile"
kind: "Software"
year: "2026"
order: 12
featured: true
facts:
  - { v: "41", k: "music-reactive effects" }
  - { v: "60 fps", k: "to WLED lights over Wi-Fi" }
summary: "A native Android app that turns music into real-time LED effects and streams them to WLED lights over Wi-Fi, so music-reactive lamps no longer need a PC running in the background."
tags: ["Kotlin", "Android", "Audio DSP", "WLED"]
specs:
  - { k: "Platform", v: "Android 10 or newer" }
  - { k: "Language", v: "Kotlin, native" }
  - { k: "Effects", v: "41 (all 39 LedFx strip effects, ported, plus 2)" }
  - { k: "Presets", v: "98 LedFx presets built in" }
  - { k: "Audio", v: "Microphone or phone audio; 32-band spectrum, beat and pitch" }
  - { k: "Output", v: "WLED over DDP at 60 fps, found by mDNS" }
links:
  - { label: "Download the APK", href: "https://github.com/mahatosourav00/ledfx-mobile/releases/latest" }
  - { label: "Source on GitHub", href: "https://github.com/mahatosourav00/ledfx-mobile" }
---

## Why I made it

My [smart lamps](/projects/iot-lighting) react to music through **LedFx**, the best open-source tool for it. But LedFx runs only on a PC. Not everyone has one, and nobody carries a PC around just to make the lights dance. I couldn't find an open-source app that did the same from a phone. I had wanted one since my smart-lamp days around 2022, and in 2026 I finally built it.

## What it does

The app listens to music, either through the microphone or from apps playing on the phone, such as Spotify or YouTube. It turns the sound into effects and streams them over Wi-Fi to WLED controllers, 60 frames a second.

- **41 effects.** All 39 of LedFx's strip effects, ported from its source, with the same settings, defaults and ranges, plus Ripples and Sparkle.
- **98 LedFx presets** built in, LedFx's 13 gradients, and your own saved presets.
- **WLED devices are found automatically** on the Wi-Fi, and the WLED settings page opens inside the app.
- **Virtual strips** preview any effect on the phone screen, with no LED hardware at all.
- **Runs in the background** with the screen off.

## How it works

An audio engine on the phone computes a 32-band spectrum, bass, mid and high levels, kick and onset detection, a tempo tracker for beat-synced effects, and pitch. Each effect turns that into a row of pixels, which is sent to the lights over **DDP**, split across packets for long strips.

*An unofficial project. It isn't affiliated with or endorsed by the LedFx team.*
