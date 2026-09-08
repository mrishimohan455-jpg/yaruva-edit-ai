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

async function fetchWithTimeout(
  url,
  options = {},
  ms = 6000
) {
  const controller =
    new AbortController();

  const timer = setTimeout(
    () => controller.abort(),
    ms
  );

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
}

/* =========================
   JAMENDO SEARCH
========================= */

async function jamendoSearch(params) {
  const url =
    new URL(
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

  for (
    const [key, value]
    of Object.entries(params)
  ) {
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

  return Array.isArray(
    data?.results
  )
    ? data.results
    : [];
}

/* =========================
   BUILD SMART SEARCH
========================= */

function buildSearches(query) {
  const text =
    String(query || "")
      .toLowerCase();

  const searches = [];

  /*
   * Jamendo recommends featured
   * genre selections for discovery.
   */

  if (
    /cinematic|movie|film|dramatic|epic|motivat/.test(
      text
    )
  ) {
    searches.push({
      featured: "1",
      tags: "soundtrack"
    });

    searches.push({
      featured: "1",
      fuzzytags: "cinematic"
    });

    searches.push({
      featured: "1",
      tags: "rock"
    });
  }

  if (
    /calm|relax|peace|meditat|piano/.test(
      text
    )
  ) {
    searches.push({
      featured: "1",
      tags: "relaxation"
    });

    searches.push({
      featured: "1",
      fuzzytags: "piano"
    });
  }

  if (
    /energetic|energy|gym|workout|fast/.test(
      text
    )
  ) {
    searches.push({
      featured: "1",
      tags: "electronic"
    });

    searches.push({
      featured: "1",
      tags: "rock"
    });
  }

  if (
    /romantic|love/.test(
      text
    )
  ) {
    searches.push({
      featured: "1",
      tags: "pop"
    });

    searches.push({
      featured: "1",
      fuzzytags: "romantic"
    });
  }

  /*
   * Always have reliable fallbacks.
   */

  searches.push({
    featured: "1",
    tags: "soundtrack"
  });

  searches.push({
    featured: "1",
    tags: "electronic"
  });

  searches.push({
    featured: "1",
    tags: "rock"
  });

  return searches;
}

/* =========================
   SEARCH MUSIC
========================= */

async function searchMusic(request) {
  const url =
    new URL(request.url);

  const query =
    (
      url.searchParams.get(
        "query"
      ) || ""
    )
      .trim()
      .slice(0, 100);

  const candidates = [];

  const searches =
    buildSearches(query);

  /*
   * Try searches one by one.
   * Stop as soon as we have usable
   * tracks.
   */

  for (
    const params
    of searches
  ) {
    try {
      const results =
        await jamendoSearch(
          params
        );

      candidates.push(
        ...results
      );

      const usable =
        getUsableTracks(
          candidates
        );

      if (
        usable.length >= 5
      ) {
        break;
      }

    } catch (error) {
      console.warn(
        "Jamendo search failed:",
        error?.message
      );
    }
  }

  const tracks =
    getUsableTracks(
      candidates
    ).slice(0, 10);

  if (!tracks.length) {
    return json(
      {
        ok: false,
        error:
          "Jamendo returned no tracks that YARUVA can use."
      },
      404
    );
  }

  return json({
    ok: true,
    tracks
  });
}

/* =========================
   FILTER USABLE TRACKS
========================= */

function getUsableTracks(
  results
) {
  const seen =
    new Set();

  const tracks =
    [];

  for (
    const track
    of results
  ) {
    if (!track?.id) {
      continue;
    }

    /*
     * Audio must exist.
     */
    if (!track?.audio) {
      continue;
    }

    /*
     * Respect Jamendo's permission.
     */
    if (
      track.audiodownload_allowed ===
      false
    ) {
      continue;
    }

    const id =
      String(track.id);

    if (
      seen.has(id)
    ) {
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
        Number(
          track.duration
        ) || 0,

      license_ccurl:
        track.license_ccurl ||
        "",

      audiodownload_allowed:
        true
    });
  }

  return tracks;
}

/* =========================
   STREAM MUSIC
========================= */

async function streamMusic(
  request
) {
  const url =
    new URL(request.url);

  const id =
    (
      url.searchParams.get(
        "id"
      ) || ""
    ).trim();

  if (
    !/^\d+$/.test(id)
  ) {
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
          error?.name ===
          "AbortError"
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
        ) ||
        "audio/mpeg"
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
      headers:
        responseHeaders
    }
  );
}

/* =========================
   GET
========================= */

export function GET(
  request
) {
  return handleGET(
    request
  );
}

async function handleGET(
  request
) {
  try {

    const url =
      new URL(request.url);

    const mode =
      url.searchParams.get(
        "mode"
      );

    /*
     * HEALTH CHECK
     */

    if (
      mode === "health"
    ) {
      return json({
        ok: true,
        service:
          "YARUVA Music API",
        status:
          "online"
      });
    }

    /*
     * MUSIC STREAM
     */

    if (
      mode === "stream"
    ) {
      return await streamMusic(
        request
      );
    }

    /*
     * MUSIC SEARCH
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

/* =========================
   OPTIONS
========================= */

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
