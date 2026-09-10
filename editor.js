// YARUVA AI EDITOR
// Local editing + real browser AI background removal

const imageInput = document.getElementById("imageInput");
const uploadBtn = document.getElementById("uploadBtn");
const uploadBox = document.getElementById("uploadBox");
const previewCard = document.getElementById("previewCard");
const previewImage = document.getElementById("previewImage");

const promptInput = document.getElementById("promptInput");
const generateBtn = document.getElementById("generateBtn");

const resultSection = document.getElementById("resultSection");
const resultImage = document.getElementById("resultImage");
const resultPrompt = document.getElementById("resultPrompt");
const saveProjectBtn = document.getElementById("saveProjectBtn");

let currentImage = null;
let generatedImage = null;
let aiRemoveModel = null;
let transformersModule = null;


// --------------------------------------------------
// UPLOAD
// --------------------------------------------------

uploadBtn?.addEventListener("click", (event) => {

  event.preventDefault();

  event.stopPropagation();

  imageInput?.click();

});

uploadBox?.addEventListener("click", (event) => {

  // Don't trigger the picker twice when

  // the user clicks the Choose image button.

  if (event.target === uploadBtn || uploadBtn?.contains(event.target)) {

    return;

  }

  imageInput?.click();

});

imageInput?.addEventListener("change", () => {

  const file = imageInput.files?.[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {

    alert("Please choose an image file.");

    return;

  }

  const reader = new FileReader();

  reader.onload = () => {

    currentImage = reader.result;

    // Show uploaded image

    if (previewImage) {

      previewImage.src = currentImage;

    }

    // IMPORTANT:

    // HTML uses the hidden attribute,

    // so remove it directly.

    if (previewCard) {

      previewCard.hidden = false;

    }

    // Update status

    const imageStatus =

      document.getElementById("imageStatus");

    if (imageStatus) {

      imageStatus.textContent = "Image ready";

    }

    const canvasLabel =

      document.getElementById("canvasLabel");

    if (canvasLabel) {

      canvasLabel.textContent = "Your image";

    }

  };

  reader.onerror = () => {

    alert("YARUVA couldn't read this image. Please try again.");

  };

  reader.readAsDataURL(file);

});


// --------------------------------------------------
// IMAGE LOADER
// --------------------------------------------------

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = reject;

    img.src = src;
  });
}


// --------------------------------------------------
// LOCAL YARUVA IMAGE ENGINE
// --------------------------------------------------

async function yaruvaCreateImage(imageData, prompt) {

  const img = await loadImage(imageData);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", {
    willReadFrequently: true
  });

  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  ctx.drawImage(img, 0, 0);

  const image = ctx.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
  );

  const data = image.data;

  const text = String(prompt || "").toLowerCase();

  let mode = "enhance";

  if (
    text.includes("cinematic") ||
    text.includes("movie") ||
    text.includes("film")
  ) {
    mode = "cinematic";
  }

  if (
    text.includes("luxury") ||
    text.includes("fashion") ||
    text.includes("editorial")
  ) {
    mode = "luxury";
  }

  if (
    text.includes("relight") ||
    text.includes("lighting") ||
    text.includes("light")
  ) {
    mode = "relight";
  }

  if (
    text.includes("portrait") ||
    text.includes("face")
  ) {
    mode = "portrait";
  }


  // -------------------------------
  // Pixel processing
  // -------------------------------

  for (let i = 0; i < data.length; i += 4) {

    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    if (mode === "enhance") {

      r = (r - 128) * 1.10 + 128;
      g = (g - 128) * 1.10 + 128;
      b = (b - 128) * 1.10 + 128;

    }


    if (mode === "cinematic") {

      r = (r - 128) * 1.18 + 128;
      g = (g - 128) * 1.08 + 128;
      b = (b - 128) * 1.15 + 128;

      r += 6;
      b += 8;

    }


    if (mode === "luxury") {

      r = (r - 128) * 1.22 + 128;
      g = (g - 128) * 1.14 + 128;
      b = (b - 128) * 1.18 + 128;

      r += 5;

    }


    if (mode === "relight") {

      r += 15;
      g += 15;
      b += 15;

      r = (r - 128) * 1.08 + 128;
      g = (g - 128) * 1.08 + 128;
      b = (b - 128) * 1.08 + 128;

    }


    if (mode === "portrait") {

      r = (r - 128) * 1.08 + 128;
      g = (g - 128) * 1.05 + 128;
      b = (b - 128) * 1.04 + 128;

    }


    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }


  // Cinematic vignette

  if (mode === "cinematic") {

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const maxDist = Math.sqrt(
      cx * cx + cy * cy
    );

    for (let y = 0; y < canvas.height; y++) {

      for (let x = 0; x < canvas.width; x++) {

        const dx = x - cx;
        const dy = y - cy;

        const distance = Math.sqrt(
          dx * dx + dy * dy
        );

        const factor =
          1 - (distance / maxDist) * 0.22;

        const index =
          (y * canvas.width + x) * 4;

        data[index] *= factor;
        data[index + 1] *= factor;
        data[index + 2] *= factor;
      }
    }
  }


  ctx.putImageData(image, 0, 0);

  return canvas.toDataURL(
    "image/jpeg",
    0.92
  );
}


