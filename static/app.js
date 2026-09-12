const byId = (id) => document.getElementById(id);

const quizState = { questions: [], categories: {}, answers: [], index: 0 };

function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function loadQuiz() {
  const response = await fetch('/api/questions');
  if (!response.ok) throw new Error('Impossibile caricare il quiz.');
  const data = await response.json();
  quizState.questions = data.questions;
  quizState.categories = data.categories;
  quizState.answers = Array(data.questions.length).fill(null);
}

async function ensureQuizLoaded() {
  if (quizState.questions.length) return true;
  try {
    await loadQuiz();
    return true;
  } catch (error) {
    console.error(error);
    window.alert('Il quiz non è disponibile. Verifica che il server Flask sia avviato.');
    return false;
  }
}

async function startQuiz() {
  if (!(await ensureQuizLoaded())) return;
  byId('quizIntro').classList.add('hidden');
  byId('resultsPanel').classList.add('hidden');
  byId('quizPanel').classList.remove('hidden');
  renderQuestion();
}

async function resetQuiz() {
  if (!(await ensureQuizLoaded())) return;
  quizState.index = 0;
  quizState.answers = Array(quizState.questions.length).fill(null);
  byId('quizIntro').classList.add('hidden');
  byId('resultsPanel').classList.add('hidden');
  byId('quizPanel').classList.remove('hidden');
  renderQuestion();
  scrollToSection('quiz');
}

function renderQuestion() {
  const question = quizState.questions[quizState.index];
  const selected = quizState.answers[quizState.index];
  const category = quizState.categories[question.category];

  byId('categoryLabel').textContent = `${category.icon} ${question.category}`;
  byId('questionCounter').textContent = `${quizState.index + 1} di ${quizState.questions.length}`;
  byId('questionKicker').textContent = `DOMANDA ${String(quizState.index + 1).padStart(2, '0')}`;
  byId('questionText').textContent = question.question;
  byId('progressBar').style.width = `${((quizState.index + 1) / quizState.questions.length) * 100}%`;

  const list = byId('answerList');
  list.innerHTML = '';
  question.options.forEach((label, optionIndex) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `answer${selected === optionIndex ? ' selected' : ''}`;
    button.innerHTML = `<span class="answer-index">${String.fromCharCode(65 + optionIndex)}</span><span>${label}</span>`;
    button.addEventListener('click', () => {
      quizState.answers[quizState.index] = optionIndex;
      renderQuestion();
    });
    list.appendChild(button);
  });

  byId('previousButton').style.visibility = quizState.index === 0 ? 'hidden' : 'visible';
  byId('nextButton').disabled = selected === null;
  byId('nextButton').textContent = quizState.index === quizState.questions.length - 1 ? 'Vedi risultato' : 'Avanti';
}

async function showResults() {
  const response = await fetch('/api/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers: quizState.answers }),
  });
  const data = await response.json();
  if (!response.ok) {
    window.alert(data.error || 'Errore durante il calcolo.');
    return;
  }

  byId('quizPanel').classList.add('hidden');
  byId('resultsPanel').classList.remove('hidden');
  byId('totalScore').textContent = data.total;
  byId('scoreRing').style.setProperty('--score', data.total);
  byId('scoreLabel').textContent = data.label;
  byId('scoreSummary').textContent = data.summary;
  byId('bestCategory').textContent = `Area migliore: ${data.best_category}`;
  byId('weakestCategory').textContent = `Priorità: ${data.weakest_category}`;
  byId('categoryResults').innerHTML = Object.entries(data.category_percentages)
    .map(([category, value]) => `<div class="category-line"><span>${category}</span><div><i style="width:${value}%"></i></div><b>${value}</b></div>`)
    .join('');
  byId('challengeTitle').textContent = data.challenge.title;
  byId('challengeText').textContent = data.challenge.text;
  byId('tipsList').innerHTML = data.tips.map((tip) => `<div class="tip-item"><span>${tip.category}</span><p>${tip.text}</p></div>`).join('');
  const wins = data.wins.length ? data.wins : [{ text: 'Hai completato il check: conoscere il punto di partenza è già utile.' }];
  byId('winsList').innerHTML = wins.map((win) => `<div class="win-item">${win.text}</div>`).join('');
  scrollToSection('quiz');
}

