'use strict';

/* ============================================================
   OFFGRIDWORKOUT — app.js
   Full app logic: navigation, exercises, diet, meals, BMR,
   progress tracking, localStorage persistence
   ============================================================ */

/* ---- SERVICE WORKER ---- */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

/* ---- STORAGE ---- */
const DB = {
  get(k, def) {
    try { const v = localStorage.getItem('ogw_' + k); return v !== null ? JSON.parse(v) : def; }
    catch { return def; }
  },
  set(k, v) { try { localStorage.setItem('ogw_' + k, JSON.stringify(v)); } catch {} },
  push(k, item) {
    const arr = this.get(k, []);
    arr.push(item);
    this.set(k, arr);
    return arr;
  }
};

/* ---- DATE HELPERS ---- */
const NOW = new Date();
const TODAY_STR = NOW.toDateString();
const TODAY_ISO = NOW.toISOString().split('T')[0];

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function monthKey(d) {
  const dt = d ? new Date(d) : NOW;
  return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0');
}

/* ---- HEADER DATE ---- */
const hd = document.getElementById('header-date');
if (hd) hd.textContent = NOW.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/* ---- INSTALL PROMPT ---- */
let deferredInstall = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredInstall = e;
  const b = document.getElementById('install-banner');
  if (b) b.style.display = 'block';
});
const installBtn = document.getElementById('install-btn');
if (installBtn) {
  installBtn.onclick = async () => {
    if (!deferredInstall) return;
    deferredInstall.prompt();
    const { outcome } = await deferredInstall.userChoice;
    if (outcome === 'accepted') {
      showToast('OFFGRIDWORKOUT installed!');
      document.getElementById('install-banner').style.display = 'none';
    }
    deferredInstall = null;
  };
}

/* ============================================================
   NAVIGATION
   ============================================================ */
const PAGES = ['home', 'gym', 'home-workout', 'diet', 'meals', 'calc', 'progress'];
let currentPage = DB.get('lastPage', 'home');

function goPage(id, navBtn) {
  PAGES.forEach(p => {
    const el = document.getElementById('page-' + p);
    if (el) el.classList.toggle('on', p === id);
  });
  document.querySelectorAll('.bnav').forEach(b => b.classList.remove('on'));
  if (navBtn) {
    navBtn.classList.add('on');
  } else {
    document.querySelectorAll('.bnav').forEach(b => {
      const fn = b.getAttribute('onclick') || '';
      if (fn.includes("'" + id + "'")) b.classList.add('on');
    });
  }
  DB.set('lastPage', id);
  currentPage = id;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (id === 'home') renderHome();
  if (id === 'progress') renderProgress();
  if (id === 'meals') renderSavedMeals();
}

window.goPage = goPage;

/* Restore last page on load */
(function() {
  const hash = location.hash.replace('#', '');
  const page = (hash && PAGES.includes(hash)) ? hash : currentPage;
  goPage(page);
})();

/* ============================================================
   TOAST
   ============================================================ */
function showToast(msg, dur = 2500) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), dur);
}
window.showToast = showToast;

/* ============================================================
   MODAL
   ============================================================ */
let modalCurrentEx = null;

function openModal(ex) {
  modalCurrentEx = ex;
  document.getElementById('modal-ex-name').textContent = ex.name;
  document.getElementById('modal-ex-figure').innerHTML = OGW.getSVG(ex.svg);

  const meta = document.getElementById('modal-ex-meta');
  meta.innerHTML = `
    <span class="pill tag-${ex.level.toLowerCase()}">${ex.level}</span>
    <span class="pill tag-${ex.type.toLowerCase().replace(' ','')}">${ex.type}</span>
    <span class="ex-meta-pill">${ex.sets} sets</span>
    <span class="ex-meta-pill">${ex.reps}</span>
    <span class="ex-meta-pill">Rest ${ex.rest}</span>
  `;
  document.getElementById('modal-ex-desc').textContent = ex.desc;
  const tips = document.getElementById('modal-ex-tips');
  tips.innerHTML = ex.tips.map(t => `<div class="ex-tip">${t}</div>`).join('');
  document.getElementById('ex-modal').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('ex-modal').classList.remove('show');
  document.body.style.overflow = '';
  modalCurrentEx = null;
}
window.closeModal = closeModal;

document.getElementById('ex-modal').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});

