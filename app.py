import json
from pathlib import Path

from flask import Flask, jsonify, render_template, request

BASE_DIR = Path(__file__).resolve().parent
DATA = json.loads((BASE_DIR / 'questions.json').read_text(encoding='utf-8'))
CATEGORIES = DATA['categories']
QUESTIONS = DATA['questions']

app = Flask(__name__)


@app.get('/')
def home():
    return render_template('index.html')


@app.get('/api/questions')
def api_questions():
    return jsonify({
        'count': len(QUESTIONS),
        'max_score': len(QUESTIONS) * 5,
        'categories': {
            name: {'icon': category['icon']}
            for name, category in CATEGORIES.items()
        },
        'questions': [
            {
                'id': index,
                'category': question['category'],
                'question': question['q'],
                'options': [label for label, _points in question['options']],
            }
            for index, question in enumerate(QUESTIONS)
        ],
    })


def score_band(total):
    if total >= 85:
        return {
            'label': 'Molto sostenibile',
            'summary': 'Le tue abitudini sono già solide. Il margine più utile è nelle poche scelte che fai ancora in modo meno efficiente.',
        }
    if total >= 70:
        return {
            'label': 'Buon equilibrio',
            'summary': 'Hai una base sostenibile concreta. Alcune modifiche mirate possono migliorare molto il risultato senza cambiare tutto.',
        }
    if total >= 55:
        return {
            'label': 'In evoluzione',
            'summary': 'Ci sono buone abitudini, ma anche aree con margine. Concentrati prima sulle azioni più semplici da ripetere.',
        }
    if total >= 40:
        return {
            'label': 'Ampio margine',
            'summary': 'Il punteggio evidenzia diverse opportunità pratiche. Meglio migliorare poche abitudini alla volta e mantenerle.',
        }
    return {
        'label': 'Da costruire',
        'summary': 'Il risultato è un punto di partenza. Scegli una sola abitudine concreta e rendila stabile prima di aggiungerne altre.',
    }


@app.post('/api/score')
def api_score():
    payload = request.get_json(silent=True) or {}
    answers = payload.get('answers')

    if not isinstance(answers, list) or len(answers) != len(QUESTIONS):
        return jsonify({'error': f'Servono esattamente {len(QUESTIONS)} risposte.'}), 400

    totals = {name: 0 for name in CATEGORIES}
    total = 0
    improvement = []
    wins = []

    for index, (question, selected) in enumerate(zip(QUESTIONS, answers)):
        if isinstance(selected, bool) or not isinstance(selected, int):
            return jsonify({'error': f'Risposta {index + 1} non valida.'}), 400
        if selected < 0 or selected >= len(question['options']):
            return jsonify({'error': f'Risposta {index + 1} fuori intervallo.'}), 400

        _label, points = question['options'][selected]
        category = question['category']
        total += points
        totals[category] += points

        if points <= 3:
            improvement.append({
                'gap': 5 - points,
                'score': points,
                'category': category,
                'text': question['tip'],
            })
        elif points >= 4:
            wins.append({
                'score': points,
                'category': category,
                'text': question['win'],
            })

    ordered = sorted(totals.items(), key=lambda item: (-item[1], item[0]))
    weakest = min(totals.items(), key=lambda item: (item[1], item[0]))[0]
    improvement.sort(key=lambda item: (-item['gap'], item['score'], item['category']))
    wins.sort(key=lambda item: (-item['score'], item['category']))

    band = score_band(total)
    tips = improvement[:4] or [{
        'category': weakest,
        'text': 'Mantieni le abitudini attuali e prova una nuova scelta sostenibile per una settimana.',
    }]

    return jsonify({
        'total': total,
        'max_score': len(QUESTIONS) * 5,
        'label': band['label'],
        'summary': band['summary'],
        'best_category': ordered[0][0],
        'weakest_category': weakest,
        'category_totals': totals,
        'category_percentages': {
            name: round((value / 25) * 100)
            for name, value in totals.items()
        },
        'challenge': {
            'title': CATEGORIES[weakest]['challenge'][0],
            'text': CATEGORIES[weakest]['challenge'][1],
        },
        'tips': tips,
        'wins': wins[:4],
    })


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=False)
