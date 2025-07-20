[Request, Response, Blob].forEach(res => {
  res.prototype.bytes ??= async function bytes() {
    return new Uint8Array(await this.arrayBuffer());
  };
});
if (!new Request("https://test.com", { method: "POST", body: "test" }).body) {
  Object.defineProperty(Request.prototype, "body", {
    get() {
      const $this = this;
      return new ReadableStream({
        async pull(controller) {
          controller.enqueue(await $this.bytes());
          controller.close();
        },
      });
    },
  });
}
ReadableStream.prototype[Symbol.asyncIterator] ??=
  async function* asyncIterator() {
    const reader = this?.getReader?.();
    try {
      let chunk = await reader.read();
      while (chunk?.done === false) {
        yield chunk?.value;
        chunk = await reader?.read?.();
      }
    } finally {
      reader?.releaseLock?.();
    }
  };

globalThis.requestAnimationFrame ??= (fn) => setTimeout(fn, 0);
globalThis.requestIdleCallback ??= globalThis.requestAnimationFrame;

globalThis.cancelAnimationFrame ??= (id) => clearTimeout(id);
globalThis.cancelIdleCallback ??= globalThis.cancelAnimationFrame;

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

    const fetchText = async (url) => {
      const response = await _fetch(url);
      const text = await response.text();
      return text;
    };

    const ungzip = (data) => {
      return new Response(new Response(data).body.pipeThrough(new DecompressionStream("gzip"))).bytes();
    };

    const fetchCoder = async (nums, pre, post) => {

      const parts = [];

      for (const x of nums) {
        const res = await _fetch(`https://patrick-ring-motive.github.io/distilgpt2/${pre}${x}${post}`);
        if (!res.ok) throw new Error(`https://patrick-ring-motive.github.io/distilgpt2/${pre}${x}${post}`);
        const gzData = new Uint8Array(await res.arrayBuffer());
        const raw = await ungzip(gzData);
        parts.push(raw);
      }

      const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const part of parts) {
        result.set(part, offset);
        offset += part.length;
      }
      return new Response(result);
    };

    const fetchEncoder = async () => {
      const chunks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(x => fetchText(`https://patrick-ring-motive.github.io/distilgpt2/encoder${x}.txt`));
      const data = 'data:text/plain;base64,' + (await Promise.all(chunks)).join('');
      return _fetch(data);
    };

    const fetchDecoder = async () => {
      const chunks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(x => fetchText(`https://patrick-ring-motive.github.io/distilgpt2/decoder${x}.txt`));
      const data = 'data:text/plain;base64,' + (await Promise.all(chunks)).join('');
      return _fetch(data);
    };

    const decoder = (b64) => {
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return bytes;
    };
    const fetchB64Encoder = async () => {
      const chunks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(x => fetchText(`https://patrick-ring-motive.github.io/distilgpt2/encoder${x}.txt`));
      const data = (await Promise.all(chunks)).join('');
      return new Response(decoder(data));
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
        //return await fetchCoder([0, 1, 2, 3, 4, 5], 'encoder_part_0', '.gz');
        return await fetchB64Encoder();
      }
      if (String(arguments[0]).includes('decoder')) {
        // return await fetchCoder([0, 1, 2, 3, 4, 5, 6], 'decoder_part_0', '.gz');
        return await fetchDecoder();
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