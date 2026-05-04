export default async function handler(req, res) {
  const { igId, imageUrl, caption, accessToken } = req.query;

  // Check if all params exist
  if (!igId || !imageUrl || !caption || !accessToken) {
    return res.status(400).json({
      error: "Missing parameters. Need igId, imageUrl, caption, accessToken",
    });
  }

  try {
    // STEP 1: Create media
    const createRes = await fetch(
      `https://graph.facebook.com/v25.0/${igId}/media?image_url=${encodeURIComponent(
        imageUrl
      )}&caption=${encodeURIComponent(
        caption
      )}&access_token=${accessToken}`
    );

    const createData = await createRes.json();

    // Check error
    if (!createData.id) {
      return res.json({
        step: "create media failed",
        createData,
      });
    }

    // STEP 2: Publish media
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
  } catch (error) {
    return res.status(500).json({
      error: "Something went wrong",
      details: error.message,
    });
  }
}
