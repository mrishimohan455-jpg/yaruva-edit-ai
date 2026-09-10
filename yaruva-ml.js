/*
====================================================
 YARUVA ML ENGINE V2
 Browser-side machine learning
 No API key
 No paid inference
====================================================
*/

let yaruvaSegmenter = null;
let yaruvaModelLoading = false;

async function loadYaruvaModel() {

  if (yaruvaSegmenter) {
    return yaruvaSegmenter;
  }

  if (yaruvaModelLoading) {
    while (yaruvaModelLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return yaruvaSegmenter;
  }

  yaruvaModelLoading = true;

  try {

    const transformers =
      await import(
        "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1"
      );

    const { pipeline } = transformers;

    yaruvaSegmenter =
      await pipeline(
        "background-removal",
        "Xenova/modnet",
        {
          dtype: "fp32"
        }
      );

    return yaruvaSegmenter;

  } finally {

    yaruvaModelLoading = false;

  }
}


window.YARUVA_ML = {

  async removeBackground(imageDataURL) {

    const segmenter =
      await loadYaruvaModel();

    const output =
      await segmenter(imageDataURL);

    if (!output || !output[0]) {
      throw new Error(
        "YARUVA could not detect the subject."
      );
    }

    const mask =
      output[0].toCanvas();

    const source =
      await loadYaruvaImage(
        imageDataURL
      );

    const canvas =
      document.createElement("canvas");

    canvas.width =
      source.naturalWidth ||
      source.width;

    canvas.height =
      source.naturalHeight ||
      source.height;

    const ctx =
      canvas.getContext("2d");

    ctx.drawImage(
      source,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const sourcePixels =
      ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

    const maskCanvas =
      document.createElement("canvas");

    maskCanvas.width =
      canvas.width;

    maskCanvas.height =
      canvas.height;

    const maskCtx =
      maskCanvas.getContext("2d");

    maskCtx.drawImage(
      mask,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const maskPixels =
      maskCtx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

    for (
      let i = 0;
      i < sourcePixels.data.length;
      i += 4
    ) {

      sourcePixels.data[i + 3] =
        maskPixels.data[i];

    }

    ctx.putImageData(
      sourcePixels,
      0,
      0
    );

    return canvas.toDataURL(
      "image/png"
    );
  }

};


function loadYaruvaImage(src) {

  return new Promise(
    (resolve, reject) => {

      const image =
        new Image();

      image.onload =
        () => resolve(image);

      image.onerror =
        () => reject(
          new Error(
            "Unable to load image."
          )
        );

      image.src = src;

    }
  );

}