byId('heroQuizButton').addEventListener('click', () => {
  scrollToSection('quiz');
  window.setTimeout(startQuiz, 280);
});
byId('heroGameButton').addEventListener('click', () => scrollToSection('game'));
byId('startQuizButton').addEventListener('click', startQuiz);
byId('restartQuizButton').addEventListener('click', resetQuiz);
byId('redoQuizButton').addEventListener('click', resetQuiz);
byId('goToGameButton').addEventListener('click', () => scrollToSection('game'));
byId('previousButton').addEventListener('click', () => {
  if (quizState.index > 0) {
    quizState.index -= 1;
    renderQuestion();
  }
});
byId('nextButton').addEventListener('click', () => {
  if (quizState.answers[quizState.index] === null) return;
  if (quizState.index < quizState.questions.length - 1) {
    quizState.index += 1;
    renderQuestion();
  } else showResults();
});

byId('menuToggle').addEventListener('click', () => {
  const menu = byId('mobileNav');
  const isOpen = menu.classList.toggle('open');
  byId('menuToggle').setAttribute('aria-expanded', String(isOpen));
});
document.querySelectorAll('#mobileNav a').forEach((link) => link.addEventListener('click', () => {
  byId('mobileNav').classList.remove('open');
  byId('menuToggle').setAttribute('aria-expanded', 'false');
}));

// Eco Maze -----------------------------------------------------------------
const canvas = byId('gameCanvas');
const ctx = canvas.getContext('2d');
const tile = 32;
const maze = [
  '#####################',
  '#.........#.........#',
  '#.###.###.#.###.###.#',
  '#O###.###.#.###.###O#',
  '#...................#',
  '#.###.#.#####.#.###.#',
  '#.....#...#...#.....#',
  '#####.### # ###.#####',
  '#.....#.......#.....#',
  '#.###.#.#####.#.###.#',
  '#...#.....#.....#...#',
  '###.#.###.#.###.#.###',
  '#O....#.......#....O#',
  '#.########.########.#',
  '#####################',
];
const dirs = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];
const bestKey = 'ecoscore_maze_best';
let phase = 'ready';
let desired = { x: 0, y: 0 };
let score = 0;
let level = 1;
let lives = 3;
let best = Number(localStorage.getItem(bestKey) || 0);
let power = 0;
let invulnerable = 0;
let seeds = new Set();
let flowers = new Set();
let particles = [];
let audioContext = null;
let musicTimer = null;
let musicStep = 0;
let muted = false;
let lastTime = performance.now();

function mover(x, y, speed) {
  return { gx: x, gy: y, tx: x, ty: y, progress: 0, dir: { x: 0, y: 0 }, speed };
}

let player = mover(10, 12, 5.3);
let enemies = [];

function cellKey(x, y) { return `${x},${y}`; }
function openCell(x, y) { return y >= 0 && y < maze.length && x >= 0 && x < maze[0].length && maze[y][x] !== '#'; }
function position(entity) {
  return {
    x: entity.gx + (entity.tx - entity.gx) * entity.progress,
    y: entity.gy + (entity.ty - entity.gy) * entity.progress,
  };
}

function createEnemies() {
  const boost = Math.min(1.6, (level - 1) * 0.14);
  return [
    { ...mover(9, 7, 3.35 + boost), mode: 'chase', hx: 9, hy: 7 },
    { ...mover(11, 7, 3.15 + boost), mode: 'ambush', hx: 11, hy: 7 },
    { ...mover(10, 8, 2.95 + boost), mode: 'wander', hx: 10, hy: 8 },
  ];
}

function resetPositions() {
  player = mover(10, 12, 5.3);
  desired = { x: 0, y: 0 };
  enemies = createEnemies();
}

function resetLevel() {
  seeds = new Set();
  flowers = new Set();
  maze.forEach((row, y) => row.split('').forEach((value, x) => {
    if (value === '.') seeds.add(cellKey(x, y));
    if (value === 'O') flowers.add(cellKey(x, y));
  }));
  power = 0;
  invulnerable = 1.2;
  particles = [];
  resetPositions();
}

function ensureAudio() {
  if (!audioContext) audioContext = new AudioContext();
  if (audioContext.state === 'suspended') audioContext.resume();
  return audioContext;
}

function tone(freq, duration, volume, type = 'sine', delay = 0) {
  if (muted) return;
  const audio = ensureAudio();
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  const start = audio.currentTime + delay;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(audio.destination);
  osc.start(start);
  osc.stop(start + duration + 0.03);
}