function quickLogFromModal() {
  if (!modalCurrentEx) return;
  const sessions = DB.get('sessions', []);
  sessions.push({
    date: TODAY_ISO,
    type: modalCurrentEx.muscle.charAt(0).toUpperCase() + modalCurrentEx.muscle.slice(1),
    exercise: modalCurrentEx.name,
    duration: 45,
    intensity: 7,
    notes: 'Logged from exercise guide'
  });
  DB.set('sessions', sessions);
  closeModal();
  showToast('Session logged!');
}
window.quickLogFromModal = quickLogFromModal;

/* ============================================================
   GYM — EXERCISE LIST
   ============================================================ */
let activeGroup = 'all';

function buildMuscleButtons() {
  const container = document.getElementById('muscle-btns');
  if (!container) return;

  const allBtn = document.createElement('div');
  allBtn.className = 'muscle-btn on';
  allBtn.innerHTML = `<span class="mb-emoji">💪</span><span class="mb-name">All</span>`;
  allBtn.onclick = () => filterExercises('all', allBtn);
  container.appendChild(allBtn);

  OGW.muscleGroups.filter(g => g.id !== 'home').forEach(g => {
    const btn = document.createElement('div');
    btn.className = 'muscle-btn';
    btn.innerHTML = `<span class="mb-emoji">${g.emoji}</span><span class="mb-name">${g.name}</span>`;
    btn.onclick = () => filterExercises(g.id, btn);
    container.appendChild(btn);
  });
}

function filterExercises(groupId, clickedBtn) {
  activeGroup = groupId;
  document.querySelectorAll('#muscle-btns .muscle-btn').forEach(b => b.classList.remove('on'));
  if (clickedBtn) clickedBtn.classList.add('on');
  renderExerciseList();
}

function renderExerciseList() {
  const container = document.getElementById('exercise-list');
  if (!container) return;

  const list = activeGroup === 'all'
    ? OGW.exercises.filter(e => e.muscle !== 'home')
    : OGW.exercises.filter(e => e.muscle === activeGroup);

  if (!list.length) { container.innerHTML = '<div style="font-size:13px;color:var(--t2);padding:12px 0">No exercises found.</div>'; return; }

  container.innerHTML = '';
  list.forEach(ex => {
    const card = document.createElement('div');
    card.className = 'ex-card';
    card.innerHTML = `
      <div class="ex-header">
        <span class="ex-badge">${ex.muscle.toUpperCase()}</span>
        <span class="ex-name">${ex.name}</span>
        <span class="pill tag-${ex.level.toLowerCase()}" style="flex-shrink:0">${ex.level}</span>
        <span class="ex-chevron">▾</span>
      </div>
      <div class="ex-detail">
        <div class="ex-figure">${OGW.getSVG(ex.svg)}</div>
        <div class="ex-meta">
          <span class="ex-meta-pill">${ex.sets} sets</span>
          <span class="ex-meta-pill">${ex.reps}</span>
          <span class="ex-meta-pill">Rest ${ex.rest}</span>
          <span class="pill tag-${ex.type.toLowerCase().replace(/\s/g,'')}">${ex.type}</span>
        </div>
        <div class="ex-desc">${ex.desc}</div>
        <div class="ex-tips">${ex.tips.map(t => `<div class="ex-tip">${t}</div>`).join('')}</div>
        <button class="log-btn" onclick="logExerciseDirect('${ex.id}')">+ Log this exercise</button>
      </div>
    `;
    card.querySelector('.ex-header').addEventListener('click', () => {
      card.classList.toggle('open');
    });
    container.appendChild(card);
  });
}

function logExerciseDirect(exId) {
  const ex = OGW.exercises.find(e => e.id === exId);
  if (!ex) return;
  const sessions = DB.get('sessions', []);
  sessions.push({
    date: TODAY_ISO,
    type: ex.muscle.charAt(0).toUpperCase() + ex.muscle.slice(1),
    exercise: ex.name,
    duration: 45,
    intensity: 7,
    notes: ''
  });
  DB.set('sessions', sessions);
  showToast('Logged: ' + ex.name + ' ✓');
}
window.logExerciseDirect = logExerciseDirect;

/* ============================================================
   HOME WORKOUT
   ============================================================ */
