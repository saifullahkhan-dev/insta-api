export default async function handler(req, res) {
  // ✅ ADD THIS (CORS fix)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  return res.status(200).json({
    profile: {
      username,
      followers: 1000,
      following: 100,
      posts: 50
    },
    metrics: {
      engagementRate: 3.2,
      avgLikes: 120,
      avgComments: 10,
      postingFrequency: 3,
      growthRate: 1.5
    },
    content: {
      reelsPercent: 60,
      postsPercent: 40
    },
    insights: [
      `Analysis for ${username}`,
      "Post more consistently"
    ],
    score: 75
  });
}
