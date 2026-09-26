const { pool, ensureSchema } = require("../db");
const { getTrendingTopic } = require("../services/topicSource");
const { generatePost } = require("../services/aiGenerate");

async function alreadyPosted(topic) {
  // Checks the last 20 post titles to avoid repeating a topic
  const result = await pool.query(
    "SELECT topic FROM posts ORDER BY created_at DESC LIMIT 20"
  );
  const recentTopics = result.rows.map((r) => (r.topic || "").toLowerCase());
  return recentTopics.some((t) => t === topic.toLowerCase());
}

async function run() {
  try {
    await ensureSchema();

    const candidates = await getTrendingTopic();

    // Find the first candidate topic that hasn't been used recently
    let chosenTopic = null;
    for (const candidate of candidates) {
      const used = await alreadyPosted(candidate);
      if (!used) {
        chosenTopic = candidate;
        break;
      }
    }

    if (!chosenTopic) {
      console.log("All candidate topics were recently posted. Skipping this run.");
      process.exit(0);
    }

    console.log("Generating post for topic:", chosenTopic);
    const { title, content } = await generatePost(chosenTopic);

    await pool.query(
      "INSERT INTO posts (title, content, topic, source) VALUES ($1, $2, $3, $4)",
      [title, content, chosenTopic, "reddit"]
    );

    console.log("Post published:", title);
    process.exit(0);
  } catch (err) {
    // Log and exit cleanly - never crash the whole cron job
    console.error("generatePost job failed:", err.message);
    process.exit(0);
  }
}

run();