function renderHomeWorkout() {
  const container = document.getElementById('home-ex-list');
  if (!container) return;

  const homeExercises = OGW.exercises.filter(e => e.muscle === 'home');
  container.innerHTML = '';

  homeExercises.forEach(ex => {
    const card = document.createElement('div');
    card.className = 'ex-card';
    card.innerHTML = `
      <div class="ex-header">
        <span class="ex-badge">${ex.type.toUpperCase()}</span>
        <span class="ex-name">${ex.name}</span>
        <span class="pill tag-${ex.level.toLowerCase()}" style="flex-shrink:0">${ex.level}</span>
        <span class="ex-chevron">▾</span>
      </div>
      <div class="ex-detail">
        <div class="ex-figure">${OGW.getSVG(ex.svg)}</div>
        <div class="ex-meta">
          <span class="ex-meta-pill">${ex.sets} sets</span>
          <span class="ex-meta-pill">${ex.reps}</span>
          <span class="ex-meta-pill">Rest ${ex.rest}</span>
        </div>
        <div class="ex-desc">${ex.desc}</div>
        <div class="ex-tips">${ex.tips.map(t => `<div class="ex-tip">${t}</div>`).join('')}</div>
        <button class="log-btn" onclick="logExerciseDirect('${ex.id}')">+ Log this exercise</button>
      </div>
    `;
    card.querySelector('.ex-header').addEventListener('click', () => card.classList.toggle('open'));
    container.appendChild(card);
  });
}

/* ============================================================
   DIET / BODY TYPE
   ============================================================ */
let selectedBodyType = DB.get('bodyType', null);

function buildBodyTypeCards() {
  const container = document.getElementById('bt-cards');
  if (!container) return;

  OGW.bodyTypes.forEach(bt => {
    const card = document.createElement('div');
    card.className = 'bt-card' + (selectedBodyType === bt.id ? ' selected' : '');
    card.innerHTML = `
      <div class="bt-emoji">${bt.emoji}</div>
      <div class="bt-name">${bt.name}</div>
      <div class="bt-desc">${bt.desc}</div>
    `;
    card.onclick = () => selectBodyType(bt.id);
    container.appendChild(card);
  });

  if (selectedBodyType) showBodyTypeResult(selectedBodyType);
}

function selectBodyType(id) {
  selectedBodyType = id;
  DB.set('bodyType', id);
  document.querySelectorAll('.bt-card').forEach((c, i) => {
    c.classList.toggle('selected', OGW.bodyTypes[i].id === id);
  });
  showBodyTypeResult(id);
  showToast('Body type saved!');
}
window.selectBodyType = selectBodyType;

