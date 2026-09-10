export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { prompt, image } = req.body || {};

    if (!prompt) {
      return res.status(400).json({
        error: "Video prompt is required."
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is not configured in Vercel."
      });
    }

    const body = {
      model:
        process.env.OPENAI_VIDEO_MODEL ||
        "sora-2",

      prompt,

      seconds: "4",

      size: "720x1280"
    };

    /*
     * If an image was uploaded, send it as a reference.
     */
    if (image) {
      body.input_reference = image;
    }

    const response = await fetch(
      "https://api.openai.com/v1/videos",
      {
        method: "POST",

        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },

        body: JSON.stringify(body)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);

      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "Video generation failed."
      });
    }

    return res.status(200).json({
      id: data.id,
      status: data.status || "queued"
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
