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
const flan = new Worker("flan-alpaca-base.js");

flan.ready = new Promise((resolve) => {
  flan.resolve = resolve;
});

flan.onmessage = (e) => {
  log(e.data);
  if (e.data === "ready") {
    flan?.resolve?.(true);
  };
};

document.getElementsByTagName('button')?.[0]?.addEventListener?.('click', async () => {
  await flan.ready;
  flan.postMessage(document.getElementById('input').value);
});