function showBodyTypeResult(id) {
  const bt = OGW.bodyTypes.find(b => b.id === id);
  if (!bt) return;

  document.getElementById('bt-result').style.display = 'block';
  document.getElementById('bt-result-name').textContent = bt.emoji + ' ' + bt.name;
  document.getElementById('bt-result-desc').textContent = bt.desc;

  // Traits
  document.getElementById('bt-traits').innerHTML = bt.traits.map(t =>
    `<div class="ex-tip">${t}</div>`
  ).join('');

  // Macro bar
  const { protein, carbs, fat } = bt.diet;
  document.getElementById('bt-macro-bar').innerHTML = `
    <div class="macro-seg" style="width:${protein}%;background:#E8FF00"></div>
    <div class="macro-seg" style="width:${carbs}%;background:#00FFB3"></div>
    <div class="macro-seg" style="width:${fat}%;background:#FFB347"></div>
  `;
  document.getElementById('bt-macros').innerHTML = `
    <div style="text-align:center"><div style="font-size:18px;font-weight:800;color:#E8FF00">${protein}%</div><div style="font-size:10px;color:var(--t2)">Protein</div></div>
    <div style="text-align:center"><div style="font-size:18px;font-weight:800;color:#00FFB3">${carbs}%</div><div style="font-size:10px;color:var(--t2)">Carbs</div></div>
    <div style="text-align:center"><div style="font-size:18px;font-weight:800;color:#FFB347">${fat}%</div><div style="font-size:10px;color:var(--t2)">Fat</div></div>
  `;
  document.getElementById('bt-diet-focus').innerHTML = `<strong style="color:var(--t)">Focus:</strong> ${bt.diet.focus} · Calories: ${bt.diet.calories}`;

  // Workout plan
  const plan = OGW.workoutPlans[bt.plan];
  document.getElementById('bt-plan-card').innerHTML = `
    <div style="margin-bottom:10px">
      <div style="font-size:16px;font-weight:800;margin-bottom:2px">${plan.name}</div>
      <div style="font-size:12px;color:var(--t2)">${plan.goal} · ${plan.sessions} sessions/week · Rest ${plan.rest}</div>
    </div>
    ${plan.schedule.map((day, i) => `
      <div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid var(--bdr)${i === plan.schedule.length - 1 ? ';border-bottom:none' : ''}">
        <div style="font-size:11px;font-weight:700;color:var(--t3);width:26px">${['M','T','W','T','F','S','S'][i]}</div>
        <div style="font-size:13px;color:${day === 'REST' ? 'var(--t3)' : 'var(--t)'};font-weight:${day === 'REST' ? '400' : '600'}">${day}</div>
      </div>
    `).join('')}
  `;

  // Meal plan
  const mealPlan = OGW.mealPlans[bt.plan] || OGW.mealPlans.athletic;
  const mpContainer = document.getElementById('bt-meal-plan');
  mpContainer.innerHTML = '';
  mealPlan.forEach(meal => {
    let totalCal = 0, totalP = 0, totalC = 0, totalF = 0;
    const itemsHtml = meal.items.map(item => {
      const food = OGW.foods.find(f => f.id === item.id);
      if (!food) return '';
      const mult = item.g / 100;
      totalCal += food.per100.cal * mult;
      totalP += food.per100.p * mult;
      totalC += food.per100.c * mult;
      totalF += food.per100.f * mult;
      return `<span style="font-size:12px;color:var(--t2)">${food.emoji} ${food.name} <strong style="color:var(--t)">${item.g}g</strong></span>`;
    }).join('<br>');

    const div = document.createElement('div');
    div.className = 'card';
    div.style.marginBottom = '8px';
    div.innerHTML = `
      <div class="card-hdr">
        <div class="card-hdr-l"><div class="dot" style="background:#E8FF00"></div>${meal.meal}</div>
        <span style="font-size:13px;font-weight:800;color:var(--y)">${Math.round(totalCal)} kcal</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:8px">${itemsHtml}</div>
      <div style="display:flex;gap:12px;font-size:11px;color:var(--t2)">
        <span>P: <strong>${Math.round(totalP)}g</strong></span>
        <span>C: <strong>${Math.round(totalC)}g</strong></span>
        <span>F: <strong>${Math.round(totalF)}g</strong></span>
      </div>
    `;
    mpContainer.appendChild(div);
  });
}

/* ============================================================
   MEAL CALCULATOR
   ============================================================ */
let plate = []; // { food, grams }
let foodCatFilter = 'all';
let foodSearchQuery = '';

function buildFoodCats() {
  const container = document.getElementById('food-cats');
  if (!container) return;
  const cats = [
    { id: 'all', label: 'All' },
    { id: 'protein', label: '🍗 Protein' },
    { id: 'carbs', label: '🍚 Carbs' },
    { id: 'veggies', label: '🥦 Veggies' },
    { id: 'fats', label: '🥑 Fats' }
  ];
  cats.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'food-cat' + (c.id === 'all' ? ' on' : '');
    btn.textContent = c.label;
    btn.onclick = () => {
      foodCatFilter = c.id;
      document.querySelectorAll('.food-cat').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      renderFoodList();
    };
    container.appendChild(btn);
  });
}

function filterFoods() {
  foodSearchQuery = document.getElementById('food-search').value.toLowerCase();
  renderFoodList();
}
window.filterFoods = filterFoods;

function renderFoodList() {
  const container = document.getElementById('food-list');
  if (!container) return;

  let list = OGW.foods;
  if (foodCatFilter !== 'all') list = list.filter(f => f.cat === foodCatFilter);
  if (foodSearchQuery) list = list.filter(f => f.name.toLowerCase().includes(foodSearchQuery));

  if (!list.length) { container.innerHTML = '<div style="font-size:13px;color:var(--t2);padding:8px 0">No foods found.</div>'; return; }

  container.innerHTML = '';
  list.forEach(food => {
    const item = document.createElement('div');
    item.className = 'food-item';
    item.innerHTML = `
      <div class="food-emoji">${food.emoji}</div>
      <div class="food-info">
        <div class="food-name">${food.name}</div>
        <div class="food-cals">${food.per100.cal} kcal · P:${food.per100.p}g C:${food.per100.c}g F:${food.per100.f}g per 100g</div>
      </div>
      <button class="food-add" onclick="addToPlate('${food.id}')">+</button>
    `;
    container.appendChild(item);
  });
}

