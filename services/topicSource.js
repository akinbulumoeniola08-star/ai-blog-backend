const fetch = require("node-fetch");

const COUNTRY = process.env.TRENDS_COUNTRY || "US";

async function getTrendingTopic() {
  const url = `https://trends.google.com/trending/rss?geo=${COUNTRY}`;
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; ai-blog-topic-fetcher/1.0)" }
  });

  if (!response.ok) {
    throw new Error(`Google Trends fetch failed: ${response.status}`);
  }

  const xml = await response.text();

  const matches = [...xml.matchAll(/<item>[\s\S]*?<title>([\s\S]*?)<\/title>/g)];
  const topics = matches
    .map((m) => m[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim())
    .filter(Boolean);

  if (topics.length === 0) {
    throw new Error("No trending topics found in Google Trends feed");
  }

  return topics.slice(0, 10);
}

module.exports = { getTrendingTopic };
