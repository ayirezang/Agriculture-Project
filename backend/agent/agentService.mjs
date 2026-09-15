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
async function getSession() {
  if (sessionPromise) return sessionPromise;
  sessionPromise = (async () => {
    const modelRuntime = await ModelRuntime.create();
    const model =
      modelRuntime.getModel("groq", "openai/gpt-oss-20b") ??
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
    });
    return session;
  })();
  return sessionPromise;
}
async function promptWithRetry(session, text, maxTries = 5) {
  for (let attempt = 1; ; attempt++) {
    try {
      await session.prompt(text);
      return;
    } catch (err) {
      const msg = err?.message ?? String(err);
      const wait = /\btry again in\s+([\d.]+)\s*s\b/i.exec(msg);
      if (!wait || attempt >= maxTries) throw err;
      const seconds = Number(wait[1]) + 2;
      console.log(
        `Rate limited. Waiting ${seconds}s (attempt ${attempt}/${maxTries})...`,
      );
      await new Promise((r) => setTimeout(r, seconds * 1000));
    }
  }
}
export async function runAgent(listing, buyerDemands) {
  seedMemory(listing, buyerDemands);
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
      "A farmer wants to sell produce. Follow your brain and skills: " +
        "load brain/brain.md, read memory/, run buyer-search, then price-negotiation " +
        "on the best match, then outreach-draft. " +
        'Reply ONLY with JSON: {"matches":[{"buyer","offer","fitScore","reason"}], ' +
        '"bestMatch":{...},"outreachDraft":"..."}',
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

// import "dotenv/config";
// import path from "node:path";
// import fs from "node:fs";
// import { fileURLToPath } from "node:url";
// import {
//   createAgentSession,
//   DefaultResourceLoader,
//   ModelRuntime,
//   SessionManager,
//   getAgentDir,
//   createSyntheticSourceInfo,
// } from "@earendil-works/pi-coding-agent";
// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// const AGENT_HOME = path.resolve(__dirname, "..", "agent-home");
// const MEMORY_DIR = path.join(AGENT_HOME, "memory");
// function seedMemory(listing, buyerDemands) {
//   fs.writeFileSync(
//     path.join(MEMORY_DIR, "listings.json"),
//     JSON.stringify(listing, null, 2),
//   );
//   fs.writeFileSync(
//     path.join(MEMORY_DIR, "buyers.json"),
//     JSON.stringify(buyerDemands, null, 2),
//   );
// }
// let sessionPromise = null;
// async function getSession() {
//   if (sessionPromise) return sessionPromise;
//   sessionPromise = (async () => {
//     const modelRuntime = await ModelRuntime.create();
//     const model =
//       modelRuntime.getModel("groq", "openai/gpt-oss-20b") ??
//       (await modelRuntime.getAvailable()).find((m) => m.provider === "groq");
//     if (!model) throw new Error("No Groq model found. Check GROQ_API_KEY.");
//     const skillFiles = [
//       "skills/buyer-search/SKILL.md",
//       "skills/price-negotiation/SKILL.md",
//       "skills/outreach-draft/SKILL.md",
//     ];
//     const loader = new DefaultResourceLoader({
//       cwd: AGENT_HOME,
//       agentDir: getAgentDir(),
//       skillsOverride: (current) => ({
//         skills: [
//           ...current.skills,
//           ...skillFiles.map((p) => ({
//             name: path.basename(path.dirname(p)),
//             description: `Skill defined in ${p}`,
//             filePath: path.join(AGENT_HOME, p),
//             baseDir: AGENT_HOME,
//             sourceInfo: createSyntheticSourceInfo(`agent:/${p}`, {
//               source: "sdk",
//             }),
//             disableModelInvocation: false,
//           })),
//         ],
//         diagnostics: current.diagnostics,
//       }),
//     });
//     await loader.reload();
//     const { session } = await createAgentSession({
//       cwd: AGENT_HOME,
//       model,
//       modelRuntime,
//       resourceLoader: loader,
//       tools: ["read", "write", "edit", "exec"],
//       sessionManager: SessionManager.inMemory(),
//     });
//     return session;
//   })();
//   return sessionPromise;
// }
// export async function runAgent(listing, buyerDemands) {
//   seedMemory(listing, buyerDemands);
//   const session = await getSession();
//   const events = [];
//   const unsub = session.subscribe((event) => {
//     events.push(
//       event.type +
//         (event.assistantMessageEvent?.type
//           ? `/${event.assistantMessageEvent.type}`
//           : ""),
//     );
//   });
//   try {
//     await session.prompt(
//       "A farmer wants to sell produce. Follow your brain and skills: " +
//         "load brain/brain.md, read memory/, run buyer-search, then price-negotiation " +
//         "on the best match, then outreach-draft. " +
//         'Reply ONLY with JSON: {"matches":[{"buyer","offer","fitScore","reason"}], ' +
//         '"bestMatch":{...},"outreachDraft":"..."}',
//     );
//   } finally {
//     unsub();
//   }
//   console.log("EVENTS:", JSON.stringify(events));
//   console.log(
//     "MESSAGES:",
//     JSON.stringify(
//       session.messages.map((m) => ({
//         role: m.role,
//         stopReason: m.stopReason,
//         errorMessage: m.errorMessage,
//         contentTypes: Array.isArray(m.content)
//           ? m.content.map((b) => b.type)
//           : m.content,
//         contentLength: Array.isArray(m.content) ? m.content.length : null,
//       })),
//       null,
//       2,
//     ),
//   );
//   const text = session.messages
//     .filter((m) => m.role === "assistant")
//     .flatMap((m) =>
//       Array.isArray(m.content)
//         ? m.content.filter((b) => b.type === "text").map((b) => b.text)
//         : [],
//     )
//     .join("\n");
//   const trimmed = text.trim().replace(/^```json\s*|\s*```$/g, "");
//   try {
//     return JSON.parse(trimmed);
//   } catch {
//     return { raw: trimmed };
//   }
// }