function addToPlate(foodId) {
  const food = OGW.foods.find(f => f.id === foodId);
  if (!food) return;
  const existing = plate.find(p => p.food.id === foodId);
  if (existing) {
    existing.grams += 100;
  } else {
    plate.push({ food, grams: 100 });
  }
  renderPlate();
  showToast(food.emoji + ' ' + food.name + ' added');
}
window.addToPlate = addToPlate;

function renderPlate() {
  const box = document.getElementById('cal-total-box');
  const plateEl = document.getElementById('plate-items');
  if (!plateEl) return;

  if (plate.length === 0) {
    if (box) box.style.display = 'none';
    return;
  }
  if (box) box.style.display = 'block';

  let totalCal = 0, totalP = 0, totalC = 0, totalF = 0;
  plate.forEach(p => {
    const m = p.grams / 100;
    totalCal += p.food.per100.cal * m;
    totalP += p.food.per100.p * m;
    totalC += p.food.per100.c * m;
    totalF += p.food.per100.f * m;
  });

  document.getElementById('total-cal').textContent = Math.round(totalCal);
  document.getElementById('total-p').textContent = Math.round(totalP) + 'g';
  document.getElementById('total-c').textContent = Math.round(totalC) + 'g';
  document.getElementById('total-f').textContent = Math.round(totalF) + 'g';

  plateEl.innerHTML = '';
  plate.forEach((p, idx) => {
    const m = p.grams / 100;
    const cal = Math.round(p.food.per100.cal * m);
    const row = document.createElement('div');
    row.className = 'plate-item';
    row.innerHTML = `
      <div class="plate-emoji">${p.food.emoji}</div>
      <div class="plate-name">${p.food.name}</div>
      <input class="plate-g-input" type="number" value="${p.grams}" min="1" max="2000"
        onchange="updateGrams(${idx}, this.value)">
      <div style="font-size:10px;color:var(--t3);width:14px;text-align:center">g</div>
      <div class="plate-cals">${cal} kcal</div>
      <button class="plate-del" onclick="removeFromPlate(${idx})">✕</button>
    `;
    plateEl.appendChild(row);
  });
}

function updateGrams(idx, val) {
  const g = parseFloat(val);
  if (isNaN(g) || g < 1) return;
  plate[idx].grams = g;
  renderPlate();
}
window.updateGrams = updateGrams;

function removeFromPlate(idx) {
  plate.splice(idx, 1);
  renderPlate();
}
window.removeFromPlate = removeFromPlate;

function clearPlate() {
  plate = [];
  renderPlate();
}
window.clearPlate = clearPlate;

function saveMeal() {
  if (!plate.length) return;
  let totalCal = 0, totalP = 0, totalC = 0, totalF = 0;
  plate.forEach(p => {
    const m = p.grams / 100;
    totalCal += p.food.per100.cal * m;
    totalP += p.food.per100.p * m;
    totalC += p.food.per100.c * m;
    totalF += p.food.per100.f * m;
  });
  const meal = {
    date: TODAY_ISO,
    items: plate.map(p => ({ name: p.food.name, emoji: p.food.emoji, grams: p.grams })),
    cal: Math.round(totalCal), p: Math.round(totalP),
    c: Math.round(totalC), f: Math.round(totalF)
  };
  DB.push('savedMeals', meal);
  clearPlate();
  renderSavedMeals();
  showToast('Meal saved! ' + Math.round(totalCal) + ' kcal');
}
window.saveMeal = saveMeal;

function renderSavedMeals() {
  const container = document.getElementById('saved-meals-list');
  if (!container) return;
  const meals = DB.get('savedMeals', []).slice().reverse().slice(0, 10);
  if (!meals.length) {
    container.innerHTML = '<div style="font-size:13px;color:var(--t2)">No saved meals yet. Build a meal above and tap Save.</div>';
    return;
  }
  container.innerHTML = '';
  meals.forEach((meal, i) => {
    const div = document.createElement('div');
    div.className = 'card';
    div.style.marginBottom = '8px';
    div.innerHTML = `
      <div class="card-hdr">
        <div style="font-size:12px;color:var(--t2)">${fmtDate(meal.date)}</div>
        <span style="font-size:14px;font-weight:800;color:var(--y)">${meal.cal} kcal</span>
      </div>
      <div style="font-size:13px;color:var(--t2);margin-bottom:6px">${meal.items.map(i => i.emoji + ' ' + i.name + ' ' + i.grams + 'g').join(' · ')}</div>
      <div style="display:flex;gap:12px;font-size:11px;color:var(--t2)">
        <span>P: <strong>${meal.p}g</strong></span>
        <span>C: <strong>${meal.c}g</strong></span>
        <span>F: <strong>${meal.f}g</strong></span>
      </div>
    `;
    container.appendChild(div);
  });
}

