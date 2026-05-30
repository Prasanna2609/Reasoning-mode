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
    description: 'Full reasoning mode fires across a real product prioritization decision.',
    tags: ['Assumption', 'Inference', 'Dependency', 'Gap'],
    steps: [
      {
        label: 'Nudge fires',
        modeLabel: 'Qualifying response detected',
        userMessage: "I'm a Growth PM at Claude (Anthropic). We're deciding what to prioritize in Q2 — three options: improving the onboarding flow for new Pro subscribers, adding lightweight team collaboration features, or building a curated prompt template library. We have roughly 6 weeks of eng bandwidth and can only pick one. What should we prioritize?",
        responseText: "Based on what you've described, improving the onboarding flow for Pro subscribers is likely the highest-leverage initiative at this stage. For most SaaS products in Claude's category, onboarding quality is the single largest predictor of 30-day retention among paid users...",
        responseHTML: null,
        showNudge: true,
        nudgeTags: ['Assumption', 'Inference', 'Dependency'],
        showLayer: false,
        showCorrection: false,
        correctionMessage: null,
        correctedResponseHTML: null,
        showReceipt: false,
        gapText: null,
        reasoningItems: [],
        changeReceipt: null
      },
      {
        label: 'Layer active',
        modeLabel: 'Reasoning Mode ON',
        userMessage: "I'm a Growth PM at Claude (Anthropic). We're deciding what to prioritize in Q2 — three options: improving the onboarding flow for new Pro subscribers, adding lightweight team collaboration features, or building a curated prompt template library. We have roughly 6 weeks of eng bandwidth and can only pick one. What should we prioritize?",
        responseText: null,
        responseHTML: "Based on what you've described, <span class=\"rl-assumption\">improving the onboarding flow for Pro subscribers</span> is likely the highest-leverage initiative at this stage. <span class=\"rl-inference\">For most SaaS products in Claude's category, onboarding quality is the single largest predictor of 30-day retention among paid users</span> — the first 72 hours typically determine whether a Pro subscriber activates deeply or churns quietly. <span class=\"rl-inference\">Onboarding improvements for paid users typically show measurable signal within 4–6 weeks</span>, which fits your bandwidth constraint well. Team collaboration has a longer payoff horizon. <span class=\"rl-inference\">Collaboration features in productivity tools typically take 2–3 release cycles to reach meaningful adoption</span> because they require simultaneous behavior change across multiple people. <span class=\"rl-dependency\">The collaboration recommendation de-prioritization holds only if you don't already have a defined multi-seat use case AND don't have organic team usage already happening in your base. If either condition is true, the risk calculus changes.</span> A prompt template library has strong discoverability value but <span class=\"rl-assumption\">is most impactful for new and intermediate users, not power users</span>. If your goal is deepening engagement among existing Pro subscribers, templates solve a slightly different problem.",
        showNudge: false,
        nudgeTags: [],
        showLayer: true,
        showCorrection: false,
        correctionMessage: null,
        correctedResponseHTML: null,
        showReceipt: false,
        gapText: "What your actual Pro retention curve looks like at day 7, 30, and 90 — this is the most important input and would change the recommendation · Whether multi-seat usage is already happening organically in your user base · What specific friction points exist in the current onboarding flow",
        reasoningItems: [
          { type: 'inference', label: 'Inference — onboarding as top retention predictor', text: "General SaaS finding from retention research. Whether it applies to Claude specifically depends on your actual retention data. If Pro users are churning at month 3 rather than day 30, the onboarding hypothesis is weaker than this framing suggests.", badge: '⚡ General SaaS benchmark — not Claude\'s actual retention data' },
          { type: 'inference', label: 'Inference — 4–6 week signal timeline', text: "Rough benchmark from conversion-focused onboarding work at other SaaS products. Highly dependent on what specific friction is being addressed and how you measure success.", badge: null },
          { type: 'assumption', label: 'Assumption — growth goal is Pro retention', text: "I assumed the primary growth goal is retaining existing Pro subscribers. If the goal is improving free-to-Pro conversion, the onboarding investment calculus is different and templates may become more relevant. This is the assumption most likely to flip the recommendation.", badge: null },
          { type: 'dependency', label: 'Dependency — two conditions must hold for collaboration to stay deprioritized', text: "The recommendation to deprioritize collaboration holds IF: (1) no defined multi-seat use case exists yet, AND (2) organic team usage isn't already happening in the base. If either is already true, collaboration is less risky than framed.", badge: null }
        ],
        changeReceipt: null
      },
      {
        label: 'Correction sent',
        modeLabel: 'Correction sent',
        userMessage: "I'm a Growth PM at Claude (Anthropic). We're deciding what to prioritize in Q2 — three options: improving the onboarding flow for new Pro subscribers, adding lightweight team collaboration features, or building a curated prompt template library. We have roughly 6 weeks of eng bandwidth and can only pick one. What should we prioritize?",
        responseText: null,
        responseHTML: "Based on what you've described, <span class=\"rl-assumption\">improving the onboarding flow for Pro subscribers</span> is likely the highest-leverage initiative at this stage. <span class=\"rl-inference\">For most SaaS products in Claude's category, onboarding quality is the single largest predictor of 30-day retention among paid users</span> — the first 72 hours typically determine whether a Pro subscriber activates deeply or churns quietly. <span class=\"rl-inference\">Onboarding improvements for paid users typically show measurable signal within 4–6 weeks</span>, which fits your bandwidth constraint well. Team collaboration has a longer payoff horizon. <span class=\"rl-inference\">Collaboration features in productivity tools typically take 2–3 release cycles to reach meaningful adoption</span> because they require simultaneous behavior change across multiple people. <span class=\"rl-dependency\">The collaboration recommendation de-prioritization holds only if you don't already have a defined multi-seat use case AND don't have organic team usage already happening in your base. If either condition is true, the risk calculus changes.</span> A prompt template library has strong discoverability value but <span class=\"rl-assumption\">is most impactful for new and intermediate users, not power users</span>. If your goal is deepening engagement among existing Pro subscribers, templates solve a slightly different problem.",
        showNudge: false,
        nudgeTags: [],
        showLayer: true,
        showCorrection: true,
        correctionMessage: "Actually our day-30 Pro retention is strong — above 70%. The real concern is free-to-Pro conversion, which is sitting around 4%. Our hypothesis is that free users aren't seeing the value of Pro during the trial.",
        correctedResponseHTML: "That changes the recommendation materially. Day-30 Pro retention above 70% means the onboarding investment for existing Pro subscribers is a lower-urgency problem. The critical gap is earlier in the funnel — free users not converting because they're not experiencing the value of Pro during the trial period. With that framing, the prompt template library becomes the strongest Q2 bet. A curated library that surfaces Pro-specific capabilities — longer context, deeper analysis, advanced outputs — during the free trial directly addresses the 'not seeing Pro value' hypothesis. It shows rather than tells, and it does so at the exact moment of conversion consideration. The specific templates to prioritize: ones that produce an output a free user clearly couldn't get with the free tier. The moment a free user sees a template response and thinks 'I couldn't do this myself' is the conversion trigger you're engineering toward. Onboarding investment is still valid but the target moment shifts: not post-Pro activation, but within the trial period, specifically around Pro feature exposure.",
        showReceipt: false,
        gapText: "What your actual Pro retention curve looks like at day 7, 30, and 90 · Whether multi-seat usage is already happening organically · What specific friction points exist in the current onboarding flow",
        reasoningItems: [
          { type: 'inference', label: 'Inference — onboarding as top retention predictor', text: "General SaaS finding from retention research. Whether it applies to Claude specifically depends on your actual retention data.", badge: '⚡ General SaaS benchmark — not Claude\'s actual retention data' },
          { type: 'inference', label: 'Inference — 4–6 week signal timeline', text: "Rough benchmark from conversion-focused onboarding work at other SaaS products.", badge: null },
          { type: 'assumption', label: 'Assumption — growth goal is Pro retention', text: "I assumed the primary growth goal is retaining existing Pro subscribers. This assumption is the one most likely to flip the recommendation if it's wrong.", badge: null },
          { type: 'dependency', label: 'Dependency — two conditions must hold for collaboration to stay deprioritized', text: "The recommendation to deprioritize collaboration holds IF: (1) no defined multi-seat use case exists yet, AND (2) organic team usage isn't already happening in the base.", badge: null }
        ],
        changeReceipt: null
      },
      {
        label: 'Change receipt',
        modeLabel: 'Change receipt',
        userMessage: "I'm a Growth PM at Claude (Anthropic). We're deciding what to prioritize in Q2 — three options: improving the onboarding flow for new Pro subscribers, adding lightweight team collaboration features, or building a curated prompt template library. We have roughly 6 weeks of eng bandwidth and can only pick one. What should we prioritize?",
        responseText: null,
        responseHTML: "Based on what you've described, <span class=\"rl-assumption\">improving the onboarding flow for Pro subscribers</span> is likely the highest-leverage initiative at this stage. <span class=\"rl-inference\">For most SaaS products in Claude's category, onboarding quality is the single largest predictor of 30-day retention among paid users</span> — the first 72 hours typically determine whether a Pro subscriber activates deeply or churns quietly. <span class=\"rl-inference\">Onboarding improvements for paid users typically show measurable signal within 4–6 weeks</span>, which fits your bandwidth constraint well. Team collaboration has a longer payoff horizon. <span class=\"rl-inference\">Collaboration features in productivity tools typically take 2–3 release cycles to reach meaningful adoption</span> because they require simultaneous behavior change across multiple people. <span class=\"rl-dependency\">The collaboration recommendation de-prioritization holds only if you don't already have a defined multi-seat use case AND don't have organic team usage already happening in your base. If either condition is true, the risk calculus changes.</span> A prompt template library has strong discoverability value but <span class=\"rl-assumption\">is most impactful for new and intermediate users, not power users</span>. If your goal is deepening engagement among existing Pro subscribers, templates solve a slightly different problem.",
        showNudge: false,
        nudgeTags: [],
        showLayer: true,
        showCorrection: true,
        correctionMessage: "Actually our day-30 Pro retention is strong — above 70%. The real concern is free-to-Pro conversion, which is sitting around 4%. Our hypothesis is that free users aren't seeing the value of Pro during the trial.",
        correctedResponseHTML: "That changes the recommendation materially. Day-30 Pro retention above 70% means the onboarding investment for existing Pro subscribers is a lower-urgency problem. The critical gap is earlier in the funnel — free users not converting because they're not experiencing the value of Pro during the trial period. With that framing, the prompt template library becomes the strongest Q2 bet. A curated library that surfaces Pro-specific capabilities — longer context, deeper analysis, advanced outputs — during the free trial directly addresses the 'not seeing Pro value' hypothesis. Onboarding investment is still valid but the target moment shifts: not post-Pro activation, but within the trial period, specifically around Pro feature exposure.",
        showReceipt: true,
        gapText: "What your actual Pro retention curve looks like at day 7, 30, and 90 · Whether multi-seat usage is already happening organically · What specific friction points exist in the current onboarding flow",
        reasoningItems: [
          { type: 'inference', label: 'Inference — onboarding as top retention predictor', text: "General SaaS finding from retention research. Whether it applies to Claude specifically depends on your actual retention data.", badge: '⚡ General SaaS benchmark — not Claude\'s actual retention data' },
          { type: 'inference', label: 'Inference — 4–6 week signal timeline', text: "Rough benchmark from conversion-focused onboarding work at other SaaS products.", badge: null },
          { type: 'assumption', label: 'Assumption — growth goal is Pro retention', text: "I assumed the primary growth goal is retaining existing Pro subscribers. This assumption is the one most likely to flip the recommendation.", badge: null },
          { type: 'dependency', label: 'Dependency — two conditions must hold', text: "The recommendation to deprioritize collaboration holds IF: (1) no defined multi-seat use case exists yet, AND (2) organic team usage isn't already happening in the base.", badge: null }
        ],
        changeReceipt: {
          changed: [
            "Core recommendation: from 'improve Pro onboarding' to 'build the prompt template library'",
            "The assumption about the growth goal was wrong — target is conversion, not retention",
            "Templates directly address the free-to-Pro conversion gap by demonstrating Pro value during the trial",
            "The 4-to-6 week signal timeline still holds — conversion rate changes are measurable quickly"
          ],
          unchanged: [
            "Which specific Pro capabilities should anchor the template library — needs data on what free users who do convert were doing before they converted",
            "Whether the current trial experience exposes Pro features at all — if it doesn't, templates alone may not solve the discoverability problem"
          ],
          stillOpen: []
        }
      }
    ]
  },

  // ─────────────────────────────────────────
  // Scenario 1 — Multi-signal inference
  // ─────────────────────────────────────────
  {
    id: 1,
    name: 'Multi-signal inference',
    description: 'Multiple numbers that read as data — all constructed from analogous sources.',
    tags: ['Inference', 'Assumption'],
    steps: [
      {
        label: 'Layer active',
        modeLabel: 'Reasoning Mode ON — multiple inference signals',
        userMessage: "What's the addressable market for HR tech tools targeting Indian companies with 100–1,000 employees?",
        responseText: null,
        responseHTML: "The HR tech market for this segment is <span class=\"rl-inference\">approximately ₹8,500–12,000 crore TAM</span>, with the 100–1,000 employee bracket representing <span class=\"rl-inference\">roughly 35–40% of total HR tech spend in India</span>, putting the segment-specific addressable market at <span class=\"rl-inference\">₹3,000–4,500 crore</span>. Key drivers: <span class=\"rl-assumption\">India has approximately 85,000–1,20,000 companies in the 100–1,000 employee range</span> based on MCA registration and industry estimates. <span class=\"rl-inference\">Average HR tech spend per employee in this segment runs ₹800–1,200 annually</span>, though adoption remains below global benchmarks. The market is <span class=\"rl-inference\">growing at 22–28% CAGR</span> driven by compliance requirements and post-pandemic workflow shifts.",
        showNudge: false,
        nudgeTags: [],
        showLayer: true,
        showCorrection: false,
        correctionMessage: null,
        correctedResponseHTML: null,
        showReceipt: false,
        gapText: "Which HR tech subcategory you are sizing — payroll vs. recruitment vs. engagement vs. HRIS have very different market sizes · Geographic distribution within India — metro concentration affects serviceable market · Whether you are measuring current spend or total serviceable market potential",
        reasoningItems: [
          { type: 'inference', label: 'These figures sound specific. They are not.', text: "The ₹8,500–12,000 crore TAM is constructed from US/global HR tech market data scaled to India's GDP and enterprise software purchasing power, published employee count estimates from MCA filings, and general SaaS adoption curves adjusted for India context. No single source gives this number for this exact segment. Use as directional sizing only.", badge: '⚠ Surface-substance divergence — reads as market data, is a constructed estimate' },
          { type: 'inference', label: 'Inference — ₹800–1,200 per employee annually', text: "Derived from global HR tech benchmarks adjusted for Indian pricing. Not from India-specific primary research on this segment. Actual spend varies widely by subcategory, company maturity, and whether you are measuring committed contracts or actual usage.", badge: null },
          { type: 'inference', label: 'Inference — 22–28% CAGR', text: "Directionally consistent with general India SaaS growth rates. Not from a dedicated HR tech India market study. Treat as a plausible range, not a citable figure without a named source.", badge: null },
          { type: 'assumption', label: 'Assumption — 85,000–1,20,000 companies in segment', text: "Estimated from MCA registration data and industry reports. The count of active companies vs. registered companies in this employee range is difficult to pin precisely. This number anchors the entire TAM calculation — verify it before using in an investor document.", badge: null }
        ],
        changeReceipt: null
      }
    ]
  },

  // ─────────────────────────────────────────
  // SCENARIO 2
  // ─────────────────────────────────────────
  {
    id: 2,
    name: 'Inference + gap',
    description: 'Tool recommendation with benchmark numbers that need verification and key inputs that are absent.',
    tags: ['Inference', 'Gap'],
    steps: [
      {
        label: 'Layer active',
        modeLabel: 'Reasoning Mode ON',
        userMessage: "We're a 35-person consulting firm moving off Excel for project management. Asana, Monday.com, or Notion — which should we go with?",
        responseText: null,
        responseHTML: "For a 35-person consulting firm, <span class=\"rl-inference\">Asana is typically the strongest fit for project-driven teams</span> — it has <span class=\"rl-inference\">the highest adoption rate among professional services firms in the 20–100 person range</span> and its task-dependency and timeline features map well to consulting project structures. <span class=\"rl-inference\">Monday.com has a steeper learning curve coming from Excel — typically 2–3 weeks longer to reach team-wide adoption</span>, but it offers stronger customisation for non-standard workflows. Notion is better positioned as a knowledge base than a project tracker — <span class=\"rl-inference\">consulting firms that have tried Notion as their primary PM tool frequently layer Asana or Monday on top within 6–9 months</span>.",
        showNudge: false,
        nudgeTags: [],
        showLayer: true,
        showCorrection: false,
        correctionMessage: null,
        correctedResponseHTML: null,
        showReceipt: false,
        gapText: "Whether you need time-tracking and billing integration — this changes the recommendation significantly · Whether clients need visibility into project status — Asana and Monday support this natively, Notion requires custom setup · Your current tech stack and where the strongest integrations matter · Team technical comfort level, which affects which tool gets adopted vs. abandoned · Budget — pricing at 35 seats differs meaningfully across all three",
        reasoningItems: [
          { type: 'inference', label: 'Inference — "highest adoption rate among professional services firms"', text: "From general SaaS market positioning and review platform data, not a definitive survey of professional services firms. Asana does index well in this category but the claim depends on how the category is defined.", badge: '⚡ General SaaS data — not a professional services benchmark study' },
          { type: 'inference', label: 'Inference — "2–3 weeks longer" for Monday.com adoption', text: "Constructed from general onboarding complexity comparisons. Actual adoption speed depends on who is leading the rollout, whether there is a change management process, and how structured the existing Excel usage was.", badge: '⚡ Directional estimate — not Monday.com\s actual onboarding benchmark' },
          { type: 'inference', label: 'Inference — "frequently layer Asana or Monday on top within 6–9 months"', text: "Directionally consistent with product forums and user reviews. The underlying point — that Notion works better as a knowledge complement than a standalone project tracker — is defensible. The 6–9 month figure is not a sourced statistic.", badge: null },
          { type: 'inference', label: 'The gap items are not minor omissions', text: "Any one of the five gap items could flip the recommendation. If billing integration is critical, the evaluation shifts entirely. If clients need project visibility, Notion is effectively eliminated. If budget is the constraint, Monday.com pricing at 35 seats may be the deciding factor. The recommendation as given is a starting framework, not a final answer.", badge: null }
        ],
        changeReceipt: null
      }
    ]
  },

  // ─────────────────────────────────────────
  // SCENARIO 3
  // ─────────────────────────────────────────
  {
    id: 3,
    name: 'Assumption + dependency',
    description: 'A business case that collapses if two conditions are not simultaneously true.',
    tags: ['Assumption', 'Dependency'],
    steps: [
      {
        label: 'Layer active',
        modeLabel: 'Reasoning Mode ON',
        userMessage: "I'm building a business case for an AI customer support tool. We have 18 agents handling 600 tickets/day. Average handle time is 12 minutes. The vendor claims 40% handle time reduction. Does the math work?",
        responseText: null,
        responseHTML: "<span class=\"rl-assumption\">At ₹40,000/month per agent fully loaded cost</span>, your current support operation runs at approximately ₹7.2L/month for 18 agents. If the 40% handle time reduction holds, you would theoretically need <span class=\"rl-assumption\">around 11 agents</span> to handle the same volume, freeing roughly ₹2.8L/month — approximately ₹33–34L annually. Most tools in this category are priced at <span class=\"rl-inference\">₹15,000–22,000/month for an 18-seat implementation</span>, making the headline ROI case positive by month 4–5. <span class=\"rl-dependency\">This conclusion holds only if both of the following are simultaneously true: (1) the 40% handle time reduction is real in your context, not just in the vendor's benchmark environment, AND (2) your ticket complexity is consistent enough that automation efficiency does not erode quality metrics like CSAT or escalation rate.</span> If either condition fails, the math changes materially. A 15–20% actual reduction instead of 40% pushes cash flow positive to month 11–14, not month 4–5 — and makes the business case substantially harder to defend.",
        showNudge: false,
        nudgeTags: [],
        showLayer: true,
        showCorrection: false,
        correctionMessage: null,
        correctedResponseHTML: null,
        showReceipt: false,
        gapText: "What happens to the 7 agents you are no longer funding — redeployment vs. attrition changes the financial model · Your current CSAT baseline and what degradation threshold is acceptable · Contract length and exit clauses if the tool underperforms · Peak volume periods, since AI tools tend to underperform on outlier and high-complexity scenarios",
        reasoningItems: [
          { type: 'assumption', label: 'Assumption — ₹40,000/month per agent fully loaded', text: "A rough estimate. Fully loaded cost includes salary, benefits, training, management overhead, and tooling. Your actual number could be meaningfully different — lower if the team is Tier 2 city-based, higher if there is significant management overhead. Use your actual HR cost data before putting this in a board document.", badge: null },
          { type: 'assumption', label: 'Assumption — 11 agents sufficient at 40% reduction', text: "Assumes perfectly even ticket distribution across the day. If you have sharp peak volumes, you may need to maintain more agents for peak coverage even if average handle time drops.", badge: null },
          { type: 'inference', label: 'Inference — ₹15,000–22,000/month pricing', text: "Based on general AI customer support tool pricing tiers for mid-market implementations. Your actual pricing depends on negotiation, contract length, and feature inclusion. Get the actual number from the vendor before putting it in a business case.", badge: '⚡ Market pricing estimate — not your actual vendor quote' },
          { type: 'dependency', label: 'Dependency — both conditions must be simultaneously true', text: "This is the most important thing to verify before building the case. The 40% figure is almost certainly a best-case benchmark tested on high-volume, low-complexity tickets. If your queue has a significant proportion of escalations or edge cases, the real number may be 15–20%. That single change makes the business case go from strong to marginal.", badge: null }
        ],
        changeReceipt: null
      },
      {
        label: 'Correction sent',
        modeLabel: 'Correction sent',
        userMessage: "I'm building a business case for an AI customer support tool. We have 18 agents handling 600 tickets/day. Average handle time is 12 minutes. The vendor claims 40% handle time reduction. Does the math work?",
        responseText: null,
        responseHTML: "<span class=\"rl-assumption\">At ₹40,000/month per agent fully loaded cost</span>, your current support operation runs at approximately ₹7.2L/month for 18 agents. If the 40% handle time reduction holds, you would theoretically need <span class=\"rl-assumption\">around 11 agents</span> to handle the same volume, freeing roughly ₹2.8L/month — approximately ₹33–34L annually. Most tools in this category are priced at <span class=\"rl-inference\">₹15,000–22,000/month for an 18-seat implementation</span>, making the headline ROI case positive by month 4–5. <span class=\"rl-dependency\">This conclusion holds only if both of the following are simultaneously true: (1) the 40% handle time reduction is real in your context, not just in the vendor's benchmark environment, AND (2) your ticket complexity is consistent enough that automation efficiency does not erode quality metrics like CSAT or escalation rate.</span> If either condition fails, the math changes materially.",
        showNudge: false,
        nudgeTags: [],
        showLayer: true,
        showCorrection: true,
        correctionMessage: "Our agents mostly handle tier-2 escalations — complex, non-standard cases. About 70% of our volume doesn't fit a standard automation pattern.",
        correctedResponseHTML: "That changes the business case significantly. If 70% of your volume is complex and non-standard, the vendor's 40% handle time reduction benchmark — almost certainly calibrated on standard, repetitive tickets — does not apply to your context. A realistic estimate for your queue: 10–15% handle time reduction, not 40%. At that level you would need roughly 15–16 agents instead of 18, freeing ₹80,000–1L/month instead of ₹2.8L. Cash flow positive shifts from month 4–5 to month 18–24, depending on implementation and training costs. That is a fundamentally weaker business case. The right approach: propose a structured pilot on the 30% of standard tickets first, track actual handle time reduction over 6–8 weeks, and use that data — not the vendor's benchmark — to build the case.",
        showReceipt: false,
        gapText: "What happens to the 7 agents you are no longer funding · Your current CSAT baseline and what degradation threshold is acceptable · Contract length and exit clauses if the tool underperforms",
        reasoningItems: [
          { type: 'assumption', label: 'Assumption — ₹40,000/month per agent fully loaded', text: "A rough estimate. Use your actual HR cost data before putting this in a board document.", badge: null },
          { type: 'assumption', label: 'Assumption — 11 agents sufficient at 40% reduction', text: "Assumes perfectly even ticket distribution across the day.", badge: null },
          { type: 'inference', label: 'Inference — ₹15,000–22,000/month pricing', text: "Based on general AI customer support tool pricing tiers for mid-market implementations.", badge: '⚡ Market pricing estimate — not your actual vendor quote' },
          { type: 'dependency', label: 'Dependency — both conditions must be simultaneously true', text: "The 40% figure is almost certainly a best-case benchmark tested on high-volume, low-complexity tickets.", badge: null }
        ],
        changeReceipt: null
      },
      {
        label: 'Change receipt',
        modeLabel: 'Change receipt',
        userMessage: "I'm building a business case for an AI customer support tool. We have 18 agents handling 600 tickets/day. Average handle time is 12 minutes. The vendor claims 40% handle time reduction. Does the math work?",
        responseText: null,
        responseHTML: "<span class=\"rl-assumption\">At ₹40,000/month per agent fully loaded cost</span>, your current support operation runs at approximately ₹7.2L/month for 18 agents. If the 40% handle time reduction holds, you would theoretically need <span class=\"rl-assumption\">around 11 agents</span> to handle the same volume, freeing roughly ₹2.8L/month — approximately ₹33–34L annually. Most tools in this category are priced at <span class=\"rl-inference\">₹15,000–22,000/month for an 18-seat implementation</span>, making the headline ROI case positive by month 4–5. <span class=\"rl-dependency\">This conclusion holds only if both of the following are simultaneously true: (1) the 40% handle time reduction is real in your context, not just in the vendor's benchmark environment, AND (2) your ticket complexity is consistent enough that automation efficiency does not erode quality metrics like CSAT or escalation rate.</span> If either condition fails, the math changes materially.",
        showNudge: false,
        nudgeTags: [],
        showLayer: true,
        showCorrection: true,
        correctionMessage: "Our agents mostly handle tier-2 escalations — complex, non-standard cases. About 70% of our volume doesn't fit a standard automation pattern.",
        correctedResponseHTML: "That changes the business case significantly. If 70% of your volume is complex and non-standard, the vendor's 40% handle time reduction benchmark does not apply to your context. A realistic estimate for your queue: 10–15% handle time reduction, not 40%. At that level you would need roughly 15–16 agents instead of 18, freeing ₹80,000–1L/month instead of ₹2.8L. Cash flow positive shifts from month 4–5 to month 18–24. The right approach: propose a structured pilot on the 30% of standard tickets first, track actual handle time reduction over 6–8 weeks, and use that data — not the vendor's benchmark — to build the case.",
        showReceipt: true,
        gapText: "What happens to the 7 agents you are no longer funding · Your current CSAT baseline · Contract length and exit clauses",
        reasoningItems: [
          { type: 'assumption', label: 'Assumption — ₹40,000/month per agent fully loaded', text: "A rough estimate. Use your actual HR cost data before putting this in a board document.", badge: null },
          { type: 'assumption', label: 'Assumption — 11 agents sufficient at 40% reduction', text: "Assumes perfectly even ticket distribution across the day.", badge: null },
          { type: 'inference', label: 'Inference — ₹15,000–22,000/month pricing', text: "Based on general AI customer support tool pricing tiers.", badge: '⚡ Market pricing estimate — not your actual vendor quote' },
          { type: 'dependency', label: 'Dependency — both conditions must be simultaneously true', text: "The 40% figure is almost certainly a best-case benchmark tested on high-volume, low-complexity tickets.", badge: null }
        ],
        changeReceipt: {
          changed: [
            "Handle time reduction assumption: 40% revised to 10–15% for your ticket composition",
            "Monthly savings: ₹2.8L revised down to ₹80K–1L",
            "Cash flow positive timeline: month 4–5 revised to month 18–24",
            "Core recommendation: from 'business case is strong' to 'run a structured pilot first, build the case from real data'"
          ],
          unchanged: [
            "Agent redeployment question: what happens to the agents you free up is still not factored in and affects the model",
            "CSAT risk: complex case handling under AI-assist still needs assessment before any budget commitment"
          ],
          stillOpen: []
        }
      }
    ]
  },

  // ─────────────────────────────────────────
  // SCENARIO 4
  // ─────────────────────────────────────────
  {
    id: 4,
    name: 'Clean response',
    description: 'Factual query. No evaluative claims. Layer stays inactive.',
    tags: ['No layer'],
    steps: [
      {
        label: 'No activation',
        modeLabel: 'Reasoning Mode ON — no elements fire',
        userMessage: "What is Net Revenue Retention (NRR) and how is it calculated?",
        responseText: "Net Revenue Retention (NRR) measures the percentage of recurring revenue retained from your existing customer base over a period — including expansion revenue from upsells and cross-sells, minus revenue lost to downgrades and churn.\\n\\nFormula:\\nNRR = (Starting MRR + Expansion MRR − Downgrade MRR − Churn MRR) ÷ Starting MRR × 100\\n\\nExample: If you started the month with ₹100L MRR, added ₹15L from expansions, lost ₹5L to downgrades, and lost ₹8L to churn:\\nNRR = (100 + 15 − 5 − 8) ÷ 100 × 100 = 102%\\n\\nNRR above 100% means your existing customer base is growing in revenue terms, even without any new customer acquisition. It is one of the most closely watched metrics in SaaS because it reflects both product value delivery and expansion motion.",
        responseHTML: null,
        showNudge: false,
        nudgeTags: [],
        showLayer: false,
        showCorrection: false,
        correctionMessage: null,
        correctedResponseHTML: null,
        showReceipt: false,
        showInactiveNotice: true,
        inactiveNoticeText: "This response contains no evaluative claims, no inferences from general data, and no assumptions about your context. Reasoning Mode has no elements to surface here. This is what appropriate non-activation looks like — the system fires when it should and stays quiet when it should not.",
        gapText: null,
        reasoningItems: [],
        changeReceipt: null
      }
    ]
  },
];

export default scenarios;