function sfx(name) {
  if (name === 'seed') tone(720, .07, .035, 'triangle');
  if (name === 'flower') {
    tone(440, .12, .05, 'sine');
    tone(660, .14, .04, 'sine', .08);
    tone(880, .18, .035, 'sine', .16);
  }
  if (name === 'hit') {
    tone(170, .22, .08, 'sawtooth');
    tone(110, .32, .05, 'square', .08);
  }
  if (name === 'enemy') {
    tone(250, .09, .05, 'square');
    tone(390, .12, .04, 'triangle', .06);
  }
  if (name === 'level') [523, 659, 784, 1047].forEach((n, i) => tone(n, .16, .04, 'sine', i * .09));
}

function startMusic() {
  ensureAudio();
  if (musicTimer) return;
  const melody = [262, 330, 392, 330, 294, 349, 440, 349];
  musicTimer = window.setInterval(() => {
    if (phase !== 'running' || muted) return;
    const i = musicStep++ % melody.length;
    tone(melody[i], .17, .012, 'triangle');
    if (i % 2 === 0) tone(i % 4 === 0 ? 131 : 147, .2, .009, 'sine');
  }, 260);
}

function updateHud() {
  byId('gameScore').textContent = score;
  byId('gameLevel').textContent = level;
  byId('gameLives').textContent = '●'.repeat(Math.max(0, lives));
  byId('gameBest').textContent = best;
}

function addScore(amount) {
  score += amount;
  if (score > best) {
    best = score;
    localStorage.setItem(bestKey, String(best));
  }
  updateHud();
}

function burst(gx, gy, color, count) {
  for (let i = 0; i < count; i += 1) {
    particles.push({ x: (gx + .5) * tile, y: (gy + .5) * tile, vx: (Math.random() - .5) * 90, vy: (Math.random() - .5) * 90, life: 1, color });
  }
}

function collect(gx, gy) {
  const id = cellKey(gx, gy);
  if (seeds.delete(id)) {
    addScore(10);
    burst(gx, gy, '#f2c45e', 5);
    sfx('seed');
  }
  if (flowers.delete(id)) {
    addScore(50);
    power = 7;
    burst(gx, gy, '#b6db76', 18);
    sfx('flower');
  }
  if (!seeds.size && !flowers.size) {
    addScore(500);
    sfx('level');
    level += 1;
    updateHud();
    resetLevel();
  }
}

function playerDirection() {
  if (openCell(player.gx + desired.x, player.gy + desired.y)) return desired;
  if (openCell(player.gx + player.dir.x, player.gy + player.dir.y)) return player.dir;
  return { x: 0, y: 0 };
}

function enemyDirection(enemy) {
  const available = dirs.filter((dir) => openCell(enemy.gx + dir.x, enemy.gy + dir.y));
  if (!available.length) return { x: 0, y: 0 };
  const reverse = { x: -enemy.dir.x, y: -enemy.dir.y };
  const choices = available.length > 1 ? available.filter((dir) => dir.x !== reverse.x || dir.y !== reverse.y) : available;
  const target = position(player);
  if (power > 0) {
    return choices.sort((a, b) => {
      const da = Math.abs(enemy.gx + a.x - target.x) + Math.abs(enemy.gy + a.y - target.y);
      const db = Math.abs(enemy.gx + b.x - target.x) + Math.abs(enemy.gy + b.y - target.y);
      return db - da;
    })[0];
  }
  if (enemy.mode === 'wander' || Math.random() < .18) return choices[Math.floor(Math.random() * choices.length)];
  const aim = enemy.mode === 'ambush' ? { x: target.x + desired.x * 3, y: target.y + desired.y * 3 } : target;
  return choices.sort((a, b) => {
    const da = Math.abs(enemy.gx + a.x - aim.x) + Math.abs(enemy.gy + a.y - aim.y);
    const db = Math.abs(enemy.gx + b.x - aim.x) + Math.abs(enemy.gy + b.y - aim.y);
    return da - db;
  })[0];
}

