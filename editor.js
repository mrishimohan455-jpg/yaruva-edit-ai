/*
====================================================
 YARUVA AI — FREE LOCAL CREATIVE ENGINE
 No OpenAI API
 No API key
 No paid AI service
 Runs directly in the browser
====================================================
*/

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


/* ==================================================
   IMAGE UPLOAD
================================================== */

function readImage(file) {

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please choose a valid image.");
    return;
  }

  const reader = new FileReader();

  reader.onload = function () {

    currentImage = reader.result;

    previewImage.src = currentImage;

    uploadBox.hidden = true;
    previewCard.hidden = false;

    const status =
      document.getElementById("imageStatus");

    if (status) {
      status.textContent = "Image ready";
    }
  };

  reader.readAsDataURL(file);
}


uploadBtn?.addEventListener("click", function () {
  imageInput?.click();
});


changeImageBtn?.addEventListener("click", function () {
  imageInput?.click();
});


imageInput?.addEventListener("change", function (event) {

  const file = event.target.files?.[0];

  readImage(file);

});


/* ==================================================
   DRAG & DROP
================================================== */

uploadBox?.addEventListener("dragover", function (event) {

  event.preventDefault();

  uploadBox.style.transform = "scale(.98)";

});


uploadBox?.addEventListener("dragleave", function () {

  uploadBox.style.transform = "";

});


uploadBox?.addEventListener("drop", function (event) {

  event.preventDefault();

  uploadBox.style.transform = "";

  const file =
    event.dataTransfer.files?.[0];

  readImage(file);

});


/* ==================================================
   PROMPT SUGGESTIONS
================================================== */

document
  .querySelectorAll("[data-prompt]")
  .forEach(function (button) {

    button.addEventListener("click", function () {

      promptInput.value =
        button.dataset.prompt || "";

      promptInput.focus();

    });

  });


/* ==================================================
   AI MAGIC
================================================== */

document
  .querySelectorAll("[data-magic]")
  .forEach(function (button) {

    button.addEventListener("click", function () {

      promptInput.value =
        button.dataset.magic || "";

      promptInput.focus();

      document
        .querySelector(".ai-prompt")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });

    });

  });


/* ==================================================
   YARUVA IMAGE ENGINE
================================================== */

async function yaruvaCreateImage(
  imageData,
  prompt
) {

  const image =
    await loadImage(imageData);

  const canvas =
    document.createElement("canvas");

  const ctx =
    canvas.getContext("2d");

  const MAX_SIZE = 1600;

  let width =
    image.naturalWidth ||
    image.width;

  let height =
    image.naturalHeight ||
    image.height;


  /* Resize large images */

  if (
    width > MAX_SIZE ||
    height > MAX_SIZE
  ) {

    const scale =
      Math.min(
        MAX_SIZE / width,
        MAX_SIZE / height
      );

    width =
      Math.round(width * scale);

    height =
      Math.round(height * scale);
  }


  canvas.width = width;
  canvas.height = height;


  ctx.drawImage(
    image,
    0,
    0,
    width,
    height
  );


  const text =
    String(prompt || "")
      .toLowerCase();


  let mode = "enhance";


  if (
    text.includes("cinematic") ||
    text.includes("cinema") ||
    text.includes("movie") ||
    text.includes("film")
  ) {

    mode = "cinematic";

  }

  else if (
    text.includes("luxury") ||
    text.includes("editorial") ||
    text.includes("fashion")
  ) {

    mode = "luxury";

  }

  else if (
    text.includes("relight") ||
    text.includes("lighting") ||
    text.includes("light")
  ) {

    mode = "relight";

  }

  else if (
    text.includes("portrait") ||
    text.includes("professional portrait")
  ) {

    mode = "portrait";

  }


  processPixels(
    canvas,
    ctx,
    mode
  );


  return canvas.toDataURL(
    "image/jpeg",
    0.94
  );
}


/* ==================================================
   IMAGE PROCESSING
================================================== */

