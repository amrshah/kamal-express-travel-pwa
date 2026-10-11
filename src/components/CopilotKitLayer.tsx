import type { ReactNode } from "react";
import { CopilotKit, CopilotPopup } from "@copilotkit/react-core/v2";
import "@copilotkit/react-core/v2/styles.css";

/**
 * Optional self-hosted CopilotKit runtime. Configure this only when Alamia
 * exposes a compatible runtime adapter. Do not point it at a raw AG-UI SSE
 * endpoint; the application/runtime adapter owns protocol translation.
 * This uses no CopilotKit Intelligence or hosted CopilotKit service.
 */
export function CopilotKitLayer({ children }: { children: ReactNode }) {
  const runtimeUrl = import.meta.env.VITE_COPILOT_RUNTIME_URL?.trim();
  if (!runtimeUrl) return <>{children}</>;

  return (
    <CopilotKit runtimeUrl={runtimeUrl}>
      {children}
      <CopilotPopup />
    </CopilotKit>
  );
}
