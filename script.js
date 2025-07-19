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
const myWorker = new Worker("flan-alpaca-base.js");

myWorker.onmessage = (e) => {
  log(e.data);
  console.log("Message received from worker");
};

