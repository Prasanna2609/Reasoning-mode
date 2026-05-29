# Reasoning Layer — Architecture Document
## Fellowship Graduation Project · Claude (Anthropic) · June 2026
### Status: Living document — updated after each phase ships

---

## 1. PROBLEM STATEMENT

> "Users who review AI outputs before acting cannot tell whether the reasoning behind them is sound — because structural quality and reasoning quality look identical in the output."

**Three atoms:**
1. **WHO:** Users who already pause and review before acting. The evaluation moment exists — they created it.
2. **WHAT:** They cannot evaluate the quality of the logic chain behind the answer. Not facts, not grammar — the *reasoning*.
3. **WHY THE GAP:** Polished structure activates a "looks complete" heuristic. The output gives no signal distinguishing sound reasoning from weak reasoning.

**The spine insight from research:**
"People know AI can be wrong. They review. Their review is broken."

---

## 2. SOLUTION

> "The Reasoning Layer aids the user's review of an AI output — showing them where to apply their judgment, what to question, and what to check externally."

**What it is NOT:** Not a fact-checker. Not a hallucination detector. Not a second AI evaluating the first. Not always-on.

**The moat:**
> "Only the generating model can reason about when it is substituting general knowledge for specific missing context — because that reasoning happens internally during generation. No external tool can access this without the generating model's cooperation."

---

## 3. SYSTEM ARCHITECTURE

### Application Modes

```
┌─────────────────────────────────────────────────────┐
│                   REASONING LAYER APP                │
│                                                      │
│  ┌────────────────┐       ┌─────────────────────┐   │
│  │  DIRECTED MODE │       │     LIVE MODE        │   │
│  │  (Scripted)    │◄─────►│  (Live AI calls)     │   │
│  │  No API calls  │ Toggle │  Two API calls       │   │
│  └────────────────┘       └─────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### Live Mode — Full Request Flow

```
USER TYPES MESSAGE
        │
        ▼
┌───────────────────────┐
│ CORRECTION CLASSIFIER │  ← deterministic, client-side
│                       │
│ Contains correction   │
│ signal? ("actually",  │
│ negation+restatement) │
└──────────┬────────────┘
           │
    ┌──────┴──────┐
    │             │
   YES            NO
    │             │
    ▼             ▼
CORRECTION     CALL 1
CALL           (Generation)
    │             │
    │     ┌───────┴──────────────────────────────┐
    │     │ Returns: {evaluative: bool,           │
    │     │          response: string}            │
    │     └───────────────┬──────────────────────┘
    │                     │
    │              ┌──────┴──────┐
    │              │             │
    │         evaluative    evaluative
    │            true          false
    │              │             │
    │              ▼             ▼
    │           CALL 2      RENDER PLAIN
    │          (Analysis)   RESPONSE
    │              │        (State 1)
    │     ┌────────┴──────────────────────────────┐
    │     │ Input: user message + Call 1 response  │
    │     │ Returns: {                             │
    │     │   inference_flags[]                   │
    │     │   assumptions[]                       │
    │     │   dependencies[]                      │
    │     │   gaps[]                              │
    │     │ }                                     │
    │     └────────────┬──────────────────────────┘
    │                  │
    │                  ▼
    │        QUOTE MATCHING PASS  ← client-side, 3-tier
    │        Tier 1: exact substring match
    │        Tier 2: 6-word anchor → wrap sentence
    │        Tier 3: no match → append as panel
    │                  │
    │          ┌───────┴──────────┐
    │          │                  │
    │    Mode ON?             Mode OFF?
    │          │                  │
    │          ▼                  ▼
    │   RENDER WITH          CHECK NUDGE
    │   HIGHLIGHTS           GATE
    │   (State 3)                │
    │                   counter < 3?
    │                       │
    │                 ┌─────┴──────┐
    │                YES           NO
    │                 │            │
    │                 ▼            ▼
    │          WAIT 500ms     RENDER PLAIN
    │          SHOW NUDGE     (State 1)
    │          (State 2)
    │
    ▼
CORRECTION CALL
Input: original response + user correction
Returns: {
  response: updated text,
  change_receipt: {
    changed[]
    unchanged[]
    still_open[]
  }
}
    │
    ▼
