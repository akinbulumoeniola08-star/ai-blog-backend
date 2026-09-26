const express = require("express");
const cors = require("cors");
const { pool, ensureSchema } = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// Health check - visiting the root URL should just show this works
app.get("/", (req, res) => {
  res.send("AI Blog backend is running.");
});

// Get all posts, newest first (this is what your Netlify site will call)
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

// Get a single post by id (for a post detail page)
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
