const imageInput = document.getElementById("imageInput");
const uploadBtn = document.getElementById("uploadBtn");
const uploadBox = document.getElementById("uploadBox");
const previewCard = document.getElementById("previewCard");
const previewImage = document.getElementById("previewImage");
const changeImageBtn = document.getElementById("changeImageBtn");

const promptInput = document.getElementById("promptInput");
const generateBtn = document.getElementById("generateBtn");

const resultSection = document.getElementById("resultSection");
const resultImage = document.getElementById("resultImage");
const resultPrompt = document.getElementById("resultPrompt");

const saveProjectBtn = document.getElementById("saveProjectBtn");
const exportBtn = document.getElementById("exportBtn");

const videoPrompt = document.getElementById("videoPrompt");
const videoBtn = document.getElementById("videoBtn");
const videoStatus = document.getElementById("videoStatus");
const videoResult = document.getElementById("videoResult");

let currentImage = "";
let generatedImage = "";


/* =========================
   IMAGE UPLOAD
   ========================= */

uploadBtn?.addEventListener("click", () => {
  imageInput?.click();
});

changeImageBtn?.addEventListener("click", () => {
  imageInput?.click();
});

imageInput?.addEventListener("change", event => {
  const file = event.target.files?.[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please choose an image file.");
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    currentImage = reader.result;

    previewImage.src = currentImage;

    uploadBox.hidden = true;
    previewCard.hidden = false;

    const status = document.getElementById("imageStatus");

    if (status) {
      status.textContent = "Image ready";
    }
  };

  reader.readAsDataURL(file);
});


/* =========================
   DRAG & DROP
   ========================= */

uploadBox?.addEventListener("dragover", event => {
  event.preventDefault();
  uploadBox.style.transform = "scale(.99)";
});

uploadBox?.addEventListener("dragleave", () => {
  uploadBox.style.transform = "";
});

uploadBox?.addEventListener("drop", event => {
  event.preventDefault();

  uploadBox.style.transform = "";

  const file = event.dataTransfer.files?.[0];

  if (!file || !file.type.startsWith("image/")) {
    alert("Please drop an image.");
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    currentImage = reader.result;

    previewImage.src = currentImage;

    uploadBox.hidden = true;
    previewCard.hidden = false;

    const status = document.getElementById("imageStatus");

    if (status) {
      status.textContent = "Image ready";
    }
  };

  reader.readAsDataURL(file);
});


/* =========================
   PROMPT SUGGESTIONS
   ========================= */

document.querySelectorAll("[data-prompt]").forEach(button => {
  button.addEventListener("click", () => {
    promptInput.value = button.dataset.prompt || "";
    promptInput.focus();
  });
});


/* =========================
   AI MAGIC
   ========================= */

document.querySelectorAll("[data-magic]").forEach(button => {
  button.addEventListener("click", () => {

    promptInput.value = button.dataset.magic || "";

    promptInput.focus();

    document.querySelector(".ai-prompt")?.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  });
});


/* =========================
   AI IMAGE GENERATION
   ========================= */

generateBtn?.addEventListener("click", generateImage);

async function generateImage() {

  if (!currentImage) {
    alert("Please upload an image first.");
    return;
  }

  const prompt = promptInput.value.trim();

  if (!prompt) {
    alert("Tell YARUVA what you want to create.");
    promptInput.focus();
    return;
  }

  const originalText = generateBtn.innerHTML;

  generateBtn.disabled = true;
  generateBtn.innerHTML = `
    <span>Creating…</span>
    <b>✦</b>
  `;

  try {

    const response = await fetch("/api/edit-image", {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        image: currentImage,
        prompt
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error ||
        "YARUVA could not generate the image."
      );
    }

    if (!data.image) {
      throw new Error(
        "No generated image was returned."
      );
    }

    generatedImage = data.image;

    resultImage.src = generatedImage;

    resultPrompt.textContent = prompt;

    resultSection.hidden = false;

    resultSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  } catch (error) {

    console.error(error);

    alert(
      error.message ||
      "Something went wrong while creating your image."
    );

  } finally {

    generateBtn.disabled = false;
    generateBtn.innerHTML = originalText;
  }
}


