export default async function handler(req, res) {
  if (req.method === "POST") {
    const data = req.body;

    return res.status(200).json({
      message: "POST received ✅",
      data: data,
    });
  }

  res.status(200).json({ message: "Use POST request" });
}
