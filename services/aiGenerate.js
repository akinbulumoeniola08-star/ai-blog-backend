const fetch = require("node-fetch");

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

async function generatePost(topic) {
  const prompt = `Write a complete, engaging blog post (500-700 words) about this trending topic: "${topic}".
Return your response as JSON only, with no markdown formatting, no code fences, in exactly this shape:
{"title": "a catchy blog post title", "content": "the full blog post text"}`;

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content;

  if (!rawText) {
    throw new Error("Groq returned no content");
  }

  const cleaned = rawText.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error("Failed to parse Groq response as JSON: " + cleaned.slice(0, 200));
  }

  if (!parsed.title || !parsed.content) {
    throw new Error("Groq response missing title or content");
  }

  return parsed;
}

module.exports = { generatePost };
