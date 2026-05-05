export async function GET(request, { params }) {
  const { username } = params;

  return Response.json({
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
