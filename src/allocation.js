/**
 * allocation.js — HostelOS Allocation Engine
 *
 * AllocateRoom(students, needsAC, needsWashroom)
 *   - Finds the smallest room (by capacity) that satisfies ALL conditions.
 *   - Among rooms with equal capacity, picks the first in insertion order.
 *   - Returns the matched room object, or null if none found.
 */

const AllocationEngine = (() => {

  /**
   * Core allocation function.
   * @param {number}  students      – number of students to accommodate
   * @param {boolean} needsAC       – whether AC is required
   * @param {boolean} needsWashroom – whether attached washroom is required
   * @returns {{ room: Object|null, reason: string }}
   */
  function allocateRoom(students, needsAC, needsWashroom) {
    // Input validation
    if (!Number.isInteger(students) || students < 1) {
      return { room: null, reason: 'Invalid number of students.' };
    }

    // Get all rooms that satisfy facility and capacity constraints
    const candidates = RoomStore.filter({
      minCapacity: students,
      needsAC:       needsAC       ? true : null,
      needsWashroom: needsWashroom ? true : null,
    });

    if (candidates.length === 0) {
      return { room: null, reason: 'No room available' };
    }

    // Sort by capacity ascending → smallest sufficient room first
    candidates.sort((a, b) => a.capacity - b.capacity);

    return { room: candidates[0], reason: 'Allocated successfully.' };
  }

  return { allocateRoom };
})();
