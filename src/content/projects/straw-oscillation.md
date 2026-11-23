---
title: "Gravity-driven oscillation in a straw"
kind: "Academic"
year: "NISER"
order: 11
featured: false
summary: "Release a capped straw in a liquid bath and the liquid inside bounces. I filmed it, fitted two damping models and recovered g to within 1%."
tags: ["Fluid dynamics", "Python", "Model fitting", "FFT"]
specs:
  - { k: "Models", v: "Newtonian vs Lorenceau" }
  - { k: "Liquids", v: "Water; 50 % water + 50 % alcohol" }
  - { k: "Tubes", v: "Plastic and glass" }
  - { k: "Analysis", v: "Video tracking + Lorentzian FFT fits" }
  - { k: "Frequency check", v: "Within 0.2–0.35 % of Hooke's law" }
  - { k: "Where", v: "SPS, NISER (7th-sem open lab)" }
cover: ../../assets/images/projects/straw-oscillation/all-depths.png
report: { href: /docs/straw-oscillation-report.pdf, label: "Read the full project report (PDF)" }
gallery:
  - { src: ../../assets/images/projects/straw-oscillation/all-depths.png, caption: "Fluid level vs time for every submerged depth", group: "The oscillation" }
  - { src: ../../assets/images/projects/straw-oscillation/model-fit.png, caption: "Both models fitted to one run", group: "The oscillation" }
  - { src: ../../assets/images/projects/straw-oscillation/power-spectrum.png, caption: "Lorentzian fit to the power spectrum gives the natural frequency", group: "Frequency and g" }
  - { src: ../../assets/images/projects/straw-oscillation/g-estimate.png, caption: "Frequency squared against 1/h gives g of about 987 cm/s2", group: "Frequency and g" }
---

Hold a straw capped at the top and push it into a bath, then release the cap. Liquid rushes in, overshoots the bath level and bounces up and down before settling. The motion looks simple, but it asks a real question: **what makes it damp?**

## What I did

1. Filmed the oscillation on a phone and **tracked the liquid level** frame by frame with Tracker software.
2. Repeated it for several **submerged lengths**, for **water and a 50 % water–alcohol mix**, and in **plastic and glass** tubes.
3. Fitted two published models to the data:
   - the **Newtonian model**: gravity plus pressure plus one phenomenological damping term $b$;
   - the **Lorenceau model**: includes Poiseuille friction and the singular pressure loss at the straw mouth.
4. Took the **FFT** of each trace and fitted a Lorentzian to the power spectrum for the natural frequency.

## Results

- Both models explain the motion well, and **Lorenceau fits slightly better**.
- The natural frequency **falls as the submerged length grows**, and agrees with the small-displacement Hooke's-law prediction $f_0 = \tfrac{1}{2\pi}\sqrt{g/h}$ to **0.20–0.35 %**.
- Plotting $f^2$ against $1/h$ gives a straight line whose slope returns **g ≈ 987 cm/s²**.

## Limits

The camera recorded only 30 frames per second, so motion blur limited the frame-by-frame tracking, and I held the straw by hand instead of using a proper clamp. A faster camera and a stand are the obvious next steps.
