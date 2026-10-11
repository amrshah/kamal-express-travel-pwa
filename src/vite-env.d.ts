/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ALAMIA_AGUI_URL?: string;
  readonly VITE_ALAMIA_CHAT_URL?: string;
  readonly VITE_COPILOT_RUNTIME_URL?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
