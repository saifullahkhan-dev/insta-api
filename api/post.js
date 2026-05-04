export default async function handler(req, res) {
  const { igId, imageUrl, caption, accessToken } = req.body;

  // Step 1: create media container
  const createRes = await fetch(
    `https://graph.facebook.com/v25.0/${igId}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: imageUrl,
        caption: caption,
        access_token: accessToken,
      }),
    }
  );

  const createData = await createRes.json();

  // Step 2: publish
  const publishRes = await fetch(
    `https://graph.facebook.com/v25.0/${igId}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: createData.id,
        access_token: accessToken,
      }),
    }
  );

  const publishData = await publishRes.json();

  res.json({
    success: true,
    postId: publishData.id,
  });
}
