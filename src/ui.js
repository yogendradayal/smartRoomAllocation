/**
 * ui.js — HostelOS UI Helpers
 * Pure rendering functions; no business logic.
 */

const UI = (() => {

  /* ── Output panel ── */
  function showOutput(panelId, message, type = 'success') {
    const el = document.getElementById(panelId);
    if (!el) return;
    el.className = `output-panel ${type}`;
    el.textContent = message;
    el.style.display = 'block';
  }

  function hideOutput(panelId) {
    const el = document.getElementById(panelId);
    if (el) el.style.display = 'none';
  }

  /* ── Field validation visuals ── */
  function setFieldError(inputId, errorId, message) {
    const inp = document.getElementById(inputId);
    const err = document.getElementById(errorId);
    if (inp) inp.classList.add('error');
    if (err) err.textContent = message;
  }

  function clearFieldError(inputId, errorId) {
    const inp = document.getElementById(inputId);
    const err = document.getElementById(errorId);
    if (inp) inp.classList.remove('error');
    if (err) err.textContent = '';
  }

  /* ── Build a single room card ── */
  function buildRoomCard(room, options = {}) {
    const { showDelete = false, highlight = false } = options;

    const card = document.createElement('div');
    card.className = 'room-card' + (highlight ? ' allocated' : '');
    card.dataset.roomNo = room.roomNo;

    const capBadge = `<span class="badge badge-cap">⊕ ${room.capacity} seats</span>`;
    const acBadge  = room.hasAC
      ? `<span class="badge badge-ac">❄ AC</span>`
      : `<span class="badge badge-off">No AC</span>`;
    const washBadge = room.hasAttachedWashroom
      ? `<span class="badge badge-wash">🚿 Washroom</span>`
      : `<span class="badge badge-off">No Washroom</span>`;

    const footer = highlight
      ? `<div class="room-card-footer">
           <span class="allocated-label">ALLOCATED</span>
         </div>`
      : showDelete
        ? `<div class="room-card-footer">
             <button class="btn btn-danger delete-btn" data-room="${room.roomNo}">Remove</button>
           </div>`
        : '';

    card.innerHTML = `
      <div class="room-no">${escapeHtml(room.roomNo)}</div>
      <div class="room-badges">
        ${capBadge}
        ${acBadge}
        ${washBadge}
      </div>
      ${footer}
    `;

    return card;
  }

  /* ── Render list of rooms into a grid ── */
  function renderRoomsGrid(gridId, rooms, options = {}) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    grid.innerHTML = '';

    if (rooms.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.innerHTML = `<div class="empty-icon">🔍</div><p>${options.emptyMessage || 'No rooms found.'}</p>`;
      grid.appendChild(empty);
      return;
    }

    rooms.forEach(room => {
      grid.appendChild(buildRoomCard(room, options));
    });
  }

  /* ── Update the global room counter in header ── */
  function updateCounter(count) {
    const el = document.getElementById('totalRooms');
    if (el) el.textContent = count;
  }

  /* ── Update stats bar (View tab) ── */
  function updateStats(rooms) {
    const total = rooms.length;
    const ac    = rooms.filter(r => r.hasAC).length;
    const wash  = rooms.filter(r => r.hasAttachedWashroom).length;
    const s = id => document.getElementById(id);
    if (s('stat-total')) s('stat-total').textContent = total;
    if (s('stat-ac'))    s('stat-ac').textContent    = ac;
    if (s('stat-wash'))  s('stat-wash').textContent  = wash;
  }

  /* ── XSS-safe string ── */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  return {
    showOutput, hideOutput,
    setFieldError, clearFieldError,
    buildRoomCard, renderRoomsGrid,
    updateCounter, updateStats,
    escapeHtml,
  };
})();
