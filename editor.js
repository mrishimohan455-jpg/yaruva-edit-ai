// ======================================================
// YARUVA AI EDITOR V4
// Free browser AI + MODNet background removal
// ======================================================


// ======================================================
// ELEMENTS
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


// ======================================================
// STATE
// ======================================================

let currentImage = null;
let generatedImage = null;

let transformersModule = null;

let aiRemoveModel = null;
let aiRemoveProcessor = null;

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

  const file =
    imageInput.files?.[0];

  if (!file) return;


  if (!file.type.startsWith("image/")) {

    alert(
      "Please choose an image file."
    );

    return;

  }


  const reader =
    new FileReader();


  reader.onload = () => {

    currentImage =
      reader.result;

    generatedImage =
      null;

    showingBefore =
      false;


    if (previewImage) {

      previewImage.src =
        currentImage;

    }


    if (previewCard) {

      previewCard.hidden =
        false;

    }


    if (imageStatus) {

      imageStatus.textContent =
        "Image ready";

    }


    if (canvasLabel) {

      canvasLabel.textContent =
        "Your image";

    }


    if (beforeAfterBtn) {

      beforeAfterBtn.textContent =
        "Before / After";

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

  return new Promise(
    (resolve, reject) => {

      const img =
        new Image();

      img.onload =
        () => resolve(img);

      img.onerror =
        () => reject(
          new Error(
            "Unable to load image."
          )
        );

      img.src =
        src;

    }
  );

}


// ======================================================
// LOCAL YARUVA IMAGE ENGINE
// ======================================================

async function yaruvaCreateImage(
  imageData,
  prompt
) {

  const img =
    await loadImage(
      imageData
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
    img.naturalWidth;

  canvas.height =
    img.naturalHeight;


  ctx.drawImage(
    img,
    0,
    0
  );


  const image =
    ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );


  const data =
    image.data;


  const text =
    String(
      prompt || ""
    ).toLowerCase();


  let mode =
    "enhance";


  if (
    text.includes("cinematic") ||
    text.includes("movie") ||
    text.includes("film")
  ) {

    mode =
      "cinematic";

  }


  if (
    text.includes("luxury") ||
    text.includes("fashion") ||
    text.includes("editorial")
  ) {

    mode =
      "luxury";

  }


  if (
    text.includes("relight") ||
    text.includes("lighting") ||
    text.includes("light")
  ) {

    mode =
      "relight";

  }


  if (
    text.includes("portrait") ||
    text.includes("face")
  ) {

    mode =
      "portrait";

  }


  for (
    let i = 0;
    i < data.length;
    i += 4
  ) {

    let r =
      data[i];

    let g =
      data[i + 1];

    let b =
      data[i + 2];


    // ENHANCE

    if (mode === "enhance") {

      r =
        (r - 128) *
        1.10 +
        128;

      g =
        (g - 128) *
        1.10 +
        128;

      b =
        (b - 128) *
        1.10 +
        128;

    }


    // CINEMATIC

    if (mode === "cinematic") {

      r =
        (r - 128) *
        1.18 +
        128;

      g =
        (g - 128) *
        1.08 +
        128;

      b =
        (b - 128) *
        1.15 +
        128;

      r += 6;
      b += 8;

    }


    // LUXURY

    if (mode === "luxury") {

      r =
        (r - 128) *
        1.22 +
        128;

      g =
        (g - 128) *
        1.14 +
        128;

      b =
        (b - 128) *
        1.18 +
        128;

      r += 5;

    }


    // RELIGHT

    if (mode === "relight") {

      r += 15;
      g += 15;
      b += 15;

      r =
        (r - 128) *
        1.08 +
        128;

      g =
        (g - 128) *
        1.08 +
        128;

      b =
        (b - 128) *
        1.08 +
        128;

    }


    // PORTRAIT

    if (mode === "portrait") {

      r =
        (r - 128) *
        1.08 +
        128;

      g =
        (g - 128) *
        1.05 +
        128;

      b =
        (b - 128) *
        1.04 +
        128;

    }


    data[i] =
      Math.max(
        0,
        Math.min(
          255,
          r
        )
      );


    data[i + 1] =
      Math.max(
        0,
        Math.min(
          255,
          g
        )
      );


    data[i + 2] =
      Math.max(
        0,
        Math.min(
          255,
          b
        )
      );

  }


  // CINEMATIC VIGNETTE

  if (
    mode === "cinematic"
  ) {

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
          (
            distance /
            maxDist
          ) *
          0.22;


        const index =
          (
            y *
            canvas.width +
            x
          ) *
          4;


        data[index] *=
          factor;

        data[index + 1] *=
          factor;

        data[index + 2] *=
          factor;

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

function showResult(
  image,
  prompt
) {

  generatedImage =
    image;

  showingBefore =
    false;


  if (resultImage) {

    resultImage.src =
      image;


    // Transparent preview

    resultImage.style.backgroundImage =
      "linear-gradient(45deg,#e8e8e8 25%,transparent 25%)," +
      "linear-gradient(-45deg,#e8e8e8 25%,transparent 25%)," +
      "linear-gradient(45deg,transparent 75%,#e8e8e8 75%)," +
      "linear-gradient(-45deg,transparent 75%,#e8e8e8 75%)";


    resultImage.style.backgroundSize =
      "24px 24px";


    resultImage.style.backgroundPosition =
      "0 0,0 12px,12px -12px,-12px 0px";

  }


  if (resultPrompt) {

    resultPrompt.textContent =
      prompt ||
      "YARUVA AI result";

  }


  if (resultSection) {

    resultSection.hidden =
      false;

  }


  setTimeout(
    () => {

      resultSection?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    },
    100
  );

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


    generateBtn.disabled =
      true;

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

    }

    catch (error) {

      console.error(
        "YARUVA Generate Error:",
        error
      );


      alert(
        "YARUVA could not process this image."
      );

    }

    finally {

      generateBtn.disabled =
        false;

      generateBtn.textContent =
        originalText ||
        "Generate";

    }

  }
);


// ======================================================
// LOAD TRANSFORMERS.JS
// ======================================================

async function loadTransformers() {

  if (
    transformersModule
  ) {

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

async function loadRemoveModel(
  button
) {

  if (
    aiRemoveModel &&
    aiRemoveProcessor
  ) {

    return {
      model:
        aiRemoveModel,

      processor:
        aiRemoveProcessor
    };

  }


  if (button) {

    button.textContent =
      "Loading AI...";

  }


  const transformers =
    await loadTransformers();


  // Official MODNet model

  aiRemoveModel =
    await transformers.AutoModel.from_pretrained(
      "Xenova/modnet",
      {
        dtype:
          "fp32"
      }
    );


  // Official MODNet processor

  aiRemoveProcessor =
    await transformers.AutoProcessor.from_pretrained(
      "Xenova/modnet"
    );


  return {

    model:
      aiRemoveModel,

    processor:
      aiRemoveProcessor

  };

}


// ======================================================
// REAL AI BACKGROUND REMOVAL
// OFFICIAL MODNET ALPHA MATTE PIPELINE
// ======================================================

async function removeBackgroundAI(
  button
) {

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

    button.disabled =
      true;

    button.textContent =
      "Loading AI...";

  }


  try {

    // --------------------------------------------------
    // LOAD TRANSFORMERS
    // --------------------------------------------------

    const transformers =
      await loadTransformers();


    // --------------------------------------------------
    // LOAD MODEL + PROCESSOR
    // --------------------------------------------------

    const ai =
      await loadRemoveModel(
        button
      );


    if (button) {

      button.textContent =
        "Preparing image...";

    }


    // --------------------------------------------------
    // LOAD IMAGE USING RawImage
    // --------------------------------------------------

    const image =
      await transformers.RawImage.fromURL(
        currentImage
      );


    if (button) {

      button.textContent =
        "AI Processing...";

    }


    // --------------------------------------------------
    // PREPROCESS IMAGE
    // --------------------------------------------------

    const processed =
      await ai.processor(
        image
      );


    // --------------------------------------------------
    // RUN MODNET
    // --------------------------------------------------

    const output =
      await ai.model({
        input:
          processed.pixel_values
      });


    if (
      !output ||
      !output.output ||
      !output.output[0]
    ) {

      throw new Error(
        "MODNet did not return an alpha matte."
      );

    }


    // --------------------------------------------------
    // OFFICIAL MODNET MASK CREATION
    // --------------------------------------------------

    const mask =
      await transformers.RawImage.fromTensor(
        output.output[0]
          .mul(255)
          .to("uint8")
      );


    // --------------------------------------------------
    // RESIZE MASK TO ORIGINAL IMAGE
    // --------------------------------------------------

    const resizedMask =
      await mask.resize(
        image.width,
        image.height
      );


    // --------------------------------------------------
    // ORIGINAL IMAGE CANVAS
    // --------------------------------------------------

    const canvas =
      document.createElement(
        "canvas"
      );


    canvas.width =
      image.width;

    canvas.height =
      image.height;


    const ctx =
      canvas.getContext(
        "2d",
        {
          willReadFrequently:
            true
        }
      );


    // Draw original image

    ctx.drawImage(
      image.toCanvas(),
      0,
      0,
      image.width,
      image.height
    );


    // --------------------------------------------------
    // GET ORIGINAL PIXELS
    // --------------------------------------------------

    const imageData =
      ctx.getImageData(
        0,
        0,
        image.width,
        image.height
      );


    const pixels =
      imageData.data;


    // --------------------------------------------------
    // GET MASK PIXELS
    // --------------------------------------------------

    const maskCanvas =
      resizedMask.toCanvas();


    const maskCtx =
      maskCanvas.getContext(
        "2d",
        {
          willReadFrequently:
            true
        }
      );


    const maskData =
      maskCtx.getImageData(
        0,
        0,
        image.width,
        image.height
      );


    const maskPixels =
      maskData.data;


    // --------------------------------------------------
    // APPLY ALPHA MATTE
    // --------------------------------------------------

    for (
      let i = 0;
      i < pixels.length;
      i += 4
    ) {

      const alpha =
        maskPixels[i];


      pixels[i + 3] =
        alpha;

    }


    // --------------------------------------------------
    // WRITE TRANSPARENCY
    // --------------------------------------------------

    ctx.putImageData(
      imageData,
      0,
      0
    );


    // --------------------------------------------------
    // EXPORT PNG
    // --------------------------------------------------

    const result =
      canvas.toDataURL(
        "image/png"
      );


    // --------------------------------------------------
    // SHOW RESULT
    // --------------------------------------------------

    showResult(
      result,
      "AI Background Removal — YARUVA AI"
    );


    if (imageStatus) {

      imageStatus.textContent =
        "AI background removed";

    }

  }

  catch (error) {

    console.error(
      "YARUVA MODNet Error:",
      error
    );


    alert(
      "YARUVA AI error: " +
      (
        error?.message ||
        error
      )
    );

  }

  finally {

    if (button) {

      button.disabled =
        false;

      button.textContent =
        originalText;

    }

  }

}


// ======================================================
// AI MAGIC TOOLS
// ======================================================

document
  .querySelectorAll(
    "[data-magic]"
  )
  .forEach(
    button => {

      button.addEventListener(
        "click",
        async () => {

          const title =
            button
              .querySelector(
                "strong"
              )
              ?.textContent
              ?.trim() ||
            "";


          // ------------------------------------------------
          // REAL AI REMOVE
          // ------------------------------------------------

          if (
            title
              .toLowerCase()
              .includes(
                "remove"
              )
          ) {

            await removeBackgroundAI(
              button
            );

            return;

          }


          // ------------------------------------------------
          // OTHER MAGIC TOOLS
          // ------------------------------------------------

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


          button.disabled =
            true;

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

          }

          catch (error) {

            console.error(
              "YARUVA Magic Error:",
              error
            );


            alert(
              "YARUVA could not process this image."
            );

          }

          finally {

            button.disabled =
              false;

            button.textContent =
              oldText;

          }

        }
      );

    }
  );


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


      if (canvasLabel) {

        canvasLabel.textContent =
          "AI result";

      }

    }

    else {

      beforeAfterBtn.textContent =
        "Before / After";


      previewImage.src =
        currentImage;


      if (canvasLabel) {

        canvasLabel.textContent =
          "Your image";

      }

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


    let projects =
      [];


    try {

      projects =
        JSON.parse(
          localStorage.getItem(
            "yaruvaProjects"
          ) ||
          "[]"
        );

    }

    catch {

      projects =
        [];

    }


    projects.unshift({

      id:
        Date.now(),

      image:
        generatedImage,

      prompt:
        resultPrompt?.textContent ||
        "YARUVA AI result",

      createdAt:
        new Date()
          .toLocaleString()

    });


    localStorage.setItem(
      "yaruvaProjects",
      JSON.stringify(
        projects.slice(
          0,
          30
        )
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

      videoStatus.hidden =
        false;

      videoStatus.textContent =
        "YARUVA free video engine is coming next.";

    }


    if (videoResult) {

      videoResult.hidden =
        true;

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
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          alert(
            "YARUVA Profile — coming soon."
          );

        }
      );

    }
  );


