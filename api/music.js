const JAMENDO_CLIENT_ID =
  process.env.JAMENDO_CLIENT_ID || "d6dcf35f";

const SEARCH_TIMEOUT = 5000;
const STREAM_TIMEOUT = 12000;

function corsHeaders(type = "application/json; charset=utf-8") {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
    "Content-Type": type
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders()
  });
}

async function fetchWithTimeout(url, options = {}, timeout = 5000) {
  const controller = new AbortController();

  const timer = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
}


/* =========================================================
   JAMENDO SEARCH
   ========================================================= */

async function jamendoSearch(params = {}) {

  const url = new URL(
    "https://api.jamendo.com/v3.0/tracks/"
  );

  url.searchParams.set(
    "client_id",
    JAMENDO_CLIENT_ID
  );

  url.searchParams.set(
    "format",
    "json"
  );

  url.searchParams.set(
    "limit",
    "10"
  );

  url.searchParams.set(
    "audioformat",
    "mp32"
  );

  url.searchParams.set(
    "type",
    "single albumtrack"
  );

  url.searchParams.set(
    "audiodownload_allowed",
    "true"
  );

  for (const [key, value] of Object.entries(params)) {

    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {

      url.searchParams.set(
        key,
        value
      );

    }

  }

  const response =
    await fetchWithTimeout(
      url,
      {},
      SEARCH_TIMEOUT
    );

  if (!response.ok) {

    throw new Error(
      `Jamendo HTTP ${response.status}`
    );

  }

  const data =
    await response.json();

  if (
    data?.headers?.status &&
    data.headers.status !== "success"
  ) {

    throw new Error(
      data?.headers?.error_message ||
      "Jamendo API request failed."
    );

  }

  return Array.isArray(data?.results)
    ? data.results
    : [];

}


/* =========================================================
   USABLE TRACK FILTER
   ========================================================= */

function getUsableTracks(results) {

  const seen = new Set();

  const tracks = [];

  for (const track of results) {

    if (!track?.id) {
      continue;
    }

    if (!track?.audio) {
      continue;
    }

    if (
      track.audiodownload_allowed === false
    ) {
      continue;
    }

    const id =
      String(track.id);

    if (seen.has(id)) {
      continue;
    }

    seen.add(id);

    tracks.push({

      id,

      name:
        track.name ||
        "Untitled",

      artist_name:
        track.artist_name ||
        "Unknown artist",

      duration:
        Number(track.duration) || 0,

      audio:
        track.audio || "",

      audiodownload:
        track.audiodownload || "",

      license_ccurl:
        track.license_ccurl || "",

      audiodownload_allowed:
        track.audiodownload_allowed !== false

    });

  }

  return tracks;

}


/* =========================================================
   SEARCH STRATEGY
   ========================================================= */

function buildSearches(query) {

  const text =
    String(query || "")
      .toLowerCase()
      .trim();

  const searches = [];

  /*
   * Most specific searches first.
   */

  if (
    /cinematic|movie|film|dramatic|epic|motivational|motivat|inspirational|inspir/.test(text)
  ) {

    searches.push({
      fuzzytags: "cinematic"
    });

    searches.push({
      tags: "soundtrack"
    });

    searches.push({
      tags: "rock"
    });

    searches.push({
      tags: "electronic"
    });

  }

  if (
    /calm|relax|peace|meditat|sleep|soft|peaceful/.test(text)
  ) {

    searches.push({
      tags: "relaxation"
    });

    searches.push({
      fuzzytags: "piano"
    });

    searches.push({
      tags: "classical"
    });

  }

  if (
    /energetic|energy|gym|workout|fast|power|hype/.test(text)
  ) {

    searches.push({
      tags: "electronic"
    });

    searches.push({
      tags: "rock"
    });

    searches.push({
      tags: "hiphop"
    });

  }

  if (
    /romantic|love|loving|emotional/.test(text)
  ) {

    searches.push({
      fuzzytags: "romantic"
    });

    searches.push({
      tags: "pop"
    });

    searches.push({
      tags: "songwriter"
    });

  }

  if (
    /sad|heartbreak|lonely|melancholy/.test(text)
  ) {

    searches.push({
      fuzzytags: "emotional"
    });

    searches.push({
      tags: "classical"
    });

    searches.push({
      fuzzytags: "piano"
    });

  }

  /*
   * Generic safety fallbacks.
   */

  searches.push({
    tags: "soundtrack"
  });

  searches.push({
    tags: "electronic"
  });

  searches.push({
    tags: "rock"
  });

  return searches;

}


