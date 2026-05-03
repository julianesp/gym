interface CloudflareEnv {
  DB: D1Database;
}

declare module "*.wasm" {
  const content: WebAssembly.Module;
  export default content;
}
