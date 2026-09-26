const fetch = require("node-fetch");

// Uses Gemini's free-tier API. Set GEMINI_API_KEY as an environment variable on Render.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

async function generatePost(topic) {
  const prompt = `Write a complete, engaging blog post (500-700 words) about this trending topic: "${topic}".
Return your response as JSON only, with no markdown formatting, in exactly this shape:
{"title": "a catchy blog post title", "content": "the full blog post text"}`;

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error("Gemini returned no content");
  }

  // Strip accidental markdown code fences before parsing JSON
  const cleaned = rawText.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error("Failed to parse Gemini response as JSON: " + cleaned.slice(0, 200));
  }

  if (!parsed.title || !parsed.content) {
    throw new Error("Gemini response missing title or content");
  }

  return parsed; // { title, content }
}

module.exports = { generatePost };
