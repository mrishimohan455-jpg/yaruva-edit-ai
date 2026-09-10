export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { image, prompt } = req.body || {};

    if (!image || !prompt) {
      return res.status(400).json({
        error: "Image and prompt are required."
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
            process.env.OPENAI_IMAGE_MODEL ||
            "gpt-image-2",

          input: [
            {
              role: "user",
              content: [
                {
                  type: "input_text",
                  text: prompt
                },
                {
                  type: "input_image",
                  image_url: image
                }
              ]
            }
          ],

          tools: [
            {
              type: "image_generation"
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
          "OpenAI image generation failed."
      });
    }

    const imageTool =
      data.output?.find(
        item =>
          item.type === "image_generation_call"
      );

    if (!imageTool?.result) {
      return res.status(500).json({
        error:
          "The AI did not return an edited image."
      });
    }

    return res.status(200).json({
      image:
        `data:image/png;base64,${imageTool.result}`
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
