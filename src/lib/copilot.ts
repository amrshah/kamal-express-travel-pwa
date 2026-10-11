export type CopilotMessage = { role: "user" | "assistant"; content: string };
export type AlamiaContext = {
  surface: "kamal-express-pwa";
  service: string;
  locale: string;
};

const aguiUrl = import.meta.env.VITE_ALAMIA_AGUI_URL?.trim();
const chatUrl = import.meta.env.VITE_ALAMIA_CHAT_URL?.trim();
let threadId = "ke-" + Math.random().toString(36).slice(2) + "-" + Date.now().toString(36);

export const copilotConfiguration = {
  aguiConfigured: Boolean(aguiUrl),
  chatConfigured: Boolean(chatUrl),
  copilotKitRuntimeConfigured: Boolean(import.meta.env.VITE_COPILOT_RUNTIME_URL?.trim()),
};

function makeId(prefix: string) {
  return prefix + "-" + Math.random().toString(36).slice(2, 10) + "-" + Date.now().toString(36);
}

async function sendAguiMessage(message: string, context: AlamiaContext, history: CopilotMessage[]) {
  if (!aguiUrl) throw new Error("AG-UI endpoint is not configured.");
  const messages = [...history, { role: "user" as const, content: message }].map((item) => ({
    id: makeId("msg"),
    role: item.role,
    content: item.content,
  }));
  const response = await fetch(aguiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    credentials: "include",
    body: JSON.stringify({
      threadId,
      runId: makeId("run"),
      messages,
      tools: [],
      context: [
        { description: "Application surface", value: context.surface },
        { description: "Selected travel service", value: context.service },
        { description: "Locale", value: context.locale },
      ],
      state: { service: context.service, locale: context.locale },
    }),
  });
  if (!response.ok) throw new Error("The Alamia travel assistant is unavailable right now.");
  if (!response.body) throw new Error("The Alamia AG-UI endpoint did not return a readable event stream.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let reply = "";
  let streamError = "";
  const consumeFrame = (frame: string) => {
    const data = frame.split("\n").filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trim()).join("\n");
    if (!data || data === "[DONE]") return;
    try {
      const event = JSON.parse(data) as { type?: string; delta?: string; message?: string; error?: string; content?: string };
      if (event.type === "TEXT_MESSAGE_CONTENT" && typeof event.delta === "string") reply += event.delta;
      if (event.type === "RUN_ERROR") streamError = event.message || event.error || "The assistant run failed.";
      if (event.type === "TEXT_MESSAGE_CONTENT" && typeof event.content === "string" && !event.delta) reply += event.content;
    } catch {
      // Ignore non-JSON SSE comments and transport keep-alives.
    }
  };
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const frames = buffer.split("\n\n");
      buffer = frames.pop() ?? "";
      frames.forEach(consumeFrame);
      if (done) break;
    }
    if (buffer.trim()) consumeFrame(buffer);
  } finally {
    reader.releaseLock();
  }
  if (streamError) throw new Error(streamError);
  if (!reply.trim()) throw new Error("The AG-UI stream completed without a text response. Verify the Alamia event contract.");
  return reply.trim();
}

/**
 * Frontend transport seam. AG-UI is preferred when configured; the JSON chat
 * route remains a simpler adapter option. Demo mode never claims to contact staff.
 * Identity, tenant, roles and permissions must be derived and enforced server-side.
 */
export async function sendTravelMessage(
  message: string,
  context: AlamiaContext,
  history: CopilotMessage[] = []
): Promise<string> {
  if (aguiUrl) return sendAguiMessage(message, context, history);

  if (chatUrl) {
    const response = await fetch(chatUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "include",
      body: JSON.stringify({ message, history, context }),
    });
    if (!response.ok) throw new Error("The travel assistant is unavailable right now. Please try again later.");
    const data: unknown = await response.json();
    if (typeof data === "object" && data !== null && "reply" in data && typeof data.reply === "string") return data.reply;
    throw new Error("The configured Alamia chat endpoint returned an unsupported response shape.");
  }

  return "Thanks for your question. This review build is running in demo mode, so it has not contacted a travel agent or live AI service. Your question was: “" + message + "”.";
}

export function getCopilotStatus() {
  if (copilotConfiguration.aguiConfigured) return "AG-UI configured";
  if (copilotConfiguration.copilotKitRuntimeConfigured) return "CopilotKit runtime";
  if (copilotConfiguration.chatConfigured) return "Chat adapter configured";
  return "Demo mode";
}
