import "./wasm_exec.js";

const env = {
  GOROOT: "/usr/local/go",
};

const cwd = "/sandbox";

const path = new URL("go.wasm", import.meta.url);
const wasmmod = await WebAssembly.compileStreaming(fetch(path));

export default async function (...args) {
  const go = new Go();
  const instance = await WebAssembly.instantiate(
    wasmmod,
    go.importObject,
  );

  go.env = env;

  go.argv = ["go", ...args];
  go.run(instance);
}