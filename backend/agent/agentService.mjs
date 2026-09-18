import "dotenv/config";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import {
  createAgentSession,
  DefaultResourceLoader,
  ModelRuntime,
  SessionManager,
  getAgentDir,
  createSyntheticSourceInfo,
} from "@earendil-works/pi-coding-agent";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AGENT_HOME = path.resolve(__dirname, "..", "agent-home");
const MEMORY_DIR = path.join(AGENT_HOME, "memory");
function seedMemory(listing, buyerDemands) {
  fs.writeFileSync(
    path.join(MEMORY_DIR, "listings.json"),
    JSON.stringify(listing, null, 2),
  );
  fs.writeFileSync(
    path.join(MEMORY_DIR, "buyers.json"),
    JSON.stringify(buyerDemands, null, 2),
  );
}
let sessionPromise = null;

async function createSession() {
  const modelRuntime = await ModelRuntime.create();
  const model =
    modelRuntime.getModel("groq", "openai/gpt-oss-20b") ??
    modelRuntime.getModel("groq", "qwen/qwen3.8-27b") ??
    (await modelRuntime.getAvailable()).find((m) => m.provider === "groq");
  if (!model) throw new Error("No Groq model found. Check GROQ_API_KEY.");
  const skillFiles = [
    "skills/buyer-search/SKILL.md",
    "skills/price-negotiation/SKILL.md",
    "skills/outreach-draft/SKILL.md",
  ];
  const loader = new DefaultResourceLoader({
    cwd: AGENT_HOME,
    agentDir: getAgentDir(),
    skillsOverride: (current) => ({
      skills: [
        ...current.skills,
        ...skillFiles.map((p) => ({
          name: path.basename(path.dirname(p)),
          description: `Skill defined in ${p}`,
          filePath: path.join(AGENT_HOME, p),
          baseDir: AGENT_HOME,
          sourceInfo: createSyntheticSourceInfo(`agent:/${p}`, {
            source: "sdk",
          }),
          disableModelInvocation: false,
        })),
      ],
      diagnostics: current.diagnostics,
    }),
  });
  await loader.reload();
  const { session } = await createAgentSession({
    cwd: AGENT_HOME,
    model,
    modelRuntime,
    resourceLoader: loader,
    tools: ["read", "write", "edit", "ls", "grep", "find"],
    sessionManager: SessionManager.inMemory(),
    thinkingLevel: "minimal",
  });
  sessionPromise = session;
  return session;
}

async function getSession() {
  if (sessionPromise) return sessionPromise;
  return createSession();
}

function resetSessionForNewRun() {
  sessionPromise = null;
}
async function promptWithRetry(session, text, maxTries = 5) {
  const rateLimitMessage = () => {
    const lastAssistant = [...session.messages]
      .reverse()
      .find((m) => m.role === "assistant");
    if (
      lastAssistant?.stopReason === "error" &&
      /\brate_limit_exceeded\b/i.test(lastAssistant?.errorMessage ?? "")
    ) {
      return lastAssistant.errorMessage;
    }
    return null;
  };
  for (let attempt = 1; attempt <= maxTries; attempt++) {
    try {
      await session.prompt(text);
    } catch (err) {
      const msg = err?.message ?? String(err);
      const wait = /\btry again in\s+([\d.]+)\s*s\b/i.exec(msg);
      if (!wait || attempt >= maxTries) throw err;
      const seconds = Number(wait[1]) + 2;
      console.log(
        `Rate limited. Waiting ${seconds}s (attempt ${attempt}/${maxTries})...`,
      );
      await new Promise((r) => setTimeout(r, seconds * 1000));
      continue;
    }
    // The SDK can embed the 429 as a message instead of throwing. Detect it
    // and re-prompt the same session so work already done is not lost.
    const limitMsg = rateLimitMessage();
    if (!limitMsg) return;
    if (attempt >= maxTries) throw new Error(limitMsg);
    const wait = /\btry again in\s+([\d.]+)\s*s\b/i.exec(limitMsg);
    const seconds = wait ? Number(wait[1]) + 2 : 10;
    console.log(
      `Rate limited. Waiting ${seconds}s (attempt ${attempt}/${maxTries})...`,
    );
    await new Promise((r) => setTimeout(r, seconds * 1000));
    text =
      "A rate limit error interrupted you. Continue from where you stopped " +
      "and reply with ONLY the required JSON.";
  }
  throw new Error(`Agent did not finish after ${maxTries} attempts`);
}
export async function runAgent(listing, buyerDemands) {
  seedMemory(listing, buyerDemands);
  resetSessionForNewRun();
  const session = await getSession();
  const events = [];
  const unsub = session.subscribe((event) => {
    events.push(
      event.type +
        (event.assistantMessageEvent?.type
          ? `/${event.assistantMessageEvent.type}`
          : ""),
    );
  });
  try {
    await promptWithRetry(
      session,
      " A farmer wants to sell produce. All listing details and buyer data are already in memory. " +
        "1) Read memory/listings.json and memory/buyers.json. " +
        "2) Run buyer-search: filter and score ALL eligible buyers, output the top 3 ranked best to worst. " +
        "3) Run outreach-draft: draft a message for the best-matched buyer. " +
        "4) Run price-negotiation: confirm the best offer is at or above minPrice. " +
        "Do NOT ask clarifying questions — all data is complete. " +
        "Reply with ONLY this JSON and nothing else: " +
        '{"matches":[{"buyer":"name","offer":3.55,"fitScore":85,"reason":"..."}],' +
        '"bestMatch":{"buyer":"name","offer":3.55,"fitScore":85,"reason":"..."},' +
        '"outreachDraft":"the drafted message here"}',
    );
  } finally {
    unsub();
  }
  console.log("EVENTS:", JSON.stringify(events));
  console.log(
    "MESSAGES:",
    JSON.stringify(
      session.messages.map((m) => ({
        role: m.role,
        stopReason: m.stopReason,
        errorMessage: m.errorMessage,
        contentTypes: Array.isArray(m.content)
          ? m.content.map((b) => b.type)
          : m.content,
        contentLength: Array.isArray(m.content) ? m.content.length : null,
      })),
      null,
      2,
    ),
  );
  const text = session.messages
    .filter((m) => m.role === "assistant")
    .flatMap((m) =>
      Array.isArray(m.content)
        ? m.content.filter((b) => b.type === "text").map((b) => b.text)
        : [],
    )
    .join("\n");
  const trimmed = text.trim().replace(/^```json\s*|\s*```$/g, "");
  try {
    return JSON.parse(trimmed);
  } catch {
    return { raw: trimmed };
  }
}

