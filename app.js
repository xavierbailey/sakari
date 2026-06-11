// ====================== SETUP ======================
const ROLL_KEYS = Object.keys(SUSHI_ROLLS);
const ROLLS = ROLL_KEYS.map(k => ({ key: k, ...SUSHI_ROLLS[k] }));
const IMAGE_BASE = "images/"; // place roll images here, named per "image" field

function shuffle(arr){
  const a = [...arr];
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

function imgTag(roll, cls){
  return `<div class="card-roll-image placeholder ${cls||''}" data-img="${roll.image}">${roll.name}</div>`;
}

// Try to load real images; fall back to placeholder text already rendered.
function hydrateImages(root){
  root.querySelectorAll('[data-img]').forEach(el => {
    const src = IMAGE_BASE + el.getAttribute('data-img');
    const test = new Image();
    test.onload = () => {
      el.style.backgroundImage = `url('${src}')`;
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center';
      el.textContent = '';
      el.classList.remove('placeholder');
    };
    test.src = src;
  });
}

function tagList(roll){
  const tags = [];
  if(roll.spicy) tags.push('Spicy');
  if(roll.raw) tags.push('Raw');
  if(roll.fried) tags.push('Fried');
  if(roll.crunchy) tags.push('Crunchy');
  if(roll.vegetarian) tags.push('Vegetarian');
  if(roll.vegan) tags.push('Vegan');
  return tags;
}

function ingredientsHTML(roll){
  return `<div class="ing-list">${roll.ingredients.map(i=>`• ${i}`).join('<br>')}</div>`;
}

// ====================== NAVIGATION ======================
const screens = document.querySelectorAll('.screen');
const navBtns = document.querySelectorAll('.nav-btn');

function showScreen(name){
  screens.forEach(s => s.classList.toggle('active', s.id === `screen-${name}`));
  navBtns.forEach(b => b.classList.toggle('active', b.dataset.screen === name));
  window.scrollTo({top:0, behavior:'smooth'});
}

navBtns.forEach(b => b.addEventListener('click', () => showScreen(b.dataset.screen)));
document.querySelectorAll('[data-go]').forEach(b => {
  b.addEventListener('click', () => showScreen(b.dataset.go));
});
function goHome(){ showScreen('home'); }

// ====================================================================
// STUDY MODE
// ====================================================================
let studyDeck = shuffle(ROLLS);
let studyIndex = 0;

const studyTypeSel = document.getElementById('study-type');
const studyCard = document.getElementById('study-card');
const studyFront = document.getElementById('study-front');
const studyBack = document.getElementById('study-back');
const studyCounter = document.getElementById('study-counter');

function renderStudyCard(){
  studyCard.classList.remove('flipped');
  const roll = studyDeck[studyIndex];
  const type = studyTypeSel.value;
  studyCounter.textContent = `${studyIndex+1} / ${studyDeck.length}`;

  let front = '', back = '';

  if(type === 'img-name'){
    front = imgTag(roll);
    back = `<h3 class="card-title">${roll.name}</h3>
            <div class="card-price">$${roll.price.toFixed(2)}</div>
            <div class="tag-row">${tagList(roll).map(t=>`<span class="tag salmon">${t}</span>`).join('')}</div>
            <p style="margin-top:12px;font-size:0.85rem;opacity:0.85">${roll.notes}</p>`;
  } else if(type === 'name-ing'){
    front = `<div class="card-eyebrow">Roll</div><h3 class="card-title">${roll.name}</h3>`;
    back = `<div class="stamp">Ingredients</div><h3 class="card-title" style="color:var(--paper)">${roll.name}</h3>${ingredientsHTML(roll)}
            <div class="tag-row">${tagList(roll).map(t=>`<span class="tag salmon">${t}</span>`).join('')}</div>`;
  } else if(type === 'ing-name'){
    front = `<div class="card-eyebrow">Ingredients</div><div class="ing-list">${roll.ingredients.map(i=>`• ${i}`).join('<br>')}</div>`;
    back = `<div class="stamp">Roll</div><h3 class="card-title" style="color:var(--paper)">${roll.name}</h3>
            <div class="card-price" style="color:var(--salmon-soft)">$${roll.price.toFixed(2)}</div>
            <p style="margin-top:8px;font-size:0.85rem;opacity:0.85">${roll.notes}</p>`;
  } else if(type === 'img-ing'){
    front = imgTag(roll);
    back = `<div class="stamp">Ingredients</div><h3 class="card-title" style="color:var(--paper)">${roll.name}</h3>${ingredientsHTML(roll)}`;
  }

  studyFront.innerHTML = front;
  studyBack.innerHTML = back;
  hydrateImages(studyFront);
}

studyCard.addEventListener('click', () => studyCard.classList.toggle('flipped'));
document.getElementById('study-flip').addEventListener('click', () => studyCard.classList.toggle('flipped'));
document.getElementById('study-next').addEventListener('click', () => {
  studyIndex = (studyIndex+1) % studyDeck.length;
  renderStudyCard();
});
document.getElementById('study-prev').addEventListener('click', () => {
  studyIndex = (studyIndex-1+studyDeck.length) % studyDeck.length;
  renderStudyCard();
});
document.getElementById('study-shuffle').addEventListener('click', () => {
  studyDeck = shuffle(ROLLS);
  studyIndex = 0;
  renderStudyCard();
});
studyTypeSel.addEventListener('change', renderStudyCard);
renderStudyCard();

// ====================================================================
// PRACTICE MODE
// ====================================================================
let practiceDeck = shuffle(ROLLS);
let practiceIndex = 0;

const practiceTypeSel = document.getElementById('practice-type');
const practiceLabel = document.getElementById('practice-label');
const practiceContent = document.getElementById('practice-content');
const practiceAnswerArea = document.getElementById('practice-answer-area');
const practiceReveal = document.getElementById('practice-reveal');
const practiceInput = document.getElementById('practice-input');
const practiceCheck = document.getElementById('practice-check');
const practiceNext = document.getElementById('practice-next');
const practiceCounter = document.getElementById('practice-counter');

function normalize(s){
  return s.toLowerCase().replace(/[^a-z0-9]/g,'');
}

function renderPracticeCard(){
  const roll = practiceDeck[practiceIndex];
  const type = practiceTypeSel.value;
  practiceCounter.textContent = `${practiceIndex+1} / ${practiceDeck.length}`;
  practiceReveal.classList.add('hidden');
  practiceReveal.className = 'reveal-area hidden';
  practiceAnswerArea.classList.remove('hidden');
  practiceNext.classList.add('hidden');
  practiceInput.value = '';
  practiceInput.disabled = false;
  practiceCheck.disabled = false;

  if(type === 'img-to-roll'){
    practiceLabel.textContent = 'Picture → name this roll';
    practiceContent.innerHTML = imgTag(roll);
    hydrateImages(practiceContent);
    practiceInput.placeholder = 'Type the roll name…';
  } else if(type === 'ing-to-roll'){
    practiceLabel.textContent = 'Ingredients → name this roll';
    practiceContent.innerHTML = `<div class="ing-display">${roll.ingredients.join(', ')}</div>`;
    practiceInput.placeholder = 'Type the roll name…';
  } else if(type === 'roll-to-ing'){
    practiceLabel.textContent = 'List the ingredients (comma separated)';
    practiceContent.innerHTML = `<h3 class="card-title">${roll.name}</h3>`;
    practiceInput.placeholder = 'e.g. crab, avocado, spicy mayo…';
  }

  practiceInput.focus();
}

function checkPractice(){
  const roll = practiceDeck[practiceIndex];
  const type = practiceTypeSel.value;
  const userVal = practiceInput.value.trim();
  let correct = false;
  let revealHTML = '';

  if(type === 'img-to-roll' || type === 'ing-to-roll'){
    correct = normalize(userVal) === normalize(roll.name);
    revealHTML = `<div class="verdict">${correct ? '✓ Correct!' : '✗ Not quite'}</div>
      <div class="reveal-roll"><b>${roll.name}</b> — $${roll.price.toFixed(2)}<br>
      ${ingredientsHTML(roll)}
      <div class="tag-row" style="margin-top:8px">${tagList(roll).map(t=>`<span class="tag" style="border-color:var(--line);color:var(--seaweed-2)">${t}</span>`).join('')}</div></div>`;
  } else {
    // roll-to-ing: fuzzy check — count how many real ingredients user mentioned
    const userIngs = userVal.split(',').map(s=>normalize(s)).filter(Boolean);
    const realIngs = roll.ingredients.map(normalize);
    const matched = realIngs.filter(ri => userIngs.some(ui => ui.includes(ri) || ri.includes(ui)));
    correct = matched.length >= Math.ceil(realIngs.length * 0.6);
    revealHTML = `<div class="verdict">${correct ? '✓ Good recall!' : '✗ Missed a few'}</div>
      <div class="reveal-roll">Full ingredient list for <b>${roll.name}</b>:<br>${ingredientsHTML(roll)}
      <p style="margin-top:8px">You named ${matched.length} of ${realIngs.length} ingredients.</p></div>`;
  }

  practiceReveal.innerHTML = revealHTML;
  practiceReveal.className = `reveal-area ${correct ? 'correct' : 'incorrect'}`;
  practiceAnswerArea.classList.add('hidden');
  practiceNext.classList.remove('hidden');
}

practiceCheck.addEventListener('click', checkPractice);
practiceInput.addEventListener('keydown', e => { if(e.key === 'Enter') checkPractice(); });

practiceNext.addEventListener('click', () => {
  practiceIndex = (practiceIndex+1) % practiceDeck.length;
  renderPracticeCard();
});
document.getElementById('practice-prev').addEventListener('click', () => {
  practiceIndex = (practiceIndex-1+practiceDeck.length) % practiceDeck.length;
  renderPracticeCard();
});
practiceTypeSel.addEventListener('change', () => { practiceIndex = 0; practiceDeck = shuffle(ROLLS); renderPracticeCard(); });
renderPracticeCard();

// ====================================================================
// QUIZ MODE
// ====================================================================
const quizSetup = document.getElementById('quiz-setup');
const quizActive = document.getElementById('quiz-active');
const quizResults = document.getElementById('quiz-results');

let quizQuestions = [];
let quizIndex = 0;
let quizScore = 0;
let quizAnswered = false;
let quizMissed = [];

// length selector
document.querySelectorAll('#quiz-length .seg-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#quiz-length .seg-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
  });
});

