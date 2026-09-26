const fetch = require("node-fetch");

// Pulls the top trending post titles from a subreddit (free, no API key needed).
// Change "technology" to whatever niche your blog is about.
const SUBREDDIT = process.env.SUBREDDIT || "technology";

async function getTrendingTopic() {
  const url = `https://www.reddit.com/r/${SUBREDDIT}/top.json?limit=10&t=day`;
  const response = await fetch(url, {
    headers: { "User-Agent": "ai-blog-topic-fetcher/1.0" }
  });

  if (!response.ok) {
    throw new Error(`Reddit fetch failed: ${response.status}`);
  }

  const data = await response.json();
  const posts = data.data.children.map((child) => child.data.title);

  if (posts.length === 0) {
    throw new Error("No trending topics found");
  }

  return posts; // returns an array of candidate topic titles
}

module.exports = { getTrendingTopic };