RE-RUN QUOTE MATCHING
RENDER UPDATED RESPONSE + CHANGE RECEIPT
(State 4)
```

### Four Application States

| State | Reasoning Mode | Nudge | Highlights | Change Receipt |
|-------|---------------|-------|-----------|----------------|
| 1 — Normal output | OFF | Not fired | Hidden | Hidden |
| 2 — Nudge visible | OFF | Visible | Hidden | Hidden |
| 3 — Layer active | ON | Hidden | Visible | Hidden |
| 4 — Correction done | ON | Hidden | Visible (updated) | Visible |

**State transitions:**
- 1 → 2: evaluative=true + counter<3 + Mode OFF → wait 500ms → nudge
- 2 → 3: User clicks "Activate Reasoning Mode" → highlights render from stored data
- 1 → 3: Mode was already ON when response arrived → immediate highlights
- 3 → 4: Correction intent detected → correction call → updated response + change receipt

---

## 4. FOUR ELEMENTS (LOCKED)

### Element 1 — Inference Flag `red underline`
Fires when the response uses population-level or general knowledge where user-specific data was absent.
- **Fires on:** numbers, percentages, benchmarks, rates drawn from general training data
- **Example trigger:** "teams of this size typically see 30–40% improvement"
- **User action:** Verify externally / supply actual data / accept with awareness

### Element 2 — Assumption `amber underline`
Fires when the response characterises the user's specific situation beyond what they explicitly stated.
- **Fires on:** characterisations of context, intent, constraints, or root cause not stated by user
- **Example trigger:** "the bottleneck here is almost certainly a capacity issue"
- **User action:** Confirm it is correct / correct it / note it as a limitation

### Element 3 — Dependency `blue underline`
Fires when the conclusion requires multiple conditions to be simultaneously true — and removing one reverses (not just weakens) the recommendation entirely.
- **Fires on:** multi-condition conclusions where any single false condition collapses the recommendation
- **Example trigger:** "this holds if budget exists AND the bottleneck is skill-gap"
- **User action:** Evaluate each condition / correct a false premise / accept if all hold

### Element 4 — Gap `plain text section below response`
Always fires on qualifying responses. Top 3 uncovered things that would most change the recommendation direction if the user supplied them.
- **Hard cap:** 3 items maximum — enforced in the API prompt and client-side
- **Placement:** "NOT COVERED" section below response. No inline highlight.
- **User action:** Supply missing context / verify externally / accept limited scope

---

## 5. TWO API CALLS

### Call 1 — Generation
**Input:** conversation history + new user message
**System prompt goal:** Return valid JSON. If response contains a recommendation, number used as evidence, percentage, or course of action → `evaluative: true`. Otherwise → `evaluative: false`.
**Returns:**
```json
{
  "evaluative": true,
  "response": "full response text"
}
```

### Call 2 — Analysis (only fires if evaluative: true)
**Input:** user message + Call 1 response text
**System prompt goal:** Identify exact quoted phrases for each element. Inference = general data the user didn't provide. Assumption = characterisation of user's situation beyond what was stated. Dependency = condition whose removal collapses the conclusion. Gaps = top 3 missing inputs that would most change the recommendation.
**Returns:**
```json
{
  "inference_flags": [{"quote": "...", "basis": "...", "missing": "..."}],
  "assumptions": [{"quote": "...", "fills": "...", "if_wrong": "..."}],
  "dependencies": [{"quote": "...", "conditions": ["...", "..."]}],
  "gaps": ["...", "...", "..."]
}
```

### Correction Call (fires when correction intent detected)
**Input:** original response text + user correction message
**System prompt goal:** Update the recommendation based on the correction. Show exactly what changed and why.
**Returns:**
```json
{
  "response": "updated recommendation text",
  "change_receipt": {
    "changed": ["what changed and why"],
    "unchanged": ["what stayed the same and why"],
    "still_open": ["unresolved assumptions or inferences"]
  }
}
```

### API Key
- Stored in `.env` file only
- Accessed via environment variable in code — never hardcoded
- One key handles all three call types

---

## 6. TECH STACK

| Layer | Technology |
|-------|-----------|
| Framework | React + Vite |
| Styling | Vanilla CSS with custom properties |
| API | OpenAI-compatible inference API |
| Storage | localStorage only |
| Deployment | Vercel |
| Fonts | Inter, IBM Plex Mono, Syne (Google Fonts) |
| Testing | Vitest + React Testing Library + Jest DOM |

---

## 7. DESIGN TOKENS

```css
/* Backgrounds */
--bg:     #0A0A0A    /* app background */
--bg2:    #111       /* sidebar */
--bg3:    #181818    /* chat windows, cards */
--bg4:    #1e1e1e    /* legend bar, panels */

/* Borders */
--border:  #222
--border2: #2a2a2a

/* Amber — Assumption */
--amber:   #F0A500
--adim:    rgba(240, 165, 0, 0.12)
--aborder: rgba(240, 165, 0, 0.3)

