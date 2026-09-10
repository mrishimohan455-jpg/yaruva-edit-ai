/*
  YARUVA AI ENGINE
  Local browser-based creative image engine.
  No API key. No external AI service.
*/

window.YARUVA_AI = {

  async create(imageDataURL, prompt) {

    if (!imageDataURL) {
      throw new Error("Please upload an image first.");
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const image = await this.loadImage(imageDataURL);

    const maxSize = 1600;

    let width = image.naturalWidth || image.width;
    let height = image.naturalHeight || image.height;

    if (width > maxSize || height > maxSize) {

      const scale =
        Math.min(maxSize / width, maxSize / height);

      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(image, 0, 0, width, height);

    const text = String(prompt || "").toLowerCase();

    let mode = "enhance";

    if (
      text.includes("cinematic") ||
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
      text.includes("face") ||
      text.includes("professional portrait")
    ) {
      mode = "portrait";
    }

    const result =
      this.process(canvas, ctx, mode);

    return result;
  },


  loadImage(src) {

    return new Promise((resolve, reject) => {

      const image = new Image();

      image.onload = () => resolve(image);

      image.onerror = () =>
        reject(
          new Error("Unable to read the image.")
        );

      image.src = src;
    });
  },


  process(canvas, ctx, mode) {

    const width = canvas.width;
    const height = canvas.height;

    const imageData =
      ctx.getImageData(
        0,
        0,
        width,
        height
      );

    const pixels = imageData.data;

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


      /* =====================
         ENHANCE
         ===================== */

      if (mode === "enhance") {

        r = this.contrast(r, 1.12);
        g = this.contrast(g, 1.12);
        b = this.contrast(b, 1.12);

        r *= 1.05;
        g *= 1.05;
        b *= 1.05;
      }


      /* =====================
         CINEMATIC
         ===================== */

      if (mode === "cinematic") {

        r = this.contrast(r, 1.18);
        g = this.contrast(g, 1.12);
        b = this.contrast(b, 1.08);

        r *= 1.05;
        g *= 0.98;
        b *= 0.94;

        if (brightness < 90) {
          b *= 1.06;
        }

        if (brightness > 190) {
          r *= 1.04;
        }
      }


      /* =====================
         LUXURY
         ===================== */

      if (mode === "luxury") {

        r = this.contrast(r, 1.10);
        g = this.contrast(g, 1.06);
        b = this.contrast(b, 1.08);

        r *= 1.08;
        g *= 1.02;
        b *= 1.04;
      }


      /* =====================
         RELIGHT
         ===================== */

      if (mode === "relight") {

        const lift =
          brightness < 150
            ? 1.16
            : 1.04;

        r *= lift;
        g *= lift;
        b *= lift;
      }


      /* =====================
         PORTRAIT
         ===================== */

      if (mode === "portrait") {

        r *= 1.05;
        g *= 1.02;
        b *= 0.98;

        r = this.contrast(r, 1.04);
        g = this.contrast(g, 1.04);
        b = this.contrast(b, 1.02);
      }


      pixels[i] =
        this.clamp(r);

      pixels[i + 1] =
        this.clamp(g);

      pixels[i + 2] =
        this.clamp(b);
    }


    ctx.putImageData(
      imageData,
      0,
      0
    );


    /* CINEMATIC VIGNETTE */

    if (mode === "cinematic") {

      const gradient =
        ctx.createRadialGradient(
          width / 2,
          height / 2,
          Math.min(width, height) * .20,
          width / 2,
          height / 2,
          Math.max(width, height) * .70
        );

      gradient.addColorStop(
        0,
        "rgba(0,0,0,0)"
      );

      gradient.addColorStop(
        1,
        "rgba(0,0,0,.38)"
      );

      ctx.fillStyle = gradient;

      ctx.fillRect(
        0,
        0,
        width,
        height
      );
    }


    return canvas.toDataURL(
      "image/jpeg",
      .94
    );
  },


  contrast(value, factor) {

    return (
      (value - 128) *
      factor +
      128
    );
  },


  clamp(value) {

    return Math.max(
      0,
      Math.min(
        255,
        Math.round(value)
      )
    );
  }

};
