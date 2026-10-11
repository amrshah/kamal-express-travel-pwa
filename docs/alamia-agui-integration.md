# Alamia copilot integration contract

This document records the integration boundary for the Kamal Express PWA. The public GitHub Pages build remains a demo until a trusted backend URL is configured.

## Recommended production path

1. Serve the PWA and Alamia API over HTTPS.
2. Authenticate the visitor using the travel product's chosen session/token flow.
3. Derive tenant, user, and role from the authenticated server-side identity. Never authorize from browser-supplied context.
4. Expose the existing Alamia AG-UI transport as an authenticated POST /api/ag-ui endpoint that accepts AG-UI run input and returns a Server-Sent Events stream with standard AG-UI event types.
5. Keep the simpler POST /api/copilot/chat JSON endpoint available only if it is intentionally supported; the current adapter expects a JSON response containing a string field named reply.
6. If the CopilotKit popup is enabled, point VITE_COPILOT_RUNTIME_URL to a self-hosted CopilotKit-compatible runtime/adapter. A raw AG-UI SSE endpoint is not automatically a CopilotKit runtime endpoint.

## Frontend environment

- VITE_ALAMIA_AGUI_URL — authenticated AG-UI SSE endpoint. The PWA sends recent chat messages, a per-page thread identifier, run identifier, and non-authoritative UI context.
- VITE_ALAMIA_CHAT_URL — optional JSON chat adapter endpoint.
- VITE_COPILOT_RUNTIME_URL — optional self-hosted CopilotKit runtime URL for the CopilotKit v2 popup.

Do not place provider API keys, session secrets, or private credentials in Vite environment variables. Anything prefixed with VITE_ is shipped to the browser. Use same-site cookies or a short-lived browser token issued by the authenticated backend as appropriate.

## Event handling

The AG-UI adapter consumes SSE data frames and assembles TEXT_MESSAGE_CONTENT deltas. It surfaces RUN_ERROR and treats an empty text stream as an integration error. If the Alamia runtime uses additional or custom events, add an explicit mapping here rather than assuming every stream is interchangeable.

## Security and scope

- Server-side identity and tenant authorization are mandatory.
- Client-provided service, locale, thread, and message values are context only—not trusted claims.
- Booking, payment, cancellation, or other state-changing tools require backend validation and explicit human confirmation where appropriate.
- Do not send passport, payment, or other sensitive information in the public demo.
- This PWA has no live booking, fare, hotel inventory, CRM-write, or ticketing integration yet.
- No CopilotKit Intelligence or hosted CopilotKit service is required. The optional popup is intended for a self-hosted compatible runtime.