/* Red — Inference */
--red:     #FF4545
--rdim:    rgba(255, 69, 69, 0.12)
--rborder: rgba(255, 69, 69, 0.3)

/* Blue — Dependency */
--blue:    #4A9EFF
--bdim:    rgba(74, 158, 255, 0.12)
--bborder: rgba(74, 158, 255, 0.3)

/* Green — Change receipt */
--green:   #00C48C
--gdim:    rgba(0, 196, 140, 0.1)
--gborder: rgba(0, 196, 140, 0.28)

/* Text */
--text:    #E8E8E8   /* primary */
--text2:   #888      /* secondary */
--text3:   #555      /* muted */

/* Layout */
--sidebar-width: 240px
```

---

## 8. FOLDER STRUCTURE

```
reasoning-layer/
├── ARCHITECTURE.md              ← this file
├── vitest.config.js             ← test configuration
├── prompts/                     ← one file per phase
│   ├── phase-0-foundation.md
│   ├── phase-1-chat-components.md
│   ├── phase-2-overlays.md
│   ├── phase-3-directed-structure.md
│   ├── phase-4-directed-content.md
│   ├── phase-5-api-layer.md
│   ├── phase-6-logic-live-ui.md
│   └── phase-7-integration-deploy.md
├── tests/                       ← test suite
│   ├── setup.js                 ← test setup configuration
│   └── phase-0.test.js          ← phase 0 verification tests
└── src/
    ├── App.jsx
    ├── components/
    │   ├── Sidebar.jsx
    │   ├── DirectedMode.jsx
    │   ├── LiveMode.jsx
    │   ├── ChatWindow.jsx
    │   ├── MessageBubble.jsx
    │   ├── HighlightedResponse.jsx
    │   ├── NudgeCard.jsx
    │   ├── ReasoningPanel.jsx
    │   ├── ChangeReceipt.jsx
    │   └── LegendBar.jsx
    ├── utils/
    │   ├── api.js
    │   ├── quoteMatch.js
    │   ├── correctionDetect.js
    │   └── storage.js
    └── styles/
        ├── global.css
        └── components.css
