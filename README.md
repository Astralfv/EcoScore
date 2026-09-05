# EcoScore 🌱

## Apri il progetto

👉 [**Apri EcoScore nel browser**](https://ecoscore-71mu7k.v2.appdeploy.ai/)

EcoScore is a sustainability web application built with **Python + Flask**.

The user answers 20 questions across four areas — Mobility, Energy, Food and Consumption — and the browser sends only the selected answer indexes to the Flask backend. Python validates the 20 answers, calculates the final score out of 100, computes category results, and returns personalized tips and a 7-day challenge.

## Tech stack

- **Python 3** — core application logic
- **Flask** — web server and API endpoints
- **HTML5** — interface structure
- **CSS3** — responsive visual design
- **JavaScript** — dynamic quiz UI and Leaf Runner mini-game
- **Canvas API + requestAnimationFrame** — 2D pixel game rendering and loop

## Where Python is used

### `app.py`
Runs the Flask web server and exposes:

- `GET /` — serves the EcoScore interface
- `GET /api/questions` — returns the 20 quiz questions
- `POST /api/score` — receives the answers and returns the calculated result

### `ecoscore.py`
Contains:

- all 20 questions
- 5 answers per question
- score values from 1 to 5
- validation logic
- total EcoScore calculation
- category totals
- personalized recommendations
- Green Wins
- 7-day challenge selection

With 20 questions × maximum 5 points, the maximum score is exactly **100**.

## Run locally

### Windows

1. Run `install.bat` once.
2. Run `start.bat`.
3. The browser opens at `http://127.0.0.1:5000`.

### Terminal

```bash
pip install -r requirements.txt
python app.py
```

Then open:

```text
http://127.0.0.1:5000
```

## Project structure

```text
EcoScore/
├── app.py
├── ecoscore.py
├── requirements.txt
├── install.bat
├── start.bat
├── templates/
│   └── index.html
└── static/
    ├── style.css
    └── app.js
```

## Leaf Runner

Leaf Runner is a custom 2D pixel mini-game included in the web interface.

Controls:

- `SPACE` — jump
- `↑` — jump
- tap/click — mobile control

## Community

AstraIndustries Discord: https://discord.gg/yv6ZYd7eTw

---

EcoScore is an educational tool and is not an environmental certification or a complete scientific measurement of personal emissions.
