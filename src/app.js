/**
 * app.js — HostelOS Application Controller
 * Wires together UI interactions, data layer, and allocation engine.
 */

(function () {
  'use strict';

  /* ══════════════════════════════════════
     NAVIGATION
  ══════════════════════════════════════ */
  const navBtns   = document.querySelectorAll('.nav-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  function switchTab(tabName) {
    navBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === tabName));
    tabPanels.forEach(p => p.classList.toggle('active', p.id === `tab-${tabName}`));

    // Refresh view tab each time it's opened
    if (tabName === 'view') renderViewTab();
    if (tabName === 'search') {
      UI.hideOutput('searchOutput');
      document.getElementById('searchResultsGrid').innerHTML = '';
    }
  }

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  /* ══════════════════════════════════════
     HELPERS
  ══════════════════════════════════════ */
  function getRadioValue(name) {
    const checked = document.querySelector(`input[name="${name}"]:checked`);
    return checked ? checked.value : null;
  }

  function refreshGlobalState() {
    const all = RoomStore.getAll();
    UI.updateCounter(all.length);
    UI.updateStats(all);
  }

  /* ══════════════════════════════════════
     TAB: ADD ROOM
  ══════════════════════════════════════ */
  const addRoomForm = document.getElementById('addRoomForm');
  const acCheckbox  = document.getElementById('hasAC');
  const washCheckbox = document.getElementById('hasWashroom');

  // Live toggle text updates
  acCheckbox.addEventListener('change', () => {
    document.getElementById('acText').textContent = acCheckbox.checked ? 'Has AC' : 'No AC';
  });
  washCheckbox.addEventListener('change', () => {
    document.getElementById('washroomText').textContent = washCheckbox.checked ? 'Has Washroom' : 'No Washroom';
  });

  addRoomForm.addEventListener('submit', e => {
    e.preventDefault();
    UI.hideOutput('addOutput');

    // Clear previous errors
    UI.clearFieldError('roomNo', 'err-roomNo');
    UI.clearFieldError('capacity', 'err-capacity');

    const roomNoVal  = document.getElementById('roomNo').value.trim();
    const capacityVal = parseInt(document.getElementById('capacity').value, 10);

    let valid = true;

    if (!roomNoVal) {
      UI.setFieldError('roomNo', 'err-roomNo', 'Room number is required.');
      valid = false;
    }

    if (isNaN(capacityVal) || capacityVal < 1) {
      UI.setFieldError('capacity', 'err-capacity', 'Capacity must be a positive number.');
      valid = false;
    }

    if (!valid) return;

    const result = RoomStore.addRoom({
      roomNo:              roomNoVal,
      capacity:            capacityVal,
      hasAC:               acCheckbox.checked,
      hasAttachedWashroom: washCheckbox.checked,
    });

    if (result.ok) {
      UI.showOutput('addOutput', `✔  ${result.message}`, 'success');
      addRoomForm.reset();
      document.getElementById('acText').textContent = 'No AC';
      document.getElementById('washroomText').textContent = 'No Washroom';
      refreshGlobalState();
    } else {
      UI.showOutput('addOutput', `✖  ${result.message}`, 'error');
    }
  });

  /* ══════════════════════════════════════
     TAB: VIEW ROOMS
  ══════════════════════════════════════ */
  function renderViewTab() {
    const all = RoomStore.getAll();
    UI.updateStats(all);

    const grid = document.getElementById('roomsGrid');
    grid.innerHTML = '';

    if (all.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" id="emptyState">
          <div class="empty-icon">🏠</div>
          <p>No rooms added yet.<br/>Head to <strong>Add Room</strong> to get started.</p>
        </div>`;
      return;
    }

    all.forEach(room => {
      const card = UI.buildRoomCard(room, { showDelete: true });
      grid.appendChild(card);
    });
  }

  // Delegate delete clicks on the view grid
  document.getElementById('roomsGrid').addEventListener('click', e => {
    if (e.target.classList.contains('delete-btn')) {
      const roomNo = e.target.dataset.room;
      if (confirm(`Remove room "${roomNo}"?`)) {
        RoomStore.deleteRoom(roomNo);
        refreshGlobalState();
        renderViewTab();
      }
    }
  });

  // Clear all rooms
  document.getElementById('clearAllBtn').addEventListener('click', () => {
    const all = RoomStore.getAll();
    if (all.length === 0) return;
    if (confirm(`Clear ALL ${all.length} room(s)? This cannot be undone.`)) {
      RoomStore.clearAll();
      refreshGlobalState();
      renderViewTab();
    }
  });

  /* ══════════════════════════════════════
     TAB: SEARCH
  ══════════════════════════════════════ */
  document.getElementById('searchBtn').addEventListener('click', () => {
    UI.hideOutput('searchOutput');

    const capInput  = document.getElementById('searchCapacity').value;
    const minCap    = capInput ? parseInt(capInput, 10) : 0;
    const acVal     = getRadioValue('searchAC');
    const washVal   = getRadioValue('searchWash');

    const criteria = {
      minCapacity:   isNaN(minCap) ? 0 : minCap,
      needsAC:       acVal === 'yes' ? true  : acVal === 'no' ? false : null,
      needsWashroom: washVal === 'yes' ? true : washVal === 'no' ? false : null,
    };

    const results = RoomStore.filter(criteria);

    UI.showOutput(
      'searchOutput',
      `Found ${results.length} room${results.length !== 1 ? 's' : ''} matching your criteria.`,
      results.length > 0 ? 'success' : 'info'
    );

    UI.renderRoomsGrid('searchResultsGrid', results, {
      emptyMessage: 'No rooms match the selected filters.',
    });
  });

  document.getElementById('resetSearchBtn').addEventListener('click', () => {
    document.getElementById('searchCapacity').value = '';
    document.querySelectorAll('input[name="searchAC"]')[0].checked = true;
    document.querySelectorAll('input[name="searchWash"]')[0].checked = true;
    UI.hideOutput('searchOutput');
    document.getElementById('searchResultsGrid').innerHTML = '';
  });

  /* ══════════════════════════════════════
     TAB: ALLOCATE
  ══════════════════════════════════════ */
  document.getElementById('allocateBtn').addEventListener('click', () => {
    UI.clearFieldError('allocStudents', 'err-allocStudents');
    UI.hideOutput('allocOutput');

    const studentsVal = parseInt(document.getElementById('allocStudents').value, 10);
    const acVal       = getRadioValue('allocAC');
    const washVal     = getRadioValue('allocWash');

    if (isNaN(studentsVal) || studentsVal < 1) {
      UI.setFieldError('allocStudents', 'err-allocStudents', 'Enter a valid number of students (≥ 1).');
      return;
    }

    const { room, reason } = AllocationEngine.allocateRoom(
      studentsVal,
      acVal === 'yes',
      washVal === 'yes'
    );

    if (room) {
      const acStr   = room.hasAC               ? 'Yes' : 'No';
      const washStr = room.hasAttachedWashroom  ? 'Yes' : 'No';
      UI.showOutput(
        'allocOutput',
        `✔  Allocated: Room ${room.roomNo}  |  Capacity: ${room.capacity}  |  AC: ${acStr}  |  Washroom: ${washStr}`,
        'success'
      );
    } else {
      UI.showOutput('allocOutput', `✖  ${reason}`, 'error');
    }
  });

  /* ══════════════════════════════════════
     INIT
  ══════════════════════════════════════ */
  refreshGlobalState();
  renderViewTab();

})();
