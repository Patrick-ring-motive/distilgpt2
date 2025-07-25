const context = [];
self.log = (e) => {
  if (/error/i.test(e?.constructor?.name)) {
    console.warn(e);
  } else {
    console.log(e);
  }
  (
    document.querySelector("output") ??
    document.getElementsByTagName("output")?.[0] ??
    {}
  ).innerHTML += (" " + (e.message ?? e));
};
window.addEventListener("error", function(e) {
  log(e?.message);
  [...arguments].forEach((x) => {
    log("window error " + (x?.message ?? x));
  });
});
const flan = new Worker("./flan-alpaca-base/flan-alpaca-base.js");

flan.ready = new Promise((resolve) => {
  flan.resolve = resolve;
});

flan.onmessage = (() => {
  let ready = false;
  return (e) => {
    log(e.data);
    if (e.data === "ready" && !ready) {
      ready = true;
      return flan?.resolve?.(true);
    };
    context.push(e.data)
  };
})();
document.getElementsByTagName('button')?.[0]?.addEventListener?.('click', async () => {
  await flan.ready;
  context.push(document.getElementById('input').value);
  flan.postMessage(context.join(' ').trim());
});
document.getElementById('input')?.addEventListener?.('keydown', async (event) => {
  if (event.key === 'Enter') {
    await flan.ready;
    context.push(document.getElementById('input').value);
    flan.postMessage(context.join(' ').trim());
  }
});