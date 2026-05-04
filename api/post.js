export default async function handler(req, res) {

  // ✅ CORS FIX
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ✅ GET params (from frontend)
  const { igId, imageUrl, caption } = req.query;

  // 🔥 HARDCODE TOKEN (IMPORTANT)
  const accessToken = "EAANhAkRWdZAMBRULRQIhimt7KWUg0TE47GdHbX7mqvedmHwgw6YxcFdnwpUUdjTXLNPfXuo47v1UIFs1gP42vB1jUlSw9x2ZCWLYkYLgwGdrZCUt1yX0K7NuYT0b3mviQ8epkqwbcFu1CHRcMZBL95pgWX6sEDdOyIRM2UfJSmgLc90WaH5CnQTiar0fgWq5e7v6FqiDWjxYtejDgAsHMXRQFs5yKy4AGCeRQgZDZD";

  const finalCaption = caption || "";

  // ❌ validation (token removed from check)
  if (!igId || !imageUrl) {
    return res.status(400).json({
      error: "Missing params",
      required: ["igId", "imageUrl"],
    });
  }

  try {
    // 🔹 STEP 1 — Create media
    const createUrl =
      `https://graph.facebook.com/v25.0/${igId}/media` +
      `?image_url=${encodeURIComponent(imageUrl)}` +
      `&caption=${encodeURIComponent(finalCaption)}` +
      `&access_token=${accessToken}`;

    const createRes = await fetch(createUrl, {
      method: "POST",
    });

    const createData = await createRes.json();

    if (!createData.id) {
      return res.status(500).json({
        step: "create media failed",
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

    if (!publishData.id) {
      return res.status(500).json({
        step: "publish failed",
        response: publishData,
      });
    }

    // ✅ SUCCESS
    return res.status(200).json({
      success: true,
      postId: publishData.id,
    });

  } catch (err) {
    return res.status(500).json({
      error: "Server crash",
      message: err.message,
    });
  }
}
