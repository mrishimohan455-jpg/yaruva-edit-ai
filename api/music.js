const JAMENDO_CLIENT_ID =
  process.env.JAMENDO_CLIENT_ID || "709fa152";

const JAMENDO_TIMEOUT = 6000;

function headers(type = "application/json") {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
    "Content-Type": type
  };
}

function responseJSON(data, status = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: headers()
    }
  );
}

function timeoutFetch(url, options = {}, ms = JAMENDO_TIMEOUT) {
  const controller = new AbortController();

  const timer = setTimeout(
    () => controller.abort(),
    ms
  );

  return fetch(url, {
    ...options,
    signal: controller.signal
  }).finally(() => {
    clearTimeout(timer);
  });
}

/* =========================
   SEARCH MUSIC
========================= */

async function searchMusic(request) {
  const url = new URL(request.url);

  const query =
    (url.searchParams.get("query") || "")
      .trim()
      .slice(0, 100);

  const jamendoURL = new URL(
    "https://api.jamendo.com/v3.0/tracks/"
  );

  jamendoURL.searchParams.set(
    "client_id",
    JAMENDO_CLIENT_ID
  );

  jamendoURL.searchParams.set(
    "format",
    "json"
  );

  jamendoURL.searchParams.set(
    "limit",
    "8"
  );

  jamendoURL.searchParams.set(
    "audioformat",
    "mp32"
  );

  jamendoURL.searchParams.set(
    "type",
    "single albumtrack"
  );

  /*
   * Use one search only.
   * This prevents the API from hanging
   * while trying many Jamendo searches.
   */

  if (query) {
    jamendoURL.searchParams.set(
      "search",
      query
    );
  } else {
    jamendoURL.searchParams.set(
      "featured",
      "1"
    );
  }

  let upstream;

  try {
    upstream = await timeoutFetch(
      jamendoURL,
      {
        method: "GET"
      },
      JAMENDO_TIMEOUT
    );
  } catch (error) {
    return responseJSON(
      {
        ok: false,
        error:
          error?.name === "AbortError"
            ? "Music search timed out."
            : "Music search failed."
      },
      504
    );
  }

  if (!upstream.ok) {
    return responseJSON(
      {
        ok: false,
        error:
          `Jamendo returned HTTP ${upstream.status}.`
      },
      502
    );
  }

  let data;

  try {
    data = await upstream.json();
  } catch {
    return responseJSON(
      {
        ok: false,
        error:
          "Invalid response from music service."
      },
      502
    );
  }

  const results =
    Array.isArray(data?.results)
      ? data.results
      : [];

  /*
   * Only keep tracks that can actually
   * be downloaded/streamed.
   */

  const seen = new Set();

  const tracks = [];

  for (const track of results) {
    if (!track?.id) continue;

    if (!track?.audio) continue;

    if (
      track.audiodownload_allowed === false
    ) {
      continue;
    }

    const id =
      String(track.id);

    if (seen.has(id)) continue;

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
        Number(track.duration) ||
        0,

      license_ccurl:
        track.license_ccurl ||
        "",

      audiodownload_allowed:
        true
    });
  }

  if (!tracks.length) {
    return responseJSON(
      {
        ok: false,
        error:
          "No usable music was found."
      },
      404
    );
  }

  return responseJSON({
    ok: true,
    tracks
  });
}

/* =========================
   STREAM MUSIC
========================= */

async function streamMusic(request) {
  const url = new URL(request.url);

  const id =
    (url.searchParams.get("id") || "")
      .trim();

  if (!/^\d+$/.test(id)) {
    return responseJSON(
      {
        ok: false,
        error:
          "Invalid music track ID."
      },
      400
    );
  }

  const jamendoURL = new URL(
    "https://api.jamendo.com/v3.0/tracks/file/"
  );

  jamendoURL.searchParams.set(
    "client_id",
    JAMENDO_CLIENT_ID
  );

  jamendoURL.searchParams.set(
    "id",
    id
  );

  jamendoURL.searchParams.set(
    "audioformat",
    "mp32"
  );

  jamendoURL.searchParams.set(
    "action",
    "stream"
  );

  let upstream;

  try {
    upstream = await timeoutFetch(
      jamendoURL,
      {
        method: "GET",
        redirect: "follow"
      },
      12000
    );
  } catch (error) {
    return responseJSON(
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
    return responseJSON(
      {
        ok: false,
        error:
          `Music stream unavailable (${upstream.status}).`
      },
      502
    );
  }

  const responseHeaders =
    new Headers(
      headers("audio/mpeg")
    );

  responseHeaders.set(
    "Content-Disposition",
    "inline"
  );

  const contentLength =
    upstream.headers.get(
      "content-length"
    );

  if (contentLength) {
    responseHeaders.set(
      "Content-Length",
      contentLength
    );
  }

  return new Response(
    upstream.body,
    {
      status: 200,
      headers: responseHeaders
    }
  );
}

/* =========================
   MAIN HANDLER
========================= */

export default async function handler(
  request
) {
  if (
    request.method === "OPTIONS"
  ) {
    return new Response(
      null,
      {
        status: 204,
        headers: headers()
      }
    );
  }

  if (
    request.method !== "GET"
  ) {
    return responseJSON(
      {
        ok: false,
        error:
          "Method not allowed."
      },
      405
    );
  }

  try {
    const url =
      new URL(request.url);

    const mode =
      url.searchParams.get(
        "mode"
      );

    if (mode === "stream") {
      return await streamMusic(
        request
      );
    }

    return await searchMusic(
      request
    );

  } catch (error) {
    console.error(
      "YARUVA Music API Error:",
      error
    );

    return responseJSON(
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
