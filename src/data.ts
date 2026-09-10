/**
 * Aniket Charjan — structured background, served as MCP tools.
 * Single source of truth: edit here, rebuild, done.
 */

export const profile = {
  name: "Aniket Ravindra Charjan",
  role: "AI Developer (Backend)",
  current: "SWE — AI Products @ BrowserStack",
  location: "Nagpur, India",
  summary:
    "Experienced AI backend developer with 3.5+ years designing, building, and maintaining robust, scalable server-side systems, with a strong focus on performance optimization, code quality, and security. Currently building autonomous AI agents at BrowserStack.",
  links: {
    portfolio: "https://aniket-charjan.vercel.app",
    github: "https://github.com/jason-bourne-gg",
    linkedin: "https://www.linkedin.com/in/aniket-charjan/",
    email: "aniketcharjan3@gmail.com",
  },
};

export const experience = [
  {
    role: "SWE — AI Products",
    company: "BrowserStack",
    period: "Feb 2025 — Present",
    highlights: [
      "Designed and shipped an autonomous AI agent that authors and executes end-to-end browser tests for enterprise web apps — planner-executor loop, Playwright tool-use via MCP, RAG over historical test artifacts, and live step-level observability.",
      "Re-architected the inference layer from monolithic LLM calls to a tiered LLM → SLM → SDK routing pipeline: median response time cut ~90%, task-success accuracy lifted 20% → 60% → 80%, per-session cost down ~80% ($5 → <$1).",
      "Built the enterprise integration surface — Salesforce SSO, RBAC, and cross-product hooks into Test Suites, Builds & Automate — plus structured tracing and eval gates that make agent behavior debuggable in production.",
    ],
    stack: ["Ruby on Rails", "Node.js", "TypeScript", "React", "LLMs/SLMs", "MCP", "BullMQ", "Redis", "MySQL", "Docker", "Kubernetes", "AWS"],
  },
  {
    role: "SDE-1 — Backend",
    company: "Sigmoid Analytics",
    period: "Jan 2024 — Jan 2025",
    highlights: [
      "Core member of a three-person backend team digitizing the annual budgeting & auditing process for the world's largest soft-drink seller.",
      "Built a tool to allocate yearly budgets across ~70 tiers per brand using ML to optimize distribution from prior revenue and sales forecasts — bottlers across 22 countries upload expenses against these tiers.",
      "Delivered real-time analytics on KPIs previously unattainable: expense ageing, rejection rates, approval times, taxonomy adherence, and backdated-entry rates.",
    ],
    stack: ["Node.js", "MySQL", "React", "Azure", "Docker", "Kubernetes"],
  },
  {
    role: "ASDE — Backend",
    company: "Sigmoid Analytics",
    period: "Jul 2022 — Dec 2023",
    highlights: [
      "Built the entire backend of a performance-marketing tool for a CPG giant, driving a 370% revenue increase for products marketed via Amazon Ads (Digital Display).",
      "Cut ad-order creation from days to minutes with product-specific audience targeting; an ML core tracked 42 KPIs daily to recommend ad-group changes. Included an admin panel and role-based authorization.",
      "Engineered a data pipeline harmonizing 25 disparate sources (structured, semi-structured, IoT streams, third-party APIs) into a unified schema on Amazon EMR, monitored with CloudWatch.",
    ],
    stack: ["Python", "FastAPI", "Flask", "Django", "SQL", "AWS EMR", "CloudWatch"],
  },
];

export const projects = [
  {
    name: "Road Clash",
    tagline: "Pseudo-3D, Road Rash–style combat racer that runs entirely in the browser.",
    details:
      "Race AI rivals solo or spin up a room and brawl with friends over peer-to-peer WebRTC — no server, no accounts. Client-side prediction keeps controls local-feeling; remote riders are snapshot-interpolated to hide jitter, and a seeded RNG builds an identical track on every peer.",
    stack: ["TypeScript", "Canvas 2D", "WebRTC", "Trystero", "Vite"],
    repo: "https://github.com/jason-bourne-gg/road-clash",
  },
  {
    name: "Genesis — HighLevel App Builder",
    tagline: "AI app builder for the HighLevel CRM: describe an app in plain English and Claude writes it.",
    details:
      "You connect a HighLevel sub-account and type what you want; Claude writes the files while you watch them appear in an on-screen editor, and the finished app runs in a sandboxed frame against your real contacts and calendars. Files are hand-editable and every generation is version-stepped.",
    stack: ["Vue 3", "TypeScript", "Firebase", "Cloud Functions", "@anthropic-ai/sdk"],
    repo: "https://github.com/jason-bourne-gg/genesis-highlevel-app-builder",
  },
  {
    name: "DirectDrop",
    tagline: "Peer-to-peer file transfer straight between two browsers — no upload, no server, no account.",
    details:
      "Pick a file, share the generated link, and the bytes stream directly to whoever opens it over WebRTC, DTLS-encrypted in transit. Trystero handles signalling over public Nostr relays, so there is no backend of our own. Auto-chunked binary with live progress, speed and ETA.",
    stack: ["TypeScript", "WebRTC", "Trystero", "Vite"],
    repo: "https://github.com/jason-bourne-gg/DirectDrop",
  },
  {
    name: "Agent Web Clipper",
    tagline: "Chrome extension that turns any page into clean, LLM-ready Markdown or JSON in one click.",
    details:
      "Picks the main content node, strips nav, ads and boilerplate using a readability heuristic (text length minus link density), converts the DOM to Markdown, and attaches metadata plus outbound links. No AI in the loop and no network calls — everything runs locally in the browser.",
    stack: ["JavaScript", "Chrome Manifest V3"],
    repo: "https://github.com/jason-bourne-gg/web-clipper-extension",
  },
  {
    name: "Doc Parser RAG Bot",
    tagline: "Retrieval-augmented Q&A over your own documents.",
    details:
      "Uploads are chunked and embedded into PostgreSQL with pgvector; a question is embedded, matched by vector similarity, re-ranked, and answered by Claude from the retrieved passages. Supports PDF, DOCX, TXT and Markdown via LangChain loaders.",
    stack: ["Node.js", "Express", "PostgreSQL", "pgvector", "LangChain", "Claude"],
    repo: "https://github.com/jason-bourne-gg/DOC-PARSER-RAG-BOT",
  },
  {
    name: "YouTube Streaming & Alert System",
    tagline: "Kafka-based notification pipeline for YouTube playlist analytics.",
    details:
      "Pulls video stats from YouTube playlists, Avro-serializes them onto a Kafka topic, processes the stream, and dispatches alerts to a Telegram bot via Confluent HTTP connectors.",
    stack: ["Python", "Kafka", "Avro", "APIs"],
    repo: null,
  },
  {
    name: "my-mcp-server",
    tagline: "This MCP server — exposes Aniket's resume as tools, resources, and prompts.",
    details:
      "An open-source Model Context Protocol server so any MCP-compatible assistant (Claude, Cursor) can query Aniket's experience, projects, and skills with sourced answers.",
    stack: ["TypeScript", "MCP", "@modelcontextprotocol/sdk"],
    repo: "https://github.com/jason-bourne-gg/my-mcp-server",
  },
];

