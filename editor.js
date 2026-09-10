// ======================================================
// YARUVA AI EDITOR V2
// Real browser AI + improved background removal
// ======================================================

const imageInput = document.getElementById("imageInput");
const uploadBtn = document.getElementById("uploadBtn");
const uploadBox = document.getElementById("uploadBox");
const previewCard = document.getElementById("previewCard");
const previewImage = document.getElementById("previewImage");

const changeImageBtn = document.getElementById("changeImageBtn");
const beforeAfterBtn = document.getElementById("beforeAfterBtn");

const promptInput = document.getElementById("promptInput");
const generateBtn = document.getElementById("generateBtn");

const resultSection = document.getElementById("resultSection");
const resultImage = document.getElementById("resultImage");
const resultPrompt = document.getElementById("resultPrompt");
const saveProjectBtn = document.getElementById("saveProjectBtn");

const imageStatus = document.getElementById("imageStatus");
const canvasLabel = document.getElementById("canvasLabel");

let currentImage = null;
let generatedImage = null;

let aiRemoveModel = null;
let transformersModule = null;

let showingBefore = false;


// ======================================================
// UPLOAD
// ======================================================

uploadBtn?.addEventListener("click", (event) => {

  event.preventDefault();
  event.stopPropagation();

  imageInput?.click();

});


uploadBox?.addEventListener("click", (event) => {

  if (
    event.target === uploadBtn ||
    uploadBtn?.contains(event.target)
  ) {
    return;
  }

  imageInput?.click();

});


changeImageBtn?.addEventListener("click", () => {

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

    generatedImage = null;

    showingBefore = false;


    if (previewImage) {

      previewImage.src = currentImage;

    }


    if (previewCard) {

      previewCard.hidden = false;

    }


    if (imageStatus) {

      imageStatus.textContent = "Image ready";

    }


    if (canvasLabel) {

      canvasLabel.textContent = "Your image";

    }

  };


  reader.onerror = () => {

    alert(
      "YARUVA couldn't read this image. Please try again."
    );

  };


  reader.readAsDataURL(file);

});


// ======================================================
// IMAGE LOADER
// ======================================================

function loadImage(src) {

  return new Promise((resolve, reject) => {

    const img = new Image();

    img.onload = () => resolve(img);

    img.onerror = reject;

    img.src = src;

  });

}


// ======================================================
// LOCAL YARUVA IMAGE ENGINE
// ======================================================

async function yaruvaCreateImage(imageData, prompt) {

  const img = await loadImage(imageData);

  const canvas = document.createElement("canvas");

  const ctx = canvas.getContext("2d", {
    willReadFrequently: true
  });


  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;


  ctx.drawImage(
    img,
    0,
    0
  );


  const image = ctx.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
  );


  const data = image.data;

  const text =
    String(prompt || "").toLowerCase();


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


  for (
    let i = 0;
    i < data.length;
    i += 4
  ) {

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


    data[i] =
      Math.max(0, Math.min(255, r));

    data[i + 1] =
      Math.max(0, Math.min(255, g));

    data[i + 2] =
      Math.max(0, Math.min(255, b));

  }


  // Cinematic vignette

  if (mode === "cinematic") {

    const cx =
      canvas.width / 2;

    const cy =
      canvas.height / 2;

    const maxDist =
      Math.sqrt(
        cx * cx +
        cy * cy
      );


    for (
      let y = 0;
      y < canvas.height;
      y++
    ) {

      for (
        let x = 0;
        x < canvas.width;
        x++
      ) {

        const dx =
          x - cx;

        const dy =
          y - cy;

        const distance =
          Math.sqrt(
            dx * dx +
            dy * dy
          );


        const factor =
          1 -
          (distance / maxDist) *
          0.22;


        const index =
          (y * canvas.width + x) * 4;


        data[index] *= factor;
        data[index + 1] *= factor;
        data[index + 2] *= factor;

      }

    }

  }


  ctx.putImageData(
    image,
    0,
    0
  );


  return canvas.toDataURL(
    "image/jpeg",
    0.92
  );

}


// ======================================================
// SHOW RESULT
// ======================================================

function showResult(image, prompt) {

  generatedImage = image;

  showingBefore = false;


  if (resultImage) {

    resultImage.src = image;

    // Checkerboard preview for transparent PNGs
    resultImage.style.backgroundImage =
      "linear-gradient(45deg,#e8e8e8 25%,transparent 25%)," +
      "linear-gradient(-45deg,#e8e8e8 25%,transparent 25%)," +
      "linear-gradient(45deg,transparent 75%,#e8e8e8 75%)," +
      "linear-gradient(-45deg,transparent 75%,#e8e8e8 75%)";

    resultImage.style.backgroundSize = "24px 24px";

    resultImage.style.backgroundPosition =
      "0 0,0 12px,12px -12px,-12px 0px";

  }


  if (resultPrompt) {

    resultPrompt.textContent =
      prompt ||
      "YARUVA AI result";

  }


  if (resultSection) {

    resultSection.hidden = false;

  }


  setTimeout(() => {

    resultSection?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  }, 100);

}


// ======================================================
// NORMAL GENERATE
// ======================================================

