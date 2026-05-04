export default async function handler(req, res) {

  // ✅ CORS FIX (IMPORTANT)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ✅ GET params (from your Lovable frontend)
  const { igId, imageUrl, caption, accessToken } = req.query;

  // fallback caption
  const finalCaption = caption || "";

  // ❌ validation
  if (!igId || !imageUrl || !accessToken) {
    return res.status(400).json({
      error: "Missing params",
      required: ["igId", "imageUrl", "accessToken"],
    });
  }

  try {
    // 🔹 STEP 1 — Create media container
    const createUrl =
      `https://graph.facebook.com/v25.0/${igId}/media` +
      `?image_url=${encodeURIComponent(imageUrl)}` +
      `&caption=${encodeURIComponent(finalCaption)}` +
      `&access_token=${accessToken}`;

    const createRes = await fetch(createUrl, {
      method: "POST",
    });

    const createData = await createRes.json();

    // ❌ fail check
    if (!createData.id) {
      return res.status(500).json({
        step: "create media failed",
        createUrl,
        response: createData,
      });
    }

    // 🔹 STEP 2 — Publish
    const publishUrl =
      `https://graph.facebook.com/v25.0/${igId}/media_publish` +
      `?creation_id=${createData.id}` +
      `&access_token=${accessToken}`;

    const publishRes = await fetch(publishUrl, {
      method: "POST",
    });

    const publishData = await publishRes.json();

    // ❌ fail check
    if (!publishData.id) {
      return res.status(500).json({
        step: "publish failed",
        publishUrl,
        response: publishData,
      });
    }

    // ✅ SUCCESS
    return res.status(200).json({
      success: true,
      postId: publishData.id,
      creationId: createData.id,
    });

  } catch (err) {
    return res.status(500).json({
      error: "Server crash",
      message: err.message,
    });
  }
}