// ======================================================
// READY
// ======================================================

console.log(
  "YARUVA AI Editor V4 loaded successfully."
);
// ======================================================

// YARUVA BACKGROUND STUDIO V1

// Free browser-based background replacement

// ======================================================

(function initBackgroundStudio() {

  // Prevent duplicate studio

  if (document.getElementById("yaruvaBackgroundStudio")) {

    return;

  }

  const studio = document.createElement("section");

  studio.id = "yaruvaBackgroundStudio";

  studio.className = "creative-section";

  studio.style.display = "none";

  studio.innerHTML = `

    <div class="section-head">

      <h2>Background Studio</h2>

      <span>YARUVA AI</span>

    </div>

    <div style="

      background:#ffffff;

      border-radius:28px;

      padding:20px;

      box-shadow:0 12px 35px rgba(30,20,50,.08);

    ">

      <p style="

        margin:0 0 16px;

        font-weight:600;

        color:#777;

      ">

        Choose a new background for your subject.

      </p>

      <div

        id="yaruvaBackgroundGrid"

        style="

          display:grid;

          grid-template-columns:repeat(2,1fr);

          gap:12px;

        "

      >

        <button

          class="yaruva-bg"

          data-bg="studio"

          style="

            min-height:110px;

            border:0;

            border-radius:20px;

            background:

              radial-gradient(circle at 50% 35%,#ffffff,#dfe3ea 60%,#aeb5c2);

            color:#17131d;

            font-weight:800;

            font-size:15px;

          "

        >

          Studio

        </button>

        <button

          class="yaruva-bg"

          data-bg="sunset"

          style="

            min-height:110px;

            border:0;

            border-radius:20px;

            background:

              linear-gradient(

                145deg,

                #ffb36b,

                #ed6a8a 45%,

                #6b4ea2

              );

            color:white;

            font-weight:800;

            font-size:15px;

          "

        >

          Sunset

        </button>

        <button

          class="yaruva-bg"

          data-bg="night"

          style="

            min-height:110px;

            border:0;

            border-radius:20px;

            background:

              radial-gradient(

                circle at 65% 25%,

                #5e72b8,

                #17172c 48%,

                #07070f

              );

            color:white;

            font-weight:800;

            font-size:15px;

          "

        >

          Night

        </button>

        <button

          class="yaruva-bg"

          data-bg="luxury"

          style="

            min-height:110px;

            border:0;

            border-radius:20px;

            background:

              linear-gradient(

                135deg,

                #efe3c2,

                #b99452 45%,

                #30251c

              );

            color:white;

            font-weight:800;

            font-size:15px;

          "

        >

          Luxury

        </button>

        <button

          class="yaruva-bg"

          data-bg="ocean"

          style="

            min-height:110px;

            border:0;

            border-radius:20px;

            background:

              linear-gradient(

                160deg,

                #9de7ef,

                #318ca6 50%,

                #123c59

              );

            color:white;

            font-weight:800;

            font-size:15px;

          "

        >

          Ocean

        </button>

        <button

          class="yaruva-bg"

          data-bg="purple"

          style="

            min-height:110px;

            border:0;

            border-radius:20px;

            background:

              radial-gradient(

                circle at 30% 20%,

                #d5a6ff,

                #6940a5 45%,

                #21112f

              );

            color:white;

            font-weight:800;

            font-size:15px;

          "

        >

          Creative

        </button>

      </div>

      <div style="

        margin-top:18px;

        display:flex;

        gap:10px;

      ">

        <button

          id="yaruvaOriginalBg"

          style="

            flex:1;

            padding:14px;

            border-radius:16px;

            border:1px solid #ddd;

            background:#fff;

            font-weight:700;

          "

        >

          Transparent

        </button>

        <button

          id="yaruvaSaveBg"

          style="

            flex:1;

            padding:14px;

            border-radius:16px;

            border:0;

            background:#17131d;

            color:#fff;

            font-weight:800;

          "

        >

          Save result

        </button>

      </div>

    </div>

  `;

  // Insert after result section

  if (resultSection) {

    resultSection.insertAdjacentElement(

      "afterend",

      studio

    );

  }

  // --------------------------------------------------

  // BACKGROUND DRAWING

  // --------------------------------------------------

  function drawBackground(

    ctx,

    width,

    height,

    type

  ) {

    let gradient;

    if (type === "studio") {

      gradient =

        ctx.createRadialGradient(

          width * 0.5,

          height * 0.35,

          20,

          width * 0.5,

          height * 0.5,

          height

        );

      gradient.addColorStop(

        0,

        "#ffffff"

      );

      gradient.addColorStop(

        0.55,

        "#dfe3ea"

      );

      gradient.addColorStop(

        1,

        "#aeb5c2"

      );

    }

    if (type === "sunset") {

      gradient =

        ctx.createLinearGradient(

          0,

          0,

          width,

          height

        );

      gradient.addColorStop(

        0,

        "#ffbd73"

      );

      gradient.addColorStop(

        0.45,

        "#ed6a8a"

      );

      gradient.addColorStop(

        1,

        "#5b3b91"

      );

    }

    if (type === "night") {

      gradient =

        ctx.createRadialGradient(

          width * 0.65,

          height * 0.2,

          10,

          width * 0.55,

          height * 0.5,

          height

        );

      gradient.addColorStop(

        0,

        "#5e72b8"

      );

      gradient.addColorStop(

        0.45,

        "#17172c"

      );

      gradient.addColorStop(

        1,

        "#07070f"

      );

    }

    if (type === "luxury") {

      gradient =

        ctx.createLinearGradient(

          0,

          0,

          width,

          height

        );

      gradient.addColorStop(

        0,

        "#efe3c2"

      );

      gradient.addColorStop(

        0.45,

        "#b99452"

      );

      gradient.addColorStop(

        1,

        "#30251c"

      );

    }

    if (type === "ocean") {

      gradient =

        ctx.createLinearGradient(

          0,

          0,

          width,

          height

        );

      gradient.addColorStop(

        0,

        "#9de7ef"

      );

      gradient.addColorStop(

        0.5,

        "#318ca6"

      );

      gradient.addColorStop(

        1,

        "#123c59"

      );

    }

    if (type === "purple") {

      gradient =

        ctx.createRadialGradient(

          width * 0.3,

          height * 0.2,

          20,

          width * 0.5,

          height * 0.5,

          height

        );

      gradient.addColorStop(

        0,

        "#d5a6ff"

      );

      gradient.addColorStop(

        0.45,

        "#6940a5"

      );

      gradient.addColorStop(

        1,

        "#21112f"

      );

    }

    ctx.fillStyle =

      gradient;

    ctx.fillRect(

      0,

      0,

      width,

      height

    );

    // Soft studio glow

    if (

      type === "studio" ||

      type === "sunset" ||

      type === "luxury"

    ) {

      const glow =

        ctx.createRadialGradient(

          width * 0.5,

          height * 0.3,

          0,

          width * 0.5,

          height * 0.3,

          height * 0.55

        );

      glow.addColorStop(

        0,

        "rgba(255,255,255,.35)"

      );

      glow.addColorStop(

        1,

        "rgba(255,255,255,0)"

      );

      ctx.fillStyle =

        glow;

      ctx.fillRect(

        0,

        0,

        width,

        height

      );

    }

  }

  // --------------------------------------------------

  // COMPOSITE SUBJECT + BACKGROUND

  // --------------------------------------------------

  async function applyBackground(

    type

  ) {

    if (!generatedImage) {

      alert(

        "Remove the background first."

      );

      return;

    }

    const subject =

      await loadImage(

        generatedImage

      );

    const width =

      subject.naturalWidth;

    const height =

      subject.naturalHeight;

    const canvas =

      document.createElement(

        "canvas"

      );

    canvas.width =

      width;

    canvas.height =

      height;

    const ctx =

      canvas.getContext(

        "2d"

      );

    // Background

    drawBackground(

      ctx,

      width,

      height,

      type

    );

    // Subject

    ctx.drawImage(

      subject,

      0,

      0,

      width,

      height

    );

    const result =

      canvas.toDataURL(

        "image/png"

      );

    showResult(

      result,

      "YARUVA AI Background Studio — " +

      type

    );

    if (imageStatus) {

      imageStatus.textContent =

        "Background applied";

    }

  }

  // --------------------------------------------------

  // SHOW STUDIO AFTER AI REMOVE

  // --------------------------------------------------

  const originalShowResult =

    window.showResult;

  // Our showResult function isn't global in

  // all browser setups, so observe result changes.

  const observer =

    new MutationObserver(

      () => {

        if (

          generatedImage &&

          resultSection &&

          !resultSection.hidden

        ) {

          studio.style.display =

            "block";

        }

      }

    );

  if (resultSection) {

    observer.observe(

      resultSection,

      {

        attributes:true,

        subtree:true

      }

    );

  }

  // Also reveal when clicking Remove result

  document

    .querySelectorAll(

      "[data-magic]"

    )

    .forEach(

      button => {

        button.addEventListener(

          "click",

          () => {

            setTimeout(

              () => {

                if (

                  generatedImage

                ) {

                  studio.style.display =

                    "block";

                }

              },

              500

            );

          }

        );

      }

    );

  // --------------------------------------------------

  // BACKGROUND BUTTONS

  // --------------------------------------------------

  studio

    .querySelectorAll(

      ".yaruva-bg"

    )

    .forEach(

      button => {

        button.addEventListener(

          "click",

          async () => {

            const type =

              button.dataset.bg;

            button.style.transform =

              "scale(.96)";

            setTimeout(

              () => {

                button.style.transform =

                  "";

              },

              120

            );

            await applyBackground(

              type

            );

          }

        );

      }

    );

  // --------------------------------------------------

  // TRANSPARENT

  // --------------------------------------------------

  document

    .getElementById(

      "yaruvaOriginalBg"

    )

    ?.addEventListener(

      "click",

      () => {

        if (!generatedImage) {

          alert(

            "Remove the background first."

          );

          return;

        }

        showResult(

          generatedImage,

          "AI Background Removal — YARUVA AI"

        );

      }

    );

  // --------------------------------------------------

  // SAVE

  // --------------------------------------------------

  document

    .getElementById(

      "yaruvaSaveBg"

    )

    ?.addEventListener(

      "click",

      () => {

        if (!generatedImage) {

          alert(

            "Create a background result first."

          );

          return;

        }

        const link =

          document.createElement(

            "a"

          );

        link.download =

          "yaruva-ai-background.png";

        link.href =

          generatedImage;

        link.click();

      }

    );

})();