function processPixels(
  canvas,
  ctx,
  mode
) {

  const width =
    canvas.width;

  const height =
    canvas.height;


  const imageData =
    ctx.getImageData(
      0,
      0,
      width,
      height
    );


  const pixels =
    imageData.data;


  for (
    let i = 0;
    i < pixels.length;
    i += 4
  ) {

    let r = pixels[i];
    let g = pixels[i + 1];
    let b = pixels[i + 2];


    const brightness =
      (r + g + b) / 3;


    /* ================================
       ENHANCE
    ================================= */

    if (mode === "enhance") {

      r = contrast(r, 1.12);
      g = contrast(g, 1.12);
      b = contrast(b, 1.12);

      r *= 1.05;
      g *= 1.05;
      b *= 1.05;
    }


    /* ================================
       CINEMATIC
    ================================= */

    if (mode === "cinematic") {

      r = contrast(r, 1.18);
      g = contrast(g, 1.12);
      b = contrast(b, 1.08);

      r *= 1.05;
      g *= 0.98;
      b *= 0.94;


      if (brightness < 90) {

        b *= 1.08;

      }


      if (brightness > 190) {

        r *= 1.04;

      }
    }


    /* ================================
       LUXURY
    ================================= */

    if (mode === "luxury") {

      r = contrast(r, 1.10);
      g = contrast(g, 1.06);
      b = contrast(b, 1.08);

      r *= 1.08;
      g *= 1.02;
      b *= 1.04;
    }


    /* ================================
       RELIGHT
    ================================= */

    if (mode === "relight") {

      const lift =
        brightness < 150
          ? 1.17
          : 1.05;

      r *= lift;
      g *= lift;
      b *= lift;
    }


    /* ================================
       PORTRAIT
    ================================= */

    if (mode === "portrait") {

      r *= 1.05;
      g *= 1.02;
      b *= 0.98;

      r = contrast(r, 1.04);
      g = contrast(g, 1.04);
      b = contrast(b, 1.02);
    }


    pixels[i] =
      clamp(r);

    pixels[i + 1] =
      clamp(g);

    pixels[i + 2] =
      clamp(b);
  }


  ctx.putImageData(
    imageData,
    0,
    0
  );


  /* ================================
     CINEMATIC VIGNETTE
  ================================= */

  if (mode === "cinematic") {

    const gradient =
      ctx.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.18,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.72
      );


    gradient.addColorStop(
      0,
      "rgba(0,0,0,0)"
    );


    gradient.addColorStop(
      0.72,
      "rgba(0,0,0,.08)"
    );


    gradient.addColorStop(
      1,
      "rgba(0,0,0,.40)"
    );


    ctx.fillStyle =
      gradient;


    ctx.fillRect(
      0,
      0,
      width,
      height
    );
  }

}


/* ==================================================
   IMAGE HELPERS
================================================== */

function loadImage(src) {

  return new Promise(
    function (resolve, reject) {

      const image =
        new Image();

      image.onload =
        function () {
          resolve(image);
        };

      image.onerror =
        function () {
          reject(
            new Error(
              "Unable to read this image."
            )
          );
        };

      image.src = src;

    }
  );
}


function contrast(
  value,
  factor
) {

  return (
    (value - 128) *
    factor +
    128
  );
}


function clamp(value) {

  return Math.max(
    0,
    Math.min(
      255,
      Math.round(value)
    )
  );
}


/* ==================================================
   GENERATE
================================================== */

generateBtn?.addEventListener(
  "click",
  generateImage
);


async function generateImage() {

  if (!currentImage) {

    alert(
      "Please upload an image first."
    );

    return;
  }


  const prompt =
    promptInput.value.trim();


  if (!prompt) {

    alert(
      "Tell YARUVA what you want to create."
    );

    promptInput.focus();

    return;
  }


  const original =
    generateBtn.innerHTML;


  generateBtn.disabled =
    true;


  generateBtn.innerHTML = `
    <span>YARUVA is creating…</span>
    <b>✦</b>
  `;


  try {

    generatedImage =
      await yaruvaCreateImage(
        currentImage,
        prompt
      );


    resultImage.src =
      generatedImage;


    resultPrompt.textContent =
      prompt;


    resultSection.hidden =
      false;


    resultSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });


  }

  catch (error) {

    console.error(error);

    alert(
      error.message ||
      "YARUVA could not process the image."
    );

  }

  finally {

    generateBtn.disabled =
      false;

    generateBtn.innerHTML =
      original;

  }

}


/* ==================================================
   SAVE PROJECT
================================================== */

saveProjectBtn?.addEventListener(
  "click",
  saveProject
);


function saveProject() {

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

    title:
      "YARUVA Creation",

    prompt:
      promptInput.value.trim(),

    image:
      generatedImage,

    createdAt:
      new Date().toISOString()

  });


  localStorage.setItem(
    "yaruvaProjects",
    JSON.stringify(
      projects.slice(0, 30)
    )
  );


  saveProjectBtn.textContent =
    "✓ Saved";


  setTimeout(
    function () {

      saveProjectBtn.textContent =
        "Save project";

    },
    1800
  );

}


/* ==================================================
   EXPORT
================================================== */

exportBtn?.addEventListener(
  "click",
  function () {

    if (!generatedImage) {

      alert(
        "Create an image first."
      );

      return;
    }


    const link =
      document.createElement("a");


    link.href =
      generatedImage;


    link.download =
      "yaruva-ai-creation.jpg";


    document.body.appendChild(link);

    link.click();

    link.remove();

  }
);


/* ==================================================
   IMAGE → VIDEO
================================================== */

/*
  The paid OpenAI video backend is intentionally
  not used anymore.

  We will build YARUVA's free motion engine separately.
*/

videoBtn?.addEventListener(
  "click",
  function () {

    if (videoStatus) {

      videoStatus.hidden =
        false;

      videoStatus.textContent =
        "YARUVA free video engine is coming next. Image creation is ready.";

    }

  }
);


if (videoResult) {
  videoResult.hidden = true;
}


/* ==================================================
   PROFILE
================================================== */

document
  .getElementById("profileNav")
  ?.addEventListener(
    "click",
    function () {

      alert(
        "YARUVA profile — coming soon."
      );

    }
  );
