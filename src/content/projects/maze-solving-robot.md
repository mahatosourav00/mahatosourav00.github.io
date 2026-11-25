---
title: "Maze-solving robot"
kind: "Club / Team"
year: "2019"
order: 7.5
featured: false
summary: "A line-follower robot with an 8-channel IR sensor array, built to find its way through a maze. I led its initial development."
tags: ["Robotics", "Sensors", "Arduino", "Robotech Club"]
facts:
  - { v: "8", k: "IR sensor channels" }
  - { v: "2", k: "driven wheels" }
specs:
  - { k: "Sensing", v: "8-channel IR array" }
  - { k: "Drive", v: "Two driven wheels, motor-driver shield" }
  - { k: "Controller", v: "Arduino-class board" }
  - { k: "Goal", v: "Junction detection and maze solving" }
  - { k: "Role", v: "Led initial development" }
  - { k: "Club", v: "Robotech, NISER" }
cover: ../../assets/images/projects/maze-solving-robot/line-follower-a.jpg
gallery:
  - { src: ../../assets/images/projects/maze-solving-robot/line-follower-a.jpg, caption: "8-channel IR sensor bar at the front" }
  - { src: ../../assets/images/projects/maze-solving-robot/line-follower-b.jpg, caption: "Motor-driver shield and the two driven wheels" }
---

A beginner project at the NISER Robotech Club, and a separate one from the club's [lunar rover model](/projects/lunar-rover), which was being built around the same time. I led the first stage of development of a line-follower robot meant to solve mazes.

## How it sees

An 8-channel IR array reads the line under the robot. With eight sensors the robot sees where the line is heading, not just whether it is on it, which is what makes junction detection and maze solving possible.

## How it moves

A motor-driver shield on an Arduino-class board turns the sensor readings into wheel speeds for the two driven wheels.
