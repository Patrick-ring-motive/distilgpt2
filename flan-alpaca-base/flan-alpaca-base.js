

const context = [];
(async () => {
  await import('https://cdn.jsdelivr.net/npm/javaxscript/common-fills.js');
  const { pipeline, TextStreamer } = await import('../transformers.js');
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
      },
      async delete(key) {
        await this.init();
        return await this.box.delete(key);
      },
      async matchAll(filter) {
        filter ??= () => true;
        await this.init();
        return [...(await this.box.matchAll())].filter(x => filter(x.url ?? x));
      },
      async keys(filter) {
        filter ??= () => true;
        await this.init();
        return [...(await this.box.keys())].filter(x => filter(x.url ?? x));
      },
      async deleteAll(filter) {
        filter ??= () => true;
        await this.init();
        return await Promise.all((await this.keys(filter)).map(x => this.delete(x.url ?? x)));
      }
    };



    const cacheText = async (url) => {
      const cached = await cache.get(url);
      if (cached) {
        return await cached.clone().text();
      }
      let response = await _fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url} ${response.statusText}`);
      }
      response = new Response(response.body.pipeThrough(new DecompressionStream("gzip")));
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

    const loc = location.href.split('/');
    loc.pop();
    const root = loc.join('/');

    const fetchB64Encoder = async () => {
      const chunks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(x => cacheText(`${root}/code_chunks/encoder${x}.txt.gz`));
      const data = (await Promise.all(chunks)).join('');
      const res = new Response(decode64(data));
      cache.deleteAll(x => x.includes('encoder'));
      return res;
    };

    const fetchB64Decoder = async () => {
      const chunks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(x => cacheText(`${root}/code_chunks/decoder${x}.txt.gz`));
      const data = (await Promise.all(chunks)).join('');
      const res = new Response(decode64(data));
      cache.deleteAll(x => x.includes('decoder'));
      return res;
    };


    globalThis.fetch = async function fetch() {
      if (String(arguments[0]).endsWith('ort-wasm-simd-threaded.jsep.wasm')) {
        return new Response((await _fetch(`${root}/ort-wasm-simd-threaded.jsep.wasm.gz`)).body.pipeThrough(new DecompressionStream("gzip")), { headers: { "content-type": "application/wasm" } });
      }
      if (String(arguments[0]).endsWith('tokenizer_config.json')) {
        return new Response((await _fetch(`${root}/tokenizerconfigjson.gz`)).body.pipeThrough(new DecompressionStream("gzip")));
      }
      if (String(arguments[0]).endsWith('config.json')) {
        return new Response((await _fetch(`${root}/configjson.gz`)).body.pipeThrough(new DecompressionStream("gzip")));
      }
      if (String(arguments[0]).endsWith('tokenizer.json')) {
        return new Response((await _fetch(`${root}/tokenizerjson.gz`)).body.pipeThrough(new DecompressionStream("gzip")));
      }
      if (String(arguments[0]).includes('encoder')) {
        return await fetchB64Encoder();
      }
      if (String(arguments[0]).includes('decoder')) {
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

    // Generate text
    const genNext = async (txt) => {
      const streamer = new TextStreamer(generator.tokenizer, {
        skip_prompt: true,
        callback_function: (token) => {
          log(token);
          context.push(token);
        }
      });
      const output = await generator(txt, {
        max_length: 32+String(txt).split(' ').length,
        do_sample: false,
        top_k: 10,
        streamer
      });
    };
    self.onmessage = async (event) => await genNext(event.data);
  } catch (e) {
    log(e);
  }

  postMessage('ready');
})();