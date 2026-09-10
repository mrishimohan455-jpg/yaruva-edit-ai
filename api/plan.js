export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { prompt } = req.body || {};

    if (!prompt) {
      return res.status(400).json({
        error: "Prompt is required."
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is not configured in Vercel."
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },

        body: JSON.stringify({
          model:
            process.env.OPENAI_TEXT_MODEL ||
            "gpt-5.6-luna",

          input: [
            {
              role: "system",
              content:
                "You are YARUVA AI, a professional creative assistant. Help users plan image edits, creative concepts and short cinematic videos. Keep answers practical and concise."
            },
            {
              role: "user",
              content: prompt
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);

      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "AI planning failed."
      });
    }

    return res.status(200).json({
      text:
        data.output_text ||
        "YARUVA AI completed your request."
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
