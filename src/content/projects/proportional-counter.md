---
title: "3D-printed proportional counter"
kind: "Research instrument"
year: "NISER"
order: 6
featured: false
summary: "A low-cost gas proportional counter for particle detection, built with 3D-printed parts and tested for performance."
tags: ["Detectors", "Nuclear physics", "3D printing"]
specs:
  - { k: "Type", v: "Gas proportional counter" }
  - { k: "Cathode", v: "Aluminium curtain rod" }
  - { k: "Anode", v: "Thin copper wire" }
  - { k: "Body", v: "3D-printed end-caps" }
  - { k: "Source", v: "Fe-55 X-rays" }
  - { k: "Best resolution", v: "At 2325 V (theory: 2279 V)" }
  - { k: "Where", v: "SPS, NISER" }
cover: ../../assets/images/projects/proportional-counter/detector-setup.jpg
report: { href: /docs/proportional-counter-report.pdf, label: "Read the full project report (PDF)" }
gallery:
  - { src: ../../assets/images/projects/proportional-counter/detector-setup.jpg, caption: "Foil-shielded detector with HV and signal connectors", group: "The build" }
  - { src: ../../assets/images/projects/proportional-counter/printed-cap.png, caption: "CAD of the 3D-printed end-cap", group: "The build" }
  - { src: ../../assets/images/projects/proportional-counter/electronics-rack.jpg, caption: "HV supply, preamplifier, amplifier and multi-channel analyser", group: "The build" }
  - { src: ../../assets/images/projects/proportional-counter/iv-curve.png, caption: "Current vs voltage (log): proportional below about 2800 V", group: "Results" }
  - { src: ../../assets/images/projects/proportional-counter/fe55-spectrum.png, caption: "Fe-55 at 2325 V, with Gaussian fits to K-alpha and the argon escape peak", group: "Results" }
  - { src: ../../assets/images/projects/proportional-counter/fe55-kbeta.png, caption: "A third peak appears, which I assign to K-beta", group: "Results" }
  - { src: ../../assets/images/projects/proportional-counter/resolution-vs-voltage.png, caption: "K-alpha resolution against operating voltage", group: "Results" }
---

An academic project (8th-semester open lab, School of Physical Sciences) in which I built and characterized a cost-effective, **3D-printed proportional counter** for detecting ionizing radiation, then tested its performance.

## Build

- **Cathode:** a commonly available aluminium curtain rod.
- **Anode:** a thin copper wire stretched along the axis.
- **Caps:** 3D-printed in a few iterations, they hold the wire taut and carry the gas inlet and the connectors.
- **Gas & source:** a counting gas flowing through the tube, with a radioactive **Fe-55** X-ray source in front of a thin window.

## Measurements

1. **Current vs bias voltage** to find the working region. The detector is proportional below about **2800 V** and drifts toward Geiger–Müller behaviour above that.
2. **Spectrum of Fe-55** through preamplifier, amplifier and multi-channel analyser. The K-alpha peak (5.9 keV) and the argon escape peak (about 3.7 keV) were fitted with Gaussians and used to **calibrate the energy axis**.
3. **Resolution vs voltage** from the peak widths (FWHM). The best resolution came at **2325 V**, close to the theoretically calculated operating voltage of 2279 V for this geometry.

## An extra peak

A third peak showed up at higher energy than K-alpha. I took it to be the **K-beta line** of Fe-55 and checked it with fits at several voltages, but could not fully pin down its origin.
