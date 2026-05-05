export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: "Username required" });
  }

  try {
    const response = await fetch(
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          "Accept": "*/*",
          "Accept-Language": "en-US,en;q=0.9",
          "X-Requested-With": "XMLHttpRequest",
          "Referer": "https://www.instagram.com/",
        },
      }
    );

    const text = await response.text();

    // 🔥 Prevent crash if blocked
    if (!text || text.startsWith("<!DOCTYPE")) {
      return res.status(500).json({
        error: "Instagram blocked request (try again later)",
      });
    }

    const data = JSON.parse(text);
    const user = data?.data?.user;

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const followers = user.edge_followed_by.count;
    const following = user.edge_follow.count;
    const posts = user.edge_owner_to_timeline_media.edges;

    let totalLikes = 0;
    let totalComments = 0;

    posts.slice(0, 10).forEach((post) => {
      totalLikes += post.node.edge_liked_by.count;
      totalComments += post.node.edge_media_to_comment.count;
    });

    const avgLikes = posts.length ? totalLikes / posts.length : 0;
    const avgComments = posts.length ? totalComments / posts.length : 0;

    const engagementRate =
      followers > 0
        ? ((avgLikes + avgComments) / followers) * 100
        : 0;

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
