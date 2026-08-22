const STORAGE_KEY = 'scorekeeper_members';
const ENDED_KEY = 'scorekeeper_ended';

const addForm = document.getElementById('addForm');
const nameInput = document.getElementById('nameInput');
const membersList = document.getElementById('membersList');
const endGameBtn = document.getElementById('endGameBtn');
const resetBtn = document.getElementById('resetBtn');
const winnerDiv = document.getElementById('winner');
const startGameBtn = document.getElementById('startGameBtn');
const roundInfo = document.getElementById('roundInfo');
const roundForm = document.getElementById('roundForm');
const roundInputs = document.getElementById('roundInputs');
const submitRoundBtn = document.getElementById('submitRoundBtn');
const roundsHistoryDiv = document.getElementById('roundsHistory');
const memberCountSection = document.getElementById('memberCountSection');
const memberCount = document.getElementById('memberCount');
const createSlotsBtn = document.getElementById('createSlotsBtn');
const bulkAddForm = document.getElementById('bulkAddForm');
const memberSlots = document.getElementById('memberSlots');
const saveMembersBtn = document.getElementById('saveMembersBtn');
const maxScoreInput = document.getElementById('maxScoreInput');
const undoRoundBtn = document.getElementById('undoRoundBtn');
const confirmModal = document.getElementById('confirmModal');
const confirmMessage = document.getElementById('confirmMessage');
const confirmYes = document.getElementById('confirmYes');
const confirmNo = document.getElementById('confirmNo');

const MAX_KEY = 'scorekeeper_max';

let members = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let ended = localStorage.getItem(ENDED_KEY) === 'true';
let inGame = false;
const ROUNDS_KEY = 'scorekeeper_rounds';
let rounds = JSON.parse(localStorage.getItem(ROUNDS_KEY) || '[]');
let roundNumber = rounds.length + 1;
let initialSetup = members.length === 0 && !ended;
let maxScore = Number(localStorage.getItem(MAX_KEY)) || 0;

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
}

function render() {
  membersList.innerHTML = '';
  members.forEach((m, i) => {
    const li = document.createElement('li');
    li.dataset.index = i;

    const left = document.createElement('div');
    left.style.display = 'flex';
    left.style.alignItems = 'center';
    const name = document.createElement('div');
    name.textContent = m.name;
    name.className = 'name';
    left.appendChild(name);
    if (m.eliminated) {
      const badge = document.createElement('span');
      badge.className = 'badge eliminated-badge';
      badge.textContent = 'Eliminated';
      left.appendChild(badge);
    }

    // show per-row total (also displayed in rounds history)
    const center = document.createElement('div');
    center.className = 'score';
    center.textContent = m.score;

    const actions = document.createElement('div');
    actions.className = 'actions';

    const inc = document.createElement('button');
    inc.textContent = '+';
    inc.onclick = () => changeScore(i, 1);
    const dec = document.createElement('button');
    dec.textContent = '−';
    dec.onclick = () => changeScore(i, -1);

    // Mark eliminated visually
    if (m.eliminated) li.classList.add('eliminated-item');

    // Disable manual score buttons while in a round or after end
    if (ended || inGame) { inc.disabled = true; dec.disabled = true; }

    actions.appendChild(inc);
    actions.appendChild(dec);

    li.appendChild(left);
    li.appendChild(center);
    li.appendChild(actions);

    membersList.appendChild(li);
  });

  // Clear any previous winner marks
  Array.from(membersList.children).forEach(li => li.classList.remove('winner-item'));

  // If the game has ended, compute and display winners
  if (ended) {
    if (members.length === 0) {
      winnerDiv.textContent = 'No members added.';
      return;
    }
    const min = Math.min(...members.map(m => m.score));
    const winners = members.filter(m => m.score === min);
    if (winners.length === 1) {
      winnerDiv.textContent = `Winner (least): ${winners[0].name} (${winners[0].score})`;
    } else {
      winnerDiv.textContent = `Tie between ${winners.map(w => w.name).join(', ')} (${min})`;
    }
    Array.from(membersList.children).forEach(li => {
      const i = Number(li.dataset.index);
      if (members[i].score === min) li.classList.add('winner-item');
    });
  } else {
    winnerDiv.textContent = '';
  }

  // Update start button and round UI
  startGameBtn.disabled = inGame || members.length === 0 || ended;
  // Undo button visible only when rounds exist
  if (undoRoundBtn) {
    undoRoundBtn.style.display = rounds.length > 0 ? 'inline-block' : 'none';
    undoRoundBtn.disabled = rounds.length === 0;
  }
  // Start button only visible after members are added
  startGameBtn.style.display = members.length > 0 ? 'inline-block' : 'none';
  roundInfo.textContent = inGame ? `Round ${roundNumber}` : '';
  roundForm.style.display = inGame ? 'block' : 'none';

  // Max score input enabled only before game starts
  if (maxScoreInput) {
    maxScoreInput.disabled = inGame || ended;
    maxScoreInput.value = maxScore || '';
  }

  // Member count and bulk add visibility
  if (initialSetup) {
    memberCountSection.style.display = 'block';
    bulkAddForm.style.display = 'none';
    addForm.style.display = 'none';
  } else {
    memberCountSection.style.display = 'none';
    addForm.style.display = 'flex';
  }

  renderRoundsHistory();
}

