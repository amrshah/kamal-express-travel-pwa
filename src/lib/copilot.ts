export type CopilotMessage = { role: "user" | "assistant"; content: string };
export type AlamiaContext = {
  surface: "kamal-express-pwa";
  service: string;
  locale: string;
};

const aguiUrl = import.meta.env.VITE_ALAMIA_AGUI_URL?.trim();
const chatUrl = import.meta.env.VITE_ALAMIA_CHAT_URL?.trim();

export const copilotConfiguration = {
  aguiConfigured: Boolean(aguiUrl),
  chatConfigured: Boolean(chatUrl),
  copilotKitRuntimeConfigured: Boolean(import.meta.env.VITE_COPILOT_RUNTIME_URL?.trim()),
};

/**
 * App-owned transport seam for Alamia. The actual request body and event mapping
 * must match the deployed Alamia runtime contract before enabling a live URL.
 * No browser-side secrets or tenant/role claims are sent from this module.
 */
export async function sendTravelMessage(
  message: string,
  context: AlamiaContext
): Promise<string> {
  if (!chatUrl) {
    return "Thanks for your question. This review build is running in demo mode, so it has not contacted a travel agent or live AI service. Your question was: “" + message + "”.";
  }

  const response = await fetch(chatUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "include",
    body: JSON.stringify({ message, context }),
  });

  if (!response.ok) {
    throw new Error("The travel assistant is unavailable right now. Please try again later.");
  }

  const data: unknown = await response.json();
  if (typeof data === "object" && data !== null && "reply" in data && typeof data.reply === "string") {
    return data.reply;
  }
  throw new Error("The configured Alamia chat endpoint returned an unsupported response shape.");
}

export function getCopilotStatus() {
  if (copilotConfiguration.chatConfigured || copilotConfiguration.aguiConfigured) return "Configured endpoint";
  return "Demo mode";
}
