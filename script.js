
import { pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.2.1";

(() => {

  const _instantiateStreaming = WebAssembly.instantiateStreaming;
  WebAssembly.instantiateStreaming = function instantiateStreaming() {
    console.log(...arguments);
    return _instantiateStreaming.apply(WebAssembly, arguments);
  };

})();

// Create a text generation pipeline
const generator = await pipeline(
  "text-generation",
  "Xenova/distilgpt2",
);

// Generate text
const output = await generator("Once upon a time,", { max_new_tokens: 64, do_sample: true });
console.log(output[0].generated_text);