generateBtn?.addEventListener(
  "click",
  async () => {

    if (!currentImage) {

      alert(
        "Upload an image first."
      );

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

  }
);


// ======================================================
// LOAD TRANSFORMERS.JS
// ======================================================

async function loadTransformers() {

  if (transformersModule) {

    return transformersModule;

  }


  transformersModule =
    await import(
      "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/+esm"
    );


  return transformersModule;

}


// ======================================================
// LOAD MODNET
// ======================================================

async function loadRemoveModel(button) {

  if (aiRemoveModel) {

    return aiRemoveModel;

  }


  if (button) {

    button.textContent =
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


// ======================================================
// IMPROVE AI MASK
// ======================================================

function improveMask(maskData, width, height) {

  const source =
    new Uint8ClampedArray(
      maskData
    );


  const dilated =
    new Uint8ClampedArray(
      source.length
    );


  // Small dilation.
  // Helps close tiny holes inside clothes/hair.

  for (
    let y = 1;
    y < height - 1;
    y++
  ) {

    for (
      let x = 1;
      x < width - 1;
      x++
    ) {

      const index =
        (y * width + x) * 4;


      let max = 0;


      for (
        let yy = -1;
        yy <= 1;
        yy++
      ) {

        for (
          let xx = -1;
          xx <= 1;
          xx++
        ) {

          const neighbour =
            (
              (y + yy) *
              width +
              (x + xx)
            ) * 4;


          max = Math.max(
            max,
            source[neighbour]
          );

        }

      }


      dilated[index] = max;

    }

  }


  const result =
    new Uint8ClampedArray(
      source.length
    );


  // Small erosion after dilation.
  // Gives cleaner outer edges.

  for (
    let y = 1;
    y < height - 1;
    y++
  ) {

    for (
      let x = 1;
      x < width - 1;
      x++
    ) {

      const index =
        (y * width + x) * 4;


      let min = 255;


      for (
        let yy = -1;
        yy <= 1;
        yy++
      ) {

        for (
          let xx = -1;
          xx <= 1;
          xx++
        ) {

          const neighbour =
            (
              (y + yy) *
              width +
              (x + xx)
            ) * 4;


          min = Math.min(
            min,
            dilated[neighbour]
          );

        }

      }


      result[index] = min;

    }

  }


  return result;

}


// ======================================================
// REAL AI BACKGROUND REMOVAL V2
// ======================================================

async function removeBackgroundAI(button) {

  if (!currentImage) {

    alert(
      "Upload an image first."
    );

    return;
  }


  const originalText =
    button?.textContent ||
    "Remove";


  if (button) {

    button.disabled = true;

    button.textContent =
      "AI Loading...";

  }


  try {

    const model =
      await loadRemoveModel(
        button
      );


    if (button) {

      button.textContent =
        "AI Processing...";

    }


    const output =
      await model(
        currentImage
      );


    if (
      !output ||
      !output[0]
    ) {

      throw new Error(
        "AI did not return a mask."
      );

    }


    const maskCanvas =
      output[0].toCanvas();


    const original =
      await loadImage(
        currentImage
      );


    const canvas =
      document.createElement(
        "canvas"
      );


    const ctx =
      canvas.getContext(
        "2d",
        {
          willReadFrequently: true
        }
      );


    canvas.width =
      original.naturalWidth;

    canvas.height =
      original.naturalHeight;


    ctx.drawImage(
      original,
      0,
      0,
      canvas.width,
      canvas.height
    );


    // Resize AI mask

    const maskCanvasResized =
      document.createElement(
        "canvas"
      );


    const maskCtx =
      maskCanvasResized.getContext(
        "2d",
        {
          willReadFrequently: true
        }
      );


    maskCanvasResized.width =
      canvas.width;

    maskCanvasResized.height =
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


    const maskImageData =
      maskCtx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );


    // Improve mask

    const improvedMask =
      improveMask(
        maskImageData.data,
        canvas.width,
        canvas.height
      );


    // Apply improved alpha

    for (
      let i = 0;
      i < imageData.data.length;
      i += 4
    ) {

      let alpha =
        improvedMask[i];


      // Softer edge transition

      if (alpha < 25) {

        alpha = 0;

      } else if (alpha > 230) {

        alpha = 255;

      } else {

        alpha =
          Math.round(
            (
              (alpha - 25) /
              205
            ) * 255
          );

      }


      imageData.data[i + 3] =
        alpha;

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
      "AI Background Removal — YARUVA AI"
    );


    if (imageStatus) {

      imageStatus.textContent =
        "AI ready";

    }


  } catch (error) {

    console.error(
      "YARUVA Remove V2:",
      error
    );


    alert(
      "AI background removal failed. Please try again."
    );


  } finally {

    if (button) {

      button.disabled = false;

      button.textContent =
        originalText;

    }

  }

}


// ======================================================
// AI MAGIC
// ======================================================

document
  .querySelectorAll(
    "[data-magic]"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      async () => {

        const title =
          button
            .querySelector("strong")
            ?.textContent
            ?.trim() || "";


        // REAL AI REMOVE

        if (
          title
            .toLowerCase()
            .includes("remove")
        ) {

          await removeBackgroundAI(
            button
          );

          return;

        }


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


// ======================================================
// BEFORE / AFTER
// ======================================================

beforeAfterBtn?.addEventListener(
  "click",
  () => {

    if (!currentImage) {

      alert(
        "Upload an image first."
      );

      return;

    }


    if (!generatedImage) {

      alert(
        "Create an AI result first."
      );

      return;

    }


    showingBefore =
      !showingBefore;


    if (showingBefore) {

      beforeAfterBtn.textContent =
        "Show Result";

      previewImage.src =
        generatedImage;

      canvasLabel.textContent =
        "AI result";

    } else {

      beforeAfterBtn.textContent =
        "Before / After";

      previewImage.src =
        currentImage;

      canvasLabel.textContent =
        "Your image";

    }

  }
);


// ======================================================
// SAVE PROJECT
// ======================================================

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

      id: Date.now(),

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


// ======================================================
// VIDEO
// ======================================================

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

      videoStatus.hidden = false;

      videoStatus.textContent =
        "YARUVA free video engine is coming next.";
    }


    if (videoResult) {

      videoResult.hidden = true;

    }

  }
);


// ======================================================
// PROFILE
// ======================================================

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
