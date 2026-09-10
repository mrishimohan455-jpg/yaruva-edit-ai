export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        error: "Video ID is required."
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is not configured in Vercel."
      });
    }

    const response = await fetch(
      `https://api.openai.com/v1/videos/${encodeURIComponent(id)}/content`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      return res.status(response.status).json({
        error: errorText || "Unable to retrieve video."
      });
    }

    const contentType =
      response.headers.get("content-type") ||
      "video/mp4";

    res.setHeader(
      "Content-Type",
      contentType
    );

    res.setHeader(
      "Cache-Control",
      "no-store"
    );

    const buffer =
      Buffer.from(
        await response.arrayBuffer()
      );

    return res.status(200).send(buffer);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error:
        error.message ||
        "Unexpected server error."
    });
  }
}
