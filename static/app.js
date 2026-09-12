const byId = (id) => document.getElementById(id);

const quizState = {
  questions: [],
  categories: {},
  answers: [],
  index: 0,
};

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

  const answerList = byId('answerList');
  answerList.innerHTML = '';

  question.options.forEach((label, optionIndex) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `answer${selected === optionIndex ? ' selected' : ''}`;
    button.innerHTML = `<span class="answer-index">${String.fromCharCode(65 + optionIndex)}</span><span>${label}</span>`;
    button.addEventListener('click', () => {
      quizState.answers[quizState.index] = optionIndex;
      renderQuestion();
    });
    answerList.appendChild(button);
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
  byId('tipsList').innerHTML = data.tips
    .map((tip) => `<div class="tip-item"><span>${tip.category}</span><p>${tip.text}</p></div>`)
    .join('');

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
  } else {
    showResults();
  }
});

byId('menuToggle').addEventListener('click', () => {
  const menu = byId('mobileNav');
  const isOpen = menu.classList.toggle('open');
  byId('menuToggle').setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('#mobileNav a').forEach((link) => {
  link.addEventListener('click', () => {
    byId('mobileNav').classList.remove('open');
    byId('menuToggle').setAttribute('aria-expanded', 'false');
  });
});

const canvas = byId('gameCanvas');
const ctx = canvas.getContext('2d');
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const BEST_KEY = 'ecoscore_river_cleanup_best';

const game = {
  running: false,
  lastTime: 0,
  elapsed: 0,
  score: 0,
  combo: 1,
  comboTimer: 0,
  best: Number(localStorage.getItem(BEST_KEY) || 0),
  spawnTimer: 0,
  obstacleTimer: 0,
  targetX: WIDTH / 2,
  pointerActive: false,
  keys: { left: false, right: false },
  particles: [],
  floaters: [],
  obstacles: [],
  popups: [],
};

const boat = {
  x: WIDTH / 2,
  y: HEIGHT - 115,
  width: 72,
  height: 92,
  vx: 0,
  tilt: 0,
};

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function randomBetween(min, max) { return min + Math.random() * (max - min); }

function roundedRect(x, y, width, height, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
}

function drawRiver(time) {
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, '#8cc4c8');
  gradient.addColorStop(1, '#5f9da7');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = '#6e8a5f';
  ctx.fillRect(0, 0, 82, HEIGHT);
  ctx.fillRect(WIDTH - 82, 0, 82, HEIGHT);
  ctx.fillStyle = '#8ca27c';
  ctx.fillRect(67, 0, 18, HEIGHT);
  ctx.fillRect(WIDTH - 85, 0, 18, HEIGHT);

  for (let i = 0; i < 18; i += 1) {
    const y = (i * 54 + (time * 70) % 54) - 54;
    const offset = Math.sin(time * 1.7 + i * .8) * 20;
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(120 + offset, y);
    ctx.bezierCurveTo(260 + offset, y + 14, 390 - offset, y - 10, 520 + offset, y + 5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(560 - offset, y + 20);
    ctx.bezierCurveTo(660 + offset, y + 5, 760 - offset, y + 24, 835 + offset, y + 10);
    ctx.stroke();
  }
}

function drawBoat(time) {
  const bob = Math.sin(time * 5) * 2.3;
  ctx.save();
  ctx.translate(boat.x, boat.y + bob);
  ctx.rotate(boat.tilt);

  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.beginPath();
  ctx.moveTo(-25, 38);
  ctx.lineTo(-42, 82);
  ctx.lineTo(-11, 51);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(25, 38);
  ctx.lineTo(42, 82);
  ctx.lineTo(11, 51);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#2b5f45';
  ctx.beginPath();
  ctx.moveTo(0, -46);
  ctx.quadraticCurveTo(38, -30, 32, 28);
  ctx.quadraticCurveTo(24, 48, 0, 50);
  ctx.quadraticCurveTo(-24, 48, -32, 28);
  ctx.quadraticCurveTo(-38, -30, 0, -46);
  ctx.fill();

  ctx.fillStyle = '#f0ede1';
  ctx.beginPath();
  ctx.moveTo(0, -30);
  ctx.quadraticCurveTo(25, -15, 21, 25);
  ctx.quadraticCurveTo(0, 36, -21, 25);
  ctx.quadraticCurveTo(-25, -15, 0, -30);
  ctx.fill();

  roundedRect(-13, -3, 26, 24, 6, '#b66b3d');
  ctx.fillStyle = '#23352b';
  ctx.beginPath();
  ctx.arc(0, -9, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d7e1d8';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-22, 9);
  ctx.lineTo(-44, 36);
  ctx.moveTo(22, 9);
  ctx.lineTo(44, 36);
  ctx.stroke();
  ctx.restore();
}

function spawnTrash() {
  const types = ['bottle', 'can', 'bag'];
  game.floaters.push({
    type: types[Math.floor(Math.random() * types.length)],
    x: randomBetween(125, WIDTH - 125),
    y: -40,
    rotation: randomBetween(-.8, .8),
    spin: randomBetween(-1.4, 1.4),
    drift: randomBetween(-22, 22),
  });
}

function spawnObstacle() {
  const type = Math.random() < .52 ? 'rock' : 'log';
  game.obstacles.push({
    type,
    x: randomBetween(130, WIDTH - 130),
    y: -80,
    width: type === 'rock' ? randomBetween(48, 68) : randomBetween(80, 112),
    height: type === 'rock' ? randomBetween(42, 58) : randomBetween(26, 34),
    rotation: randomBetween(-.4, .4),
  });
}

function drawTrash(item) {
  ctx.save();
  ctx.translate(item.x, item.y);
  ctx.rotate(item.rotation);
  if (item.type === 'bottle') {
    roundedRect(-7, -14, 14, 28, 5, '#dbe9e7');
    roundedRect(-4, -20, 8, 8, 2, '#39765b');
    ctx.fillStyle = '#89b8a7';
    ctx.fillRect(-5, -5, 10, 8);
  } else if (item.type === 'can') {
    roundedRect(-9, -13, 18, 26, 4, '#d4d8d2');
    ctx.fillStyle = '#b05243';
    ctx.fillRect(-8, -5, 16, 8);
  } else {
    ctx.fillStyle = '#d8d0ad';
    ctx.beginPath();
    ctx.moveTo(-14, -10);
    ctx.lineTo(12, -13);
    ctx.lineTo(15, 13);
    ctx.lineTo(-10, 10);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawObstacle(item) {
  ctx.save();
  ctx.translate(item.x, item.y);
  ctx.rotate(item.rotation);
  if (item.type === 'rock') {
    ctx.fillStyle = '#59645f';
    ctx.beginPath();
    ctx.moveTo(-item.width * .48, item.height * .25);
    ctx.lineTo(-item.width * .26, -item.height * .45);
    ctx.lineTo(item.width * .2, -item.height * .5);
    ctx.lineTo(item.width * .5, item.height * .18);
    ctx.lineTo(item.width * .24, item.height * .46);
    ctx.closePath();
    ctx.fill();
  } else {
    roundedRect(-item.width / 2, -item.height / 2, item.width, item.height, item.height / 2, '#6b4a32');
    ctx.fillStyle = '#8c6549';
    ctx.beginPath();
    ctx.arc(-item.width / 2 + 10, 0, item.height * .28, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function spawnParticles(x, y, color, amount) {
  for (let i = 0; i < amount; i += 1) {
    game.particles.push({
      x,
      y,
      vx: randomBetween(-85, 85),
      vy: randomBetween(-70, 20),
      life: randomBetween(.35, .75),
      maxLife: .75,
      size: randomBetween(3, 7),
      color,
    });
  }
}

function addPopup(text, x, y) { game.popups.push({ text, x, y, life: .8 }); }
function boatHitbox() { return { x: boat.x - 23, y: boat.y - 37, width: 46, height: 72 }; }
function trashHitbox(item) { return { x: item.x - 15, y: item.y - 18, width: 30, height: 36 }; }
function obstacleHitbox(item) { return { x: item.x - item.width * .42, y: item.y - item.height * .38, width: item.width * .84, height: item.height * .76 }; }
function intersects(a, b) { return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y; }

function resetGame() {
  game.elapsed = 0;
  game.score = 0;
  game.combo = 1;
  game.comboTimer = 0;
  game.spawnTimer = .4;
  game.obstacleTimer = 1.8;
  game.floaters = [];
  game.obstacles = [];
  game.particles = [];
  game.popups = [];
  game.targetX = WIDTH / 2;
  boat.x = WIDTH / 2;
  boat.vx = 0;
  boat.tilt = 0;
  updateHud();
}

function updateHud() {
  byId('gameScore').textContent = Math.floor(game.score);
  byId('gameCombo').textContent = `x${game.combo}`;
  byId('gameBest').textContent = game.best;
}

function startGame() {
  resetGame();
  game.running = true;
  game.lastTime = performance.now();
  byId('gameOverlay').classList.add('hidden');
  byId('gameStatus').textContent = 'In corso';
  requestAnimationFrame(gameLoop);
}

function endGame() {
  game.running = false;
  const finalScore = Math.floor(game.score);
  if (finalScore > game.best) {
    game.best = finalScore;
    localStorage.setItem(BEST_KEY, String(game.best));
  }
  updateHud();
  byId('overlayTitle').textContent = 'Partita finita';
  byId('overlayText').textContent = `Punteggio ${finalScore} · record ${game.best}`;
  byId('gameOverlay').classList.remove('hidden');
  byId('gameStatus').textContent = 'Game over';
}

function updateGame(delta) {
  game.elapsed += delta;
  const speed = Math.min(330, 150 + game.elapsed * 4.8);
  const keyboardDirection = Number(game.keys.right) - Number(game.keys.left);
  if (keyboardDirection) game.targetX += keyboardDirection * 430 * delta;
  game.targetX = clamp(game.targetX, 118, WIDTH - 118);

  const distance = game.targetX - boat.x;
  boat.vx += distance * 8.5 * delta;
  boat.vx *= Math.pow(.0008, delta);
  boat.x += boat.vx * delta;
  boat.x = clamp(boat.x, 118, WIDTH - 118);
  boat.tilt += (clamp(boat.vx / 650, -.24, .24) - boat.tilt) * Math.min(1, delta * 8);

  game.spawnTimer -= delta;
  if (game.spawnTimer <= 0) {
    spawnTrash();
    game.spawnTimer = randomBetween(.48, .9) * Math.max(.62, 1 - game.elapsed / 180);
  }
  game.obstacleTimer -= delta;
  if (game.obstacleTimer <= 0) {
    spawnObstacle();
    game.obstacleTimer = randomBetween(1.15, 1.8) * Math.max(.68, 1 - game.elapsed / 210);
  }
  game.comboTimer -= delta;
  if (game.comboTimer <= 0 && game.combo > 1) game.combo = 1;

  const currentBoatHitbox = boatHitbox();
  game.floaters.forEach((item) => {
    item.y += speed * delta;
    item.x += Math.sin(game.elapsed * 2 + item.y * .015) * item.drift * delta;
    item.rotation += item.spin * delta;
  });
  game.obstacles.forEach((item) => {
    item.y += speed * .9 * delta;
    item.rotation += .08 * delta;
  });

  game.floaters = game.floaters.filter((item) => {
    if (intersects(currentBoatHitbox, trashHitbox(item))) {
      const gained = 10 * game.combo;
      game.score += gained;
      game.combo = Math.min(5, game.combo + 1);
      game.comboTimer = 2.25;
      spawnParticles(item.x, item.y, '#e5f1ea', 12);
      addPopup(`+${gained}`, item.x, item.y);
      return false;
    }
    return item.y < HEIGHT + 70;
  });

  for (const item of game.obstacles) {
    if (intersects(currentBoatHitbox, obstacleHitbox(item))) {
      spawnParticles(boat.x, boat.y, '#ffffff', 18);
      endGame();
      return;
    }
  }
  game.obstacles = game.obstacles.filter((item) => item.y < HEIGHT + 100);

  game.particles.forEach((particle) => {
    particle.life -= delta;
    particle.x += particle.vx * delta;
    particle.y += particle.vy * delta;
    particle.vy += 110 * delta;
  });
  game.particles = game.particles.filter((particle) => particle.life > 0);
  game.popups.forEach((popup) => { popup.life -= delta; popup.y -= 36 * delta; });
  game.popups = game.popups.filter((popup) => popup.life > 0);
  game.score += delta * 2.2;
  updateHud();
}

function drawEffects() {
  game.particles.forEach((particle) => {
    ctx.globalAlpha = clamp(particle.life / particle.maxLife, 0, 1);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  ctx.textAlign = 'center';
  ctx.font = '700 22px Inter, sans-serif';
  game.popups.forEach((popup) => {
    ctx.globalAlpha = clamp(popup.life / .8, 0, 1);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(popup.text, popup.x, popup.y);
  });
  ctx.globalAlpha = 1;
}

function drawGame() {
  drawRiver(game.elapsed);
  game.floaters.forEach(drawTrash);
  game.obstacles.forEach(drawObstacle);
  drawBoat(game.elapsed);
  drawEffects();
}

function gameLoop(now) {
  if (!game.running) return;
  const delta = Math.min(.033, (now - game.lastTime) / 1000);
  game.lastTime = now;
  updateGame(delta);
  drawGame();
  if (game.running) requestAnimationFrame(gameLoop);
}

function canvasXFromPointer(event) {
  const rect = canvas.getBoundingClientRect();
  return ((event.clientX - rect.left) / rect.width) * WIDTH;
}

canvas.addEventListener('pointerdown', (event) => {
  game.pointerActive = true;
  canvas.setPointerCapture(event.pointerId);
  game.targetX = canvasXFromPointer(event);
});
canvas.addEventListener('pointermove', (event) => {
  if (game.pointerActive && game.running) game.targetX = canvasXFromPointer(event);
});
canvas.addEventListener('pointerup', () => { game.pointerActive = false; });
canvas.addEventListener('pointercancel', () => { game.pointerActive = false; });

window.addEventListener('keydown', (event) => {
  if (event.code === 'ArrowLeft' || event.code === 'KeyA') game.keys.left = true;
  if (event.code === 'ArrowRight' || event.code === 'KeyD') game.keys.right = true;
  if ((event.code === 'ArrowLeft' || event.code === 'ArrowRight') && byId('game').getBoundingClientRect().top < window.innerHeight) event.preventDefault();
});
window.addEventListener('keyup', (event) => {
  if (event.code === 'ArrowLeft' || event.code === 'KeyA') game.keys.left = false;
  if (event.code === 'ArrowRight' || event.code === 'KeyD') game.keys.right = false;
});

byId('startGameButton').addEventListener('click', startGame);
byId('gameOverlay').addEventListener('click', startGame);
byId('resetBestButton').addEventListener('click', () => {
  game.best = 0;
  localStorage.removeItem(BEST_KEY);
  updateHud();
});

resetGame();
drawGame();
loadQuiz().catch((error) => console.warn(error));