function getQuizConfig(){
  const length = parseInt(document.querySelector('#quiz-length .seg-btn.active').dataset.val);
  const types = [...document.querySelectorAll('#screen-quiz .check-item input:checked')].map(c=>c.value);
  return { length, types: types.length ? types : ['mc'] };
}

function buildQuestion(type, roll, pool){
  if(type === 'mc'){
    // multiple choice: ingredients shown, pick the roll name
    const choiceMode = Math.random() < 0.5;
    if(choiceMode){
      const distractors = shuffle(pool.filter(r=>r.key!==roll.key)).slice(0,3).map(r=>r.name);
      const options = shuffle([roll.name, ...distractors]);
      return {
        type:'mc', roll, options, answer: roll.name,
        label: 'Multiple Choice — Ingredients',
        prompt: `<div class="ing-display">${roll.ingredients.join(', ')}</div><p style="font-size:0.8rem;margin-top:10px;color:var(--seaweed-2)">Which roll is this?</p>`
      };
    } else {
      const distractors = shuffle(pool.filter(r=>r.key!==roll.key)).slice(0,3);
      const options = shuffle([roll, ...distractors].map(r => r.notes));
      return {
        type:'mc', roll, options, answer: roll.notes,
        label: 'Multiple Choice — Roll Notes',
        prompt: `<h3 class="card-title">${roll.name}</h3><p style="font-size:0.8rem;margin-top:10px;color:var(--seaweed-2)">Which description matches this roll?</p>`
      };
    }
  }
  if(type === 'type'){
    return {
      type:'type', roll, answer: roll.name,
      label: 'Type-In — Ingredients',
      prompt: `<div class="ing-display">${roll.ingredients.join(', ')}</div><p style="font-size:0.8rem;margin-top:10px;color:var(--seaweed-2)">Type the roll name.</p>`
    };
  }
  if(type === 'image'){
    const distractors = shuffle(pool.filter(r=>r.key!==roll.key)).slice(0,3).map(r=>r.name);
    const options = shuffle([roll.name, ...distractors]);
    return {
      type:'image', roll, options, answer: roll.name,
      label: 'Image Identification',
      prompt: imgTag(roll)
    };
  }
  if(type === 'ingredient'){
    // show roll name + price/notes, pick which ingredient belongs
    const realIng = roll.ingredients[Math.floor(Math.random()*roll.ingredients.length)];
    const allIngs = [...new Set(ROLLS.flatMap(r=>r.ingredients))];
    const distractors = shuffle(allIngs.filter(i => !roll.ingredients.includes(i))).slice(0,3);
    const options = shuffle([realIng, ...distractors]);
    return {
      type:'ingredient', roll, options, answer: realIng,
      label: 'Ingredient ID',
      prompt: `<h3 class="card-title">${roll.name}</h3><p style="font-size:0.8rem;margin-top:10px;color:var(--seaweed-2)">Which of these IS in this roll?</p>`
    };
  }
}

