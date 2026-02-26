# HostelOS — Smart Room Allocation System

A fully client-side web application that manages hostel rooms and automatically allocates the best-fit room to students based on capacity and facility requirements.

---

## 🚀 Live Demo

> https://adorable-hamster-3c4060.netlify.app/

---

## 📦 Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Structure   | HTML5 (semantic)                  |
| Styling     | Pure CSS3 (custom properties, CSS Grid, Flexbox, animations) |
| Logic       | Vanilla JavaScript (ES6 modules via IIFE pattern) |
| Persistence | LocalStorage (no backend required) |
| Fonts       | Google Fonts — Syne + Space Mono  |
| Hosting     | Netlify    |

**No frameworks. No build tools. No dependencies.**  
Just open `index.html` in a browser — it works.

---

## 🗂️ Project Structure

```
hostel-allocation/
├── index.html          ← App shell & markup for all 4 tabs
├── src/
│   ├── styles.css      ← All styles (variables, components, responsive)
│   ├── data.js         ← RoomStore — in-memory + LocalStorage persistence
│   ├── allocation.js   ← AllocationEngine — room allocation algorithm
│   ├── ui.js           ← UI helpers — rendering, error display, DOM manipulation
│   └── app.js          ← App controller — event wiring, tab navigation
└── README.md
```

---

## ⚙️ Data Model

Each room object:

```js
{
  roomNo:              String,   // Unique identifier, e.g. "A-101"
  capacity:            Number,   // Max students the room can hold
  hasAC:               Boolean,  // true / false
  hasAttachedWashroom: Boolean   // true / false
}
```

---

## ✅ Features

### 1. Add Room
Fill in Room Number, Capacity, and toggle AC / Washroom switches.  
Validation prevents duplicate room numbers and empty/invalid fields.

### 2. View All Rooms
Displays all rooms as visual cards with badge indicators for capacity, AC, and washroom.  
Includes stats (total rooms, AC count, washroom count) and individual delete / clear-all options.

### 3. Search Rooms
Filter rooms by:
- Minimum capacity
- AC preference (Any / Yes / No)
- Washroom preference (Any / Yes / No)

Results render instantly with room count summary.

### 4. Allocate Room — `AllocateRoom(students, needsAC, needsWashroom)`

**Algorithm:**
1. Filter all rooms to those with `capacity ≥ students`.
2. Apply facility filters (AC / Washroom) if required.
3. Sort candidates by capacity ascending.
4. Return the first (smallest sufficient) room.
5. If no candidates, return **"No room available"**.

This guarantees the **smallest possible room** that still satisfies all constraints — minimising waste.

---

## 🏃 Running Locally

```bash
# No install needed — just open the file:
open index.html

# Or serve with any static server:
npx serve .
python3 -m http.server 8080
```

---



## 🔐 Error Handling

| Scenario                        | Handling                              |
|---------------------------------|---------------------------------------|
| Duplicate room number           | Error message shown inline            |
| Empty or non-numeric capacity   | Field highlighted + error text        |
| Allocation with 0 students      | Input validation prevents submission  |
| No matching room found          | "No room available" displayed         |
| LocalStorage unavailable        | Falls back to in-memory gracefully    |

---



---

