/**
 * data.js — HostelOS Data Layer
 * Manages in-memory room storage with LocalStorage persistence.
 */

const RoomStore = (() => {
  const STORAGE_KEY = 'hostelOS_rooms';
  let rooms = [];

  /** Load rooms from LocalStorage on init */
  function init() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) rooms = JSON.parse(saved);
    } catch {
      rooms = [];
    }
  }

  /** Persist rooms to LocalStorage */
  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
    } catch {
      console.warn('LocalStorage unavailable – data will not persist across sessions.');
    }
  }

  /**
   * Add a room to the store.
   * @param {{roomNo:string, capacity:number, hasAC:boolean, hasAttachedWashroom:boolean}} room
   * @returns {{ ok:boolean, message:string }}
   */
  function addRoom(room) {
    // Validate uniqueness
    if (rooms.some(r => r.roomNo.toLowerCase() === room.roomNo.toLowerCase())) {
      return { ok: false, message: `Room "${room.roomNo}" already exists.` };
    }
    rooms.push({ ...room });
    persist();
    return { ok: true, message: `Room "${room.roomNo}" added successfully.` };
  }

  /** Return a shallow copy of all rooms */
  function getAll() {
    return [...rooms];
  }

  /**
   * Filter rooms by given criteria.
   * @param {{ minCapacity?:number, needsAC?:boolean|null, needsWashroom?:boolean|null }} criteria
   */
  function filter({ minCapacity = 0, needsAC = null, needsWashroom = null } = {}) {
    return rooms.filter(r => {
      if (r.capacity < minCapacity) return false;
      if (needsAC !== null && r.hasAC !== needsAC) return false;
      if (needsWashroom !== null && r.hasAttachedWashroom !== needsWashroom) return false;
      return true;
    });
  }

  /** Remove all rooms */
  function clearAll() {
    rooms = [];
    persist();
  }

  /** Delete a single room by roomNo */
  function deleteRoom(roomNo) {
    rooms = rooms.filter(r => r.roomNo !== roomNo);
    persist();
  }

  return { init, addRoom, getAll, filter, clearAll, deleteRoom };
})();

// Initialise on load
RoomStore.init();
