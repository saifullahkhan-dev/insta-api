export default async function handler(req, res) {
  const token = req.query.token;

  const response = await fetch(
    `https://graph.facebook.com/v25.0/me/accounts?access_token=${token}`
  );

  const data = await response.json();

  res.status(200).json(data);
}