/** Headline career metrics — quick, quotable facts. */
export const highlights = [
  { metric: "3.5+ years", detail: "backend & AI engineering experience" },
  { metric: "~90%", detail: "median agent response-time reduction at BrowserStack" },
  { metric: "20% → 80%", detail: "agent task-success accuracy across three iterations" },
  { metric: "~80%", detail: "per-session cost reduction ($5 → <$1)" },
  { metric: "370%", detail: "revenue lift from a performance-marketing tool" },
  { metric: "22 countries", detail: "covered by the global budgeting platform" },
  { metric: "25 sources", detail: "harmonized into a unified analytics schema" },
];

export const skills = {
  "AI / ML": ["Agentic AI", "LLMs", "SLMs", "RAG systems", "Prompt Engineering", "Vector DBs", "MCP"],
  Languages: ["Python", "JavaScript", "TypeScript", "C++"],
  Backend: ["Node.js", "FastAPI", "Flask", "Express.js", "Ruby on Rails", "Django"],
  "Infra / DevOps": ["Docker", "Kubernetes", "Kafka", "Redis", "BullMQ"],
  Cloud: ["AWS", "Azure", "GCP"],
  "Data / Design": ["PostgreSQL", "MySQL", "HLD", "LLD"],
};

export const education = [
  { degree: "Integrated Masters", institution: "IIT Bhubaneswar", period: "2017 — 2022", score: "CGPA 8.60/10" },
  { degree: "Class XII (MH Board)", institution: "Shri Dawale Junior College, Akola", period: "2017", score: "88%" },
  { degree: "Class X (CBSE)", institution: "Agragami Convent School, Wardha", period: "2015", score: "10/10" },
];

export const contact = {
  email: "aniketcharjan3@gmail.com",
  phone: "+91 90212 94482",
  linkedin: "https://www.linkedin.com/in/aniket-charjan/",
  github: "https://github.com/jason-bourne-gg",
  portfolio: "https://aniket-charjan.vercel.app",
  availability: "Open to roles and collaborations in AI / backend engineering.",
};

/** Assemble the entire resume as a single Markdown document. */
export function buildResumeMarkdown(): string {
  const lines: string[] = [];
  lines.push(`# ${profile.name}`);
  lines.push(`**${profile.role}** · ${profile.current} · ${profile.location}`);
  lines.push("");
  lines.push(profile.summary);
  lines.push("");
  lines.push(
    `[Portfolio](${profile.links.portfolio}) · [GitHub](${profile.links.github}) · [LinkedIn](${profile.links.linkedin}) · ${profile.links.email}`
  );

  lines.push("\n## Highlights");
  for (const h of highlights) lines.push(`- **${h.metric}** — ${h.detail}`);

  lines.push("\n## Experience");
  for (const job of experience) {
    lines.push(`\n### ${job.role} — ${job.company}`);
    lines.push(`*${job.period}*`);
    for (const point of job.highlights) lines.push(`- ${point}`);
    lines.push(`\n_Stack: ${job.stack.join(", ")}_`);
  }

  lines.push("\n## Projects");
  for (const p of projects) {
    const link = p.repo ? ` ([repo](${p.repo}))` : "";
    lines.push(`\n### ${p.name}${link}`);
    lines.push(`${p.tagline}`);
    lines.push(`${p.details}`);
    lines.push(`\n_Stack: ${p.stack.join(", ")}_`);
  }

  lines.push("\n## Skills");
  for (const [category, items] of Object.entries(skills)) {
    lines.push(`- **${category}:** ${items.join(", ")}`);
  }

  lines.push("\n## Education");
  for (const e of education) {
    lines.push(`- **${e.degree}**, ${e.institution} (${e.period}) — ${e.score}`);
  }

  return lines.join("\n");
}
