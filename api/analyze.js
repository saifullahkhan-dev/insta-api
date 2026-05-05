export default async function handler(req, res) {
  // ✅ CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const token = process.env.META_TOKEN;

    // 🔥 STEP 1: Get Instagram Business Account ID
    const igRes = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?fields=instagram_business_account&access_token=${token}`
    );
    const igData = await igRes.json();

    const igId =
      igData?.data?.[0]?.instagram_business_account?.id;

    if (!igId) {
      return res.status(400).json({
        error: "Instagram account not connected properly",
      });
    }

    // 🔥 STEP 2: Get profile data
    const profileRes = await fetch(
      `https://graph.facebook.com/v19.0/${igId}?fields=username,followers_count,follows_count,media_count&access_token=${token}`
    );
    const profile = await profileRes.json();

    // 🔥 STEP 3: Get media (posts)
    const mediaRes = await fetch(
      `https://graph.facebook.com/v19.0/${igId}/media?fields=like_count,comments_count,timestamp&limit=10&access_token=${token}`
    );
    const mediaData = await mediaRes.json();

    const posts = mediaData.data || [];

    // 🔥 STEP 4: Calculate metrics
    let totalLikes = 0;
    let totalComments = 0;

    posts.forEach((p) => {
      totalLikes += p.like_count || 0;
      totalComments += p.comments_count || 0;
    });

    const avgLikes = posts.length ? totalLikes / posts.length : 0;
    const avgComments = posts.length ? totalComments / posts.length : 0;

    const engagementRate =
      profile.followers_count > 0
        ? ((avgLikes + avgComments) / profile.followers_count) * 100
        : 0;

    // 🔥 STEP 5: Score logic (basic)
    let score = 50;
    if (engagementRate > 5) score = 90;
    else if (engagementRate > 3) score = 75;
    else if (engagementRate > 1) score = 60;

    // 🔥 STEP 6: Return real data
    return res.status(200).json({
      profile: {
        username: profile.username,
        followers: profile.followers_count,
        following: profile.follows_count,
        posts: profile.media_count,
      },
      metrics: {
        engagementRate: Number(engagementRate.toFixed(2)),
        avgLikes: Math.round(avgLikes),
        avgComments: Math.round(avgComments),
        postingFrequency: posts.length,
        growthRate: 0, // can add later
      },
      content: {
        reelsPercent: 0,
        postsPercent: 100,
      },
      insights: [
        engagementRate > 3
          ? "Strong engagement 👍"
          : "Increase engagement with better hooks",
      ],
      score,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch Instagram data",
      details: error.message,
    });
  }
}
