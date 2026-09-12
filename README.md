# EcoScore

## Live

- 🌐 [**EcoScore — single multilingual site**](https://ecoscore-71mu7k.v2.appdeploy.ai/)
- 💬 [**AstraIndustries Discord**](https://discord.gg/yv6ZYd7eTw)

EcoScore is a small sustainability project by **AstraIndustries**. It compares 20 everyday habits across four areas, returns a score from 0 to 100 and highlights realistic places to improve.

The public site is now a **single switchable interface** with **Italian, English and Russian** available directly in the header. Language preference is remembered locally.

## What it includes

- 20-question sustainability check
- 4 equally weighted categories: Mobility, Energy, Food and Consumption
- score from 0 to 100
- per-category percentages
- improvement priorities
- positive habits already in place
- a practical 7-day challenge
- **Eco Flux**, an original competitive 2D pixel-art score-attack game
- responsive desktop and mobile layouts
- live IT / EN / RU language switching
- motion and micro-interactions with reduced-motion support
- a dedicated AstraIndustries Discord community section

## Eco Flux

Eco Flux replaces the previous maze mini-game with a faster, more competitive score-attack loop built around short repeatable runs.

Each run lasts **60 seconds**. The goal is to push a personal best through precise movement, risk management and combo preservation.

### Core mechanics

- continuous movement with Arrow keys or WASD
- 60-second runs designed for immediate retries
- collectible energy cores
- combo-based multiplier up to x8
- Flow meter used as a gameplay resource
- Space-bar dash that consumes Flow
- hostile smog drones with escalating pressure
- near-miss bonuses for passing dangerously close to drones
- dash-through drone breaks for extra score
- collisions remove time, Flow and combo rather than ending the run immediately
- increasing drone count and speed during the run
- personal-best score stored in `localStorage`
- final performance rank and run statistics
- pixel particles, screen shake, score popups and animated trail
- procedural 8-bit-style music and sound effects with the Web Audio API
- pause, mute, restart, fullscreen and mobile touch controls

The design goal is a low-friction competitive loop: **run → score → restart → improve the PB**.

## Languages

EcoScore uses one public site rather than separate language deployments.

Available languages:

- 🇮🇹 Italian
- 🇬🇧 English
- 🇷🇺 Russian

The switch happens inside the current page, including the quiz, results, game description and Discord/community copy.

## Discord community

Discord is a primary part of the project rather than a small footer link. The site includes a dedicated community section for:

- sharing Eco Flux personal-best scores
- feedback and bug reports
- EcoScore and AstraIndustries project updates

Server: **https://discord.gg/yv6ZYd7eTw**

## Design direction

The main site uses a restrained modern visual system with consistent typography, spacing and interactions. The game deliberately switches to a separate 2D pixel-art aesthetic.

The interface includes:

- animated section reveals
- quiz transitions and selection feedback
- animated result bars and score state
- responsive navigation
- accessible focus states
- mobile controls
- `prefers-reduced-motion` support

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

The repository also contains a Flask reference implementation:

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
- React + TypeScript for the deployed interface
- HTML5 / CSS3
- Canvas API + `requestAnimationFrame`
- Web Audio API
- Fullscreen API
- `localStorage` for language preference and Eco Flux personal best

## Note

EcoScore is an educational project. It is not an environmental certification and does not attempt to calculate a complete personal carbon footprint.