// --------------------------------------------------
// SHOW RESULT
// --------------------------------------------------

function showResult(image, prompt) {

  generatedImage = image;

  if (resultImage) {
    resultImage.src = image;
  }

  if (resultPrompt) {
    resultPrompt.textContent =
      prompt || "YARUVA AI result";
  }

  if (resultSection) {
  resultSection.hidden = false;
}

  resultSection?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}


// --------------------------------------------------
// NORMAL GENERATE
// --------------------------------------------------

generateBtn?.addEventListener("click", async () => {

  if (!currentImage) {

    alert("Upload an image first.");

    return;
  }

  const prompt =
    promptInput?.value?.trim() ||
    "Enhance this image professionally.";

  const originalText =
    generateBtn.textContent;

  generateBtn.disabled = true;

  generateBtn.textContent =
    "Creating...";


  try {

    const output =
      await yaruvaCreateImage(
        currentImage,
        prompt
      );

    showResult(
      output,
      prompt
    );

  } catch (error) {

    console.error(error);

    alert(
      "YARUVA could not process this image."
    );

  } finally {

    generateBtn.disabled = false;

    generateBtn.textContent =
      originalText || "Generate";
  }
});


// --------------------------------------------------
// LOAD TRANSFORMERS.JS
// --------------------------------------------------

async function loadTransformers() {

  if (transformersModule) {
    return transformersModule;
  }

  transformersModule = await import(
    "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/+esm"
  );

  return transformersModule;
}


// --------------------------------------------------
// LOAD REAL AI BACKGROUND REMOVAL MODEL
// --------------------------------------------------

async function loadRemoveModel(statusButton) {

  if (aiRemoveModel) {
    return aiRemoveModel;
  }

  if (statusButton) {
    statusButton.textContent =
      "Loading AI...";
  }

  const transformers =
    await loadTransformers();

  aiRemoveModel =
    await transformers.pipeline(
      "background-removal",
      "Xenova/modnet",
      {
        dtype: "q8"
      }
    );

  return aiRemoveModel;
}


// --------------------------------------------------
// REAL AI BACKGROUND REMOVAL
// --------------------------------------------------

