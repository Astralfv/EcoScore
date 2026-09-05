import json
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory

BASE_DIR = Path(__file__).resolve().parent
DATA = json.loads((BASE_DIR / 'questions.json').read_text(encoding='utf-8'))
CATEGORIES = DATA['categories']
QUESTIONS = DATA['questions']

app = Flask(__name__)


@app.get('/')
def home():
    return send_from_directory(BASE_DIR, 'index.html')


@app.get('/style.css')
def style():
    return send_from_directory(BASE_DIR, 'style.css')


@app.get('/app.js')
def javascript():
    return send_from_directory(BASE_DIR, 'app.js')


@app.get('/api/questions')
def api_questions():
    return jsonify({
        'count': len(QUESTIONS),
        'max_score': len(QUESTIONS) * 5,
        'categories': {name: {'icon': data['icon']} for name, data in CATEGORIES.items()},
        'questions': [
            {
                'id': i,
                'category': q['category'],
                'question': q['q'],
                'options': [label for label, _points in q['options']],
            }
            for i, q in enumerate(QUESTIONS)
        ],
    })


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

    for i, (question, selected) in enumerate(zip(QUESTIONS, answers)):
        if isinstance(selected, bool) or not isinstance(selected, int):
            return jsonify({'error': f'Risposta {i + 1} non valida.'}), 400
        if selected < 0 or selected >= len(question['options']):
            return jsonify({'error': f'Risposta {i + 1} fuori intervallo.'}), 400

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
        if points >= 4:
            wins.append({
                'score': points,
                'category': category,
                'text': question['win'],
            })

    if total >= 90:
        title = 'Eco ninja. Quasi sospetto.'
        text = 'Le tue abitudini sono molto solide. Il prossimo livello è rendere costanti le poche scelte ancora migliorabili.'
    elif total >= 75:
        title = 'Molto bene. Davvero.'
        text = 'Hai già una base sostenibile forte. Poche modifiche mirate possono spostare parecchio il risultato.'
    elif total >= 60:
        title = 'Buona base, tanto potenziale.'
        text = 'Non parti da zero. Scegli una o due abitudini semplici da ripetere invece di rivoluzionare tutto insieme.'
    elif total >= 40:
        title = 'Work in progress.'
        text = 'Ci sono diverse opportunità concrete. Le risposte più basse indicano dove puoi migliorare più facilmente.'
    else:
        title = 'Houston, abbiamo margine.'
        text = 'Il punteggio non è una sentenza: è una mappa. Parti da una singola abitudine fattibile e rendila automatica.'

    ordered = sorted(totals.items(), key=lambda item: item[1], reverse=True)
    weakest = min(totals, key=totals.get)
    improvement.sort(key=lambda item: (item['gap'], -item['score']), reverse=True)
    wins.sort(key=lambda item: item['score'], reverse=True)

    tips = improvement[:5] or [{
        'category': weakest,
        'text': 'Continua così e sperimenta una nuova abitudine sostenibile per 7 giorni.',
    }]

    return jsonify({
        'total': total,
        'title': title,
        'text': text,
        'best_category': ordered[0][0],
        'weakest_category': weakest,
        'category_totals': totals,
        'category_percentages': {name: value * 4 for name, value in totals.items()},
        'challenge': {
            'title': CATEGORIES[weakest]['challenge'][0],
            'text': CATEGORIES[weakest]['challenge'][1],
        },
        'tips': tips,
        'wins': wins[:6],
    })


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=False)
