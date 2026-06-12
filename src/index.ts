#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import {
  buildResumeMarkdown,
  contact,
  education,
  experience,
  highlights,
  profile,
  projects,
  skills,
} from "./data.js";

/* ------------------------------------------------------------------ tools */

const TOOLS = [
  { name: "get_profile", description: "Aniket's profile: name, current role, location, summary, and links.", inputSchema: { type: "object", properties: {} } },
  { name: "get_experience", description: "Full work history — roles, companies, periods, highlights, and per-role stack.", inputSchema: { type: "object", properties: {} } },
  { name: "get_projects", description: "All of Aniket's personal/side projects.", inputSchema: { type: "object", properties: {} } },
  {
    name: "get_project",
    description: "Details for one project by name (partial, case-insensitive match).",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string", description: "Project name, e.g. 'Road Clash'." } },
      required: ["name"],
    },
  },
  { name: "get_skills", description: "Technical skills grouped by category.", inputSchema: { type: "object", properties: {} } },
  {
    name: "has_skill",
    description: "Check whether Aniket has a given skill and return supporting evidence from his skills and experience.",
    inputSchema: {
      type: "object",
      properties: { skill: { type: "string", description: "Skill or technology, e.g. 'Kafka', 'RAG', 'Kubernetes'." } },
      required: ["skill"],
    },
  },
  { name: "get_highlights", description: "Headline career metrics (years, latency cut, revenue lift, etc.).", inputSchema: { type: "object", properties: {} } },
  { name: "get_education", description: "Education history.", inputSchema: { type: "object", properties: {} } },
  { name: "get_contact", description: "Contact details and availability.", inputSchema: { type: "object", properties: {} } },
  { name: "get_resume", description: "The entire resume as a single formatted Markdown document.", inputSchema: { type: "object", properties: {} } },
  {
    name: "search_background",
    description: "Free-text search across experience, projects, and skills. Answers questions like 'what did he do at BrowserStack?'.",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string", description: "Search term, e.g. 'kafka', 'RAG', 'BrowserStack'." } },
      required: ["query"],
    },
  },
];

/* --------------------------------------------------------- search support */

interface IndexEntry {
  source: string;
  text: string;
}

function buildSearchIndex(): IndexEntry[] {
  const index: IndexEntry[] = [];
  for (const job of experience) {
    const head = `${job.role} @ ${job.company} (${job.period})`;
    index.push({ source: head, text: `${head} — stack: ${job.stack.join(", ")}` });
    for (const h of job.highlights) index.push({ source: head, text: h });
  }
  for (const p of projects) {
    const head = `Project: ${p.name}`;
    index.push({ source: head, text: `${head} — ${p.tagline} ${p.details} stack: ${p.stack.join(", ")}` });
  }
  for (const [cat, items] of Object.entries(skills)) {
    index.push({ source: `Skills: ${cat}`, text: items.join(", ") });
  }
  return index;
}

const SEARCH_INDEX = buildSearchIndex();

function search(query: string) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return SEARCH_INDEX.filter((entry) => {
    const haystack = `${entry.source} ${entry.text}`.toLowerCase();
    return terms.every((t) => haystack.includes(t));
  }).map((entry) => ({ source: entry.source, match: entry.text }));
}

function findProject(name: string) {
  const q = name.toLowerCase();
  return projects.find((p) => p.name.toLowerCase().includes(q)) || null;
}

function hasSkill(skill: string) {
  const q = skill.toLowerCase();
  const fromSkills = Object.entries(skills)
    .filter(([, items]) => items.some((i) => i.toLowerCase().includes(q)))
    .map(([cat]) => `Listed skill (${cat})`);
  const fromExperience = experience
    .filter((job) => job.stack.some((s) => s.toLowerCase().includes(q)) || job.highlights.some((h) => h.toLowerCase().includes(q)))
    .map((job) => `${job.role} @ ${job.company}`);
  const evidence = [...fromSkills, ...fromExperience];
  return { skill, has: evidence.length > 0, evidence };
}

/* -------------------------------------------------------------- resources */

const RESOURCES = [
  { uri: "resume://full", name: "Full resume (Markdown)", description: "Aniket's entire resume as one Markdown document.", mimeType: "text/markdown" },
  { uri: "resume://profile", name: "Profile (JSON)", description: "Profile summary, role, and links.", mimeType: "application/json" },
  { uri: "resume://all", name: "Everything (JSON)", description: "All structured data: profile, experience, projects, skills, education, contact.", mimeType: "application/json" },
];

function readResource(uri: string) {
  switch (uri) {
    case "resume://full":
      return { mimeType: "text/markdown", text: buildResumeMarkdown() };
    case "resume://profile":
      return { mimeType: "application/json", text: JSON.stringify(profile, null, 2) };
    case "resume://all":
      return {
        mimeType: "application/json",
        text: JSON.stringify({ profile, highlights, experience, projects, skills, education, contact }, null, 2),
      };
    default:
      return null;
  }
}

