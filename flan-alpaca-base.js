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

    const cache = {
      async init() {
        if (!cache.box) {
          cache.box = caches.open('chunk-cache');
        }
        if (cache.box instanceof Promise) {
          cache.box = await cache.box;
        }
        return cache.box;
      },
      async get(key) {
        await this.init();
        return (await this.box.match(key))?.clone?.();
      },
      async set(key, value) {
        await this.init();
        return await this.box.put(key, (await value)?.clone?.());
      }
    };



    const cacheText = async (url) => {
      const cached = await cache.get(url);
      if (cached) {
        return await cached.clone().text();
      }
      const response = await _fetch(url);
      cache.set(url, response.clone());
      const text = await response.text();
      return text;
    };

    const decode64 = (b64) => {
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      const len = binary.length;
      for (let i = 0; i !== len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    };

    const fetchB64Encoder = async () => {
      const chunks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(x => cacheText(`https://patrick-ring-motive.github.io/distilgpt2/encoder${x}.txt`));
      const data = (await Promise.all(chunks)).join('');
      return new Response(decode64(data));
    };

    const fetchB64Decoder = async () => {
      const chunks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(x => cacheText(`https://patrick-ring-motive.github.io/distilgpt2/decoder${x}.txt`));
      const data = (await Promise.all(chunks)).join('');
      return new Response(decode64(data));
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
        return await fetchB64Decoder();
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