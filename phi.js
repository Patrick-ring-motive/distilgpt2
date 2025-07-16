import { pipeline, TextStreamer } from "@huggingface/transformers";

// Create a text generation pipeline
const generator = await pipeline(
  "text-generation",
  "Xenova/Phi-3-mini-4k-instruct",
);

// Define the list of messages
const messages = [
  { role: "user", content:  "Solve the equation: x^2 - 3x + 2 = 0" },
];

// Create text streamer
const streamer = new TextStreamer(generator.tokenizer, {
  skip_prompt: true,
  // callback_function: (text) => { }, // Optional callback function
})

// Generate a response
const output = await generator(messages, { max_new_tokens: 512, do_sample: false, streamer });
console.log(output[0].generated_text.at(-1).content);