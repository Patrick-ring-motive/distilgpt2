
//import { pipeline } from "./transformers.js";
//import { pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.2.1";
import { pipeline } from "https://cdn.jsdelivr.net/npm/@xenova/transformers";
globalThis.pipeline = pipeline;
/*(() => {
  const _fetch = globalThis.fetch;
  globalThis.fetch = async function fetch() {
     if (String(arguments[0]).endsWith('ort-wasm-simd-threaded.jsep.wasm')) {
       const loc = location.href.split('/');
       loc.pop();
       return new Response((await _fetch(`${loc.join('/')}/ort-wasm-simd-threaded.jsep.wasm.gz`)).body.pipeThrough(new DecompressionStream("gzip")), { headers: { "content-type": "application/wasm" } });
    return _fetch.apply(this, arguments);
  };
})();*/

// Create a text generation pipeline
const generator = await pipeline(
  "text-generation",
  // "Xenova/distilgpt2",
  //"Xenova/LaMini-T5-738M"
  "Xenova/flan-alpaca-base"
);

// Generate text
const output = await generator("Who are you?", { max_new_tokens: 64, do_sample: true });
console.log(output[0].generated_text);