function startQuiz(){
  const { length, types } = getQuizConfig();
  const pool = shuffle(ROLLS);
  quizQuestions = [];
  for(let i=0;i<length;i++){
    const roll = pool[i % pool.length];
    const type = types[Math.floor(Math.random()*types.length)];
    quizQuestions.push(buildQuestion(type, roll, ROLLS));
  }
  quizIndex = 0;
  quizScore = 0;
  quizMissed = [];

  quizSetup.classList.add('hidden');
  quizResults.classList.add('hidden');
  quizActive.classList.remove('hidden');
  renderQuizQuestion();
}

const quizContent = document.getElementById('quiz-content');
const quizLabel = document.getElementById('quiz-label');
const quizAnswerArea = document.getElementById('quiz-answer-area');
const quizSubmit = document.getElementById('quiz-submit');
const quizNext = document.getElementById('quiz-next');
const quizQCounter = document.getElementById('quiz-qcounter');
const quizProgress = document.getElementById('quiz-progress');

function renderQuizQuestion(){
  const q = quizQuestions[quizIndex];
  quizAnswered = false;
  quizQCounter.textContent = `Question ${quizIndex+1} / ${quizQuestions.length}`;
  quizProgress.style.width = `${(quizIndex/quizQuestions.length)*100}%`;
  quizLabel.textContent = q.label;
  quizContent.innerHTML = q.prompt;
  hydrateImages(quizContent);

  quizSubmit.classList.remove('hidden');
  quizNext.classList.add('hidden');

  if(q.type === 'type'){
    quizAnswerArea.innerHTML = `<input type="text" id="quiz-input" class="text-input" placeholder="Type the roll name…" autocomplete="off">`;
    document.getElementById('quiz-input').addEventListener('keydown', e=>{ if(e.key==='Enter') submitQuiz(); });
    setTimeout(()=>document.getElementById('quiz-input')?.focus(), 50);
  } else {
    quizAnswerArea.innerHTML = `<div class="choice-grid">${q.options.map((opt,i)=>
      `<button class="choice-btn" data-val="${i}">${opt}</button>`).join('')}</div>`;
    quizAnswerArea.querySelectorAll('.choice-btn').forEach(btn=>{
      btn.addEventListener('click', () => {
        quizAnswerArea.querySelectorAll('.choice-btn').forEach(b=>b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });
  }
}

function submitQuiz(){
  if(quizAnswered) return;
  const q = quizQuestions[quizIndex];
  let userAnswer = '';
  let correct = false;

  if(q.type === 'type'){
    userAnswer = document.getElementById('quiz-input').value.trim();
    correct = normalize(userAnswer) === normalize(q.answer);
    document.getElementById('quiz-input').disabled = true;
  } else {
    const selected = quizAnswerArea.querySelector('.choice-btn.selected');
    userAnswer = selected ? selected.textContent : '(no answer)';
    correct = selected && selected.textContent === q.answer;
    quizAnswerArea.querySelectorAll('.choice-btn').forEach(b=>{
      b.disabled = true;
      if(b.textContent === q.answer) b.classList.add('correct');
      else if(b.classList.contains('selected')) b.classList.add('wrong');
    });
  }

  if(correct) quizScore++;
  else quizMissed.push({ q, userAnswer });

  // show inline feedback for type-in
  if(q.type === 'type'){
    const fb = document.createElement('div');
    fb.className = `reveal-area ${correct?'correct':'incorrect'}`;
    fb.innerHTML = `<div class="verdict">${correct ? '✓ Correct!' : '✗ Correct answer: '+q.answer}</div>`;
    quizAnswerArea.appendChild(fb);
  }

  quizAnswered = true;
  quizSubmit.classList.add('hidden');
  quizNext.classList.remove('hidden');
}

quizSubmit.addEventListener('click', submitQuiz);
quizNext.addEventListener('click', () => {
  quizIndex++;
  if(quizIndex >= quizQuestions.length){
    finishQuiz();
  } else {
    renderQuizQuestion();
  }
});

function finishQuiz(){
  quizActive.classList.add('hidden');
  quizResults.classList.remove('hidden');
  const total = quizQuestions.length;
  const pct = Math.round((quizScore/total)*100);
  const pass = pct >= 80;

  const stamp = document.getElementById('result-stamp');
  stamp.textContent = pass ? 'PASS' : 'TRY AGAIN';
  stamp.className = `result-stamp ${pass ? '' : 'fail'}`;

  document.getElementById('result-score').textContent = `${quizScore} / ${total}`;
  document.getElementById('result-pct').textContent = `${pct}%`;

  const breakdown = document.getElementById('result-breakdown');
  breakdown.innerHTML = `
    <div class="breakdown-item"><span class="b-label">Correct</span><span class="b-val">${quizScore}</span></div>
    <div class="breakdown-item"><span class="b-label">Missed</span><span class="b-val">${total-quizScore}</span></div>
    <div class="breakdown-item"><span class="b-label">Score</span><span class="b-val">${pct}%</span></div>
    <div class="breakdown-item"><span class="b-label">Result</span><span class="b-val">${pass?'Pass':'Retake'}</span></div>
  `;

  document.getElementById('quiz-review-wrong').onclick = () => {
    let list = document.querySelector('.review-list');
    if(list){ list.remove(); return; }
    list = document.createElement('div');
    list.className = 'review-list';
    if(quizMissed.length === 0){
      list.innerHTML = `<div class="review-item">Perfect score — nothing missed! 🎉</div>`;
    } else {
      list.innerHTML = quizMissed.map(m => `
        <div class="review-item">
          <b>${m.q.roll.name}</b> — your answer: "${m.userAnswer}"<br>
          Correct answer: <b>${m.q.answer}</b>
        </div>`).join('');
    }
    quizResults.appendChild(list);
  };
}

document.getElementById('quiz-start').addEventListener('click', startQuiz);
document.getElementById('quiz-retake').addEventListener('click', () => {
  const list = document.querySelector('.review-list');
  if(list) list.remove();
  quizResults.classList.add('hidden');
  quizSetup.classList.remove('hidden');
});

// ====================================================================
// MENU / ROLL LIST
// ====================================================================
const menuGrid = document.getElementById('menu-grid');
const menuSearch = document.getElementById('menu-search');

function renderMenu(filter=''){
  const f = filter.toLowerCase().trim();
  const filtered = ROLLS.filter(r =>
    r.name.toLowerCase().includes(f) ||
    r.ingredients.some(i=>i.toLowerCase().includes(f)) ||
    r.proteins.some(p=>p.toLowerCase().includes(f))
  );
  menuGrid.innerHTML = filtered.map(roll => `
    <div class="menu-item" data-key="${roll.key}">
      <div class="menu-item-img" data-img="${roll.image}">${roll.name}</div>
      <div class="menu-item-body">
        <h4>${roll.name}</h4>
        <div class="price">$${roll.price.toFixed(2)}</div>
        <div class="menu-item-tags">${tagList(roll).map(t=>`<span class="tag">${t}</span>`).join('')}</div>
      </div>
    </div>
  `).join('');
  hydrateImages(menuGrid);

  menuGrid.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => openModal(item.dataset.key));
  });
}

