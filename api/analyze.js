export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: "Username required" });
  }

  try {
    // 🔥 Fetch public Instagram page
    const htmlRes = await fetch(`https://www.instagram.com/${username}/`);
    const html = await htmlRes.text();

    // 🔥 Extract JSON from page
    const jsonMatch = html.match(/window\._sharedData = (.*?);<\/script>/);

    if (!jsonMatch) {
      return res.status(500).json({ error: "Failed to extract data" });
    }

    const data = JSON.parse(jsonMatch[1]);
    const user = data.entry_data.ProfilePage[0].graphql.user;

    const followers = user.edge_followed_by.count;
    const following = user.edge_follow.count;
    const posts = user.edge_owner_to_timeline_media.edges;

    let totalLikes = 0;
    let totalComments = 0;

    posts.slice(0, 10).forEach((post) => {
      totalLikes += post.node.edge_liked_by.count;
      totalComments += post.node.edge_media_to_comment.count;
    });

    const avgLikes = totalLikes / posts.length;
    const avgComments = totalComments / posts.length;

    const engagementRate =
      ((avgLikes + avgComments) / followers) * 100;

    return res.status(200).json({
      profile: {
        username,
        followers,
        following,
        posts: posts.length,
      },
      metrics: {
        engagementRate: Number(engagementRate.toFixed(2)),
        avgLikes: Math.round(avgLikes),
        avgComments: Math.round(avgComments),
        postingFrequency: posts.length,
        growthRate: 0,
      },
      content: {
        reelsPercent: 0,
        postsPercent: 100,
      },
      insights: [
        engagementRate > 3
          ? "Good engagement"
          : "Needs improvement",
      ],
      score: Math.min(100, Math.round(engagementRate * 10)),
    });

  } catch (err) {
    return res.status(500).json({
      error: "Failed to fetch Instagram data",
      details: err.message,
    });
  }
}