/* =========================
   SAVE PROJECT
   ========================= */

saveProjectBtn?.addEventListener("click", saveProject);

function saveProject() {

  if (!generatedImage) {
    alert("Generate an image first.");
    return;
  }

  const projects =
    JSON.parse(
      localStorage.getItem("yaruvaProjects") || "[]"
    );

  const project = {
    id: Date.now(),
    title: "YARUVA Creation",
    prompt: promptInput.value.trim(),
    image: generatedImage,
    createdAt: new Date().toISOString()
  };

  projects.unshift(project);

  localStorage.setItem(
    "yaruvaProjects",
    JSON.stringify(projects.slice(0, 30))
  );

  saveProjectBtn.textContent = "✓ Saved";

  setTimeout(() => {
    saveProjectBtn.textContent = "Save project";
  }, 1800);
}


/* =========================
   EXPORT
   ========================= */

exportBtn?.addEventListener("click", () => {

  if (!generatedImage) {
    alert("Create an image first.");
    return;
  }

  const link = document.createElement("a");

  link.href = generatedImage;
  link.download = "yaruva-ai-creation.png";

  document.body.appendChild(link);

  link.click();

  link.remove();
});


/* =========================
   IMAGE → VIDEO
   ========================= */

videoBtn?.addEventListener("click", createVideo);

async function createVideo() {

  if (!currentImage) {
    alert("Upload an image first.");
    return;
  }

  const prompt =
    videoPrompt.value.trim() ||
    "Create a cinematic animation from this image with subtle camera movement and natural motion.";

  const originalText = videoBtn.innerHTML;

  videoBtn.disabled = true;

  videoBtn.innerHTML = `
    Creating video…
    <b>▶</b>
  `;

  videoStatus.hidden = false;
  videoStatus.textContent =
    "YARUVA is preparing your cinematic video…";

  videoResult.hidden = true;

  try {

    const response = await fetch("/api/video", {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        prompt,
        image: currentImage
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error ||
        "Video generation failed."
      );
    }

    if (!data.id) {
      throw new Error(
        "No video job was created."
      );
    }

    await pollVideo(data.id);

  } catch (error) {

    console.error(error);

    videoStatus.textContent =
      error.message ||
      "Unable to create the video.";

  } finally {

    videoBtn.disabled = false;
    videoBtn.innerHTML = originalText;
  }
}


/* =========================
   VIDEO STATUS
   ========================= */

async function pollVideo(id) {

  const maxAttempts = 60;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {

    const response = await fetch(
      `/api/video-status?id=${encodeURIComponent(id)}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error ||
        "Unable to check video status."
      );
    }

    const progress =
      data.progress != null
        ? Math.round(data.progress)
        : null;

    if (data.status === "completed") {

      videoStatus.textContent =
        "Your cinematic video is ready.";

      videoResult.src =
        `/api/video-content?id=${encodeURIComponent(id)}`;

      videoResult.hidden = false;

      videoResult.load();

      return;
    }

    if (
      data.status === "failed" ||
      data.status === "error"
    ) {

      throw new Error(
        data?.error?.message ||
        "Video generation failed."
      );
    }

    videoStatus.textContent =
      progress != null
        ? `Creating your video… ${progress}%`
        : "Creating your cinematic video…";

    await new Promise(resolve =>
      setTimeout(resolve, 5000)
    );
  }

  throw new Error(
    "Video generation is taking longer than expected. Please try again later."
  );
}


/* =========================
   PROFILE
   ========================= */

document
  .getElementById("profileNav")
  ?.addEventListener("click", () => {
    alert("YARUVA profile — coming soon.");
  });