menuSearch.addEventListener('input', e => renderMenu(e.target.value));
renderMenu();

// modal
const modalBackdrop = document.getElementById('modal-backdrop');
const modalContent = document.getElementById('modal-content');

function openModal(key){
  const roll = SUSHI_ROLLS[key];
  modalContent.innerHTML = `
    <button class="modal-close" id="modal-close">✕</button>
    <div class="card-eyebrow">$${roll.price.toFixed(2)}</div>
    <h3>${roll.name}</h3>
    <div style="margin:14px 0">${imgTag({...roll}, '')}</div>
    <div class="tag-row" style="margin-bottom:14px">${tagList(roll).map(t=>`<span class="tag" style="border-color:var(--line);color:var(--seaweed-2)">${t}</span>`).join('')}</div>
    <p style="font-size:0.85rem;line-height:1.7;margin-bottom:10px"><b>Ingredients:</b><br>${roll.ingredients.join(', ')}</p>
    <p style="font-size:0.85rem;line-height:1.7;color:var(--seaweed-2)">${roll.notes}</p>
  `;
  hydrateImages(modalContent);
  document.getElementById('modal-close').addEventListener('click', closeModal);
  modalBackdrop.classList.remove('hidden');
}
function closeModal(){ modalBackdrop.classList.add('hidden'); }
modalBackdrop.addEventListener('click', e => { if(e.target === modalBackdrop) closeModal(); });
document.addEventListener('keydown', e => { if(e.key==='Escape') closeModal(); });
