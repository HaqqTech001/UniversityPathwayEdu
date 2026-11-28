/// <reference types="vite/client" />

// Vite environment variables and stylesheet side-effect imports.
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly [key: string]: string | boolean | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.css';
