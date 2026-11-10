# Course Review Board — ACL UI/UX Lab

A **standalone React + Vite demo** used for one session of the **UI/UX Rescue Challenge**.
The app works, but its interface was not designed around what students actually need to do. Your job is to **redesign the user experience** so the session's user scenario is easy to complete — **without removing or weakening any existing feature**.

The app runs entirely in the browser. It uses realistic example records saved in `localStorage` and does **not** connect to MongoDB or the API from the previous lab.

---

## The task

### 1. Understand the user scenario

> A student is **choosing a course**, wants to **understand previous student feedback**, and then **submits a review for another course**.

Walk through this scenario in the current app before changing anything. Note every point where the student hesitates, gets lost, has to guess, or does unnecessary work.

### 2. Redesign the interface

Improve the layout, navigation, wording, visual hierarchy, forms and feedback so the scenario above feels clear and quick. You may restructure components, styles and copy as much as you need.

### 3. Keep every existing feature working

A redesign that drops or breaks functionality does not count as a rescue. The following must still work after your changes:

| Area | What must keep working |
| --- | --- |
| **Browse reviews** | List all reviews with course, rating, comment, reviewer and an edit action for your own reviews. |
| **Search & filter** | Search by course code, comment text or reviewer name; filter by star rating. |
| **Overview stats** | Total reviews, overall average score, number of rated courses, rating distribution. |
| **Course score lookup** | Enter a course code to see its average rating and review count. |
| **Course details page** | Clicking a course code opens a separate, **shareable** page (`#/courses/<CODE>`) with the course name, short description, teaching history for **2024/25** and **2025/26** (instructors and TAs), and that course's student reviews. |
| **Write a review** | Create a review with a course code, a rating and an optional comment. |
| **Edit a review** | Edit **only your own** reviews (reviews owned by `You`). |
| **Validation rules** | Course code is required; rating must be a **whole number from 1 to 5**; a user can write **only one review per course**. |
| **Persistence & reset** | Changes are saved in `localStorage`; **Reset demo** restores the example records. |

---

## Functional brief

Users browse reviews and course summaries. Course codes in the review list open a separate, shareable course-details page showing the course name, short description, teaching history for 2024/25 and 2025/26, and its student reviews. A reviewer may write one review per course and edit only their own reviews. Ratings must be integers 1–5.

All staff names and course descriptions are **fictional sample data**, not historical GUC records.

### Review fields (from the prior lab)

| Field | Label | Rule |
| --- | --- | --- |
| `courseCode` | Course code | Required text (stored in upper case) |
| `rating` | Rating | Whole number 1 to 5 |
| `comment` | Comment | Optional |

Each stored review also carries `id`, `owner` (`'you'` or `'other'`), `name` and `date`. You can assume the currently signed-in user is **`You`**.

### Example courses

| Code | Name |
| --- | --- |
| CSEN701 | Advanced Computer Lab |
| CSEN401 | Software Engineering |
| CSEN202 | Data Structures |
| MATH204 | Linear Algebra |
| HUMA101 | Critical Thinking & Communication |

A course code that is not in the catalog still works, but its details page shows a "Course details not yet added" placeholder.

---

## Run the project

Requires [Node.js](https://nodejs.org/) 18 or later.

```bash
npm install
npm run dev
```

The terminal prints **one local URL** (usually `http://localhost:5173/`). Open it in your normal browser — the dev server does **not** open a browser automatically. Press `Ctrl+C` to stop it.




## Project structure

```
.
├── index.html          # HTML entry point
├── scripts/dev.mjs     # Starts the Vite dev server and prints a single URL
├── src/
│   ├── main.jsx        # Mounts <App /> into #root
│   ├── App.jsx         # All UI, state, routing, sample data and validation
│   └── styles.css      # All styling
└── package.json
```

Key things inside `src/App.jsx`:

- `COURSE_CATALOG` — course names, descriptions and teaching history.
- `seed` — the example reviews restored by **Reset demo**.
- `KEY` — the `localStorage` key where reviews are saved.
- `readRoute` / `openCourse` — hash-based routing for the course details page.
- `submit` — form validation (required code, 1–5 rating, one review per course).

> Tip: if your changes to the data shape seem not to apply, click **Reset demo** or clear the `acl-course-pulse-v2` entry in your browser's `localStorage`.
