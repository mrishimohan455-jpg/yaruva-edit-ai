// ======================================================
// YARUVA AI EDITOR
// Browser AI + MODNet + Background Studio
// ======================================================


// ======================================================
// ELEMENTS
// ======================================================

const imageInput =
  document.getElementById("imageInput");

const uploadBtn =
  document.getElementById("uploadBtn");

const uploadBox =
  document.getElementById("uploadBox");

const previewCard =
  document.getElementById("previewCard");

const previewImage =
  document.getElementById("previewImage");

const changeImageBtn =
  document.getElementById("changeImageBtn");

const beforeAfterBtn =
  document.getElementById("beforeAfterBtn");

const promptInput =
  document.getElementById("promptInput");

const generateBtn =
  document.getElementById("generateBtn");

const resultSection =
  document.getElementById("resultSection");

const resultImage =
  document.getElementById("resultImage");

const resultPrompt =
  document.getElementById("resultPrompt");

const saveProjectBtn =
  document.getElementById("saveProjectBtn");

const imageStatus =
  document.getElementById("imageStatus");

const canvasLabel =
  document.getElementById("canvasLabel");


// ======================================================
// STATE
// ======================================================

let currentImage = null;
let generatedImage = null;
let showingBefore = false;

let transformersModule = null;
let aiRemoveModel = null;
let aiRemoveProcessor = null;


// ======================================================
// UPLOAD
// ======================================================

changeImageBtn?.addEventListener(
  "click",
  () => {
    imageInput?.click();
  }
);


imageInput?.addEventListener(
  "change",
  () => {

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


    reader.onload =
      () => {

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


    reader.onerror =
      () => {

        alert(
          "YARUVA couldn't read this image."
        );

      };


    reader.readAsDataURL(file);

  }
);


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
        () =>
          reject(
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
// YARUVA IMAGE ENGINE
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


  canvas.width =
    img.naturalWidth;

  canvas.height =
    img.naturalHeight;


  const ctx =
    canvas.getContext(
      "2d",
      {
        willReadFrequently: true
      }
    );


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


    if (mode === "enhance") {

      r =
        (r - 128) * 1.10 + 128;

      g =
        (g - 128) * 1.10 + 128;

      b =
        (b - 128) * 1.10 + 128;

    }


    if (mode === "cinematic") {

      r =
        (r - 128) * 1.18 + 128;

      g =
        (g - 128) * 1.08 + 128;

      b =
        (b - 128) * 1.15 + 128;

      r += 6;
      b += 8;

    }


    if (mode === "luxury") {

      r =
        (r - 128) * 1.22 + 128;

      g =
        (g - 128) * 1.14 + 128;

      b =
        (b - 128) * 1.18 + 128;

      r += 5;

    }


    if (mode === "relight") {

      r += 15;
      g += 15;
      b += 15;

      r =
        (r - 128) * 1.08 + 128;

      g =
        (g - 128) * 1.08 + 128;

      b =
        (b - 128) * 1.08 + 128;

    }


    if (mode === "portrait") {

      r =
        (r - 128) * 1.08 + 128;

      g =
        (g - 128) * 1.05 + 128;

      b =
        (b - 128) * 1.04 + 128;

    }


    data[i] =
      Math.max(
        0,
        Math.min(255, r)
      );

    data[i + 1] =
      Math.max(
        0,
        Math.min(255, g)
      );

    data[i + 2] =
      Math.max(
        0,
        Math.min(255, b)
      );

  }


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


    const oldText =
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
        oldText ||
        "Generate";

    }

  }
);


