# Kamal Express Travel PWA

A responsive, installable React + TypeScript travel inquiry experience for flights, visa guidance, Umrah planning, hotels, and travel assistance.

## Local development

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

The build runs TypeScript checks and produces the static site in `dist/`.

## UI foundation

- React + TypeScript + Vite
- Tailwind CSS design tokens and a responsive, mobile-first design system
- Radix UI primitives for accessible popovers and selects, plus React Day Picker for calendar selection
- Lucide icons and a curated airport reference dataset with city, airport name, country, and IATA code
- Passenger controls, trip-type selector, validation, mobile navigation drawer, and PWA service worker

The UI uses shadcn/ui-style local design primitives and Radix behavior rather than a hosted component service. The current airport list is a curated starter dataset, not a complete worldwide airport feed. No live fares, ticketing, hotel inventory, or booking API is connected.

## AG-UI / Alamia / CopilotKit boundary

The frontend is structured so Alamia remains the owner of skills, tools, authorization, tenant identity, policy enforcement, audit, and provider routing. Browser-provided tenant/role values must never be treated as authorization.

- `src/lib/copilot.ts` is the app-owned travel-assistant adapter. With no endpoint configured, it stays in demo mode.
- `VITE_ALAMIA_CHAT_URL` is an optional JSON endpoint for an application-owned chat adapter. The current adapter expects a JSON response shaped as `{ "reply": "..." }`. Only configure it after confirming the actual server contract and authentication.
- `VITE_ALAMIA_AGUI_URL` is reserved for the Alamia AG-UI endpoint contract; this frontend does not assume that a raw AG-UI SSE endpoint is interchangeable with a CopilotKit runtime URL.
- `VITE_COPILOT_RUNTIME_URL` enables the optional CopilotKit v2 popup and must point to a compatible **self-hosted** CopilotKit runtime/adapter endpoint. Do not point it directly at a raw `/api/ag-ui` route unless a compatible adapter has been implemented.
- No CopilotKit Intelligence, Copilot Cloud, or other paid hosted CopilotKit service is required by this frontend. The demo does not ship any provider API keys.

For production, put the Alamia integration behind authenticated HTTPS, enforce identity and tenant membership on the server, validate every action server-side, and use explicit approval for booking/payment mutations. Configure CORS and cookie settings deliberately for the frontend origin.

## GitHub Pages review

The `main` branch builds with Node.js and deploys the generated `dist/` folder using GitHub Actions:

https://amrshah.github.io/kamal-express-travel-pwa/

Every push runs a production build before deployment. The public review site is demo-only until the Alamia and CRM adapters are configured.

## Current review scope

- Responsive PWA shell and slide-out mobile navigation
- Airport autocomplete using a curated set of popular airports
- Date picker, trip type, cabin/airline selectors, passenger controls, and basic validation
- Travel, visa, Umrah, and hotel inquiry previews
- Demo travel copilot with an adapter seam for Alamia
- Optional CopilotKit v2 UI integration behind a compatible self-hosted runtime URL

The CRM remains the system of record; this frontend must not create a false impression that demo submissions have reached the travel team.
