//text dedup

function textDedup(arr){
    for(let i = 0; i < arr.length; i++){
        for(let x = i+1; x < arr.length;x++){
            for(let o = x-i;o>1;o--){
                if(arr.slice(i,i+o).join('') == arr.slice(x,x+o).join('')){
                    arr.splice(x,o);
                    return textDedup(arr);
                }
            }
        }
    }
    return arr;
}

let context = [];

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
self.write = () => {
  const output = (
    document.querySelector("output") ??
    document.getElementsByTagName("output")?.[0] ??
    {}
  );
  output.innerHTML = textDedup(context.filter(x=>x)).join(' ');
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
let justSent = true;
flan.onmessage = (() => {
  if (justSent) {
    justSent = false;
   // context = [];
  }
  let ready = false;
  return (e) => {
    if (e.data === "ready" && !ready) {
      ready = true;
      log('|ready|');
      return flan?.resolve?.(true);
    };
    context.push(e.data);
    textDedup(context.filter(x=>x));
    write();
  };
})();

document.getElementsByTagName('button')?.[0]?.addEventListener?.('click', async () => {
  await flan.ready;
  context.push(document.getElementById('input').value);
  flan.postMessage(textDedup(context.filter(x=>x)).join(' ').trim());
});
document.getElementById('input')?.addEventListener?.('keydown', async (event) => {
  if (event.key === 'Enter') {
    await flan.ready;
    textDedup(context.filter(x=>x)).push(document.getElementById('input').value);
    flan.postMessage(document.getElementById('input').value);
    justSent = true;
  }
});