/* ============================================================
   BMR CALCULATOR
   ============================================================ */
function buildActivitySelect() {
  const sel = document.getElementById('calc-activity');
  if (!sel) return;
  OGW.activityMults.forEach(a => {
    const opt = document.createElement('option');
    opt.value = a.val;
    opt.textContent = a.label;
    sel.appendChild(opt);
  });
  sel.value = '1.55';
}

function calcBMR() {
  const age = parseFloat(document.getElementById('calc-age').value);
  const weight = parseFloat(document.getElementById('calc-weight').value);
  const height = parseFloat(document.getElementById('calc-height').value);
  const sex = document.getElementById('calc-sex').value;
  const activity = parseFloat(document.getElementById('calc-activity').value);
  const goalAdj = parseFloat(document.getElementById('calc-goal').value);

  if (!age || !weight || !height) { showToast('Please fill in all fields'); return; }

  const bmr = OGW.calcBMR(weight, height, age, sex);
  const tdee = Math.round(bmr * activity);
  const goalCal = tdee + goalAdj;
  const protein = Math.round(weight * 2.2);
  const fat = Math.round((goalCal * 0.25) / 9);
  const carbs = Math.round((goalCal - protein * 4 - fat * 9) / 4);

  document.getElementById('calc-result').style.display = 'block';
  document.getElementById('calc-tdee').textContent = tdee.toLocaleString();
  document.getElementById('calc-bmr-val').textContent = Math.round(bmr).toLocaleString();
  document.getElementById('calc-goal-val').textContent = goalCal.toLocaleString();
  document.getElementById('calc-protein-val').textContent = protein + 'g';
  document.getElementById('calc-carbs-val').textContent = Math.max(0, carbs) + 'g';

  const pPct = Math.round((protein * 4 / goalCal) * 100);
  const cPct = Math.round((Math.max(0, carbs) * 4 / goalCal) * 100);
  const fPct = 100 - pPct - cPct;
  document.getElementById('calc-macro-bar').innerHTML = `
    <div class="macro-seg" style="width:${pPct}%;background:#E8FF00"></div>
    <div class="macro-seg" style="width:${cPct}%;background:#00FFB3"></div>
    <div class="macro-seg" style="width:${Math.max(0, fPct)}%;background:#FFB347"></div>
  `;

  const advice = goalAdj > 0
    ? `You need a caloric surplus. Prioritise protein (${protein}g/day) and compound lifts. Eat ${Math.round(protein / 6)}g protein per meal across 6 meals.`
    : goalAdj < 0
    ? `You're in a deficit. Keep protein high (${protein}g/day) to preserve muscle. Reduce carbs on rest days.`
    : `Maintenance calories. Focus on body recomposition — strength training + adequate protein.`;
  document.getElementById('calc-advice').innerHTML = `<strong style="color:var(--t)">Advice:</strong> ${advice}`;

  // Save for reference
  DB.set('calcResult', { bmr: Math.round(bmr), tdee, goalCal, protein, carbs: Math.max(0, carbs), fat });
  showToast('Calculated! ' + goalCal + ' kcal/day');
  document.getElementById('calc-result').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
window.calcBMR = calcBMR;

/* ============================================================
   PROGRESS TRACKING
   ============================================================ */
function logSession() {
  const type = document.getElementById('log-type').value;
  const duration = parseInt(document.getElementById('log-duration').value) || 45;
  const intensity = parseInt(document.getElementById('log-intensity').value) || 7;
  const notes = document.getElementById('log-notes').value.trim();

  if (intensity < 1 || intensity > 10) { showToast('Intensity must be 1–10'); return; }

  const session = { date: TODAY_ISO, type, duration, intensity, notes };
  DB.push('sessions', session);

  document.getElementById('log-duration').value = '';
  document.getElementById('log-intensity').value = '';
  document.getElementById('log-notes').value = '';

  renderProgress();
  showToast('Session logged! Keep grinding 💪');
}
window.logSession = logSession;

function logMeasurement() {
  const weight = parseFloat(document.getElementById('meas-weight').value);
  const bf = parseFloat(document.getElementById('meas-bf').value);
  if (!weight) { showToast('Enter your weight'); return; }

  const m = { date: TODAY_ISO, weight, bf: bf || null };
  DB.push('measurements', m);
  document.getElementById('meas-weight').value = '';
  document.getElementById('meas-bf').value = '';
  showToast('Measurements saved!');
}
window.logMeasurement = logMeasurement;

function renderProgress() {
  renderMonthGrid();
  renderStats();
  renderSuggestions();
  renderSessionHistory();
}

function renderMonthGrid() {
  const grid = document.getElementById('month-grid');
  const label = document.getElementById('month-label');
  if (!grid) return;

  const sessions = DB.get('sessions', []);
  const year = NOW.getFullYear();
  const month = NOW.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7; // Mon=0

  if (label) label.textContent = firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const sessionDays = new Set(
    sessions.filter(s => s.date && s.date.startsWith(monthKey())).map(s => s.date)
  );

  grid.innerHTML = '';

  // Empty cells for offset
  for (let i = 0; i < startDow; i++) {
    const empty = document.createElement('div');
    empty.className = 'day-cell';
    empty.style.opacity = '0';
    grid.appendChild(empty);
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    const cell = document.createElement('div');
    cell.className = 'day-cell' +
      (sessionDays.has(dateStr) ? ' has-session' : '') +
      (d === NOW.getDate() ? ' today' : '');
    cell.textContent = d;
    grid.appendChild(cell);
  }
}

function renderStats() {
  const sessions = DB.get('sessions', []);
  const thisMonth = sessions.filter(s => s.date && s.date.startsWith(monthKey()));

  const count = thisMonth.length;
  const totalMins = thisMonth.reduce((a, s) => a + (s.duration || 0), 0);
  const avgIntensity = count ? (thisMonth.reduce((a, s) => a + (s.intensity || 7), 0) / count).toFixed(1) : '—';

  // Streak calculation
  let streak = 0;
  const allSessions = DB.get('sessions', []);
  const sessionSet = new Set(allSessions.map(s => s.date));
  let d = new Date(NOW);
  while (true) {
    const iso = d.toISOString().split('T')[0];
    if (sessionSet.has(iso)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else { break; }
  }

  const el = id => document.getElementById(id);
  if (el('stats-sessions')) el('stats-sessions').textContent = count;
  if (el('stats-mins')) el('stats-mins').textContent = totalMins;
  if (el('stats-intensity')) el('stats-intensity').textContent = avgIntensity;
  if (el('stats-streak')) el('stats-streak').textContent = streak;
}

function renderSuggestions() {
  const container = document.getElementById('suggestions-box');
  if (!container) return;

  const sessions = DB.get('sessions', []);
  const thisMonth = sessions.filter(s => s.date && s.date.startsWith(monthKey()));
  const count = thisMonth.length;
  const avgIntensity = count ? thisMonth.reduce((a, s) => a + (s.intensity || 7), 0) / count : 0;
  const bt = DB.get('bodyType', null);

  const suggestions = [];

  if (count === 0) {
    suggestions.push({ icon: '🚀', msg: '<strong>Start your first session!</strong> Even 20 minutes of movement counts. Log it and build the habit.' });
  } else if (count < 4) {
    suggestions.push({ icon: '📅', msg: `<strong>You've trained ${count} time${count > 1 ? 's' : ''} this month.</strong> Aim for at least 12 sessions (3/week) for real results.` });
  } else if (count >= 12) {
    suggestions.push({ icon: '🔥', msg: `<strong>Excellent consistency — ${count} sessions this month!</strong> Make sure you're getting 7–8h sleep for recovery.` });
  }

  if (avgIntensity > 0 && avgIntensity < 5) {
    suggestions.push({ icon: '⚡', msg: '<strong>Your average intensity is low.</strong> Try pushing harder on your sets — progressive overload is the key to growth.' });
  } else if (avgIntensity >= 8) {
    suggestions.push({ icon: '😴', msg: '<strong>Very high average intensity.</strong> Make sure you\'re taking at least 2 rest days per week to avoid overtraining.' });
  }

  const typeCounts = {};
  thisMonth.forEach(s => { typeCounts[s.type] = (typeCounts[s.type] || 0) + 1; });
  const sorted = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
  if (sorted.length) {
    const fav = sorted[0][0];
    const missing = ['Legs & Core', 'Back & Biceps', 'Chest & Triceps'].filter(t => !typeCounts[t]);
    if (missing.length) {
      suggestions.push({ icon: '⚖️', msg: `<strong>You often train ${fav}</strong> but missed: ${missing.join(', ')}. Balance your program for full body development.` });
    }
  }

  if (bt === 'ectomorph') suggestions.push({ icon: '🍚', msg: '<strong>As an Ectomorph</strong>, prioritise caloric surplus. Eat within 30 min post-workout. Carbs are your friend.' });
  if (bt === 'endomorph') suggestions.push({ icon: '🥗', msg: '<strong>As an Endomorph</strong>, keep cardio in your routine 2–3x/week. Reduce simple carbs on rest days.' });
  if (bt === 'mesomorph') suggestions.push({ icon: '🎯', msg: '<strong>As a Mesomorph</strong>, you respond well to varied training. Mix strength days and hypertrophy days for best results.' });

  if (!suggestions.length) {
    suggestions.push({ icon: '✅', msg: '<strong>You\'re on track!</strong> Keep your consistency and progressive overload for continued growth.' });
  }

  container.innerHTML = suggestions.map(s =>
    `<div class="suggestion-card">${s.icon} ${s.msg}</div>`
  ).join('');
}

function renderSessionHistory() {
  const container = document.getElementById('session-history');
  if (!container) return;

  const sessions = DB.get('sessions', []).slice().reverse().slice(0, 15);
  if (!sessions.length) {
    container.innerHTML = '<div style="font-size:13px;color:var(--t2)">No sessions logged yet.</div>';
    return;
  }

  container.innerHTML = '';
  sessions.forEach(s => {
    const div = document.createElement('div');
    div.className = 'session-item';
    div.innerHTML = `
      <div class="session-dot"></div>
      <div>
        <div class="session-name">${s.type}</div>
        <div class="session-meta">${fmtDate(s.date)} · ${s.duration} min · Intensity ${s.intensity}/10${s.notes ? ' · ' + s.notes : ''}</div>
      </div>
    `;
    container.appendChild(div);
  });
}

/* ============================================================
   HOME PAGE
   ============================================================ */
function renderHome() {
  // Weekly schedule
  const bt = DB.get('bodyType', null);
  const planKey = bt ? OGW.bodyTypes.find(b => b.id === bt)?.plan : 'athletic';
  const plan = OGW.workoutPlans[planKey || 'athletic'];
  const planNameEl = document.getElementById('home-plan-name');
  const schedEl = document.getElementById('home-schedule');

  if (planNameEl) planNameEl.textContent = plan.name;
  if (schedEl) {
    const dow = (NOW.getDay() + 6) % 7; // Mon=0
    schedEl.innerHTML = plan.schedule.map((day, i) => `
      <div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid var(--bdr)${i === 6 ? ';border-bottom:none' : ''}">
        <div style="font-size:11px;font-weight:700;color:var(--t3);width:22px">${['M','T','W','T','F','S','S'][i]}</div>
        <div style="font-size:13px;font-weight:${i === dow ? '800' : day === 'REST' ? '400' : '600'};color:${i === dow ? 'var(--y)' : day === 'REST' ? 'var(--t3)' : 'var(--t)'}">${day}${i === dow ? ' ← today' : ''}</div>
      </div>
    `).join('');
  }

  // Last session
  const sessions = DB.get('sessions', []);
  const lastEl = document.getElementById('home-last-session');
  if (lastEl) {
    if (!sessions.length) {
      lastEl.innerHTML = '<div style="font-size:13px;color:var(--t2)">No sessions logged yet. Start training and log your first session!</div>';
    } else {
      const s = sessions[sessions.length - 1];
      lastEl.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:15px;font-weight:700">${s.type}</div>
            <div style="font-size:12px;color:var(--t2);margin-top:2px">${fmtDate(s.date)} · ${s.duration} min · Intensity ${s.intensity}/10</div>
            ${s.notes ? `<div style="font-size:12px;color:var(--t3);margin-top:4px">${s.notes}</div>` : ''}
          </div>
          <div style="font-size:24px;font-weight:900;color:var(--y)">${s.intensity}<span style="font-size:12px;font-weight:600">/10</span></div>
        </div>
      `;
    }
  }
}

/* ============================================================
   INIT — build all static UI
   ============================================================ */
buildMuscleButtons();
renderExerciseList();
renderHomeWorkout();
buildBodyTypeCards();
buildFoodCats();
renderFoodList();
buildActivitySelect();
renderHome();
renderProgress();
renderSavedMeals();

/* Restore saved data in meal calc */
const savedCalc = DB.get('calcResult', null);
