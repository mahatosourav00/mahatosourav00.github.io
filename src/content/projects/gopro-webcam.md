---
title: "GoPro Cam"
kind: "Software"
year: "2026"
order: 14
featured: false
facts:
  - { v: "1080p", k: "virtual webcam, no OBS" }
  - { v: "16 ms", k: "of delay added by the app" }
summary: "A Windows app that turns a GoPro HERO9 into a webcam for Zoom, Meet or Teams, without OBS: a steadier alternative to GoPro's official webcam app, with more control over the camera."
tags: ["Python", "Windows", "Video streaming"]
specs:
  - { k: "Camera", v: "GoPro HERO9 Black (newer HEROs supported, untested)" }
  - { k: "Platform", v: "Windows 10 / 11" }
  - { k: "Output", v: "A 1080p virtual camera called GoPro Cam" }
  - { k: "Latency", v: "About 0.9 s end to end, 16 ms of it in the app" }
  - { k: "Stack", v: "Python, PyAV, Unity Capture virtual camera" }
links:
  - { label: "Download for Windows", href: "https://github.com/mahatosourav00/gopro-webcam/releases" }
  - { label: "Source on GitHub", href: "https://github.com/mahatosourav00/gopro-webcam" }
---

## Why I made it

A GoPro makes a great webcam, but GoPro's official webcam app wasn't stable enough for me and gave little control over the camera. So I wrote my own.

## What it does

- A small **background service** in the tray streams the camera into a virtual camera called **GoPro Cam**. Pick it in Zoom, Google Meet, Teams, Discord and so on.
- An optional **settings and preview window** changes the camera's settings and shows the picture. Close it any time; the webcam keeps running.
- Resolution (480p, 720p, 1080p) and field of view change **live**, during a call.
- The list of settings is read **from the camera itself**, so nothing unsupported is ever sent.

## How it works

The app finds the camera's USB network adapter and talks to the camera's own HTTP API. In webcam mode the camera sends an MPEG-TS stream over UDP, which is decoded in-process with low-delay options and fed into a DirectShow virtual camera. I measured the delay with a small tool of my own: 16 ms of it is the app; the rest is the camera's own encoder.