/* =========================================================
   MUSIC SEARCH
   ========================================================= */

async function searchMusic(request) {

  const url =
    new URL(request.url);

  const query =
    (
      url.searchParams.get("query") ||
      ""
    )
      .trim()
      .slice(0, 100);

  const searches =
    buildSearches(query);

  /*
   * IMPORTANT:
   * Return as soon as ONE search gives usable
   * tracks instead of waiting for 5 tracks
   * from multiple searches.
   */

  for (const params of searches) {

    try {

      const results =
        await jamendoSearch(params);

      const usable =
        getUsableTracks(results);

      if (usable.length) {

        return json({

          ok: true,

          query,

          count:
            Math.min(
              usable.length,
              10
            ),

          tracks:
            usable.slice(0, 10)

        });

      }

    } catch (error) {

      console.warn(
        "Jamendo search failed:",
        error?.message
      );

      /*
       * Try the next fallback.
       */

    }

  }

  return json(
    {
      ok: false,

      error:
        "YARUVA could not find usable background music.",

      query
    },
    404
  );

}


/* =========================================================
   STREAM MUSIC
   ========================================================= */

async function streamMusic(request) {

  const url =
    new URL(request.url);

  const id =
    (
      url.searchParams.get("id") ||
      ""
    ).trim();

  if (!/^\d+$/.test(id)) {

    return json(
      {
        ok: false,
        error:
          "Invalid music track ID."
      },
      400
    );

  }

  const jamendo =
    new URL(
      "https://api.jamendo.com/v3.0/tracks/file/"
    );

  jamendo.searchParams.set(
    "client_id",
    JAMENDO_CLIENT_ID
  );

  jamendo.searchParams.set(
    "id",
    id
  );

  jamendo.searchParams.set(
    "audioformat",
    "mp32"
  );

  jamendo.searchParams.set(
    "action",
    "download"
  );

  let upstream;

  try {

    upstream =
      await fetchWithTimeout(
        jamendo,
        {
          redirect: "follow"
        },
        STREAM_TIMEOUT
      );

  } catch (error) {

    return json(
      {
        ok: false,

        error:
          error?.name === "AbortError"
            ? "Music stream timed out."
            : "Music stream failed."
      },
      504
    );

  }

  if (
    !upstream.ok ||
    !upstream.body
  ) {

    return json(
      {
        ok: false,

        error:
          `Music stream unavailable (${upstream.status}).`
      },
      502
    );

  }

  const contentType =
    upstream.headers.get(
      "content-type"
    ) ||
    "audio/mpeg";

  const headers =
    new Headers(
      corsHeaders(contentType)
    );

  headers.set(
    "Content-Disposition",
    "inline"
  );

  return new Response(
    upstream.body,
    {
      status: 200,
      headers
    }
  );

}


/* =========================================================
   GET
   ========================================================= */

export function GET(request) {

  return handleGET(request);

}


async function handleGET(request) {

  try {

    const url =
      new URL(request.url);

    const mode =
      url.searchParams.get("mode");

    /*
     * HEALTH CHECK
     */

    if (mode === "health") {

      return json({

        ok: true,

        service:
          "YARUVA Music API",

        status:
          "online"

      });

    }

    /*
     * STREAM
     */

    if (mode === "stream") {

      return await streamMusic(
        request
      );

    }

    /*
     * SEARCH
     */

    return await searchMusic(
      request
    );

  } catch (error) {

    console.error(
      "YARUVA Music API error:",
      error
    );

    return json(
      {
        ok: false,

        error:
          error?.message ||
          "Music service error."
      },
      500
    );

  }

}


/* =========================================================
   OPTIONS / CORS
   ========================================================= */

export function OPTIONS() {

  return new Response(
    null,
    {
      status: 204,

      headers:
        corsHeaders()
    }
  );

}