```

---

## 9. PHASE BREAKDOWN

### Phase 0 — Foundation
**Delivers:** Project initialized. Design system in place. Layout shell renders. Fonts load correctly.
- Project scaffold (React + Vite)
- All CSS custom properties defined in global.css
- Google Fonts imported (Inter, IBM Plex Mono, Syne)
- Fixed sidebar layout + main content area
- All component and util files stubbed (empty exports)
- App renders: dark background, amber asterisk, "Reasoning Layer" in Syne
**Gate:** App loads. Background is #0A0A0A. Correct fonts visible.

---

### Phase 0B — Testing Infrastructure
**Delivers:** Vitest testing framework installed, configured with jsdom, and verifying the baseline setup.
- Testing dependencies (vitest, jsdom, React Testing Library, Jest DOM) installed
- `vitest.config.js` and `tests/setup.js` created and configured
- Baseline test suite (`tests/phase-0.test.js`) added to verify stubs, CSS existence, and imports
**Gate:** Running `npm test` successfully executes and passes all test assertions.

---

### Phase 1 — Chat Components
**Delivers:** Every visual chat piece built and pixel-correct. No logic — purely visual.
- Chat window shell (macOS-style decorative dots in header)
- User message bubble (right-aligned, amber-tinted)
- Assistant message bubble (left-aligned, dark)
- Highlight span CSS classes: `.rl-inference` (red), `.rl-assumption` (amber), `.rl-dependency` (blue)
- Legend bar (amber / red / blue swatches with labels)
- Gap section ("NOT COVERED" label + body text)
**Gate:** Static chat mockup shows all three highlight types on hardcoded text.

---

### Phase 2 — Overlay Components
**Delivers:** Reasoning panel, nudge card, and change receipt — all visual, no logic.
- Reasoning panel (expandable, collapsed by default, one row per element type)
- Nudge card (amber border, ◈ icon, two buttons: primary amber + ghost)
- Change receipt card (green border, three sections: Changed / Unchanged / Still Open)
**Gate:** All three overlay components render on static hardcoded data.

---

### Phase 3 — Directed Mode Structure
**Delivers:** Navigation shell and step system. No scenario content yet.
- Sidebar scenario nav links (highlight active scenario with amber left border)
- Step button bar at top of each scenario (numbered, clicking shows corresponding pane)
- Scenario container that renders whatever content data it receives
- Mode toggle (Directed / Live) in sidebar
**Gate:** Navigation works. Clicking a scenario link and step buttons switches views. Empty scenarios render without errors.

---

### Phase 4 — Directed Mode Content
**Delivers:** All scenario data in a `scenarios.js` file. Structure from Phase 3 renders it.
- `src/data/scenarios.js` — all scripted scenario content
- Five scenarios: all-four-elements, dependency-heavy, inference-only, multi-signal, clean-response
- Each scenario has steps with: user query, response text, highlight positions, gap items, change receipt
- Scenarios wired into Phase 3 structure
**Gate:** All five scenarios navigable with correct content at each step.

---

### Phase 5 — API Layer + ENV
**Delivers:** Three API utility functions. ENV file configured. Vercel config ready.
- `.env` file with API key variable (placeholder)
- `vercel.json` with build command and output directory
- `api.js`: `generateResponse(messages)`, `analyseResponse(userMsg, responseText)`, `correctResponse(original, correction)`
- JSON parse with null-safe defaults on all responses
- All arrays default to `[]` if missing from response
**Gate:** `generateResponse` tested in browser console. Returns parsed JSON. No key visible in source.

---

### Phase 6 — Logic + Live Mode UI
**Delivers:** All client-side logic. Full chat interface in Live Mode.
- `quoteMatch.js`: 3-tier matching (exact → 6-word anchor → panel fallback)
- `correctionDetect.js`: question markers → normal turn; correction signals → correction call
- `storage.js`: helpers for `rl_dismissals` and `rl_mode`
- Live Mode chat interface: input bar, Reasoning Mode toggle, conversation history state
- Loading states: "Generating…" and "Analysing reasoning…"
- Error states: Call 1 fail → red message. Call 2 fail → render plain, no nudge.
**Gate:** User can type a message in Live Mode, see loading states, see plain response render. Mode toggle persists on reload.

---

### Phase 7 — Integration + Deploy
**Delivers:** Everything wired. App live on Vercel. All four states working end to end.
- Call 1 → evaluative gate → Call 2 flow wired
- Call 2 output → quote matching → highlight rendering wired
- Nudge gate wired (counter check → 500ms → nudge card → activate → layer renders)
- Correction flow wired (classifier → correction call → updated response + change receipt)
- Reasoning Mode ON path: next qualifying response gets layer immediately
- Deploy to Vercel, API key set in dashboard
- Test all four states with demo query
- Three screenshots captured (States 2, 3, 4) for deck
**Gate:** Demo query produces all four states in Live Mode. Vercel URL opens correctly.

---

## 10. HARD CONSTRAINTS

1. One API key. Stored in `.env` only. Accessed via environment variable. Never hardcoded.
2. Directed Mode: zero API calls. All content is scripted in `scenarios.js`.
3. No external UI libraries. No Tailwind. Pure CSS with custom properties only.
4. No API key ever in source code, committed to git, or in any console output.
5. Call 2 failure → render plain response. Never render a broken or empty layer.
6. Nudge fires at most once per response. Never re-fires for the same response.
7. Gap section: maximum 3 items. Hard cap enforced.
8. Correction call only fires when correction classifier returns true. Never fires on questions.
9. All API response arrays default to `[]` if absent. App never throws on missing fields.
10. localStorage keys are exactly: `rl_dismissals` (integer, 0–3) and `rl_mode` (boolean).

---

## 11. KEY DECISIONS (LOCKED — DO NOT REOPEN)

| Decision | What was decided | Why |
|----------|-----------------|-----|
| Entry to Reasoning Mode | Toggle in prompt bar (primary) + nudge (secondary) | Respects user autonomy — they know when stakes are high |
| Always-on vs user-controlled | User-controlled | Token cost + noise + autonomy |
| Same model vs two models | Two calls, same model (prototype); two-model pitch for production | Self-consistency bias is real but marginal for structured extraction |
| Trigger condition | Evaluative claim in response (number, %, recommendation, course of action) | Objectively detectable — not "all outputs" (noise) or "user-triggered only" (misses the unaware) |
| Correction mechanism | User types naturally; classifier detects intent | Simpler than tap-to-correct, equally clear with change receipt |
| Number of elements | 4: inference, assumption, dependency, gap | Alternative perspectives, reasoning chain, uncertainty texture all evaluated and eliminated |
| Nudge lifetime | 3 dismissals then permanent suppress | Per-session resets build fatigue; three respects casual/habit/deliberate as distinct |
| Deployment | Vercel | Publicly accessible, no login, proven from previous project |

*Last updated: All 8 phases complete. 103 tests passing across 8 test files. App ready for Vercel deployment. Key fixes applied: inline highlighting, reasoning mode persistence, correction flow with change receipt, new chat and history persistence, empty state suppression on non-evaluative responses, textarea input, system prompt quality improvements.*
