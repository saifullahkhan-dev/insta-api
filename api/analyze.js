export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: "Username required" });
  }

  try {
    const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`;

    // 🔥 Use proxy from server (not browser)
    const proxyUrl = `https://thingproxy.freeboard.io/fetch/${url}`;

    const response = await fetch(proxyUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });

    const text = await response.text();

    if (!text || text.startsWith("<!DOCTYPE")) {
      throw new Error("Blocked response");
    }

    const data = JSON.parse(text);
    const user = data?.data?.user;

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const posts = user.edge_owner_to_timeline_media.edges || [];

    let totalLikes = 0;
    let totalComments = 0;

    posts.slice(0, 10).forEach((post) => {
      totalLikes += post.node.edge_liked_by.count;
      totalComments += post.node.edge_media_to_comment.count;
    });

    const avgLikes = posts.length ? totalLikes / posts.length : 0;
    const avgComments = posts.length ? totalComments / posts.length : 0;

    const engagementRate =
      user.edge_followed_by.count > 0
        ? ((avgLikes + avgComments) / user.edge_followed_by.count) * 100
        : 0;

    return res.status(200).json({
      profile: {
        username: user.username,
        followers: user.edge_followed_by.count,
        following: user.edge_follow.count,
        posts: user.edge_owner_to_timeline_media.count
      },
      metrics: {
        engagementRate: Number(engagementRate.toFixed(2)),
        avgLikes: Math.round(avgLikes),
        avgComments: Math.round(avgComments),
        postingFrequency: posts.length,
        growthRate: 0
      },
      score: Math.min(100, Math.round(engagementRate * 10)),
      insights: [
        engagementRate > 3
          ? "Good engagement"
          : "Needs improvement"
      ]
    });

  } catch (err) {
    return res.status(500).json({
      error: "Failed to fetch Instagram data",
      details: err.message,
    });
  }
}
