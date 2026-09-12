# EcoScore

## Live links

- 🇮🇹 [**EcoScore — Italiano**](https://ecoscore-71mu7k.v2.appdeploy.ai/)
- 🇬🇧 [**EcoScore — English**](https://ecoscore-71mu7k.v2.appdeploy.ai/?lang=en)
- 💬 [**AstraIndustries Discord**](https://discord.gg/yv6ZYd7eTw)

EcoScore is a small sustainability project by **AstraIndustries**. It compares 20 everyday habits across four areas, returns a score from 0 to 100 and highlights realistic places to improve.

The public website is available in both Italian and English from the links above.

## What it includes

- 20-question sustainability check
- 4 equally weighted categories: Mobility, Energy, Food and Consumption
- score from 0 to 100
- per-category percentages
- improvement priorities
- positive habits already in place
- a simple 7-day challenge
- **Eco Maze**, an original animated 2D pixel-art maze game
- responsive desktop and mobile layouts
- dedicated Italian and English UI copy
- motion and micro-interactions with reduced-motion support

## Current design direction

The interface is intentionally restrained rather than template-heavy. The current polish pass focuses on:

- consistent spacing and typography
- natural copy instead of generic dashboard language
- clear hierarchy and quieter component styling
- polished hover, press, quiz and result transitions
- animated score bars and result states
- a real mobile navigation menu
- consistent Italian/English labels and fallbacks
- accessible focus states
- `prefers-reduced-motion` support

The main site keeps a clean modern visual language, while Eco Maze deliberately uses a separate 16-bit / pixel-art game aesthetic.

## Eco Maze

Eco Maze is an original nature-themed maze-chase mini-game. It takes inspiration from the general maze-game genre without reusing another game's characters, map or artwork.

Gameplay features:

- true pixel-art canvas rendering with `image-rendering: pixelated`
- frame-based player and enemy animation
- animated seeds, flowers, vegetation and ambient fireflies
- collect seeds to clear each level
- special flowers temporarily make smog enemies vulnerable
- three enemy behaviours: chase, ambush and wander
- lives, score, levels and persistent local high score
- pixel particles, score popups and screen shake
- increasing enemy speed on later levels
- Arrow keys / WASD controls
- touch directional pad on mobile
- pause and restart controls
- mute/unmute control
- procedural 8-bit-style music and sound effects generated through the Web Audio API
- optional full-screen mode through the browser Fullscreen API

No external music or sound files are required.

## Quiz logic

Each question has five possible answers worth 1 to 5 points. There are five questions in each category, so every category is worth up to 25 points and the full EcoScore is worth 100.

The result includes:

- total score
- score band and explanation
- strongest and weakest category
- category percentages
- improvement priorities
- positive habits
- one practical 7-day focus

## Repository structure

The repository also contains the Flask reference implementation:

```text
EcoScore/
├── app.py
├── questions.json
├── requirements.txt
├── install.bat
├── start.bat
├── templates/
│   └── index.html
└── static/
    ├── app.js
    └── style.css
```

### Run the Flask reference build locally

On Windows, run `install.bat` once and then `start.bat`.

Or from a terminal:

```bash
pip install -r requirements.txt
python app.py
```

Then open:

```text
http://127.0.0.1:5000
```

## Technology

The project currently uses a mix of:

- Python / Flask for the repository reference build and scoring API
- React + TypeScript for the deployed polished interface
- HTML5 / CSS3
- Canvas API + `requestAnimationFrame`
- Web Audio API
- Fullscreen API
- localStorage for the Eco Maze high score

## Note

EcoScore is an educational project. It is not an environmental certification and does not attempt to calculate a complete personal carbon footprint.
