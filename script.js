self.log = (e) => {
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
const myWorker = new Worker("worker.js");

myWorker.onmessage = (e) => {
  log(e.data);
  console.log("Message received from worker");
};

const fetchChunk = async (url) => {
  const response = await fetch(url);
  const bytes = await response.bytes();
  return bytes;
};

const fetchEncoder = async () => {
  const chunks = [0, 1, 2, 3].map(x => fetchChunk(`https://patrick-ring-motive.github.io/distilgpt2/encoder_chunk0${x}.txt`));
  const bytes = await Promise.all(chunks);
  return new Response(new Response(new Uint8Array((await Promise.all(bytes.flat())).flat()).body.pipeThrough(new DecompressionStream("gzip"))).body);
};

