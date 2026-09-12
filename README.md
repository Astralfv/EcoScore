# EcoScore

## Live

- 🌐 [**EcoScore — single multilingual site**](https://ecoscore-71mu7k.v2.appdeploy.ai/)
- 💬 [**AstraIndustries Discord**](https://discord.gg/yv6ZYd7eTw)

EcoScore is a small sustainability project by **AstraIndustries**. It compares 20 everyday habits across four areas, returns a score from 0 to 100 and highlights realistic places to improve.

The public site is a **single switchable interface** with **Italian, English and Russian** available directly in the header. Language preference is remembered locally.

## What it includes

- 20-question sustainability check
- 4 equally weighted categories: Mobility, Energy, Food and Consumption
- score from 0 to 100
- per-category percentages
- improvement priorities
- positive habits already in place
- a practical 7-day challenge
- **Eco Rally**, an original competitive 2D pixel-art racing time trial
- responsive desktop and mobile layouts
- live IT / EN / RU language switching
- motion and micro-interactions with reduced-motion support
- a dedicated AstraIndustries Discord community section

## Eco Rally

Eco Rally replaces the previous score-arena game with a more concrete and skill-based racing challenge.

The game is a **three-lap top-down pixel-art time trial**. The goal is to learn the circuit, improve braking points and corner exits, and beat your own best lap.

### Core mechanics

- Arrow keys or WASD for throttle, braking and steering
- Space to drift
- Shift to use boost
- three-lap sessions
- mandatory checkpoints
- road grip versus slower grass/off-road handling
- boost pads placed around the circuit
- boost gained through controlled drifting
- lap timer, best lap and delta display
- personal best saved in `localStorage`
- best-lap racing line saved as a transparent ghost replay
- ghost opponent visible during later attempts
- pixel skid marks, particles and environmental details
- procedural engine and feedback sounds through the Web Audio API
- pause, mute, restart and fullscreen controls
- dedicated touch controls for mobile

The competitive loop is intentionally simple: **learn the track → set a clean lap → race your ghost → improve by tenths**.

## Languages

EcoScore uses one public site rather than separate language deployments.

Available languages:

- 🇮🇹 Italian
- 🇬🇧 English
- 🇷🇺 Russian

The switch happens inside the current page, including the quiz, results, game and Discord/community copy.

## Discord community

Discord is a primary part of the project rather than a small footer link. The site includes a dedicated community section for:

- sharing Eco Rally best-lap times
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
- `localStorage` for language preference, best lap and ghost replay

## Note

EcoScore is an educational project. It is not an environmental certification and does not attempt to calculate a complete personal carbon footprint.
