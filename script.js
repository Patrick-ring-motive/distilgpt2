
//import { pipeline } from "./transformers.js";
import { pipeline, TextStreamer } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.2.1";
//import { pipeline } from "https://cdn.jsdelivr.net/npm/@xenova/transformers";
globalThis.pipeline = pipeline;
globalThis.TextStreamer = TextStreamer;
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
window.log = (e) => {
  console.log(e);
  (
    document.querySelector("output") ??
    document.getElementsByTagName("output")?.[0] ??
    {}
  ).innerHTML += ("<br>" + (e.message ?? e));
};
window.addEventListener("error", function(e) {
  log(e?.message);
  [...arguments].forEach((x) => {
    log("window error " + (x?.message ?? x));
  });
});
// Create a text generation pipeline
let generator;
try {
  if (/mobile/i.test(navigator.userAgent)) {
    log("loading mobile model")
    generator = (await pipeline(
      "text-generation",
      "Xenova/distilgpt2",
    ));
    log("loaded mobile model");
  } else {
    generator = (await pipeline('text2text-generation', 'Xenova/flan-alpaca-base'));
  }

  // Generate text
  //const output = await generator("Who are you?", { max_new_tokens: 64, do_sample: true });



  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));





  // Generate a response
  if (/mobile/i.test(navigator.userAgent)) {
    const output = await generator("Once upon a time,", { max_new_tokens: 32, do_sample: true });
    log(output[0].generated_text.at(-1).content);
  } else {
    // Generate text
    const streamer = new TextStreamer(generator.tokenizer, {
      skip_prompt: true,
      callback_function: (token) => log(token)
    });
    const context = ['What is Python?'];
    //for (const _ of Array(20)) {
    const output = await generator(context.join(''), { max_length: 32, do_sample: true, top_k: 10, streamer });
    await log(context.join(' '));
    await sleep(100);
    context.push(output[0].generated_text);
    // }
  }
} catch (e) {
  log(e);
}