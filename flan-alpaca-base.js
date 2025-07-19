const context = ['What is Python?'];
(async () => {
  //import { pipeline } from "./transformers.js";
  //const { pipeline, TextStreamer } = await import("https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.2.1");
  //import { pipeline } from "https://cdn.jsdelivr.net/npm/@xenova/transformers";



  const { pipeline, TextStreamer } = await import('./transformers.js');
  globalThis.pipeline = pipeline;
  globalThis.TextStreamer = TextStreamer;
  (() => {
    const _fetch = globalThis.fetch;
    const fetchChunk = async (url) => {
      const response = await _fetch(url);
      const bytes = await response.bytes();
      return bytes;
    };

    const fetchEncoder = async () => {
      const chunks = [0, 1, 2, 3].map(x => fetchChunk(`https://patrick-ring-motive.github.io/distilgpt2/encoder_chunk0${x}.txt`));
      const bytes = await Promise.all(chunks);
      return new Response(new Response(new Uint8Array((await Promise.all(bytes.flat())).flat())).body.pipeThrough(new DecompressionStream("gzip")));
    };

    const fetchDecoder = async () => {
      const chunks = [0, 1, 2, 3, 4, 5].map(x => fetchChunk(`https://patrick-ring-motive.github.io/distilgpt2/decoder_chunk0${x}.txt`));
      const bytes = await Promise.all(chunks);
      return new Response(new Response(new Uint8Array((await Promise.all(bytes.flat())).flat())).body.pipeThrough(new DecompressionStream("gzip")));
    };

    globalThis.fetch = async function fetch() {
      if (String(arguments[0]).endsWith('ort-wasm-simd-threaded.jsep.wasm')) {
        const loc = location.href.split('/');
        loc.pop();
        return new Response((await _fetch(`${loc.join('/')}/ort-wasm-simd-threaded.jsep.wasm.gz`)).body.pipeThrough(new DecompressionStream("gzip")), { headers: { "content-type": "application/wasm" } });
      }
      if (String(arguments[0]).endsWith('tokenizer_config.json')) {
        const loc = location.href.split('/');
        loc.pop();
        return new Response((await _fetch(`${loc.join('/')}/tokenizerconfigjson.gz`)).body.pipeThrough(new DecompressionStream("gzip")));
      }
      if (String(arguments[0]).endsWith('config.json')) {
        const loc = location.href.split('/');
        loc.pop();
        return new Response((await _fetch(`${loc.join('/')}/configjson.gz`)).body.pipeThrough(new DecompressionStream("gzip")));
      }
      if (String(arguments[0]).endsWith('tokenizer.json')) {
        const loc = location.href.split('/');
        loc.pop();
        return new Response((await _fetch(`${loc.join('/')}/tokenizerjson.gz`)).body.pipeThrough(new DecompressionStream("gzip")));
      }
      if (String(arguments[0]).includes('encoder')) {
        return await fetchEncoder();
      }
      if (String(arguments[0]).includes('decoder')) {
        const loc = location.href.split('/');
        loc.pop();
        return new Response((await _fetch(`https://huggingface.co/datasets/Weblet/flan/resolve/main/onnxdecodermodelmergedquantizedonnx.gz`)).body.pipeThrough(new DecompressionStream("gzip")));
      }
      return _fetch.apply(this, arguments);
    };
  })();
  self.log = (msg) => {
    self.postMessage(msg);
  };

  // Create a text generation pipeline
  let generator;
  try {

    generator = (await pipeline('text2text-generation', 'Xenova/flan-alpaca-base'));


    // Generate text

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));





    // Generate a response
    if (/mobile/i.test(navigator.userAgent)) {
      const output = await generator("Once upon a time,", { max_new_tokens: 32, do_sample: true });
      log(output[0].generated_text.at(-1).content);
    } else {
      // Generate text
      const streamer = new TextStreamer(generator.tokenizer, {
        skip_prompt: true,
        callback_function: (token) => {
          log(token);
          context.push(token);
        }
      });
      const output = await generator(context.join(''), { max_length: 32, do_sample: true, top_k: 10, streamer });
      await log(context.join(' '));
      // await sleep(100);
      context.push(output[0].generated_text);
    }
  } catch (e) {
    log(e);
  }

})();