function advance(entity, dt, chooser, arrived) {
  let distance = entity.speed * dt;
  while (distance > 0) {
    if (entity.tx === entity.gx && entity.ty === entity.gy) {
      const next = chooser();
      if (!next.x && !next.y) return;
      entity.dir = { ...next };
      entity.tx = entity.gx + next.x;
      entity.ty = entity.gy + next.y;
    }
    const step = Math.min(distance, 1 - entity.progress);
    entity.progress += step;
    distance -= step;
    if (entity.progress >= .9999) {
      entity.gx = entity.tx;
      entity.gy = entity.ty;
      entity.tx = entity.gx;
      entity.ty = entity.gy;
      entity.progress = 0;
      if (arrived) arrived();
    }
  }
}

function setPhase(next) {
  phase = next;
  const overlay = byId('gameOverlay');
  if (next === 'running') overlay.classList.add('hidden');
  else overlay.classList.remove('hidden');
  if (next === 'paused') {
    byId('overlayTitle').textContent = 'In pausa';
    byId('overlayText').textContent = 'Premi per riprendere.';
  } else if (next === 'gameover') {
    byId('overlayTitle').textContent = 'Partita finita';
    byId('overlayText').textContent = `Punteggio: ${score}`;
  } else {
    byId('overlayTitle').textContent = 'Eco Maze';
    byId('overlayText').textContent = 'Raccogli tutti i semi e evita lo smog.';
  }
}

function newGame() {
  score = 0;
  level = 1;
  lives = 3;
  resetLevel();
  updateHud();
  setPhase('running');
  startMusic();
  tone(392, .1, .04, 'triangle');
  tone(523, .13, .04, 'triangle', .09);
}

function togglePause() {
  if (phase === 'running') setPhase('paused');
  else if (phase === 'paused') setPhase('running');
  byId('pauseGameButton').textContent = phase === 'paused' ? 'Riprendi' : 'Pausa';
}

function toggleSound() {
  muted = !muted;
  byId('soundButton').textContent = muted ? 'Audio off' : 'Audio on';
  if (!muted) {
    ensureAudio();
    tone(523, .08, .03, 'triangle');
  }
}

function loseLife() {
  if (invulnerable > 0) return;
  lives -= 1;
  updateHud();
  sfx('hit');
  if (lives <= 0) {
    setPhase('gameover');
    return;
  }
  invulnerable = 1.6;
  resetPositions();
}

function queueDirection(dir) {
  desired = { ...dir };
  if (phase === 'ready') newGame();
}

