# 🛰️ 3D Solar System · Voyager Tracker

**An interactive, physics-driven 3D visualization of the solar system that tracks the real position of Voyager 1 and Voyager 2 in interstellar space — today, and on any date from 1977 to 2076.**

[![Status](https://img.shields.io/badge/status-active-success)](#)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](#license)
[![Built with Claude Fable 5](https://img.shields.io/badge/Built%20with-Claude%20Fable%205-d97757)](https://www.anthropic.com/claude/fable)

🌐 **[Read this in Spanish / Léelo en español →](README.es.md)**

---

## 🌌 About the Project

Most solar system diagrams lie to you. They have to — at true scale, if the Sun were a soccer ball, Earth would be a grain of sand 24 meters away, and the Voyager probes would be on the other side of your city.

This project refuses to flatten that truth. It is a **single self-contained HTML file** that renders the solar system in real proportion, derives every planetary orbit from **Kepler's laws** (no hard-coded positions), and places **Voyager 1 (~165+ AU, toward Ophiuchus)** and **Voyager 2 (~137+ AU, toward Pavo)** using their real heliocentric velocities and asymptotic trajectories — including the gravity-assist flybys that bent their paths at Jupiter, Saturn, Uranus and Neptune.

The goal is simple and ambitious: that anyone — a high-school student, a recruiter, you — can spend five minutes inside it and walk away *feeling* the scale of space and the magnitude of what the Voyager missions achieved.

What makes it special:

- **Real physics, not animation keyframes.** Planet positions are solved from orbital elements via the Kepler equation every frame; orbital periods emerge from Kepler's third law and orbital speeds from the vis-viva equation.
- **Real spacecraft data.** Voyager distances, headings, velocities, launch dates and heliopause crossings match the published mission record.
- **Scale you can switch.** A logarithmic mode lets you see Mercury and interstellar space in one view; a linear ("real") mode shows the planets vanish into a dot inside the heliosphere — which is exactly the point.
- **A view from the probe itself.** "Voyager Perspective" mode places the camera aboard each spacecraft, where the Sun is reduced to the brightest star in a black sky.

---

## ✨ Features

- 🪐 **Keplerian orbital engine** — all 8 planets propagated from JPL J2000 orbital elements, solved numerically each frame
- 🚀 **Voyager 1 & 2 live tracking** — real distance, light-time and velocity for any simulated date
- 🛤️ **Historical trajectories** — flight paths drawn from launch (1977) through each real gravity-assist flyby up to the current date
- ⏱️ **Time machine** — scrub from 1977 to 2076, or play at speeds from 1 day/s to 5 years/s
- 🔭 **Voyager Perspective mode** — see the Sun as a point of light from 165 AU away, with live brightness and light-delay figures
- 📏 **Dual scale modes** — logarithmic (everything in one view) vs. real proportion (feel the emptiness)
- 🫧 **Interstellar context** — heliopause (~120 AU), Oort Cloud (2,000–100,000 AU), light-day and light-year reference rings
- 🖱️ **Full free exploration** — orbit, zoom and pan; click any body for a live data panel; hover for distance, light-time and speed
- ⚽ **Tangible scale card** — "if the Sun were a soccer ball…" comparisons, updated live with the simulation date
- 🌐 **Bilingual UI** — English by default, Spanish via one click, covering every label down to the in-scene 3D annotations
- 📦 **Zero install** — one HTML file, no backend, no build step

---

## 🛠️ Built With

| Technology | Role |
|---|---|
| [Three.js](https://threejs.org/) r160 | WebGL rendering, camera controls (`OrbitControls`), HTML-anchored labels (`CSS2DRenderer`) |
| Vanilla JavaScript (ES Modules) | Application logic, Kepler solver, i18n — no frameworks |
| HTML5 + CSS3 | Single-file delivery, glassmorphism UI panels |
| NASA / JPL data | Orbital elements and Voyager mission parameters (see [Data Sources](#-data-sources)) |

### About Claude Fable 5

This project was built with **[Claude Fable 5](https://www.anthropic.com/claude/fable)**, the first Mythos-class model from Anthropic available to the public (released June 2026). Fable 5 served as the primary engineering engine of the project: it designed the architecture, implemented the Keplerian mechanics and trajectory model, wrote and iterated on the rendering and UI code, and visually verified every build in a headless browser until the result matched the intent. The author directed the vision, requirements and review; Fable 5 did the heavy lifting at the keyboard.

---

## 🚀 Getting Started

This is a single self-contained HTML file. No installation, no dependencies, no build step.

**Option 1 — Just open it**

```
Double-click index.html
```

That's it. An internet connection is needed on first load (Three.js is fetched from a CDN).

**Option 2 — Serve it locally** (recommended if your browser restricts local files)

```bash
# Python
python -m http.server 8000

# or Node
npx serve .
```

Then open `http://localhost:8000`.

**Controls:** drag to rotate · scroll to zoom · click any body for details · use the bottom bar for views, scale modes and Voyager perspectives · use the top-left panel to travel in time.

---

## 📡 Data Sources

- **Planetary orbital elements** — [JPL "Approximate Positions of the Planets"](https://ssd.jpl.nasa.gov/planets/approx_pos.html) (Keplerian elements, J2000 epoch)
- **Ephemerides reference** — [NASA/JPL Horizons System](https://ssd.jpl.nasa.gov/horizons/)
- **Voyager distances, velocities and trajectory** — [NASA JPL Voyager Mission Status](https://voyager.jpl.nasa.gov/mission/status/)
- **Heliopause crossings** — NASA announcements: Voyager 1 (Aug 25, 2012), Voyager 2 (Nov 5, 2018)
- **Physical constants** — IAU definitions (1 AU = 149,597,870.7 km; c = 299,792.458 km/s)

Planetary motion is *derived* from these elements through Kepler's equation at runtime — no positions are hard-coded. Voyager positions use their published heliocentric speeds and asymptotic directions (Ophiuchus, +35° ecliptic latitude for V1; Pavo, −48° for V2), with trajectories routed through the true planet positions on each historical flyby date.

---

## 👨‍🚀 Author

**Alan Jesús López Jacinto**

- GitHub: [@alanjlj2202](https://github.com/alanjlj2202)
- LinkedIn: [Alan Jesús López Jacinto](https://www.linkedin.com/in/alan-jesús-lópez-jacinto-66a699253)

---

## 🙏 Acknowledgements

- **[Anthropic](https://www.anthropic.com/)** and the **Claude Fable 5** team — for building a model capable of turning an idea about cosmic scale into working, verified software within a single conversation.
- **The NASA Voyager mission** — nearly five decades of engineering, and the two most distant ambassadors humanity has ever sent. The Golden Record is still out there, moving away at 17 km/s.
- **[Three.js](https://threejs.org/)** contributors, for making WebGL feel like creative writing.

> *"The spacecraft will be encountered and the record played only if there are advanced spacefaring civilizations in interstellar space. But the launching of this bottle into the cosmic ocean says something very hopeful about life on this planet."* — Carl Sagan
