// YARUVA AI EDITOR

let originalImage = "";
let editedImage = "";

// Elements
const imageInput = document.getElementById("imageInput");
const imagePreview = document.getElementById("imagePreview");
const previewSection = document.getElementById("previewSection");

const promptInput = document.getElementById("promptInput");
const generateBtn = document.getElementById("generateBtn");

const resultPreview = document.getElementById("resultPreview");
const compareSection = document.getElementById("compareSection");

const videoPrompt = document.getElementById("videoPrompt");
const videoBtn = document.getElementById("videoBtn");
const videoStatus = document.getElementById("videoStatus");
const videoPreview = document.getElementById("videoPreview");


// -----------------------------
// IMAGE UPLOAD
// -----------------------------

if (imageInput) {

  imageInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {

      originalImage = event.target.result;

      if (imagePreview) {
        imagePreview.src = originalImage;
      }

      if (previewSection) {
        previewSection.hidden = false;
      }

      if (compareSection) {
        compareSection.hidden = true;
      }

    };

    reader.readAsDataURL(file);

  });

}


// -----------------------------
// PROMPT SUGGESTIONS
// -----------------------------

document.querySelectorAll("[data-prompt]").forEach(button => {

  button.addEventListener("click", () => {

    const prompt = button.dataset.prompt;

    if (promptInput) {
      promptInput.value = prompt;
      promptInput.focus();
    }

  });

});


// -----------------------------
// AI IMAGE EDIT
// -----------------------------

async function generateAIEdit(promptOverride = null) {

  if (!originalImage) {

    alert("Please upload an image first.");

    return;

  }

  const prompt =
    promptOverride ||
    promptInput.value.trim();

  if (!prompt) {

    alert("Tell YARUVA what you want to create.");

    return;

  }


  generateBtn.disabled = true;

  generateBtn.innerHTML =
    "YARUVA is creating…";


  try {

    const response = await fetch(
      "/api/edit-image",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          image: originalImage,

          prompt: prompt

        })

      }
    );


    const data = await response.json();


    if (!response.ok) {

      throw new Error(
        data.error ||
        "AI editing failed."
      );

    }


    editedImage =
      data.image ||
      data.result ||
      data.url;


    if (!editedImage) {

      throw new Error(
        "No edited image was returned."
      );

    }


    if (resultPreview) {

      resultPreview.src =
        editedImage;

    }


    if (compareSection) {

      compareSection.hidden =
        false;

    }


    saveProject(
      editedImage,
      prompt
    );


  } catch (error) {

    console.error(error);

    alert(
      error.message ||
      "Something went wrong."
    );

  } finally {

    generateBtn.disabled = false;

    generateBtn.innerHTML =
      "Generate with AI <b>→</b>";

  }

}


// -----------------------------
// GENERATE BUTTON
// -----------------------------

if (generateBtn) {

  generateBtn.addEventListener(
    "click",
    () => generateAIEdit()
  );

}


// -----------------------------
// AI MAGIC BUTTONS
// -----------------------------

const magicPrompts = {

  enhance:
    "Enhance this image with realistic details, sharpness, professional lighting and high-end quality.",

  cinematic:
    "Transform this image into a cinematic film still with dramatic lighting, realistic colors, depth and premium visual grading.",

  remove:
    "Remove distracting or unwanted background elements while keeping the main subject realistic and natural.",

  relight:
    "Relight this image with beautiful professional studio lighting while preserving the subject and realistic appearance.",

  luxury:
    "Give this image a premium luxury editorial appearance with sophisticated lighting, elegant tones and photorealistic detail.",

  portrait:
    "Transform this into a professional studio portrait with realistic skin, flattering lighting, depth and premium photography quality."

};


document.querySelectorAll(".magic-btn").forEach(button => {

  button.addEventListener("click", () => {

    const action =
      button.dataset.action;

    const prompt =
      magicPrompts[action];

    if (!prompt) return;

    if (promptInput) {
      promptInput.value = prompt;
    }

    generateAIEdit(prompt);

  });

});


