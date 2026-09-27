const express = require("express");
const cors = require("cors");
const { pool, ensureSchema } = require("./db");
const { generateAndSave } = require("./services/generateAndSave");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI Blog backend is running.");
});

app.get("/api/posts", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, title, content, topic, created_at FROM posts ORDER BY created_at DESC LIMIT 50"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

app.get("/api/posts/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM posts WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching post:", err);
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

app.get("/api/generate", async (req, res) => {
  const secret = req.query.secret;
  if (!process.env.GENERATE_SECRET || secret !== process.env.GENERATE_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const result = await generateAndSave();
    console.log("Generate result:", result);
    res.json(result);
  } catch (err) {
    console.error("Generate failed:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;

ensureSchema()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to set up database schema:", err);
    process.exit(1);
  });
