const { pool } = require("../db");
const { getTrendingTopic } = require("./topicSource");
const { generatePost } = require("./aiGenerate");

async function alreadyPosted(topic) {
  const result = await pool.query(
    "SELECT topic FROM posts ORDER BY created_at DESC LIMIT 20"
  );
  const recentTopics = result.rows.map((r) => (r.topic || "").toLowerCase());
  return recentTopics.some((t) => t === topic.toLowerCase());
}

async function generateAndSave() {
  const candidates = await getTrendingTopic();

  let chosenTopic = null;
  for (const candidate of candidates) {
    const used = await alreadyPosted(candidate);
    if (!used) {
      chosenTopic = candidate;
      break;
    }
  }

  if (!chosenTopic) {
    return { skipped: true, reason: "All candidate topics were recently posted" };
  }

  const { title, content } = await generatePost(chosenTopic);

  await pool.query(
    "INSERT INTO posts (title, content, topic, source) VALUES ($1, $2, $3, $4)",
    [title, content, chosenTopic, "reddit"]
  );

  return { skipped: false, title, topic: chosenTopic };
}

module.exports = { generateAndSave };
