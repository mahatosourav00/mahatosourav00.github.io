---
title: "Lunar rover & maze-solving robot"
kind: "Club / Team"
year: "2019"
order: 7
featured: false
summary: "A Pragyan-inspired wireless rover with solar panels and live camera, and a line-follower robot with an 8-channel IR array."
tags: ["Robotics", "Sensors", "Robotech Club"]
specs:
  - { k: "Rover", v: "Wireless, solar, ultrasonic, live camera" }
  - { k: "Maze bot", v: "8-channel IR array" }
  - { k: "Role", v: "Hardware developer" }
cover: ../../assets/images/projects/lunar-rover/line-follower-a.jpg
gallery:
  - { src: ../../assets/images/projects/lunar-rover/line-follower-a.jpg, caption: "8-channel IR sensor bar at the front", group: "Line follower" }
  - { src: ../../assets/images/projects/lunar-rover/line-follower-b.jpg, caption: "Motor-driver shield and the two driven wheels", group: "Line follower" }
---

These were my first builds, done as a beginner in a team at the NISER Robotech Club. The rover was a simple, look-alike model of Chandrayaan-2's rover, built for an outreach event on the Chandrayaan-2 mission organised by NISER's School of Earth and Planetary Sciences. It was not a working replica. What I took away was the fundamentals, and the confidence to start a build of my own: [an FPV drone](/projects/fpv-drone).

- Led initial development of a **line-follower robot** with an 8-channel IR sensor array for maze solving.
- Built a wirelessly controlled **lunar rover prototype**, inspired by ISRO's Pragyan, with ultrasonic sensors, solar panels and real-time camera feeds.

## The line follower

An 8-channel IR array reads the line under the robot. A motor-driver shield on an Arduino-class board turns the readings into wheel speeds. With eight sensors the robot sees where the line is heading, not just whether it is on it, which is what makes junction detection and maze solving possible.
