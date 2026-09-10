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
      `https://api.openai.com/v1/videos/${encodeURIComponent(id)}`,
      {
        method: "GET",

        headers: {
          "Authorization": `Bearer ${apiKey}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);

      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "Unable to check video status."
      });
    }

    return res.status(200).json({
      id: data.id,
      status: data.status,
      progress: data.progress ?? null,
      error: data.error ?? null
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error:
        error.message ||
        "Unexpected server error."
    });
  }
}
