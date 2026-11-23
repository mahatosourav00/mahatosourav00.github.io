---
title: "Autonomous quadcopter"
kind: "Club / Team"
year: "2020 – 22"
order: 5
featured: false
summary: "An ArduPilot quadcopter with autonomous take-off, landing and waypoint navigation, designed to grow into vision and delivery tasks."
tags: ["ArduPilot", "Autonomy", "Robotech Club"]
specs:
  - { k: "Firmware", v: "ArduPilot" }
  - { k: "Autonomy", v: "Takeoff · Landing · Waypoints" }
  - { k: "Role", v: "Project leader" }
  - { k: "Club", v: "Robotech, NISER" }
  - { k: "Ground station", v: "Laptop mission planner + telemetry" }
cover: ../../assets/images/projects/quadcopter/airframe.jpg
gallery:
  - { src: ../../assets/images/projects/quadcopter/airframe.jpg, caption: "Airframe with GPS mast and flight controller", group: "Hardware" }
  - { src: ../../assets/images/projects/quadcopter/mission-planning.jpg, caption: "Mission planning on the laptop, radio at hand", group: "Hardware" }
  - { src: ../../assets/images/projects/quadcopter/v-night-flight.jpg, video: /videos/quadcopter/night-flight.mp4, caption: "Night flight test (2020)", group: "In flight" }
  - { src: ../../assets/images/projects/quadcopter/v-build.jpg, video: /videos/quadcopter/build.mp4, caption: "Early build: wiring up the first airframe (2020)", group: "In flight" }
  - { src: ../../assets/images/projects/quadcopter/v-bench-test.jpg, video: /videos/quadcopter/bench-test.mp4, caption: "Bench test with the transmitter (2022)", group: "In flight" }
---

As project leader at the NISER Robotech Club, I built a quadcopter running **ArduPilot** that can take off, land and fly waypoint missions on its own. The platform was designed to be extended with AI vision, delivery and surveillance payloads.

## The platform

- An airframe on tall landing legs, with a **GPS mast** well clear of the electronics, so the position estimate stays clean.
- An **ArduPilot** flight controller handling stabilization, take-off, landing and waypoint missions.
- A laptop ground station: missions are drawn on a satellite map, uploaded to the drone and followed autonomously, with the radio kept in hand as a manual override.

## Timeline

The earliest wiring and test-flight clips date from 2020. The airframe shown in the photos is the 2022 version.