function drawLeaf(x, y, rotation, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#7fbd67';
  ctx.beginPath();
  ctx.ellipse(0, 0, 7, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function renderGame(now) {
  const dt = Math.min(.033, (now - lastTime) / 1000);
  lastTime = now;

  if (phase === 'running') {
    power = Math.max(0, power - dt);
    invulnerable = Math.max(0, invulnerable - dt);
    advance(player, dt, playerDirection, () => collect(player.gx, player.gy));
    enemies.forEach((enemy) => advance(enemy, dt, () => enemyDirection(enemy)));
    const p = position(player);
    enemies.forEach((enemy) => {
      const e = position(enemy);
      if (Math.hypot(p.x - e.x, p.y - e.y) < .62) {
        if (power > 0) {
          addScore(200);
          sfx('enemy');
          burst(enemy.gx, enemy.gy, '#b7d9dd', 20);
          Object.assign(enemy, mover(enemy.hx, enemy.hy, enemy.speed));
        } else loseLife();
      }
    });
    particles.forEach((particle) => {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 18 * dt;
      particle.life -= dt * 1.8;
    });
    particles = particles.filter((particle) => particle.life > 0);
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#eef3e8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < maze.length; y += 1) {
    for (let x = 0; x < maze[y].length; x += 1) {
      const px = x * tile;
      const py = y * tile;
      if (maze[y][x] === '#') {
        ctx.fillStyle = '#244d3b';
        ctx.beginPath();
        ctx.roundRect(px + 2, py + 2, tile - 4, tile - 4, 7);
        ctx.fill();
        if ((x + y) % 3 === 0) drawLeaf(px + 9, py + 9, -.55, .72);
      } else {
        ctx.fillStyle = (x + y) % 2 ? '#f0f4eb' : '#f4f6ef';
        ctx.fillRect(px, py, tile, tile);
      }
    }
  }

  seeds.forEach((value) => {
    const [x, y] = value.split(',').map(Number);
    const pulse = 1 + Math.sin(now / 220 + x + y) * .15;
    ctx.fillStyle = '#d8a93b';
    ctx.beginPath();
    ctx.ellipse((x + .5) * tile, (y + .5) * tile, 3.1 * pulse, 4.3 * pulse, .5, 0, Math.PI * 2);
    ctx.fill();
  });

  flowers.forEach((value) => {
    const [x, y] = value.split(',').map(Number);
    const cx = (x + .5) * tile;
    const cy = (y + .5) * tile;
    for (let petal = 0; petal < 5; petal += 1) {
      const angle = petal * Math.PI * 2 / 5 + now / 4000;
      ctx.fillStyle = '#f1d56f';
      ctx.beginPath();
      ctx.arc(cx + Math.cos(angle) * 6, cy + Math.sin(angle) * 6, 3.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#5d9d59';
    ctx.beginPath();
    ctx.arc(cx, cy, 3.4, 0, Math.PI * 2);
    ctx.fill();
  });

  enemies.forEach((enemy, index) => {
    const e = position(enemy);
    const cx = (e.x + .5) * tile;
    const cy = (e.y + .5) * tile + Math.sin(now / 180 + index) * 1.6;
    ctx.fillStyle = power > 0 ? '#9bcbd1' : ['#66716d', '#596560', '#727a70'][index];
    ctx.beginPath();
    ctx.arc(cx, cy - 2, 11, Math.PI, 0);
    ctx.lineTo(cx + 12, cy + 9);
    ctx.quadraticCurveTo(cx + 7, cy + 5, cx + 3, cy + 10);
    ctx.quadraticCurveTo(cx - 2, cy + 5, cx - 6, cy + 10);
    ctx.quadraticCurveTo(cx - 10, cy + 5, cx - 12, cy + 9);
    ctx.closePath();
    ctx.fill();
  });

  const pp = position(player);
  const pcx = (pp.x + .5) * tile;
  const pcy = (pp.y + .5) * tile;
  const blink = invulnerable > 0 && Math.floor(now / 90) % 2 === 0;
  if (!blink) {
    ctx.fillStyle = power > 0 ? '#66b76c' : '#3b8b5f';
    ctx.beginPath();
    ctx.arc(pcx, pcy, 11, 0, Math.PI * 2);
    ctx.fill();
    drawLeaf(pcx - 1, pcy - 12, -.7 + Math.sin(now / 130) * .12, .95);
    drawLeaf(pcx + 5, pcy - 12, .7 - Math.sin(now / 130) * .12, .9);
  }

  particles.forEach((particle) => {
    ctx.globalAlpha = Math.max(0, particle.life);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, 3.2, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  if (power > 0) {
    ctx.fillStyle = 'rgba(36,77,59,.18)';
    ctx.fillRect(0, canvas.height - 5, canvas.width * Math.min(1, power / 7), 5);
  }
  requestAnimationFrame(renderGame);
}

byId('gameOverlay').addEventListener('click', () => {
  if (phase === 'paused') togglePause();
  else newGame();
});
byId('restartGameButton').addEventListener('click', newGame);
byId('pauseGameButton').addEventListener('click', togglePause);
byId('soundButton').addEventListener('click', toggleSound);
byId('fullscreenButton').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (document.fullscreenEnabled) await byId('mazeFrame').requestFullscreen();
  } catch (error) {
    console.warn('Fullscreen non disponibile', error);
  }
});
document.addEventListener('fullscreenchange', () => {
  byId('fullscreenButton').textContent = document.fullscreenElement ? 'Esci da schermo intero' : 'Schermo intero';
});

document.querySelectorAll('[data-dir]').forEach((button) => {
  button.addEventListener('pointerdown', () => {
    const map = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
    queueDirection(map[button.dataset.dir]);
  });
});

window.addEventListener('keydown', (event) => {
  const map = {
    ArrowLeft: { x: -1, y: 0 }, KeyA: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 }, KeyD: { x: 1, y: 0 },
    ArrowUp: { x: 0, y: -1 }, KeyW: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 }, KeyS: { x: 0, y: 1 },
  };
  if (map[event.code]) {
    if (phase === 'running' || phase === 'ready') event.preventDefault();
    queueDirection(map[event.code]);
  }
  if (event.code === 'KeyP') togglePause();
  if (event.code === 'KeyM') toggleSound();
});

resetLevel();
updateHud();
requestAnimationFrame(renderGame);
loadQuiz().catch(() => {});
