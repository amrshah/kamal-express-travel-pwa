import type { ReactNode } from "react";

/**
 * Build-safe placeholder for the optional self-hosted CopilotKit popup.
 *
 * The current @copilotkit/react-core/v2 entrypoint imports a stylesheet that
 * conflicts with this app's Tailwind v3 PostCSS pipeline (its @layer base is
 * processed as a separate root). Keep the main travel PWA buildable while the
 * optional popup is disabled. The app's own AG-UI adapter remains independent.
 *
 * Re-enable this layer after adopting a CSS pipeline compatible with the
 * CopilotKit v2 stylesheet; do not point a runtime at a raw AG-UI SSE endpoint.
 */
export function CopilotKitLayer({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
