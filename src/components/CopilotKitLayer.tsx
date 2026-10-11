import type { ReactNode } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotPopup } from "@copilotkit/react-ui";

/**
 * Optional self-hosted CopilotKit runtime. This URL must point to a compatible
 * CopilotKit runtime endpoint, not directly to the raw Alamia AG-UI SSE route.
 * No hosted CopilotKit Intelligence service is required by this frontend layer.
 */
export function CopilotKitLayer({ children }: { children: ReactNode }) {
  const runtimeUrl = import.meta.env.VITE_COPILOT_RUNTIME_URL?.trim();
  if (!runtimeUrl) return <>{children}</>;

  return (
    <CopilotKit runtimeUrl={runtimeUrl}>
      {children}
      <CopilotPopup
        labels={{
          title: "Kamal Express travel copilot",
          initial: "Assalamu alaikum! How can I help you plan your journey?",
          placeholder: "Ask about your trip…"
        }}
      />
    </CopilotKit>
  );
}