// -----------------------------
// CREATE VIDEO
// -----------------------------

if (videoBtn) {

  videoBtn.addEventListener(
    "click",
    createVideo
  );

}


async function createVideo() {

  if (!originalImage) {

    alert(
      "Upload an image before creating a video."
    );

    return;

  }


  const prompt =
    videoPrompt.value.trim() ||
    "Create a cinematic realistic animation with natural movement and a slow camera motion.";


  videoBtn.disabled = true;

  videoBtn.innerHTML =
    "Creating video…";


  videoStatus.innerHTML =
    "<p>YARUVA is generating your video…</p>";


  try {

    const response = await fetch(
      "/api/video",
      {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          prompt: prompt,

          image: originalImage

        })

      }
    );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.error ||
        "Video generation failed."
      );

    }


    if (!data.id) {

      throw new Error(
        "Video job was not created."
      );

    }


    await pollVideo(data.id);


  } catch (error) {

    console.error(error);

    videoStatus.innerHTML =
      `<p>${escapeHtml(error.message)}</p>`;

  } finally {

    videoBtn.disabled = false;

    videoBtn.innerHTML =
      "Create AI Video <b>▶</b>";

  }

}


// -----------------------------
// VIDEO STATUS
// -----------------------------

async function pollVideo(id) {

  let attempts = 0;

  const maxAttempts = 120;


  while (attempts < maxAttempts) {

    attempts++;


    const response =
      await fetch(
        "/api/video-status?id=" +
        encodeURIComponent(id)
      );


    const data =
      await response.json();


    const status =
      data.status ||
      "processing";


    videoStatus.innerHTML =
      `<p>Video status: ${escapeHtml(status)}</p>`;


    if (
      status === "completed" ||
      status === "succeeded"
    ) {

      const videoUrl =
        "/api/video-content?id=" +
        encodeURIComponent(id);


      videoPreview.src =
        videoUrl;

      videoPreview.hidden =
        false;


      videoStatus.innerHTML =
        "<p>✓ Your AI video is ready.</p>";


      saveProject(
        videoUrl,
        promptForVideo()
      );


      return;

    }


    if (
      status === "failed" ||
      status === "cancelled"
    ) {

      throw new Error(
        "Video generation did not complete."
      );

    }


    await wait(5000);

  }


  throw new Error(
    "Video generation timed out. Please try again."
  );

}


function promptForVideo() {

  return (
    videoPrompt?.value?.trim() ||
    "AI generated video"
  );

}


// -----------------------------
// SAVE PROJECT
// -----------------------------

function saveProject(url, prompt) {

  try {

    const projects =
      JSON.parse(
        localStorage.getItem(
          "yaruva_projects"
        ) || "[]"
      );


    projects.unshift({

      id:
        Date.now(),

      type:
        url.includes("video")
          ? "video"
          : "image",

      url:
        url,

      prompt:
        prompt,

      createdAt:
        new Date().toISOString()

    });


    localStorage.setItem(
      "yaruva_projects",
      JSON.stringify(
        projects.slice(0, 30)
      )
    );

  } catch (error) {

    console.warn(
      "Could not save project",
      error
    );

  }

}


// -----------------------------
// EXPORT
// -----------------------------

const exportBtn =
  document.getElementById(
    "exportBtn"
  );


if (exportBtn) {

  exportBtn.addEventListener(
    "click",
    exportResult
  );

}


function exportResult() {

  const url =
    editedImage ||
    originalImage;


  if (!url) {

    alert(
      "Create or upload something first."
    );

    return;

  }


  const link =
    document.createElement("a");

  link.href =
    url;

  link.download =
    "YARUVA-Creation.png";

  document.body.appendChild(link);

  link.click();

  link.remove();

}


// -----------------------------
// HELPERS
// -----------------------------

function wait(ms) {

  return new Promise(
    resolve =>
      setTimeout(resolve, ms)
  );

}


function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}
