---
title: "Autonomous quadcopter"
kind: "Club / Team"
year: "2020 – 23"
order: 5
featured: false
summary: "A club quadcopter I led, from an ArduPilot Mega prototype to a Pixhawk 4 build that takes off, lands, flies waypoint missions and holds position with the radio off."
tags: ["ArduPilot", "Pixhawk 4", "PX4", "Autonomy", "Robotech Club"]
specs:
  - { k: "Flight controller", v: "ArduPilot Mega, then Holybro Pixhawk 4 (PX4)" }
  - { k: "Role", v: "Project leader" }
  - { k: "Autonomy", v: "Takeoff · Landing · Waypoints · Hold" }
  - { k: "Ground station", v: "QGroundControl + 3DR telemetry" }
  - { k: "Motors", v: "4 × Emax MT2213 935 kV, 1045 props, 3S LiPo" }
  - { k: "Frame", v: "Aluminium box-pipe arms, sunmica plates, printed legs" }
  - { k: "Club", v: "Robotech, NISER" }
cover: ../../assets/images/projects/quadcopter/airframe.jpg
report: { href: "https://github.com/rtcniser/2022-23_Drone_CONCLUDED", label: "Club repository: build notes, CAD files and wiring (GitHub)" }
gallery:
  - { src: ../../assets/images/projects/quadcopter/airframe.jpg, caption: "Airframe with GPS mast and flight controller", group: "Hardware" }
  - { src: ../../assets/images/projects/quadcopter/mission-planning.jpg, caption: "Mission planning on the laptop, radio at hand", group: "Hardware" }
  - { src: ../../assets/images/projects/quadcopter/wiring-diagram.png, caption: "Signal and power layout of the 2022–23 build", group: "Hardware" }
  - { src: ../../assets/images/projects/quadcopter/v-night-flight.jpg, video: /videos/quadcopter/night-flight.mp4, caption: "Night flight test (2020)", group: "In flight" }
  - { src: ../../assets/images/projects/quadcopter/v-build.jpg, video: /videos/quadcopter/build.mp4, caption: "Early build: wiring up the first airframe (2020)", group: "In flight" }
  - { src: ../../assets/images/projects/quadcopter/v-bench-test.jpg, video: /videos/quadcopter/bench-test.mp4, caption: "Bench test with the transmitter (2022)", group: "In flight" }
---

As project leader at the NISER Robotech Club, I led a quadcopter project that can take off, land and fly a planned path on its own. It can also **hold itself steady in the air with the remote control switched off**, which is why we call it autonomous. The platform was designed to grow: proximity sensors, LiDAR or cameras could feed path-planning and obstacle avoidance later.

## Two generations

The first iterations (2020–22) flew on an **ArduPilot Mega** flight controller. In 2022–23 we moved to a **Pixhawk 4** running the PX4 stack, which brought more processing power, richer I/O and a cleaner ground-station workflow. That headroom matters because other projects, such as AI vision, can then be attached to the drone as peripherals. The sections below describe the Pixhawk build.

## The platform

- An airframe on tall landing legs, with a **GPS mast** well clear of the electronics, so the position estimate stays clean.
- A **Pixhawk 4** flight controller with built-in gyroscope and accelerometer, plus an onboard compass, GPS and a telemetry radio.
- A laptop ground station: missions are drawn on a satellite map in **QGroundControl**, uploaded to the drone and followed autonomously, with the radio kept in hand as a manual override.

## How it is wired

A 3S LiPo feeds a Holybro PM07 power module, which gives the Pixhawk regulated power, reports battery voltage and current, and distributes power and signal to four ESCs and brushless motors. The GPS, the telemetry radio (linking to QGroundControl) and the 2.4 GHz receiver (linking to the pilot's transmitter) all plug into the Pixhawk.

## Built light

To lift a heavier payload, the body is kept light: two small **sunmica** plates sandwich the electronics, **aluminium box pipes** form the arms, and the legs and GPS stand are **3D printed**. Parts were drawn in SolidWorks and cut or printed in-house.

## Flying it

The usual modes were Position, Hold and Altitude. Setup in QGroundControl is: load the PX4 stack, choose the generic quadcopter airframe, calibrate the radio and sensors, and test each motor. Control gains come from careful **PID tuning** by trial and error, which is what makes the craft stable and responsive.

## Timeline

The earliest wiring and test-flight clips date from 2020, on the ArduPilot Mega. The Pixhawk build documented in the club repository is the 2022–23 version.
