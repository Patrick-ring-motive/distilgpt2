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
document.getElementById('input')?.addEventListener?.('keydown', async (event) => {
  if (event.key === 'Enter') {
    await flan.ready;
    flan.postMessage(document.getElementById('input').value);
  }
});