async function removeBackgroundAI(button) {

  if (!currentImage) {

    alert(
      "Upload an image first."
    );

    return;
  }

  const originalText =
    button?.textContent || "Remove";

  if (button) {
    button.disabled = true;
    button.textContent =
      "AI Loading...";
  }


  try {

    const model =
      await loadRemoveModel(button);

    if (button) {
      button.textContent =
        "AI Processing...";
    }


    const output =
      await model(currentImage);


    if (
      !output ||
      !output[0]
    ) {
      throw new Error(
        "No AI mask returned."
      );
    }


    // Transformers.js returns
    // a mask canvas for MODNet

    const maskCanvas =
      output[0].toCanvas();


    const original =
      await loadImage(currentImage);


    const canvas =
      document.createElement("canvas");

    const ctx =
      canvas.getContext("2d");


    canvas.width =
      original.naturalWidth;

    canvas.height =
      original.naturalHeight;


    // Draw original image

    ctx.drawImage(
      original,
      0,
      0,
      canvas.width,
      canvas.height
    );


    // Create mask canvas

    const resizedMask =
      document.createElement("canvas");

    const maskCtx =
      resizedMask.getContext(
        "2d"
      );


    resizedMask.width =
      canvas.width;

    resizedMask.height =
      canvas.height;


    maskCtx.drawImage(
      maskCanvas,
      0,
      0,
      canvas.width,
      canvas.height
    );


    const imageData =
      ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );


    const maskData =
      maskCtx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );


    // Apply AI alpha mask

    for (
      let i = 0;
      i < imageData.data.length;
      i += 4
    ) {

      imageData.data[i + 3] =
        maskData.data[i];

    }


    ctx.putImageData(
      imageData,
      0,
      0
    );


    const result =
      canvas.toDataURL(
        "image/png"
      );


    showResult(
      result,
      "AI Background Removal — YARUVA MODNet"
    );


  } catch (error) {

    console.error(
      "YARUVA AI Remove Error:",
      error
    );

    alert(
      "AI background removal failed. Please try again."
    );

  } finally {

    if (button) {

      button.disabled = false;

      button.textContent =
        originalText || "Remove";
    }
  }
}


// --------------------------------------------------
// MAGIC TOOLS
// --------------------------------------------------

document
  .querySelectorAll("[data-magic]")
  .forEach(button => {

    button.addEventListener(
      "click",
      async () => {

        const title =
          button.querySelector(
            "strong"
          )?.textContent?.trim() || "";


        // REAL AI FEATURE

        if (
          title.toLowerCase()
            .includes("remove")
        ) {

          await removeBackgroundAI(
            button
          );

          return;
        }


        // Other tools currently
        // use YARUVA local processing

        if (!currentImage) {

          alert(
            "Upload an image first."
          );

          return;
        }


        const prompt =
          button.dataset.magic ||
          title;


        const oldText =
          button.textContent;

        button.disabled = true;

        button.textContent =
          "Working...";


        try {

          const output =
            await yaruvaCreateImage(
              currentImage,
              prompt
            );


          showResult(
            output,
            prompt
          );


        } catch (error) {

          console.error(error);

          alert(
            "YARUVA could not process this image."
          );

        } finally {

          button.disabled = false;

          button.textContent =
            oldText;
        }
      }
    );
  });


// --------------------------------------------------
// SAVE PROJECT
// --------------------------------------------------

saveProjectBtn?.addEventListener(
  "click",
  () => {

    if (!generatedImage) {

      alert(
        "Generate an image first."
      );

      return;
    }


    const projects =
      JSON.parse(
        localStorage.getItem(
          "yaruvaProjects"
        ) || "[]"
      );


    projects.unshift({

      id:
        Date.now(),

      image:
        generatedImage,

      prompt:
        resultPrompt?.textContent ||
        "YARUVA AI result",

      createdAt:
        new Date().toLocaleString()

    });


    localStorage.setItem(
      "yaruvaProjects",
      JSON.stringify(
        projects.slice(0, 30)
      )
    );


    alert(
      "Saved to YARUVA Projects ✨"
    );
  }
);


// --------------------------------------------------
// VIDEO
// --------------------------------------------------

const videoBtn =
  document.getElementById(
    "videoBtn"
  );

const videoStatus =
  document.getElementById(
    "videoStatus"
  );

const videoResult =
  document.getElementById(
    "videoResult"
  );


videoBtn?.addEventListener(
  "click",
  () => {

    if (videoStatus) {

      videoStatus.textContent =
        "YARUVA free video engine is coming next.";
    }

    if (videoResult) {

      videoResult.classList.remove(
        "hidden"
      );
    }
  }
);


// --------------------------------------------------
// PROFILE
// --------------------------------------------------

document
  .querySelectorAll(
    "[data-profile]"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        alert(
          "YARUVA Profile — coming soon."
        );
      }
    );
  });
