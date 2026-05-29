const STEP0_USER_MESSAGE =
  "My startup has 9 engineers. We've missed our last 3 sprints. Should I let go of 2 under-performers or hire a senior engineer?";

const STEP0_RESPONSE_TEXT =
  "Based on your situation, I'd recommend hiring a senior engineer over letting go of team members. Engineering teams that lose members during delivery crises typically see a 40–60% drop in velocity for 2–3 months due to knowledge transfer overhead and morale impact. A senior hire can stabilise delivery within 4–6 weeks by identifying process gaps and mentoring the team. The under-performance you're seeing is almost certainly a systems problem, not a people problem. At a 9-person team, consistent sprint misses usually indicate unclear requirements, scope creep, or insufficient technical leadership — not individual failures. I'd suggest bringing in a senior engineer or tech lead first, running one sprint with them, and then reassessing individual performance with clearer benchmarks in place.";

const STEP2_RESPONSE_HTML =
  "Based on your situation, I'd recommend <span class='rl-assumption'>hiring a senior engineer</span> over letting go of team members. Engineering teams that lose members during delivery crises <span class='rl-inference'>typically see a 40–60% drop in velocity for 2–3 months</span> due to knowledge transfer overhead and morale impact. A senior hire can <span class='rl-inference'>stabilise delivery within 4–6 weeks</span> by identifying process gaps and mentoring the team. The under-performance you're seeing is <span class='rl-assumption'>almost certainly a systems problem, not a people problem</span>. At a 9-person team, <span class='rl-dependency'>consistent sprint misses usually indicate unclear requirements, scope creep, or insufficient technical leadership</span> — not individual failures. I'd suggest bringing in a senior engineer or tech lead first, <span class='rl-dependency'>running one sprint with them, and then reassessing individual performance</span> with clearer benchmarks.";

const STEP2_GAP_TEXT =
  "Whether sprint misses are concentrated in specific engineers or distributed · Current engineering process maturity · Whether under-performers have received structured feedback · Your runway and budget for a senior hire";

const STEP2_REASONING_ITEMS = [
  {
    type: 'inference',
    label: '40–60% velocity drop',
    text: "Industry benchmark from general engineering team data. Not calibrated to your team's specific dynamics or seniority mix.",
    badge: 'Population data — not your team\'s history',
  },
  {
    type: 'inference',
    label: '4–6 weeks to stabilise',
    text: "Estimated from typical onboarding curves. Depends on the senior hire's domain knowledge and team receptiveness.",
    badge: 'Constructed estimate — no basis in your situation',
  },
  {
    type: 'assumption',
    label: 'Systems problem not people problem',
    text: 'Reasonable prior for a 9-person team but an assumption. If 1–2 engineers are individually underperforming, this framing and the recommendation both change.',
  },
  {
    type: 'assumption',
    label: 'Hiring is within budget',
    text: 'Assumed budget flexibility exists for a senior engineering hire. If budget is constrained, the recommendation changes entirely.',
  },
  {
    type: 'dependency',
    label: 'Recommendation requires two conditions',
    text: 'The hire-over-let-go recommendation holds IF: (1) sprint misses are systemic not individual, AND (2) budget exists for the hire. If either is false, the conclusion changes.',
  },
];

const STEP3_CORRECTION_MESSAGE =
  "Actually I've tracked it — 2 engineers account for 70% of the missed tasks. The rest of the team is performing fine. It's not systemic.";

const STEP3_CORRECTED_HTML =
  "That changes the picture significantly. If the misses are concentrated in 2 engineers, this is most likely an individual performance issue — which means adding more people won't solve it. I'd recommend: First, direct 1:1 conversations with both engineers to understand what's blocking them — it could be skill gaps, unclear scope, or disengagement. If after those conversations you still see a genuine performance gap, a performance improvement plan makes more sense than a senior hire. A senior hire is still worth considering as a capability upgrade once the delivery issue is resolved — not as a substitute for addressing the specific performance problem.";

const STEP4_CHANGE_RECEIPT = {
  changed: [
    "Primary assumption corrected: sprint misses were systemic → now confirmed concentrated in 2 engineers. Recommendation shifts from hire-first to performance-management-first.",
    "Framing reversed: under-performance was assumed to be a systems failure. Now established as individual — the entire diagnostic changes.",
  ],
  unchanged: [
    "Senior engineer hire remains on the table as a future capability upgrade — not as the immediate intervention.",
    "The need to address the sprint miss root cause before making personnel changes.",
  ],
  stillOpen: [
    "Whether the 2 engineers can improve with direct feedback or whether performance management is the endpoint.",
    "Budget and runway for a senior hire when the time comes.",
  ],
};

