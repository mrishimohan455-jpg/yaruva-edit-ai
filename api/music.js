const JAMENDO_CLIENT_ID =
  process.env.JAMENDO_CLIENT_ID || "709fa152";

const SEARCH_TIMEOUT = 6000;
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

async function fetchWithTimeout(url, options = {}, ms = 6000) {
  const controller = new AbortController();

  const timer = setTimeout(() => {
    controller.abort();
  }, ms);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
}

async function searchMusic(request) {
  const url = new URL(request.url);

  const query =
    (url.searchParams.get("query") || "")
      .trim()
      .slice(0, 100);

  const jamendo =
    new URL(
      "https://api.jamendo.com/v3.0/tracks/"
    );

  jamendo.searchParams.set(
    "client_id",
    JAMENDO_CLIENT_ID
  );

  jamendo.searchParams.set(
    "format",
    "json"
  );

  jamendo.searchParams.set(
    "limit",
    "8"
  );

  jamendo.searchParams.set(
    "audioformat",
    "mp32"
  );

  jamendo.searchParams.set(
    "type",
    "single albumtrack"
  );

  if (query) {
    jamendo.searchParams.set(
      "search",
      query
    );
  } else {
    jamendo.searchParams.set(
      "featured",
      "1"
    );
  }

  let upstream;

  try {
    upstream =
      await fetchWithTimeout(
        jamendo,
        {},
        SEARCH_TIMEOUT
      );
  } catch (error) {
    return json(
      {
        ok: false,
        error:
          error?.name === "AbortError"
            ? "Jamendo search timed out."
            : "Jamendo search failed."
      },
      504
    );
  }

  if (!upstream.ok) {
    return json(
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
    return json(
      {
        ok: false,
        error:
          "Jamendo returned invalid JSON."
      },
      502
    );
  }

  const results =
    Array.isArray(data?.results)
      ? data.results
      : [];

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
    return json(
      {
        ok: false,
        error:
          "No usable music was found."
      },
      404
    );
  }

  return json({
    ok: true,
    tracks
  });
}

async function streamMusic(request) {
  const url =
    new URL(request.url);

  const id =
    (url.searchParams.get("id") || "")
      .trim();

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
    "stream"
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

  const responseHeaders =
    new Headers(
      corsHeaders(
        upstream.headers.get(
          "content-type"
        ) || "audio/mpeg"
      )
    );

  responseHeaders.set(
    "Content-Disposition",
    "inline"
  );

  return new Response(
    upstream.body,
    {
      status: 200,
      headers: responseHeaders
    }
  );
}

async function handleGET(request) {
  try {
    const url =
      new URL(request.url);

    const mode =
      url.searchParams.get("mode");

    /*
     * IMPORTANT:
     * This responds instantly.
     * It does NOT contact Jamendo.
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
      "YARUVA Music API error",
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

export function GET(request) {
  return handleGET(request);
}

export function OPTIONS() {
  return new Response(
    null,
    {
      status: 204,
      headers: corsHeaders()
    }
  );
}
