export default async function handler(req, res) {
  const { igId, imageUrl, caption, accessToken } = req.query;

  if (!igId || !imageUrl || !accessToken) {
    return res.status(400).json({ error: "Missing params" });
  }

  try {
    // ✅ STEP 1: Create media container
    const createUrl = `https://graph.facebook.com/v25.0/${igId}/media?image_url=${encodeURIComponent(imageUrl)}&caption=${encodeURIComponent(caption)}&access_token=${accessToken}`;

    const createRes = await fetch(createUrl, {
      method: "POST",
    });

    const createData = await createRes.json();

    if (!createData.id) {
      return res.status(500).json({
        step: "create media failed",
        error: createData,
      });
    }

    // ✅ STEP 2: Publish post
    const publishUrl = `https://graph.facebook.com/v25.0/${igId}/media_publish?creation_id=${createData.id}&access_token=${accessToken}`;

    const publishRes = await fetch(publishUrl, {
      method: "POST",
    });

    const publishData = await publishRes.json();

    return res.status(200).json({
      success: true,
      createData,
      publishData,
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}