function showConfirm(message, onConfirm, onCancel) {
  if (!confirmModal) { if (onConfirm) onConfirm(); return; }
  confirmMessage.textContent = message;
  confirmModal.style.display = 'block';
  function cleanup() {
    confirmModal.style.display = 'none';
    confirmYes.removeEventListener('click', yesHandler);
    confirmNo.removeEventListener('click', noHandler);
  }
  function yesHandler() { cleanup(); onConfirm && onConfirm(); }
  function noHandler() { cleanup(); onCancel && onCancel(); }
  confirmYes.addEventListener('click', yesHandler);
  confirmNo.addEventListener('click', noHandler);
}

function renderRoundForm() {
  roundInputs.innerHTML = '';
  members.forEach((m, i) => {
    if (m.eliminated) return; // skip eliminated members for new rounds
    const row = document.createElement('div');
    row.className = 'round-row';
    const label = document.createElement('label');
    label.textContent = m.name;
    label.htmlFor = `score_${i}`;
    const input = document.createElement('input');
    input.type = 'number';
    input.id = `score_${i}`;
    input.name = `score_${i}`;
    input.required = true;
    input.min = '-100000';
    input.placeholder = 'Score for this round';
    row.appendChild(label);
    row.appendChild(input);
    roundInputs.appendChild(row);
  });
}

