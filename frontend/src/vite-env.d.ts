declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_NODE_ENV: string;
  readonly VITE_API_URL?: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}