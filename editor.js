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
// ======================================================

// YARUVA BACKGROUND STUDIO V2

// Professional cinematic backgrounds

// ======================================================

(function initYaruvaBackgroundStudioV2() {

  // Remove previous Background Studio if it exists

  const oldStudio =

    document.getElementById(

      "yaruvaBackgroundStudio"

    );

  if (oldStudio) {

    oldStudio.remove();

  }

  // ----------------------------------------------------

  // CREATE STUDIO

  // ----------------------------------------------------

  const studio =

    document.createElement("section");

  studio.id =

    "yaruvaBackgroundStudio";

  studio.className =

    "creative-section";

  studio.innerHTML = `

    <div class="section-head">

      <h2>Background Studio</h2>

      <span>YARUVA AI</span>

    </div>

    <div style="

      background:#ffffff;

      border-radius:28px;

      padding:20px;

      box-shadow:0 16px 45px rgba(30,20,50,.10);

    ">

      <p style="

        margin:0 0 18px;

        color:#777;

        font-weight:600;

        line-height:1.5;

      ">

        Put your subject anywhere.

        Choose a cinematic environment.

      </p>

      <div

        id="yaruvaBackgroundGrid"

        style="

          display:grid;

          grid-template-columns:repeat(2,1fr);

          gap:12px;

        "

      >

        <!-- CITY -->

        <button

          class="yaruva-bg-v2"

          data-bg="city"

          style="

            min-height:125px;

            border:0;

            border-radius:22px;

            background:

              radial-gradient(

                circle at 70% 25%,

                rgba(255,190,100,.45),

                transparent 18%

              ),

              linear-gradient(

                145deg,

                #15172e,

                #30255e 45%,

                #080914

              );

            color:white;

            font-weight:800;

            font-size:16px;

            position:relative;

            overflow:hidden;

          "

        >

          🌃<br>

          Cinematic City

          <small style="

            display:block;

            margin-top:5px;

            opacity:.65;

            font-weight:500;

          ">

            Night lights

          </small>

        </button>

        <!-- OFFICE -->

        <button

          class="yaruva-bg-v2"

          data-bg="office"

          style="

            min-height:125px;

            border:0;

            border-radius:22px;

            background:

              linear-gradient(

                135deg,

                #f5f0e8,

                #d8d2ca

              );

            color:#201d22;

            font-weight:800;

            font-size:16px;

          "

        >

          🏢<br>

          Luxury Office

          <small style="

            display:block;

            margin-top:5px;

            opacity:.55;

            font-weight:500;

          ">

            Corporate look

          </small>

        </button>

        <!-- SUNSET -->

        <button

          class="yaruva-bg-v2"

          data-bg="sunset"

          style="

            min-height:125px;

            border:0;

            border-radius:22px;

            background:

              linear-gradient(

                160deg,

                #ffd18a,

                #ef7c72 45%,

                #6b3f78

              );

            color:white;

            font-weight:800;

            font-size:16px;

          "

        >

          🌅<br>

          Golden Sunset

          <small style="

            display:block;

            margin-top:5px;

            opacity:.7;

            font-weight:500;

          ">

            Warm cinematic

          </small>

        </button>

        <!-- ROOFTOP -->

        <button

          class="yaruva-bg-v2"

          data-bg="rooftop"

          style="

            min-height:125px;

            border:0;

            border-radius:22px;

            background:

              linear-gradient(

                145deg,

                #6c7894,

                #303746 50%,

                #14161c

              );

            color:white;

            font-weight:800;

            font-size:16px;

          "

        >

          🏙️<br>

          Modern Rooftop

          <small style="

            display:block;

            margin-top:5px;

            opacity:.65;

            font-weight:500;

          ">

            Premium city

          </small>

        </button>

        <!-- BEACH -->

        <button

          class="yaruva-bg-v2"

          data-bg="beach"

          style="

            min-height:125px;

            border:0;

            border-radius:22px;

            background:

              linear-gradient(

                180deg,

                #8ed9ee 0%,

                #d7f1e8 48%,

                #d4a56b 49%,

                #a87548 100%

              );

            color:#16333b;

            font-weight:800;

            font-size:16px;

          "

        >

          🏖️<br>

          Tropical Beach

          <small style="

            display:block;

            margin-top:5px;

            opacity:.6;

            font-weight:500;

          ">

            Natural daylight

          </small>

        </button>

        <!-- NATURE -->

        <button

          class="yaruva-bg-v2"

          data-bg="nature"

          style="

            min-height:125px;

            border:0;

            border-radius:22px;

            background:

              linear-gradient(

                155deg,

                #a7d8a2,

                #477657 48%,

                #172e25

              );

            color:white;

            font-weight:800;

            font-size:16px;

          "

        >

          🌲<br>

          Nature

          <small style="

            display:block;

            margin-top:5px;

            opacity:.7;

            font-weight:500;

          ">

            Outdoor portrait

          </small>

        </button>

        <!-- STUDIO -->

        <button

          class="yaruva-bg-v2"

          data-bg="studio"

          style="

            min-height:125px;

            border:0;

            border-radius:22px;

            background:

              radial-gradient(

                circle at 50% 35%,

                #ffffff,

                #e1e3e8 58%,

                #b5bbc5

              );

            color:#18151d;

            font-weight:800;

            font-size:16px;

          "

        >

          🎬<br>

          Photo Studio

          <small style="

            display:block;

            margin-top:5px;

            opacity:.55;

            font-weight:500;

          ">

            Clean professional

          </small>

        </button>

        <!-- NIGHT CLUB -->

        <button

          class="yaruva-bg-v2"

          data-bg="neon"

          style="

            min-height:125px;

            border:0;

            border-radius:22px;

            background:

              radial-gradient(

                circle at 25% 30%,

                #b44cff,

                transparent 22%

              ),

              radial-gradient(

                circle at 75% 65%,

                #ff4c9a,

                transparent 25%

              ),

              #10101c;

            color:white;

            font-weight:800;

            font-size:16px;

          "

        >

          🪩<br>

          Neon Night

          <small style="

            display:block;

            margin-top:5px;

            opacity:.7;

            font-weight:500;

          ">

            Music-video look

          </small>

        </button>

      </div>

      <!-- ACTIONS -->

      <div style="

        margin-top:18px;

        display:flex;

        gap:10px;

      ">

        <button

          id="yaruvaTransparentV2"

          style="

            flex:1;

            padding:15px;

            border-radius:17px;

            border:1px solid #dedede;

            background:#fff;

            font-weight:700;

          "

        >

          Transparent

        </button>

        <button

          id="yaruvaSaveBackgroundV2"

          style="

            flex:1;

            padding:15px;

            border-radius:17px;

            border:0;

            background:#17131d;

            color:#fff;

            font-weight:800;

          "

        >

          Save PNG

        </button>

      </div>

    </div>

  `;

  // ----------------------------------------------------

  // INSERT AFTER RESULT

  // ----------------------------------------------------

  if (resultSection) {

    resultSection.insertAdjacentElement(

      "afterend",

      studio

    );

  }

  // ----------------------------------------------------

  // DRAW BACKGROUND

  // ----------------------------------------------------

  function drawProfessionalBackground(

    ctx,

    width,

    height,

    type

  ) {

    let gradient;

    // ==================================================

    // CINEMATIC CITY

    // ==================================================

    if (type === "city") {

      gradient =

        ctx.createLinearGradient(

          0,

          0,

          0,

          height

        );

      gradient.addColorStop(

        0,

        "#101329"

      );

      gradient.addColorStop(

        .55,

        "#29234f"

      );

      gradient.addColorStop(

        1,

        "#070811"

      );

      ctx.fillStyle =

        gradient;

      ctx.fillRect(

        0,

        0,

        width,

        height

      );

      // Moon / glow

      const glow =

        ctx.createRadialGradient(

          width * .72,

          height * .20,

          5,

          width * .72,

          height * .20,

          height * .25

        );

      glow.addColorStop(

        0,

        "rgba(255,220,170,.45)"

      );

      glow.addColorStop(

        1,

        "rgba(255,220,170,0)"

      );

      ctx.fillStyle =

        glow;

      ctx.fillRect(

        0,

        0,

        width,

        height

      );

      // Buildings

      const buildings = 13;

      for (

        let i = 0;

        i < buildings;

        i++

      ) {

        const x =

          (i / buildings) *

          width;

        const buildingWidth =

          width /

          buildings *

          .9;

        const buildingHeight =

          height *

          (

            .28 +

            Math.random() * .30

          );

        ctx.fillStyle =

          i % 2 === 0

            ? "#111321"

            : "#191a2b";

        ctx.fillRect(

          x,

          height - buildingHeight,

          buildingWidth,

          buildingHeight

        );

        // Windows

        ctx.fillStyle =

          "rgba(255,205,120,.45)";

        for (

          let wy = height - buildingHeight + 18;

          wy < height - 15;

          wy += 27

        ) {

          for (

            let wx = x + 10;

            wx < x + buildingWidth - 8;

            wx += 19

          ) {

            ctx.fillRect(

              wx,

              wy,

              5,

              8

            );

          }

        }

      }

    }

    // ==================================================

    // LUXURY OFFICE

    // ==================================================

    else if (type === "office") {

      gradient =

        ctx.createLinearGradient(

          0,

          0,

          width,

          height

        );

      gradient.addColorStop(

        0,

        "#f7f4ee"

      );

      gradient.addColorStop(

        .55,

        "#dedbd5"

      );

      gradient.addColorStop(

        1,

        "#b7b3ad"

      );

      ctx.fillStyle =

        gradient;

      ctx.fillRect(

        0,

        0,

        width,

        height

      );

      // Window

      ctx.fillStyle =

        "rgba(115,145,170,.35)";

      ctx.fillRect(

        width * .08,

        height * .12,

        width * .84,

        height * .48

      );

      // Window lines

      ctx.strokeStyle =

        "rgba(255,255,255,.55)";

      ctx.lineWidth =

        5;

      ctx.beginPath();

      ctx.moveTo(

        width * .50,

        height * .12

      );

      ctx.lineTo(

        width * .50,

        height * .60

      );

      ctx.moveTo(

        width * .08,

        height * .36

      );

      ctx.lineTo(

        width * .92,

        height * .36

      );

      ctx.stroke();

      // Floor

      ctx.fillStyle =

        "#a49f98";

      ctx.fillRect(

        0,

        height * .60,

        width,

        height * .40

      );

      // Floor perspective lines

      ctx.strokeStyle =

        "rgba(255,255,255,.22)";

      ctx.lineWidth =

        2;

      for (

        let i = 0;

        i < 9;

        i++

      ) {

        ctx.beginPath();

        ctx.moveTo(

          width * .5,

          height * .60

        );

        ctx.lineTo(

          width *

          (i / 8),

          height

        );

        ctx.stroke();

      }

    }

    // ==================================================

    // GOLDEN SUNSET

    // ==================================================

    else if (type === "sunset") {

      gradient =

        ctx.createLinearGradient(

          0,

          0,

          0,

          height

        );

      gradient.addColorStop(

        0,

        "#ffcf91"

      );

      gradient.addColorStop(

        .42,

        "#ef8876"

      );

      gradient.addColorStop(

        .72,

        "#a04d72"

      );

      gradient.addColorStop(

        1,

        "#3b2855"

      );

      ctx.fillStyle =

        gradient;

      ctx.fillRect(

        0,

        0,

        width,

        height

      );

      // Sun

      const sun =

        ctx.createRadialGradient(

          width * .72,

          height * .43,

          5,

          width * .72,

          height * .43,

          height * .16

        );

      sun.addColorStop(

        0,

        "rgba(255,244,185,1)"

      );

      sun.addColorStop(

        1,

        "rgba(255,190,100,0)"

      );

      ctx.fillStyle =

        sun;

      ctx.fillRect(

        0,

        0,

        width,

        height

      );

      // Horizon

      ctx.fillStyle =

        "rgba(47,31,49,.45)";

      ctx.fillRect(

        0,

        height * .72,

        width,

        height * .28

      );

    }

    // ==================================================

    // MODERN ROOFTOP

    // ==================================================

    else if (type === "rooftop") {

      gradient =

        ctx.createLinearGradient(

          0,

          0,

          0,

          height

        );

      gradient.addColorStop(

        0,

        "#7785a2"

      );

      gradient.addColorStop(

        .55,

        "#3e475d"

      );

      gradient.addColorStop(

        1,

        "#171a21"

      );

      ctx.fillStyle =

        gradient;

      ctx.fillRect(

        0,

        0,

        width,

        height

      );

      // City skyline

      ctx.fillStyle =

        "rgba(10,12,18,.65)";

      for (

        let i = 0;

        i < 11;

        i++

      ) {

        const x =

          i *

          width /

          10;

        const h =

          height *

          (

            .18 +

            Math.random() * .25

          );

        ctx.fillRect(

          x,

          height * .58 - h,

          width / 12,

          h

        );

      }

      // Rooftop floor

      ctx.fillStyle =

        "#252932";

      ctx.fillRect(

        0,

        height * .70,

        width,

        height * .30

      );

      ctx.strokeStyle =

        "rgba(255,255,255,.15)";

      ctx.lineWidth =

        3;

      for (

        let i = 0;

        i < 8;

        i++

      ) {

        ctx.beginPath();

        ctx.moveTo(

          width * .5,

          height * .70

        );

        ctx.lineTo(

          width *

          i / 7,

          height

        );

        ctx.stroke();

      }

    }

    // ==================================================

    // BEACH

    // ==================================================

    else if (type === "beach") {

      gradient =

        ctx.createLinearGradient(

          0,

          0,

          0,

          height

        );

      gradient.addColorStop(

        0,

        "#8ed9ee"

      );

      gradient.addColorStop(

        .47,

        "#d8f0e7"

      );

      gradient.addColorStop(

        .48,

        "#d8c18d"

      );

      gradient.addColorStop(

        1,

        "#9b704b"

      );

      ctx.fillStyle =

        gradient;

      ctx.fillRect(

        0,

        0,

        width,

        height

      );

      // Sun glow

      const glow =

        ctx.createRadialGradient(

          width * .78,

          height * .22,

          5,

          width * .78,

          height * .22,

          height * .22

        );

      glow.addColorStop(

        0,

        "rgba(255,255,210,.7)"

      );

      glow.addColorStop(

        1,

        "rgba(255,255,210,0)"

      );

      ctx.fillStyle =

        glow;

      ctx.fillRect(

        0,

        0,

        width,

        height

      );

      // Ocean line

      ctx.fillStyle =

        "rgba(55,147,168,.25)";

      ctx.fillRect(

        0,

        height * .48,

        width,

        height * .12

      );

    }

    // ==================================================

    // NATURE

    // ==================================================

    else if (type === "nature") {

      gradient =

        ctx.createLinearGradient(

          0,

          0,

          0,

          height

        );

      gradient.addColorStop(

        0,

        "#b5dba9"

      );

      gradient.addColorStop(

        .40,

        "#67956b"

      );

      gradient.addColorStop(

        1,

        "#18352a"

      );

      ctx.fillStyle =

        gradient;

      ctx.fillRect(

        0,

        0,

        width,

        height

      );

      // Trees

      for (

        let i = 0;

        i < 12;

        i++

      ) {

        const x =

          (

            i /

            11

          ) *

          width;

        const treeHeight =

          height *

          (

            .30 +

            Math.random() * .25

          );

        ctx.fillStyle =

          "#244f39";

        ctx.beginPath();

        ctx.moveTo(

          x,

          height * .82

        );

        ctx.lineTo(

          x - width * .09,

          height * .82

          - treeHeight

        );

        ctx.lineTo(

          x + width * .09,

          height * .82

          - treeHeight

        );

        ctx.closePath();

        ctx.fill();

      }

      // Foreground

      ctx.fillStyle =

        "#173025";

      ctx.fillRect(

        0,

        height * .78,

        width,

        height * .22

      );

    }

    // ==================================================

    // PHOTO STUDIO

    // ==================================================

    else if (type === "studio") {

      gradient =

        ctx.createRadialGradient(

          width * .5,

          height * .30,

          20,

          width * .5,

          height * .5,

          height

        );

      gradient.addColorStop(

        0,

        "#ffffff"

      );

      gradient.addColorStop(

        .55,

        "#e1e4e9"

      );

      gradient.addColorStop(

        1,

        "#aeb5c0"

      );

      ctx.fillStyle =

        gradient;

      ctx.fillRect(

        0,

        0,

        width,

        height

      );

      // Floor

      ctx.fillStyle =

        "rgba(110,115,125,.12)";

      ctx.fillRect(

        0,

        height * .78,

        width,

        height * .22

      );

    }

    // ==================================================

    // NEON NIGHT

    // ==================================================

    else if (type === "neon") {

      ctx.fillStyle =

        "#0d0d18";

      ctx.fillRect(

        0,

        0,

        width,

        height

      );

      const purple =

        ctx.createRadialGradient(

          width * .25,

          height * .35,

          5,

          width * .25,

          height * .35,

          height * .45

        );

      purple.addColorStop(

        0,

        "rgba(183,76,255,.75)"

      );

      purple.addColorStop(

        1,

        "rgba(183,76,255,0)"

      );

      ctx.fillStyle =

        purple;

      ctx.fillRect(

        0,

        0,

        width,

        height

      );

      const pink =

        ctx.createRadialGradient(

          width * .78,

          height * .58,

          5,

          width * .78,

          height * .58,

          height * .42

        );

      pink.addColorStop(

        0,

        "rgba(255,70,160,.65)"

      );

      pink.addColorStop(

        1,

        "rgba(255,70,160,0)"

      );

      ctx.fillStyle =

        pink;

      ctx.fillRect(

        0,

        0,

        width,

        height

      );

      // Neon lines

      ctx.strokeStyle =

        "rgba(90,220,255,.45)";

      ctx.lineWidth =

        8;

      for (

        let i = 0;

        i < 5;

        i++

      ) {

        ctx.beginPath();

        ctx.moveTo(

          0,

          height *

          (.20 + i * .15)

        );

        ctx.lineTo(

          width,

          height *

          (.10 + i * .15)

        );

        ctx.stroke();

      }

    }

  }

  // ----------------------------------------------------

  // APPLY BACKGROUND

  // ----------------------------------------------------

  async function applyProfessionalBackground(

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

  // --------------------------------------------------

  // DRAW PROFESSIONAL BACKGROUND

  // --------------------------------------------------

  drawProfessionalBackground(

    ctx,

    width,

    height,

    type

  );

  // --------------------------------------------------

  // DRAW SUBJECT

  // --------------------------------------------------

  //

  // IMPORTANT:

  // No blurred duplicate.

  // This prevents the ghost/halo around

  // the hair, ears and shoulders.

  //

  ctx.globalAlpha =

    1;

  ctx.filter =

    "none";

  ctx.drawImage(

    subject,

    0,

    0,

    width,

    height

  );

  // --------------------------------------------------

  // EXPORT

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

    "YARUVA AI Background Studio — " +

    type

  );

  if (imageStatus) {

    imageStatus.textContent =

      "Background applied";

  }

}

  // ----------------------------------------------------

  // BACKGROUND BUTTONS

  // ----------------------------------------------------

  studio

    .querySelectorAll(

      ".yaruva-bg-v2"

    )

    .forEach(

      button => {

        button.addEventListener(

          "click",

          async () => {

            const type =

              button.dataset.bg;

            button.disabled =

              true;

            const oldText =

              button.innerHTML;

            button.innerHTML =

              "Creating...";

            try {

              await applyProfessionalBackground(

                type

              );

            }

            catch (error) {

              console.error(

                "YARUVA Background Error:",

                error

              );

              alert(

                "YARUVA couldn't create this background."

              );

            }

            finally {

              button.disabled =

                false;

              button.innerHTML =

                oldText;

            }

          }

        );

      }

    );

  // ----------------------------------------------------

  // TRANSPARENT

  // ----------------------------------------------------

  document

    .getElementById(

      "yaruvaTransparentV2"

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

  // ----------------------------------------------------

  // SAVE PNG

  // ----------------------------------------------------

  document

    .getElementById(

      "yaruvaSaveBackgroundV2"

    )

    ?.addEventListener(

      "click",

      () => {

        if (!generatedImage) {

          alert(

            "Create a result first."

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

  // ----------------------------------------------------

  // SHOW STUDIO WHEN RESULT EXISTS

  // ----------------------------------------------------

  if (

    resultSection &&

    !resultSection.hidden &&

    generatedImage

  ) {

    studio.style.display =

      "block";

  }

  // Watch result visibility

  if (resultSection) {

    const observer =

      new MutationObserver(

        () => {

          if (

            !resultSection.hidden &&

            generatedImage

          ) {

            studio.style.display =

              "block";

          }

        }

      );

    observer.observe(

      resultSection,

      {

        attributes:true

      }

    );

  }

})();