function renderRoundsHistory() {
  roundsHistoryDiv.innerHTML = '';
  if (!rounds || rounds.length === 0) return;
  const table = document.createElement('table');
  table.className = 'rounds-table';
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const thMember = document.createElement('th');
  thMember.textContent = 'Member';
  headerRow.appendChild(thMember);
  const thElim = document.createElement('th');
  thElim.textContent = 'Elim';
  headerRow.appendChild(thElim);
  rounds.forEach((r, idx) => {
    const th = document.createElement('th');
    th.textContent = `R${idx + 1}`;
    headerRow.appendChild(th);
  });
  const thTotal = document.createElement('th');
  thTotal.textContent = 'Total';
  headerRow.appendChild(thTotal);
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  members.forEach((m, mi) => {
    const tr = document.createElement('tr');
    if (m.eliminated) tr.classList.add('eliminated-item');
    const tdName = document.createElement('td');
    tdName.textContent = m.name;
    tr.appendChild(tdName);
    const tdElim = document.createElement('td');
    tdElim.textContent = m.eliminated ? 'Yes' : '-';
    tr.appendChild(tdElim);
    let rowTotal = 0;
    rounds.forEach(r => {
      const td = document.createElement('td');
      const v = Number(r[mi]);
      td.textContent = isNaN(v) ? '-' : v;
      if (!isNaN(v)) rowTotal += v;
      tr.appendChild(td);
    });
    const tdTotal = document.createElement('td');
    tdTotal.textContent = m.score;
    tr.appendChild(tdTotal);
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  roundsHistoryDiv.appendChild(table);
}

function addMember(name) {
  members.push({ name, score: 0, eliminated: false });
  save();
  render();
}

function createSlots() {
  const n = Number(memberCount.value) || 1;
  memberSlots.innerHTML = '';
  for (let i = 0; i < n; i++) {
    const div = document.createElement('div');
    div.className = 'slot-row';
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = `Member ${i + 1} name`;
    input.required = true;
    input.id = `slot_${i}`;
    div.appendChild(input);
    memberSlots.appendChild(div);
  }
  bulkAddForm.style.display = 'block';
  memberCountSection.style.display = 'none';
}

function saveBulkMembers(e) {
  e.preventDefault();
  const inputs = Array.from(memberSlots.querySelectorAll('input'));
  members = inputs.map(i => ({ name: i.value.trim(), score: 0, eliminated: false })).filter(m => m.name);
  if (members.length === 0) return;
  save();
  initialSetup = false;
  bulkAddForm.style.display = 'none';
  render();
}

function startGame() {
  if (members.length === 0) return;
  // Read and persist max score threshold (must be >0)
  const val = Number(maxScoreInput && maxScoreInput.value) || 0;
  maxScore = val > 0 ? val : 0;
  if (maxScore > 0) localStorage.setItem(MAX_KEY, String(maxScore));

  inGame = true;
  rounds = [];
  localStorage.removeItem(ROUNDS_KEY);
  roundNumber = 1;
  // Disable adding members while game in progress
  document.getElementById('nameInput').disabled = true;
  document.querySelector('#addForm button[type="submit"]').disabled = true;
  renderRoundForm();
  render();
}

function changeScore(index, delta) {
  if (ended) return;
  if (inGame) return;
  members[index].score += delta;
  save();
  render();
}

function submitRound(e) {
  e.preventDefault();
  // Collect scores
  const inputs = Array.from(roundInputs.querySelectorAll('input'));
  const roundScores = [];
  for (const input of inputs) {
    const idx = Number(input.id.split('_')[1]);
    const val = Number(input.value) || 0;
    members[idx].score += val;
    roundScores[idx] = val;
    input.value = '';
  }
  // After applying round scores, mark members eliminated if they reached maxScore
  if (maxScore && maxScore > 0) {
    members.forEach((m, i) => {
      if (!m.eliminated && m.score >= maxScore) {
        m.eliminated = true;
      }
    });
  }
  rounds.push(roundScores);
  localStorage.setItem(ROUNDS_KEY, JSON.stringify(rounds));
  save();
  roundNumber = rounds.length + 1;

  // If only one non-eliminated member remains, end the game automatically
  const active = members.filter(m => !m.eliminated);
  if (active.length <= 1) {
    // Ask confirmation before auto-ending
    showConfirm('Only one player remains — end game now?', () => {
      localStorage.setItem(ROUNDS_KEY, JSON.stringify(rounds));
      endGame();
    }, () => {
      // If user cancels, allow continuing (no further action)
      render();
    });
    return;
  }

  renderRoundForm();
  render();
}

function endGame() {
  ended = true;
  inGame = false;
  localStorage.setItem(ENDED_KEY, 'true');
  localStorage.setItem(ROUNDS_KEY, JSON.stringify(rounds));
  if (maxScore && maxScore > 0) localStorage.setItem(MAX_KEY, String(maxScore));
  // Re-enable adding members after end
  document.getElementById('nameInput').disabled = false;
  document.querySelector('#addForm button[type="submit"]').disabled = false;
  render();
}

function recomputeFromRounds() {
  // Reset scores and elimination
  members.forEach(m => { m.score = 0; m.eliminated = false; });
  // Apply each saved round in order
  for (const r of rounds) {
    for (let i = 0; i < members.length; i++) {
      const v = Number(r[i]) || 0;
      members[i].score += v;
    }
    // Apply elimination after each round
    if (maxScore && maxScore > 0) {
      members.forEach(m => { if (!m.eliminated && m.score >= maxScore) m.eliminated = true; });
    }
  }
}

function undoLastRound() {
  if (!rounds || rounds.length === 0) return;
  rounds.pop();
  localStorage.setItem(ROUNDS_KEY, JSON.stringify(rounds));
  // Recompute members scores and elimination from remaining rounds
  recomputeFromRounds();
  save();
  roundNumber = rounds.length + 1;
  renderRoundForm();
  render();
}

function resetGame() {
  members = [];
  ended = false;
  rounds = [];
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(ENDED_KEY);
  localStorage.removeItem(ROUNDS_KEY);
  localStorage.removeItem(MAX_KEY);
  winnerDiv.textContent = '';
  render();
}

addForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = nameInput.value.trim();
  if (!name) return;
  addMember(name);
  nameInput.value = '';
});

endGameBtn.addEventListener('click', () => showConfirm('End the game now?', () => endGame()));
resetBtn.addEventListener('click', () => resetGame());

undoRoundBtn && undoRoundBtn.addEventListener('click', () => {
  showConfirm('Undo last round? This cannot be undone.', () => undoLastRound());
});

startGameBtn.addEventListener('click', () => startGame());
roundForm.addEventListener('submit', submitRound);
createSlotsBtn.addEventListener('click', createSlots);
bulkAddForm.addEventListener('submit', saveBulkMembers);

render();