const PLACEHOLDER_STEP = {
  label: 'Placeholder — content coming soon',
  modeLabel: 'Reasoning Mode OFF',
  userMessage: 'Placeholder query for this scenario',
  responseText: 'Placeholder response for this scenario',
  responseHTML: null,
  showNudge: false,
  showLayer: false,
  showCorrection: false,
  correctionMessage: null,
  correctedResponseHTML: null,
  showReceipt: false,
  gapText: null,
  reasoningItems: [],
  changeReceipt: null,
};

const scenarios = [
  // ─────────────────────────────────────────
  // Scenario 0 — All four elements
  // ─────────────────────────────────────────
  {
    id: 0,
    name: 'All four elements',
    steps: [
      // Step 0 — plain output, layer off
      {
        label: 'Before — polished output, reasoning invisible',
        modeLabel: 'Reasoning Mode OFF',
        userMessage: STEP0_USER_MESSAGE,
        responseText: STEP0_RESPONSE_TEXT,
        responseHTML: null,
        showNudge: false,
        showLayer: false,
        showCorrection: false,
        correctionMessage: null,
        correctedResponseHTML: null,
        showReceipt: false,
        gapText: null,
        reasoningItems: [],
        changeReceipt: null,
      },
      // Step 1 — nudge fires
      {
        label: 'Nudge fires after response',
        modeLabel: 'Qualifying response detected',
        userMessage: STEP0_USER_MESSAGE,
        responseText: STEP0_RESPONSE_TEXT,
        responseHTML: null,
        showNudge: true,
        showLayer: false,
        showCorrection: false,
        correctionMessage: null,
        correctedResponseHTML: null,
        showReceipt: false,
        gapText: null,
        reasoningItems: [],
        changeReceipt: null,
      },
      // Step 2 — layer active
      {
        label: 'Layer active — all four element types visible',
        modeLabel: 'Reasoning Mode ON',
        userMessage: STEP0_USER_MESSAGE,
        responseText: STEP0_RESPONSE_TEXT,
        responseHTML: STEP2_RESPONSE_HTML,
        showNudge: false,
        showLayer: true,
        showCorrection: false,
        correctionMessage: null,
        correctedResponseHTML: null,
        showReceipt: false,
        gapText: STEP2_GAP_TEXT,
        reasoningItems: STEP2_REASONING_ITEMS,
        changeReceipt: null,
      },
      // Step 3 — user corrects
      {
        label: 'User corrects the core assumption',
        modeLabel: 'Correction sent',
        userMessage: STEP0_USER_MESSAGE,
        responseText: STEP0_RESPONSE_TEXT,
        responseHTML: STEP2_RESPONSE_HTML,
        showNudge: false,
        showLayer: true,
        showCorrection: true,
        correctionMessage: STEP3_CORRECTION_MESSAGE,
        correctedResponseHTML: STEP3_CORRECTED_HTML,
        showReceipt: false,
        gapText: STEP2_GAP_TEXT,
        reasoningItems: STEP2_REASONING_ITEMS,
        changeReceipt: null,
      },
      // Step 4 — change receipt
      {
        label: 'Change receipt — what the correction caused',
        modeLabel: 'Change receipt',
        userMessage: STEP0_USER_MESSAGE,
        responseText: STEP0_RESPONSE_TEXT,
        responseHTML: STEP2_RESPONSE_HTML,
        showNudge: false,
        showLayer: true,
        showCorrection: true,
        correctionMessage: STEP3_CORRECTION_MESSAGE,
        correctedResponseHTML: STEP3_CORRECTED_HTML,
        showReceipt: true,
        gapText: STEP2_GAP_TEXT,
        reasoningItems: STEP2_REASONING_ITEMS,
        changeReceipt: STEP4_CHANGE_RECEIPT,
      },
    ],
  },

  // ─────────────────────────────────────────
  // Scenario 1 — Dependency heavy (placeholder)
  // ─────────────────────────────────────────
  {
    id: 1,
    name: 'Dependency heavy',
    steps: [
      PLACEHOLDER_STEP,
      PLACEHOLDER_STEP,
      PLACEHOLDER_STEP,
    ],
  },

  // ─────────────────────────────────────────
  // Scenario 2 — Inference only (placeholder)
  // ─────────────────────────────────────────
  {
    id: 2,
    name: 'Inference only',
    steps: [
      PLACEHOLDER_STEP,
      PLACEHOLDER_STEP,
    ],
  },

  // ─────────────────────────────────────────
  // Scenario 3 — Multi-signal inference (placeholder)
  // ─────────────────────────────────────────
  {
    id: 3,
    name: 'Multi-signal inference',
    steps: [
      PLACEHOLDER_STEP,
      PLACEHOLDER_STEP,
    ],
  },

  // ─────────────────────────────────────────
  // Scenario 4 — Clean response (placeholder)
  // ─────────────────────────────────────────
  {
    id: 4,
    name: 'Clean response',
    steps: [
      PLACEHOLDER_STEP,
    ],
  },
];

export default scenarios;