/* ---------------------------------------------------------------- prompts */

const PROMPTS = [
  {
    name: "screen_for_role",
    description: "Assess Aniket's fit for a role given a job description, citing specific experience.",
    arguments: [{ name: "job_description", description: "The full job description to screen against.", required: true }],
  },
  {
    name: "draft_outreach",
    description: "Draft a short, tailored recruiter outreach message to Aniket.",
    arguments: [
      { name: "company", description: "Your company name.", required: true },
      { name: "role", description: "The role you're hiring for (optional).", required: false },
    ],
  },
];

function getPrompt(name: string, args: Record<string, string>) {
  switch (name) {
    case "screen_for_role": {
      const jd = args.job_description || "(no job description provided)";
      return {
        description: "Screen Aniket against a job description.",
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text:
                "You have access to tools and resources describing the candidate Aniket Charjan " +
                "(get_experience, get_projects, get_skills, search_background, and the resume://full resource). " +
                "Using only that sourced data, assess his fit for the role below. Give a fit score out of 10, " +
                "list concrete matching evidence (cite the role/project), and note any gaps.\n\n" +
                `JOB DESCRIPTION:\n${jd}`,
            },
          },
        ],
      };
    }
    case "draft_outreach": {
      const company = args.company || "our company";
      const role = args.role ? ` for a ${args.role} role` : "";
      return {
        description: "Draft a recruiter outreach message.",
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text:
                `Draft a concise, warm outreach message from a recruiter at ${company} to Aniket Charjan${role}. ` +
                "Reference one or two specific, accurate details about his background (use get_experience / get_projects / search_background). " +
                "Keep it under 120 words, no buzzword filler, and end with a clear call to action.",
            },
          },
        ],
      };
    }
    default:
      return null;
  }
}

/* ----------------------------------------------------------------- server */

const server = new Server(
  { name: "my-mcp-server", version: "1.1.0" },
  { capabilities: { tools: {}, resources: {}, prompts: {} } }
);

const reply = (data: unknown) => ({
  content: [{ type: "text" as const, text: typeof data === "string" ? data : JSON.stringify(data, null, 2) }],
});
const fail = (text: string) => ({ content: [{ type: "text" as const, text }], isError: true });

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;
  try {
    switch (name) {
      case "get_profile": return reply(profile);
      case "get_experience": return reply(experience);
      case "get_projects": return reply(projects);
      case "get_project": {
        const q = typeof args.name === "string" ? args.name : "";
        if (!q.trim()) return reply("Provide a 'name'.");
        const p = findProject(q);
        return p ? reply(p) : reply(`No project matching "${q}". Known: ${projects.map((x) => x.name).join(", ")}.`);
      }
      case "get_skills": return reply(skills);
      case "has_skill": {
        const q = typeof args.skill === "string" ? args.skill : "";
        if (!q.trim()) return reply("Provide a 'skill'.");
        return reply(hasSkill(q));
      }
      case "get_highlights": return reply(highlights);
      case "get_education": return reply(education);
      case "get_contact": return reply(contact);
      case "get_resume": return reply(buildResumeMarkdown());
      case "search_background": {
        const query = typeof args.query === "string" ? args.query : "";
        if (!query.trim()) return reply("Provide a non-empty 'query' string.");
        const results = search(query);
        return reply(results.length ? results : `No matches for "${query}". Try a broader term or use get_experience / get_projects / get_skills.`);
      }
      default:
        return fail(`Unknown tool: ${name}`);
    }
  } catch (err) {
    return fail(`Error handling "${name}": ${err instanceof Error ? err.message : String(err)}`);
  }
});

server.setRequestHandler(ListResourcesRequestSchema, async () => ({ resources: RESOURCES }));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  const res = readResource(uri);
  if (!res) throw new Error(`Unknown resource: ${uri}`);
  return { contents: [{ uri, mimeType: res.mimeType, text: res.text }] };
});

server.setRequestHandler(ListPromptsRequestSchema, async () => ({ prompts: PROMPTS }));

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;
  const prompt = getPrompt(name, (args as Record<string, string>) || {});
  if (!prompt) throw new Error(`Unknown prompt: ${name}`);
  return prompt;
});

/* ------------------------------------------------------------------- boot */

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // MCP uses stdout for protocol framing; all logs must go to stderr.
  console.error("my-mcp-server running on stdio");

  const shutdown = async () => {
    try {
      await server.close();
    } catch {
      /* ignore */
    }
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

process.on("unhandledRejection", (reason) => console.error("Unhandled rejection:", reason));
process.on("uncaughtException", (err) => console.error("Uncaught exception:", err));

main().catch((err) => {
  console.error("Fatal error starting my-mcp-server:", err);
  process.exit(1);
});
