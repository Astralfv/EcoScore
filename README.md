# EcoScore

## Live links

- 🇮🇹 [**EcoScore — Italiano**](https://ecoscore-71mu7k.v2.appdeploy.ai/)
- 🇬🇧 [**EcoScore — English**](https://ecoscore-71mu7k.v2.appdeploy.ai/?lang=en)
- 💬 [**AstraIndustries Discord**](https://discord.gg/yv6ZYd7eTw)

EcoScore is a small sustainability web application by **AstraIndustries**. It turns 20 everyday-habit questions into a score from 0 to 100 and highlights the areas where a few realistic changes can have the most value.

## What it includes

- 20-question sustainability check
- 4 categories: Mobility, Energy, Food and Consumption
- score from 0 to 100
- category percentages
- personalised improvement priorities
- positive habits already in place
- a 7-day challenge based on the weakest category
- **Eco Maze**, an animated nature-themed 2D maze game

## Tech stack

- Python 3
- Flask
- HTML5
- CSS3
- Vanilla JavaScript
- Canvas API + `requestAnimationFrame`
- Web Audio API for procedural music and sound effects
- Fullscreen API for optional full-screen gameplay

The quiz score is calculated on the Flask backend. The browser sends only the selected answer indexes; the server validates them against `questions.json` before returning the result.

## Project structure

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

## Run locally

### Windows

Run `install.bat` once, then start the project with `start.bat`.

### Terminal

```bash
pip install -r requirements.txt
python app.py
```

Open:

```text
http://127.0.0.1:5000
```

## Quiz logic

Each question has five possible answers worth 1 to 5 points. There are five questions in each category, so every category is worth up to 25 points and the full EcoScore is worth 100.

`POST /api/score` returns:

- total score
- score band and summary
- best and weakest category
- category percentages
- improvement priorities
- green wins
- the selected 7-day challenge

## Eco Maze

Eco Maze is an original nature-themed maze game inspired by classic maze-chase games without reusing their characters, map or artwork.

Gameplay features:

- collect seeds to clear the maze
- collect special flowers to temporarily weaken the smog enemies
- three different enemy behaviours
- lives, score, levels and persistent local high score
- animated player, enemies, collectibles and particle effects
- increasing difficulty on later levels
- keyboard controls with Arrow keys or WASD
- touch directional controls on mobile devices
- pause and restart controls
- mute/unmute control
- procedural sound effects and looping background music generated with the Web Audio API
- optional full-screen mode using the browser Fullscreen API

No external audio files are required: music and sound effects are generated directly in the browser.

## Design direction

The interface intentionally avoids overly decorative cards, excessive badges, fake dashboard elements and constant joke copy. The visual system is restrained and responsive, with a small set of reusable spacing, typography, colour and component rules.

## Note

EcoScore is an educational project. It is not an environmental certification and does not attempt to calculate a complete personal carbon footprint.
