export default async function handler(req, res) {
  const { igId, imageUrl, caption, accessToken } = req.query;

  if (!igId || !imageUrl || !caption || !accessToken) {
    return res.status(400).json({
      error: "Missing parameters",
    });
  }

  // Step 1: create media
  const createRes = await fetch(
    `https://graph.facebook.com/v25.0/${igId}/media?image_url=${imageUrl}&caption=${caption}&access_token=${accessToken}`
  );

  const createData = await createRes.json();

  // Step 2: publish
  const publishRes = await fetch(
    `https://graph.facebook.com/v25.0/${igId}/media_publish?creation_id=${createData.id}&access_token=${accessToken}`
  );

  const publishData = await publishRes.json();

  return res.json({
    success: true,
    postId: publishData.id,
    createData,
    publishData,
  });
}
