export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({
      message: "GET working ✅",
      example: "/api/post?test=hello",
      received: req.query,
    });
  }

  res.status(200).json({ message: "Only GET for now" });
}
