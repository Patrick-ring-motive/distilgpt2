const unquote = x => String(x).replace(/^[\s"'`]+|[\s"'`]+$/g, '');

const lower = x => String(x).toLowerCase();

const cap = x => [...String(x)].map((x, i) => (!i) ? x.toUpperCase() : x).join('');

const uncap = x => [...String(x)].map((x, i, a) => (a.slice(1).every(y => y == y.toLowerCase()) && !i) ? x.toLowerCase() : x).join('');

const beReg = /^(is|am|are|were|was|will|did|do|does|can|may|would|could|have|say|get|make|go|know|take|see|come|think|look|want|give|use|find|tell|ask|work|seem|feel|try|leave|call|has)[a-z]+/i;
const wReg = /^(w|h)[a-z]+/i;

function questionToAnswer(text, answer) {
  if (/\sor\s/i.test(text)) return answer;
  answer = unquote(answer);
  text = unquote(text);
  const words = text.split(/\s+/);
  const q0 = unquote(`${words.shift()}`);
  console.log(words);
  let be = q0;
  if (!beReg.test(q0) && wReg.test(q0)) {
    be = unquote(`${words.shift()}`);
  }
  let sent = ` ${words.join(' ').trim().replace(/\?$/,'')} ${be} ${uncap(answer)}.` + 0;

  if (/^(of|a|the)$/i.test(be) || (/^(of)$/i.test(words[0]))) {
    sent = (`${answer} is ${lower(be)} ${words.join(' ')}`.trim().replace(/\?$/, '.')) + 1;
  } else if (/^(did|do|does)$/i.test(be)) {
    let subject = String(String(text.split(` ${be} `).pop()).split(/\s|$/).shift());
    sent = `${subject} ${be} ${words.join(' ').replace(subject,'').replace(/[\.\?\!]$/,'')} ${uncap(answer)}.` + 2;
  } else {
    if (words.some(x => beReg.test(x))) {
      let word = words.find(x => beReg.test(x));
      let subject = text.slice(text.indexOf(word)).replace(word, '');
      sent = `${subject.replace(/[\.\?\!]$/,'')} ${word} ${uncap(answer)}.` + 3;
    } else {
      sent = ` ${words.join(' ').trim().replace(/\?$/,'')} ${be} is ${uncap(answer)}.` + 4;
    }
  }
  sent = sent.split(' ').map((x, i, a) => (lower(x) == lower(a[i - 1])) ? '' : x).join(' ').trim().replace(/\s+/g, ' ');
  console.log(cap(sent));

}

const questions = [
  ["Color of the sky?", "Blue"],
  ["Opposite of black?", "White"],
  ["Is water wet?", "Yes"],
  ["Shape of Earth?", "Round"],
  ["A liquid?", "Water"],
  ["A fruit?", "Apple"],
  ["A metal?", "Gold"],
  ["Hot or cold?", "Hot"],
  ["Up or down?", "Up"],
  ["Yes or no?", "Yes"],
  ["What is the capital of France?", "Paris"],
  ["What is the primary color of the ocean?", "Blue"],
  ["What is the opposite of a hot temperature?", "Cold"],
  ["What do bees make?", "Honey"],
  ["What is the shape of a standard basketball?", "Round"],
  ["What do you call frozen water?", "Ice"],
  ["What brightly colored bird mimics speech?", "Parrot"],
  ["What is a common name for table salt?", "SodiumChloride"],
  ["What is the largest planet in our solar system?", "Jupiter"],
  ["What direction does the sun rise?", "East"],
  ["What is the name of the Earth's only natural satellite?", "Moon"]
];

for (const ques of questions) {
  questionToAnswer(ques[0], ques[1]);
}