// ======================================================
// TRANSFORMERS.JS
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


  aiRemoveModel =
    await transformers.AutoModel.from_pretrained(
      "Xenova/modnet",
      {
        dtype: "fp32"
      }
    );


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


  const oldText =
    button?.textContent ||
    "Remove";


  if (button) {

    button.disabled =
      true;

    button.textContent =
      "Loading AI...";

  }


  try {

    const transformers =
      await loadTransformers();


    const ai =
      await loadRemoveModel(
        button
      );


    if (button) {

      button.textContent =
        "Preparing image...";

    }


    const image =
      await transformers.RawImage.fromURL(
        currentImage
      );


    if (button) {

      button.textContent =
        "AI Processing...";

    }


    const processed =
      await ai.processor(
        image
      );


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


    const mask =
      await transformers.RawImage.fromTensor(
        output.output[0]
          .mul(255)
          .to("uint8")
      );


    const resizedMask =
      await mask.resize(
        image.width,
        image.height
      );


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
          willReadFrequently: true
        }
      );


    const originalCanvas =
      image.toCanvas();


    ctx.drawImage(
      originalCanvas,
      0,
      0,
      image.width,
      image.height
    );


    const imageData =
      ctx.getImageData(
        0,
        0,
        image.width,
        image.height
      );


    const pixels =
      imageData.data;


    const maskCanvas =
      resizedMask.toCanvas();


    const maskCtx =
      maskCanvas.getContext(
        "2d",
        {
          willReadFrequently: true
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


    for (
      let i = 0;
      i < pixels.length;
      i += 4
    ) {

      pixels[i + 3] =
        maskPixels[i];

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
        oldText;

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
  .forEach(
    button => {

      button.addEventListener(
        "click",
        async () => {

          const title =
            button
              .querySelector("strong")
              ?.textContent
              ?.trim() ||
            "";


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
// BACKGROUND STUDIO
// ======================================================

(function initBackgroundStudio() {

  const oldStudio =
    document.getElementById(
      "yaruvaBackgroundStudio"
    );

  if (oldStudio) {

    oldStudio.remove();

  }


  const studio =
    document.createElement(
      "section"
    );


  studio.id =
    "yaruvaBackgroundStudio";


  studio.className =
    "creative-section";


  studio.style.display =
    "none";


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


      <div style="
        display:grid;
        grid-template-columns:repeat(2,1fr);
        gap:12px;
      ">

        <button
          class="yaruva-bg"
          data-bg="city"
          style="
            min-height:125px;
            border:0;
            border-radius:22px;
            background:linear-gradient(145deg,#15172e,#30255e,#080914);
            color:white;
            font-weight:800;
            font-size:16px;
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


        <button
          class="yaruva-bg"
          data-bg="office"
          style="
            min-height:125px;
            border:0;
            border-radius:22px;
            background:linear-gradient(135deg,#f5f0e8,#d8d2ca);
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


        <button
          class="yaruva-bg"
          data-bg="sunset"
          style="
            min-height:125px;
            border:0;
            border-radius:22px;
            background:linear-gradient(160deg,#ffd18a,#ef7c72,#6b3f78);
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


        <button
          class="yaruva-bg"
          data-bg="rooftop"
          style="
            min-height:125px;
            border:0;
            border-radius:22px;
            background:linear-gradient(145deg,#6c7894,#303746,#14161c);
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


        <button
          class="yaruva-bg"
          data-bg="beach"
          style="
            min-height:125px;
            border:0;
            border-radius:22px;
            background:linear-gradient(180deg,#8ed9ee,#d7f1e8,#d4a56b);
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


        <button
          class="yaruva-bg"
          data-bg="nature"
          style="
            min-height:125px;
            border:0;
            border-radius:22px;
            background:linear-gradient(155deg,#a7d8a2,#477657,#172e25);
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


        <button
          class="yaruva-bg"
          data-bg="studio"
          style="
            min-height:125px;
            border:0;
            border-radius:22px;
            background:radial-gradient(circle at 50% 35%,#ffffff,#e1e3e8,#b5bbc5);
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


        <button
          class="yaruva-bg"
          data-bg="neon"
          style="
            min-height:125px;
            border:0;
            border-radius:22px;
            background:
              radial-gradient(circle at 25% 30%,#b44cff,transparent 22%),
              radial-gradient(circle at 75% 65%,#ff4c9a,transparent 25%),
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


      <div style="
        margin-top:18px;
        display:flex;
        gap:10px;
      ">

        <button
          id="yaruvaTransparent"
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
          id="yaruvaSaveBackground"
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


  if (resultSection) {

    resultSection.insertAdjacentElement(
      "afterend",
      studio
    );

  }


  // ====================================================
  // BACKGROUND DRAWING
  // ====================================================

  function drawBackground(
    ctx,
    width,
    height,
    type
  ) {

    const W =
      width;

    const H =
      height;


    function fillGradient(
      colors
    ) {

      const g =
        ctx.createLinearGradient(
          0,
          0,
          0,
          H
        );


      colors.forEach(
        (color, index) => {

          g.addColorStop(
            index /
            (colors.length - 1),
            color
          );

        }
      );


      ctx.fillStyle =
        g;

      ctx.fillRect(
        0,
        0,
        W,
        H
      );

    }


    function glow(
      x,
      y,
      radius,
      color,
      alpha
    ) {

      const g =
        ctx.createRadialGradient(
          x,
          y,
          0,
          x,
          y,
          radius
        );


      g.addColorStop(
        0,
        `rgba(${color},${alpha})`
      );

      g.addColorStop(
        1,
        `rgba(${color},0)`
      );


      ctx.fillStyle =
        g;

      ctx.fillRect(
        0,
        0,
        W,
        H
      );

    }


    // CITY
    if (type === "city") {

      fillGradient([
        "#080b18",
        "#17172d",
        "#30253b",
        "#080a12"
      ]);


      glow(
        W * .75,
        H * .20,
        W * .42,
        "255,190,130",
        .28
      );


      for (
        let i = 0;
        i < 11;
        i++
      ) {

        const x =
          W * (i / 11);

        const bw =
          W * (
            .08 +
            (i % 3) * .025
          );

        const bh =
          H * (
            .25 +
            (i % 4) * .08
          );


        ctx.fillStyle =
          i % 2 === 0
            ? "#101423"
            : "#181b2b";


        ctx.fillRect(
          x,
          H * .78 - bh,
          bw,
          bh
        );


        for (
          let row = 0;
          row < 7;
          row++
        ) {

          for (
            let col = 0;
            col < 3;
            col++
          ) {

            if (
              (
                row +
                col +
                i
              ) % 3 === 0
            ) continue;


            ctx.fillStyle =
              "rgba(255,205,120,.60)";


            ctx.fillRect(
              x +
              bw * .18 +
              col * bw * .25,

              H * .78 -
              bh +
              bh * .12 +
              row * bh * .11,

              Math.max(
                2,
                bw * .06
              ),

              Math.max(
                3,
                bh * .035
              )
            );

          }

        }

      }


      ctx.fillStyle =
        "#090b12";

      ctx.fillRect(
        0,
        H * .78,
        W,
        H * .22
      );

    }


    // OFFICE
    else if (
      type === "office"
    ) {

      fillGradient([
        "#11151b",
        "#343941",
        "#15171c"
      ]);


      ctx.fillStyle =
        "#1b2b3b";

      ctx.fillRect(
        W * .08,
        H * .10,
        W * .84,
        H * .62
      );


      glow(
        W * .20,
        H * .30,
        W * .38,
        "255,205,150",
        .20
      );


      ctx.strokeStyle =
        "rgba(230,240,250,.25)";

      ctx.lineWidth =
        Math.max(
          2,
          W * .004
        );


      ctx.beginPath();

      ctx.moveTo(
        W * .50,
        H * .10
      );

      ctx.lineTo(
        W * .50,
        H * .72
      );

      ctx.moveTo(
        W * .08,
        H * .40
      );

      ctx.lineTo(
        W * .92,
        H * .40
      );

      ctx.stroke();


      const floor =
        ctx.createLinearGradient(
          0,
          H * .70,
          0,
          H
        );

      floor.addColorStop(
        0,
        "#41434a"
      );

      floor.addColorStop(
        1,
        "#101217"
      );


      ctx.fillStyle =
        floor;

      ctx.fillRect(
        0,
        H * .70,
        W,
        H * .30
      );

    }


    // SUNSET
    else if (
      type === "sunset"
    ) {

      fillGradient([
        "#39234d",
        "#b95f5a",
        "#f09a58",
        "#f5c77a"
      ]);


      glow(
        W * .78,
        H * .42,
        W * .32,
        "255,220,150",
        .65
      );


      ctx.fillStyle =
        "rgba(255,235,180,.95)";


      ctx.beginPath();

      ctx.arc(
        W * .78,
        H * .42,
        Math.min(W,H) * .055,
        0,
        Math.PI * 2
      );

      ctx.fill();


      ctx.fillStyle =
        "#26342e";

      ctx.beginPath();

      ctx.moveTo(
        0,
        H * .70
      );


      for (
        let i = 0;
        i <= 10;
        i++
      ) {

        ctx.lineTo(
          W * (i / 10),
          H *
          (
            .61 +
            Math.sin(i * 1.7) * .05
          )
        );

      }


      ctx.lineTo(
        W,
        H
      );

      ctx.lineTo(
        0,
        H
      );

      ctx.closePath();

      ctx.fill();

    }


    // ROOFTOP
    else if (
      type === "rooftop"
    ) {

      fillGradient([
        "#07101d",
        "#17334a",
        "#597a8b"
      ]);


      glow(
        W * .78,
        H * .25,
        W * .35,
        "120,180,220",
        .28
      );


      for (
        let i = 0;
        i < 10;
        i++
      ) {

        const bw =
          W * .08;

        const bh =
          H *
          (
            .15 +
            (i % 4) * .05
          );

        const x =
          W *
          (
            i / 10
          );


        ctx.fillStyle =
          "#182531";

        ctx.fillRect(
          x,
          H * .72 - bh,
          bw,
          bh
        );

      }


      const floor =
        ctx.createLinearGradient(
          0,
          H * .68,
          0,
          H
        );

      floor.addColorStop(
        0,
        "#41464d"
      );

      floor.addColorStop(
        1,
        "#11151a"
      );


      ctx.fillStyle =
        floor;

      ctx.fillRect(
        0,
        H * .68,
        W,
        H * .32
      );


      ctx.strokeStyle =
        "rgba(255,255,255,.14)";

      ctx.lineWidth =
        Math.max(
          1,
          W * .002
        );


      for (
        let i = 0;
        i < 8;
        i++
      ) {

        ctx.beginPath();

        ctx.moveTo(
          W * .5,
          H * .68
        );

        ctx.lineTo(
          W * (i / 7),
          H
        );

        ctx.stroke();

      }

    }


    // BEACH
    else if (
      type === "beach"
    ) {

      fillGradient([
        "#4e91bd",
        "#9dd1df",
        "#f2d7a0"
      ]);


      glow(
        W * .78,
        H * .20,
        W * .40,
        "255,230,170",
        .40
      );


      ctx.fillStyle =
        "#398ba5";

      ctx.fillRect(
        0,
        H * .48,
        W,
        H * .32
      );


      ctx.fillStyle =
        "#d9bd82";

      ctx.fillRect(
        0,
        H * .80,
        W,
        H * .20
      );


      // Palm trees

      function palm(
        x,
        y,
        scale
      ) {

        ctx.strokeStyle =
          "rgba(20,55,45,.85)";

        ctx.lineWidth =
          Math.max(
            2,
            W * .007 * scale
          );


        ctx.beginPath();

        ctx.moveTo(
          x,
          y
        );

        ctx.quadraticCurveTo(
          x - W * .025 * scale,
          y - H * .12 * scale,
          x + W * .015 * scale,
          y - H * .23 * scale
        );

        ctx.stroke();


        const topX =
          x +
          W * .015 * scale;

        const topY =
          y -
          H * .23 * scale;


        for (
          let i = 0;
          i < 7;
          i++
        ) {

          const angle =
            -1.9 +
            i * .55;


          ctx.beginPath();

          ctx.moveTo(
            topX,
            topY
          );

          ctx.quadraticCurveTo(
            topX +
            Math.cos(angle) *
            W * .08 * scale,

            topY +
            Math.sin(angle) *
            H * .06 * scale,

            topX +
            Math.cos(angle) *
            W * .16 * scale,

            topY +
            Math.sin(angle) *
            H * .13 * scale
          );

          ctx.stroke();

        }

      }


      palm(
        W * .10,
        H * .82,
        1
      );


      palm(
        W * .90,
        H * .84,
        .85
      );

    }


    // NATURE
    else if (
      type === "nature"
    ) {

      fillGradient([
        "#86b7a0",
        "#4f8067",
        "#1c392d"
      ]);


      glow(
        W * .50,
        H * .25,
        W * .50,
        "255,235,180",
        .28
      );


      for (
        let i = 0;
        i < 15;
        i++
      ) {

        const x =
          W *
          (i / 14);

        const radius =
          H *
          (
            .10 +
            (i % 5) * .025
          );


        ctx.fillStyle =
          i % 2 === 0
            ? "#28523e"
            : "#1f4435";


        ctx.beginPath();

        ctx.arc(
          x,
          H * .64,
          radius,
          0,
          Math.PI * 2
        );

        ctx.fill();

      }


      ctx.fillStyle =
        "#172d20";

      ctx.fillRect(
        0,
        H * .68,
        W,
        H * .32
      );

    }


    // STUDIO
    else if (
      type === "studio"
    ) {

      const g =
        ctx.createRadialGradient(
          W * .50,
          H * .30,
          20,
          W * .50,
          H * .50,
          H
        );


      g.addColorStop(
        0,
        "#ffffff"
      );

      g.addColorStop(
        .55,
        "#e1e4e9"
      );

      g.addColorStop(
        1,
        "#aeb5c0"
      );


      ctx.fillStyle =
        g;

      ctx.fillRect(
        0,
        0,
        W,
        H
      );


      ctx.fillStyle =
        "rgba(80,85,95,.18)";

      ctx.fillRect(
        0,
        H * .76,
        W,
        H * .24
      );

    }


    // NEON
    else if (
      type === "neon"
    ) {

      ctx.fillStyle =
        "#0d0d
