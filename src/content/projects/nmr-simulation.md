---
title: "NMR simulation in Python"
kind: "Academic"
year: "NISER"
order: 10
featured: false
summary: "Quantum and classical simulations of nuclear magnetic resonance: spin flips from the Schrödinger equation, magnetisation from the Bloch equations."
tags: ["Python", "Quantum mechanics", "Bloch equations", "FFT"]
specs:
  - { k: "Quantum model", v: "Schrödinger equation, spin-½" }
  - { k: "Classical model", v: "Bloch equations" }
  - { k: "Numerics", v: "ODE solvers + FFT" }
  - { k: "Language", v: "Python" }
  - { k: "Where", v: "SPS, NISER (7th-sem open lab)" }
cover: ../../assets/images/projects/nmr-simulation/off-resonance.png
report: { href: /docs/nmr-simulation-report.pdf, label: "Read the full project report (PDF)" }
gallery:
  - { src: ../../assets/images/projects/nmr-simulation/spin-flip-oscillation.png, caption: "Spin-flip probability swings between up and down at resonance", group: "Quantum picture" }
  - { src: ../../assets/images/projects/nmr-simulation/resonance-width.png, caption: "Weaker rf fields give much sharper resonances", group: "Quantum picture" }
  - { src: ../../assets/images/projects/nmr-simulation/power-spectrum.png, caption: "Power spectrum of the flip probability", group: "Quantum picture" }
  - { src: ../../assets/images/projects/nmr-simulation/pulse-90.png, caption: "Magnetisation tip during a 90 degree pulse", group: "Classical (Bloch) picture" }
  - { src: ../../assets/images/projects/nmr-simulation/free-precession.png, caption: "Free precession and relaxation", group: "Classical (Bloch) picture" }
  - { src: ../../assets/images/projects/nmr-simulation/off-resonance.png, caption: "Trajectories for different detunings", group: "Classical (Bloch) picture" }
---

A seventh-semester open-lab project that rebuilds nuclear magnetic resonance from the ground up, as two simulations of the same physics.

## Two views of one experiment

- **Quantum (microscopic).** A spin-½ nucleus sits in a strong static field $H_0$ along $z$ with a weak rf field $H_1\cos\omega t$ across it. I solved the time-dependent Schrödinger equation numerically and tracked the **probability that the spin flips**.
- **Classical (macroscopic).** The same system as a magnetisation vector obeying the **Bloch equations**, in the rotating frame, including the $T_1$ and $T_2$ relaxation terms.

## What the simulations show

- Flipping is only efficient at **resonance**, when the rf frequency matches the Larmor frequency.
- The response is extremely **sensitive to the rf amplitude**: smaller $H_1$ gives a much narrower resonance, so one can tell very precisely whether the resonance condition holds, or whether a local field is shifting it.
- The wiggles on the flip-probability curves are explained by their **power spectra**, computed with the **fast Fourier transform**.
- The Bloch simulations reproduce **90° and 180° pulses**, **free precession** and **off-resonance** behaviour, and make the lattice relaxation picture easy to see.

## Tools

Python (SciPy `odeint`, NumPy FFT, Matplotlib), with 3D trajectory plots of the magnetisation. Writing the report also meant understanding why the FFT cuts the cost from $O(N^2)$ to $O(N\log N)$.
